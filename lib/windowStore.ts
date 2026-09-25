"use client";

import { create } from "zustand";
import { useAchievementStore } from "@/lib/achievements";
import { DEFAULT_OPEN_IDS, getWindowDefinition } from "@/lib/windows";
import type { WindowState } from "@/lib/types";

/**
 * Window manager store (TRD §1-4).
 *
 * Custom React state rather than an OS-simulation library: each window is
 * `{ id, title, component, position, size, zIndex, minimized }` and z-ordering
 * comes from a monotonically increasing counter.
 *
 * No localStorage persistence — TRD §1 lists it as optional v1.1, and keeping
 * the initial state deterministic is what lets the first paint be server-rendered
 * with real content in it (TRD §5, no-JS/crawler fallback).
 */

/** Windows sit above the wallpaper and sticky notes (which live at z-0/1). */
const Z_BASE = 10;

/** Windows that count towards the "visited every window" achievement. */
const EXPLORER_IDS = new Set<string>(DEFAULT_OPEN_IDS);

function initialWindows(): WindowState[] {
  return DEFAULT_OPEN_IDS.flatMap((id, i) => {
    const def = getWindowDefinition(id);
    if (!def) return [];
    return [
      {
        id: def.id,
        title: def.title,
        component: def.component,
        projectId: def.projectId,
        position: def.defaultPosition,
        size: def.defaultSize,
        zIndex: Z_BASE + i,
        minimized: false,
      },
    ];
  });
}

type Position = { x: number; y: number };
type Size = { width: number; height: number };

type WindowStore = {
  windows: WindowState[];
  zCounter: number;
  focusedId: string | null;
  announcement: string;
  /** Window currently being title-bar-dragged, for the archive hotspot. */
  dragCandidateId: string | null;
  /** Opens the window, or restores + focuses it if it already exists. */
  open: (id: string) => void;
  close: (id: string) => void;
  minimize: (id: string) => void;
  focus: (id: string) => void;
  /** Taskbar click: open, focus, or toggle minimize — never a duplicate. */
  toggle: (id: string) => void;
  move: (id: string, position: Position) => void;
  resize: (id: string, size: Size, position?: Position) => void;
  /** Drag-to-archive: minimize with the archive (suck-in) animation flag set. */
  archive: (id: string) => void;
  setDragCandidate: (id: string | null) => void;
  clearAnnouncement: () => void;
};

export const useWindowStore = create<WindowStore>((set, get) => ({
  windows: initialWindows(),
  zCounter: Z_BASE + DEFAULT_OPEN_IDS.length,
  focusedId: DEFAULT_OPEN_IDS[DEFAULT_OPEN_IDS.length - 1] ?? null,
  announcement: "",
  dragCandidateId: null,

  open: (id) => {
    const def = getWindowDefinition(id);
    if (!def) return;
    const { windows, zCounter } = get();
    const z = zCounter + 1;
    const existing = windows.find((w) => w.id === id);

    if (existing) {
      set({
        windows: windows.map((w) => (w.id === id ? { ...w, minimized: false, zIndex: z } : w)),
        zCounter: z,
        focusedId: id,
        announcement: `Focused ${def.title}`,
      });
      return;
    }

    set({
      windows: [
        ...windows,
        {
          id: def.id,
          title: def.title,
          component: def.component,
          projectId: def.projectId,
          position: def.defaultPosition,
          size: def.defaultSize,
          zIndex: z,
          minimized: false,
        },
      ],
      zCounter: z,
      focusedId: id,
      announcement: `Opened ${def.title}`,
    });

    // Easter-egg side effects: the resume is the "found the resume" achievement,
    // and every core window touched counts towards the explorer sequence.
    if (id === "resume") useAchievementStore.getState().unlock("found-resume");
    if (EXPLORER_IDS.has(id)) useAchievementStore.getState().record("explorer", id);
  },

  close: (id) => {
    const { windows } = get();
    const closing = windows.find((w) => w.id === id);
    const remaining = windows.filter((w) => w.id !== id);
    const nextFocus = [...remaining].sort((a, b) => b.zIndex - a.zIndex)[0] ?? null;
    set({
      windows: remaining,
      focusedId: nextFocus && !nextFocus.minimized ? nextFocus.id : null,
      announcement: closing ? `Closed ${closing.title}` : "",
    });
  },

  minimize: (id) => {
    const win = get().windows.find((w) => w.id === id);
    if (!win) return;
    set({
      windows: get().windows.map((w) => (w.id === id ? { ...w, minimized: true } : w)),
      focusedId: null,
      announcement: `Minimized ${win.title}`,
    });
  },

  focus: (id) => {
    const { windows, zCounter, focusedId } = get();
    const win = windows.find((w) => w.id === id);
    if (!win) return;
    // Already focused and topmost: no z-bump, keeps the counter from drifting.
    const topZ = Math.max(...windows.map((w) => w.zIndex));
    if (focusedId === id && win.zIndex === topZ) return;
    const z = zCounter + 1;
    set({
      windows: windows.map((w) => (w.id === id ? { ...w, zIndex: z, minimized: false } : w)),
      zCounter: z,
      focusedId: id,
    });
    if (EXPLORER_IDS.has(id)) useAchievementStore.getState().record("explorer", id);
  },

  toggle: (id) => {
    const win = get().windows.find((w) => w.id === id);
    if (!win) return get().open(id);
    if (win.minimized) return get().focus(id);
    if (get().focusedId === id) return get().minimize(id);
    return get().focus(id);
  },

  move: (id, position) => {
    set({ windows: get().windows.map((w) => (w.id === id ? { ...w, position } : w)) });
  },

  resize: (id, size, position) => {
    set({
      windows: get().windows.map((w) =>
        w.id === id ? { ...w, size, position: position ?? w.position } : w,
      ),
    });
  },

  /** Drag-to-archive: minimize with the archive animation flag set. */
  archive: (id) => {
    const win = get().windows.find((w) => w.id === id);
    if (!win || win.minimized) return;
    set({
      windows: get().windows.map((w) => (w.id === id ? { ...w, minimized: true, archiving: true } : w)),
      focusedId: null,
      announcement: `Archived ${win.title}`,
    });
    useAchievementStore.getState().unlock("archived");
    // The flag only drives the exit animation; clear it once it has played.
    setTimeout(() => {
      set({ windows: get().windows.map((w) => (w.id === id ? { ...w, archiving: false } : w)) });
    }, 450);
  },

  setDragCandidate: (id) => set({ dragCandidateId: id }),

  clearAnnouncement: () => set({ announcement: "" }),
}));
