"use client";

import { motion } from "framer-motion";

/** One remote visitor's cursor with its name tag. Purely presentational. */
export function GhostCursor({
  x,
  y,
  name,
  reduceMotion,
}: {
  x: number;
  y: number;
  name: string;
  /** framer-motion's useReducedMotion returns boolean | null. */
  reduceMotion: boolean | null;
}) {
  return (
    <motion.div
      initial={false}
      animate={{ x, y }}
      transition={
        reduceMotion
          ? { duration: 0 }
          : { type: "spring", stiffness: 700, damping: 40, mass: 0.5 }
      }
      style={{ position: "fixed", left: 0, top: 0, pointerEvents: "none", zIndex: 9800 }}
    >
      <svg width="16" height="20" viewBox="0 0 16 20" fill="none" aria-hidden="true">
        <path
          d="M1 1L14.5 10.5L8.5 11.5L11.5 18L9 19L6.5 12.5L1 16V1Z"
          fill="#e2654a"
          stroke="white"
          strokeWidth="1.2"
        />
      </svg>
      <span className="ml-3 mt-0.5 inline-block rounded-md bg-accent px-1.5 py-0.5 font-mono text-[9px] font-medium text-white">
        {name}
      </span>
    </motion.div>
  );
}
