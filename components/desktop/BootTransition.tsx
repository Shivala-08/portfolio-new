"use client";

import { useEffect, useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { RefreshCw } from "lucide-react";

/**
 * The Windows-Update-style loading transition. Plays once on first load
 * ("configuring updates… do not turn off your portfolio") and can be replayed
 * via `playBootTransition()` — the Ctrl+Alt+Del easter egg uses it the first
 * time the Task Manager opens.
 *
 * The percentage is static by design (design doc §8: authored, not random):
 * "47%" IS the joke. No backend, no timers, no hydration mismatch.
 */

const VISIBLE_MS = 1400;

type Listener = () => void;

const listeners = new Set<Listener>();

export function BootTransition() {
  const [visible, setVisible] = useState(false);
  const reduceMotion = useReducedMotion();

  useEffect(() => {
    // Small delay so the desktop paints first — the joke lands better when
    // visitors briefly see the real thing before the update screen takes over.
    const start = setTimeout(() => setVisible(true), 350);
    return () => clearTimeout(start);
  }, []);

  useEffect(() => {
    if (!visible) return;
    const id = setTimeout(() => setVisible(false), VISIBLE_MS);
    return () => clearTimeout(id);
  }, [visible]);

  useEffect(() => {
    const onPlay = () => setVisible(true);
    listeners.add(onPlay);
    return () => {
      listeners.delete(onPlay);
    };
  }, []);

  return (
    <AnimatePresence>
      {visible ? (
        <motion.div
          key="boot"
          role="status"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0, transition: { duration: 0.25 } }}
          className="fixed inset-0 z-[9900] flex flex-col items-center justify-center gap-6 bg-[#1f3a5f] px-6 text-center font-mono text-[#e8ecf7]"
        >
          <motion.div
            animate={{ rotate: 360 }}
            transition={reduceMotion ? { duration: 0 } : { repeat: Infinity, duration: 1.6, ease: "linear" }}
          >
            <RefreshCw className="size-7" aria-hidden="true" />
          </motion.div>
          <div className="space-y-1.5">
            <p className="text-[13px] sm:text-[14px]">Configuring updates… 47%</p>
            <p className="text-[11px] text-[#9db2e0] sm:text-[12px]">
              Do not turn off your portfolio.
            </p>
          </div>
          <div className="h-1 w-56 overflow-hidden rounded-full bg-[#33517c] sm:w-72">
            <motion.div
              className="h-full bg-[#e8ecf7]"
              initial={{ width: "32%" }}
              animate={{ width: "47%" }}
              transition={{ duration: 1.1, ease: "easeOut" }}
            />
          </div>
        </motion.div>
      ) : null}
    </AnimatePresence>
  );
}

export function playBootTransition() {
  listeners.forEach((fn) => fn());
}
