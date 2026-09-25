"use client";

import { useEffect, useState } from "react";
import { Clock } from "lucide-react";

/**
 * The honest screen-time widget (taskbar tray). Counts up from page load in
 * mm:ss — a self-aware nod to the attention-economy theme. Rendered only after
 * mount so the server HTML can't disagree with the counter.
 */
export function ScreenTimeWidget() {
  const [seconds, setSeconds] = useState(0);

  useEffect(() => {
    const id = setInterval(() => setSeconds((s) => s + 1), 1000);
    return () => clearInterval(id);
  }, []);

  const mm = Math.floor(seconds / 60);
  const ss = seconds % 60;
  const label = `${mm}m ${String(ss).padStart(2, "0")}s`;

  return (
    <div
      className="flex items-center gap-1.5 rounded-md border border-line bg-chrome px-2 py-1"
      title="Time you will not get back"
    >
      <Clock aria-hidden="true" className="size-3.5 shrink-0 text-ink-faint" />
      <span className="font-mono text-[10.5px] tabular-nums text-ink-soft">{label}</span>
      <span className="sr-only">You have been on this portfolio for {label}.</span>
    </div>
  );
}
