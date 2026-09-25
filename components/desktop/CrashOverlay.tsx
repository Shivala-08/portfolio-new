"use client";

import { useEffect, useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { useAchievementStore } from "@/lib/achievements";

/**
 * The fake crash screen ("DESKTOP_STOPPED_RESPONDING … just kidding").
 *
 * Two triggers, both throttled hard so it stays a joke:
 *   - a rare random flash (min 4 minutes apart, and never in the first minute)
 *   - programmatic: the "Trigger a critical error" item in the right-click menu
 *
 * Brief by design: 1.1s of crash, then it snaps back on its own. Any input
 * dismisses it instantly. Reduced motion swaps the glitch entrance for a plain
 * fade — the screen still appears, it just doesn't shake.
 */

const MIN_FIRST_DELAY_MS = 60_000;
const MIN_GAP_MS = 240_000;
const VISIBLE_MS = 1_100;

type Listener = () => void;

const listeners = new Set<Listener>();

/** Any component (context menu, achievement toast…) can request a crash. */
export function triggerCrash() {
  listeners.forEach((fn) => fn());
}

const LINES = [
  "A problem has been detected and this portfolio has been shut down to prevent damage to your first impression.",
  "DESKTOP_STOPPED_RESPONDING",
  "If this is the first time you've seen this Stop error screen, congratulations — it means you're paying attention.",
  "Technical information: *** STOP: 0x00000047 (0xTABS, 0xOPEN, 0xC0FFEE, 0xDECAFBAD)",
  "Beginning dump of excuses… just kidding. Restarting.",
];

export function CrashOverlay() {
  const [visible, setVisible] = useState(false);
  const reduceMotion = useReducedMotion();

  useEffect(() => {
    let last = 0;
    let timeout: ReturnType<typeof setTimeout> | undefined;

    const show = () => {
      const now = Date.now();
      if (now - last < MIN_GAP_MS) return;
      last = now;
      setVisible(true);
      useAchievementStore.getState().unlock("bsod-survivor");
      timeout = setTimeout(() => setVisible(false), VISIBLE_MS);
    };

    const schedule = () => {
      // Rare: one attempt every 4–9 minutes, and never in the first minute.
      const delay = MIN_FIRST_DELAY_MS + Math.random() * 480_000;
      timeout = setTimeout(() => {
        if (Math.random() < 0.5) show();
        schedule();
      }, delay);
    };
    schedule();

    const onTrigger = () => show();
    listeners.add(onTrigger);

    const dismiss = () => setVisible(false);
    window.addEventListener("keydown", dismiss);
    window.addEventListener("pointerdown", dismiss);

    return () => {
      listeners.delete(onTrigger);
      if (timeout) clearTimeout(timeout);
      window.removeEventListener("keydown", dismiss);
      window.removeEventListener("pointerdown", dismiss);
    };
  }, []);

  return (
    <AnimatePresence>
      {visible ? (
        <motion.div
          key="crash"
          role="alert"
          initial={reduceMotion ? { opacity: 0 } : { opacity: 0, scaleX: 1.04 }}
          animate={
            reduceMotion
              ? { opacity: 1 }
              : { opacity: 1, scaleX: [1.04, 1, 1.02, 1], x: [0, -6, 5, -2, 0] }
          }
          exit={{ opacity: 0, transition: { duration: 0.12 } }}
          transition={{ duration: reduceMotion ? 0.1 : 0.28 }}
          className="fixed inset-0 z-[10000] flex flex-col justify-center overflow-hidden bg-[#07215c] px-6 font-mono text-[#e8ecf7] sm:px-16"
          onPointerDown={(e) => e.stopPropagation()}
        >
          <div className="max-w-2xl space-y-3 text-[11px] leading-relaxed sm:text-[13px]">
            <p className="w-fit bg-[#e8ecf7] px-2 py-0.5 text-[#07215c]">: (</p>
            {LINES.map((line) => (
              <p key={line}>{line}</p>
            ))}
            <p className="pt-2 text-[10px] uppercase tracking-[0.2em] text-[#9db2e0] sm:text-[11px]">
              47% complete — collecting your sympathy
            </p>
          </div>
        </motion.div>
      ) : null}
    </AnimatePresence>
  );
}
