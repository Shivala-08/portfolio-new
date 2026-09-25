"use client";

import { create } from "zustand";

/**
 * Achievement system — Windows-style toasts for things visitors actually do.
 *
 * Purely client-side, no persistence (deliberate: every visit gets the little
 * dopamine hits again, and there is no backend to store state). Any component
 * can call `unlock(id)`; unknown ids are ignored so a typo can't crash the UI.
 */

export type Achievement = {
  id: string;
  /** Toast headline. */
  title: string;
  /** Toast sub-line. */
  body: string;
};

/**
 * Sequence achievements: unlocked once every part in `all` has been recorded
 * (in any order). The synapse one is the "actually read the Synapse breakdown"
 * achievement — its parts are the case-study sections of the Synapse window.
 */
export const SEQUENCES = {
  explorer: {
    all: ["about", "projects", "todo", "lab", "contact", "resume"],
    achievement: {
      id: "every-window",
      title: "Achievement unlocked: opened every window",
      body: "All 6. That's the spirit — tabs don't close themselves.",
    },
  },
  deepDive: {
    all: ["df-constraint", "df-tradeoffs"],
    achievement: {
      id: "deep-dive",
      title: "Achievement unlocked: actually read the Deploy Forge breakdown",
      body: "Constraint AND tradeoffs. The 30\u201360s delay is the honest part.",
    },
  },
} as const;

export const ACHIEVEMENTS: Record<string, Achievement> = {
  "found-resume": {
    id: "found-resume",
    title: "Achievement unlocked: found the resume",
    body: "The only window that was never a joke.",
  },
  "discipline": {
    id: "discipline",
    title: "Achievement unlocked: tried to end Discipline.sys",
    body: "Access denied. It's load-bearing — 99% of everything, actually.",
  },
  "coffee": {
    id: "coffee",
    title: "Achievement unlocked: resumed Coffee.exe",
    body: "CPU spiked to 73%. Output unchanged. It was still worth it.",
  },
  "npm": {
    id: "npm",
    title: "Achievement unlocked: killed npm_install.exe",
    body: "It respawned. It always respawns. You knew it would.",
  },
  "table-flip": {
    id: "table-flip",
    title: "Achievement unlocked: archive everything",
    body: "A clean desktop. But the tabs — the tabs remain open.",
  },
  "task-manager": {
    id: "task-manager",
    title: "Achievement unlocked: pressed Ctrl+Alt+Del",
    body: "On a portfolio. Respect.",
  },
  "end-imposter": {
    id: "end-imposter",
    title: "Achievement unlocked: ended imposter_syndrome.dll",
    body: "The only process you can actually kill. It won't come back.",
  },
  archived: {
    id: "archived",
    title: "Achievement unlocked: archived a window",
    body: "Decluttering the desktop counts as productivity.",
  },
  "bsod-survivor": {
    id: "bsod-survivor",
    title: "Achievement unlocked: survived the crash",
    body: "SYNAPSE_STOPPED_RESPONDING gets everyone once.",
  },
  "2am": {
    id: "2am",
    title: "Achievement unlocked: it's past 2am",
    body: "why does retrieval only break at 2am. why are you here at 2am.",
  },
  assistant: {
    id: "assistant",
    title: "Achievement unlocked: dismissed Clippy",
    body: "It stays gone. You're the first to make it stick.",
  },
  bookworm: {
    id: "bookworm",
    title: "Achievement unlocked: pulled a volume off the shelf",
    body: "Seven field guides, one reader. Sheet 5 has the links.",
  },
  ...Object.fromEntries(Object.values(SEQUENCES).map((s) => [s.achievement.id, s.achievement])),
} as Record<string, Achievement>;

const TOAST_MS = 6000;
const MAX_TOASTS = 3;

type AchievementStore = {
  /** Unlocked ids this visit — never re-fires. */
  unlocked: ReadonlySet<string>;
  /** Parts seen per sequence id, e.g. "read-synapse" -> {"synapse-constraint", …}. */
  sequenceProgress: Record<string, ReadonlySet<string>>;
  /** Live toast queue; the component animates these in the corner. */
  toasts: Achievement[];
  unlock: (id: string) => void;
  /** Records one part of a sequence; unlocks the achievement when complete. */
  record: (sequence: keyof typeof SEQUENCES, part: string) => void;
  dismiss: (id: string) => void;
};

export const useAchievementStore = create<AchievementStore>((set, get) => ({
  unlocked: new Set<string>(),
  sequenceProgress: {},
  toasts: [],

  unlock: (id) => {
    const achievement = ACHIEVEMENTS[id];
    if (!achievement) return;
    const { unlocked, toasts } = get();
    if (unlocked.has(id)) return;
    const next = new Set(unlocked);
    next.add(id);
    set({
      unlocked: next,
      toasts: [...toasts, achievement].slice(-MAX_TOASTS),
    });
    setTimeout(() => get().dismiss(id), TOAST_MS);
  },

  record: (sequence, part) => {
    const seq = SEQUENCES[sequence];
    const { sequenceProgress } = get();
    const seen = sequenceProgress[seq.achievement.id] ?? new Set<string>();
    if (seen.has(part)) return;
    const next = new Set(seen).add(part);
    set({ sequenceProgress: { ...sequenceProgress, [seq.achievement.id]: next } });
    if (seq.all.every((p) => next.has(p))) get().unlock(seq.achievement.id);
  },

  dismiss: (id) => set({ toasts: get().toasts.filter((t) => t.id !== id) }),
}));
