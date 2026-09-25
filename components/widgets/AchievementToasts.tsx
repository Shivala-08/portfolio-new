"use client";

import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { Trophy, X } from "lucide-react";
import { useAchievementStore } from "@/lib/achievements";

/**
 * Windows-style achievement toasts, docked just above the taskbar's right
 * corner (the tray side, where real notifications live). Auto-dismiss after
 * 6s via the store; the X dismisses early. Announced through the aria-live
 * region role so screen readers get the unlock too.
 */
export function AchievementToasts() {
  const toasts = useAchievementStore((s) => s.toasts);
  const dismiss = useAchievementStore((s) => s.dismiss);
  const reduceMotion = useReducedMotion();

  return (
    <div
      aria-live="polite"
      className="pointer-events-none fixed bottom-16 right-3 z-[9000] flex w-[290px] flex-col gap-2 sm:w-[320px]"
    >
      <AnimatePresence>
        {toasts.map((toast) => (
          <motion.div
            key={toast.id}
            role="status"
            initial={reduceMotion ? false : { opacity: 0, x: 60, scale: 0.96 }}
            animate={{ opacity: 1, x: 0, scale: 1 }}
            exit={reduceMotion ? { opacity: 0 } : { opacity: 0, x: 40, scale: 0.97 }}
            transition={reduceMotion ? { duration: 0 } : { type: "spring", stiffness: 380, damping: 30 }}
            className="pointer-events-auto flex items-start gap-2.5 rounded-lg border border-line-strong bg-chrome p-3 shadow-[0_12px_32px_-12px_rgb(38_35_31/0.35)]"
          >
            <span className="mt-0.5 grid size-7 shrink-0 place-items-center rounded-md bg-accent-soft text-accent-ink">
              <Trophy aria-hidden="true" className="size-4" />
            </span>
            <div className="min-w-0 flex-1">
              <p className="text-[11.5px] font-medium leading-snug text-ink">{toast.title}</p>
              <p className="mt-0.5 text-[11px] leading-snug text-ink-soft">{toast.body}</p>
            </div>
            <button
              type="button"
              onClick={() => dismiss(toast.id)}
              aria-label="Dismiss notification"
              className="grid size-5 shrink-0 place-items-center rounded text-ink-faint transition-colors hover:bg-wallpaper-deep hover:text-ink"
            >
              <X aria-hidden="true" className="size-3" />
            </button>
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
}
