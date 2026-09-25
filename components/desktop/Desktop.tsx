"use client";

import dynamic from "next/dynamic";
import { useEffect } from "react";
import { AnimatePresence } from "framer-motion";
import { StickyNote } from "@/components/desktop/StickyNote";
import { Taskbar } from "@/components/desktop/Taskbar";
import { Window } from "@/components/desktop/Window";
import { ArchiveHotspot } from "@/components/desktop/ArchiveHotspot";
import { Assistant } from "@/components/desktop/Assistant";
import { BootTransition, playBootTransition } from "@/components/desktop/BootTransition";
import { CrashOverlay } from "@/components/desktop/CrashOverlay";
import { ContextMenu } from "@/components/desktop/ContextMenu";
import { AchievementToasts } from "@/components/widgets/AchievementToasts";
import { WindowContent } from "@/components/windows/registry";
import { STICKY_NOTES } from "@/lib/content";
import { useAchievementStore } from "@/lib/achievements";
import { useWindowStore } from "@/lib/windowStore";
import { clampPosition, clampSize, useViewport } from "@/lib/viewport";

const NUDGE = { fine: 16, coarse: 64 } as const;

// Liveblocks is only needed when a key exists, and never during SSR — keep it
// out of the first-load bundle entirely.
const MultiplayerCursors = dynamic(
  () => import("@/components/desktop/MultiplayerCursors").then((m) => m.MultiplayerCursors),
  { ssr: false },
);

export function Desktop() {
  const windows = useWindowStore((s) => s.windows);
  const focusedId = useWindowStore((s) => s.focusedId);
  const close = useWindowStore((s) => s.close);
  const move = useWindowStore((s) => s.move);
  const open = useWindowStore((s) => s.open);
  const announcement = useWindowStore((s) => s.announcement);
  const clearAnnouncement = useWindowStore((s) => s.clearAnnouncement);
  const viewport = useViewport();

  // Clear the announcement after it has been read, so saying the same thing twice
  // ("closed about.md" twice in a row) still triggers a live-region update.
  useEffect(() => {
    if (!announcement) return;
    const id = setTimeout(clearAnnouncement, 1500);
    return () => clearTimeout(id);
  }, [announcement, clearAnnouncement]);

  /**
   * Keyboard requirements from TRD §5:
   *   - Tab reaches every taskbar entry, Enter opens/focuses (native button behaviour)
   *   - Escape closes the focused window
   *   - Alt + arrows (Shift for a bigger step) moves it, so a window is operable
   *     without a mouse. Plain arrows are deliberately NOT bound, because window
   *     content scrolls.
   *
   * Plus the headline easter egg: Ctrl+Alt+Del opens the fake Task Manager.
   * Browsers usually never see that combo (the OS eats it), so Ctrl+Alt+T and
   * Ctrl+Alt+Backspace are aliases — and the taskbar tray has a visible button
   * so the window is discoverable without the shortcut at all.
   */
  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      // The 2am sticky note needed a payoff: type anything between 2 and 5am.
      const hour = new Date().getHours();
      if (hour >= 2 && hour < 5) {
        useAchievementStore.getState().unlock("2am");
      }

      if (
        event.ctrlKey &&
        event.altKey &&
        (event.key === "Delete" || event.key === "Backspace" || event.code === "KeyT")
      ) {
        event.preventDefault();
        useAchievementStore.getState().unlock("task-manager");
        const first = !useWindowStore.getState().windows.some((w) => w.id === "taskManager");
        open("taskManager");
        if (first) playBootTransition();
        return;
      }

      if (event.key === "Escape" && focusedId) {
        event.preventDefault();
        close(focusedId);
        return;
      }

      if (event.altKey && !viewport.isMobile && focusedId) {
        const deltas: Record<string, [number, number]> = {
          ArrowLeft: [-1, 0],
          ArrowRight: [1, 0],
          ArrowUp: [0, -1],
          ArrowDown: [0, 1],
        };
        const delta = deltas[event.key];
        if (!delta) return;
        event.preventDefault();
        const win = useWindowStore.getState().windows.find((w) => w.id === focusedId);
        if (!win) return;
        const step = event.shiftKey ? NUDGE.coarse : NUDGE.fine;
        const size = clampSize(win.size, viewport);
        move(
          win.id,
          clampPosition(
            { x: win.position.x + delta[0] * step, y: win.position.y + delta[1] * step },
            size,
            viewport,
          ),
        );
      }
    };

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [focusedId, viewport, close, move, open]);

  const visible = windows.filter((w) => !w.minimized);

  return (
    <div data-desktop className="flex h-dvh flex-col">
      <main aria-label="Desktop" className="wallpaper-grid relative flex-1 overflow-hidden">
        {STICKY_NOTES.map((note) => (
          <StickyNote key={note.id} note={note} viewport={viewport} />
        ))}

        <ArchiveHotspot />

        <AnimatePresence>
          {visible.map((win, index) => (
            <Window
              key={win.id}
              win={win}
              index={index}
              focused={focusedId === win.id}
              viewport={viewport}
            >
              <WindowContent win={win} />
            </Window>
          ))}
        </AnimatePresence>
      </main>

      <Taskbar />

      <AchievementToasts />
      <CrashOverlay />
      <ContextMenu />
      <Assistant />
      <MultiplayerCursors />
      <BootTransition />

      {/* Window open/close/minimize state, announced to screen readers (TRD §5). */}
      <div aria-live="polite" aria-atomic="true" className="sr-only">
        {announcement}
      </div>
    </div>
  );
}
