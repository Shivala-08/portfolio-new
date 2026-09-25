"use client";

import { useEffect, useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { Sparkles, X } from "lucide-react";
import { useAchievementStore } from "@/lib/achievements";

/**
 * The Clippy-style assistant (the "fun if you have time" tier).
 *
 * Throttled hard so it charms rather than annoys: first quip after 20s, at
 * least 45s between quips, max 5 per visit. "Dismiss permanently" persists a
 * localStorage flag and unlocks an achievement.
 */

const FIRST_DELAY_MS = 20_000;
const GAP_MS = 45_000;
const MAX_QUIPS = 5;
const STORAGE_KEY = "portfolio.clippy-dismissed";

const QUIPS: Array<{ id: string; text: string }> = [
  { id: "hire", text: "It looks like you're assessing hireability. The resume window is already open. Efficient." },
  { id: "drag", text: "Tip: drag a window onto the archive icon. Very tactile. Very satisfying." },
  { id: "cad", text: "Try Ctrl+Alt+Del. On this site it does something. Don't do it at work." },
  { id: "tradeoffs", text: "The Deploy Forge tradeoffs section is the honest part. The 30\u201360s one. Just saying." },
  { id: "late", text: "It's late where you are. The 2am sticky note was written by someone who knows." },
  { id: "tabs", text: "You've been here a while. I counted. It's not weird, I'm a feature." },
];

export function Assistant() {
  const [quipIndex, setQuipIndex] = useState<number | null>(null);
  const [dismissed, setDismissed] = useState(true); // true until mount avoids hydration mismatch
  const [quipCount, setQuipCount] = useState(0);
  const reduceMotion = useReducedMotion();

  // Load the persisted dismissal flag after mount.
  useEffect(() => {
    setDismissed(localStorage.getItem(STORAGE_KEY) === "1");
  }, []);

  // Scheduler: initial delay, then gap-throttled resurfacing.
  useEffect(() => {
    if (dismissed || quipCount >= MAX_QUIPS) return;
    const delay = quipCount === 0 ? FIRST_DELAY_MS : GAP_MS;
    const id = setTimeout(() => {
      setQuipIndex(quipCount);
      setQuipCount((c) => c + 1);
    }, delay);
    return () => clearTimeout(id);
  }, [dismissed, quipCount]);

  const hide = () => setQuipIndex(null);

  const dismissPermanently = () => {
    localStorage.setItem(STORAGE_KEY, "1");
    setDismissed(true);
    setQuipIndex(null);
    useAchievementStore.getState().unlock("assistant");
  };

  return (
    <AnimatePresence>
      {quipIndex !== null && !dismissed ? (
        <motion.div
          key={QUIPS[quipIndex].id}
          initial={reduceMotion ? false : { opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          exit={reduceMotion ? { opacity: 0 } : { opacity: 0, y: 16 }}
          transition={{ type: "spring", stiffness: 320, damping: 28 }}
          className="fixed bottom-16 left-4 z-[9200] w-[270px] rounded-xl border border-line-strong bg-chrome p-3 shadow-[0_14px_36px_-14px_rgb(38_35_31/0.35)]"
        >
          <div className="flex items-start gap-2.5">
            <span className="grid size-8 shrink-0 place-items-center rounded-full border border-accent/40 bg-accent-soft text-accent-ink">
              <Sparkles aria-hidden="true" className="size-4" />
            </span>
            <div className="min-w-0 flex-1">
              <p className="text-[12px] leading-snug text-ink">{QUIPS[quipIndex].text}</p>
              <div className="mt-2 flex items-center gap-2">
                <button
                  type="button"
                  onClick={hide}
                  className="rounded-md border border-line px-2 py-1 text-[10.5px] text-ink-soft transition-colors hover:bg-wallpaper-deep"
                >
                  Later
                </button>
                <button
                  type="button"
                  onClick={dismissPermanently}
                  className="rounded-md border border-line px-2 py-1 text-[10.5px] text-ink-soft transition-colors hover:bg-wallpaper-deep"
                >
                  Never again
                </button>
              </div>
            </div>
            <button
              type="button"
              onClick={hide}
              aria-label="Dismiss assistant"
              className="grid size-5 place-items-center rounded text-ink-faint transition-colors hover:bg-wallpaper-deep hover:text-ink"
            >
              <X aria-hidden="true" className="size-3" />
            </button>
          </div>
        </motion.div>
      ) : null}
    </AnimatePresence>
  );
}
