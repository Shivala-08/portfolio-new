"use client";

import { useEffect, useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { Archive } from "lucide-react";
import { cn } from "@/lib/cn";
import { isOverHotspot, eventPoint, registerHotspot } from "@/lib/archiveHotspot";
import { useWindowStore } from "@/lib/windowStore";

/**
 * The archive hotspot (bottom-left desktop corner, mirroring the tray in the
 * bottom-right). Dragging a window's title bar over it archives that window
 * with a suck-into-the-icon animation — more tactile than the X button.
 *
 * react-rnd drags are mouse-event based, so hover state comes from listening
 * to pointermove on the document and hit-testing the registered rect; the
 * drop decision itself lives in Window.tsx's onDragStop. Hover is only tracked
 * while a drag candidate exists, so idle mouse movement costs nothing.
 */
export function ArchiveHotspot() {
  const [hovered, setHovered] = useState(false);
  const dragCandidateId = useWindowStore((s) => s.dragCandidateId);
  const archive = useWindowStore((s) => s.archive);
  const reduceMotion = useReducedMotion();
  const active = dragCandidateId !== null;

  useEffect(() => {
    registerHotspot(document.getElementById("archive-hotspot"));
    return () => registerHotspot(null);
  }, []);

  useEffect(() => {
    if (!active) {
      setHovered(false);
      return;
    }
    const onMove = (e: PointerEvent) => {
      const point = eventPoint(e);
      if (point) setHovered(isOverHotspot(point.x, point.y));
    };
    document.addEventListener("pointermove", onMove);
    return () => document.removeEventListener("pointermove", onMove);
  }, [active]);

  return (
    // The wrapper owns a fixed size so the hit-test rect (read via
    // getBoundingClientRect in lib/archiveHotspot.ts) cannot collapse when the
    // in-flow ghost outline is swapped for the absolutely-positioned button
    // during a drag — that collapse shrank the drop zone to the padded corner.
    // Hidden below MOBILE_BREAKPOINT (900), where dragging is disabled anyway.
    <div
      id="archive-hotspot"
      className="absolute bottom-3 left-3 z-[5] size-11 hidden min-[900px]:block"
      aria-hidden="true"
    >
      <AnimatePresence>
        {(active || hovered) && (
          <motion.button
            type="button"
            tabIndex={-1}
            key="archive-icon"
            initial={reduceMotion ? false : { opacity: 0, scale: 0.8 }}
            // Hover engage plays a one-shot "gulp" — dip, overshoot, settle —
            // the icon inhaling right before it sucks the window in. The
            // leading null starts from the current value, so re-hovering
            // mid-gulp retargets smoothly instead of restarting from 1.
            // Reduced motion skips the keyframes and keeps the plain scale.
            animate={
              hovered
                ? { opacity: 1, scale: reduceMotion ? 1.15 : [null, 0.94, 1.18, 1.15] }
                : { opacity: 1, scale: 1 }
            }
            exit={reduceMotion ? { opacity: 0 } : { opacity: 0, scale: 0.8 }}
            transition={{
              scale:
                hovered && !reduceMotion
                  ? {
                      duration: 0.3,
                      times: [0, 0.3, 0.65, 1],
                      ease: [0.23, 1, 0.32, 1] as [number, number, number, number],
                    }
                  : { type: "spring", stiffness: 400, damping: 22 },
              opacity: { type: "spring", stiffness: 400, damping: 22 },
            }}
            onClick={() => archive(useWindowStore.getState().dragCandidateId ?? "")}
            // Above the window stack while dragging: the dragged window (z >= 10)
            // would otherwise hide the drop target the moment the drag starts.
            className={cn(
              "absolute bottom-0 left-0 grid size-11 place-items-center rounded-xl border-2 border-dashed transition-colors duration-150",
              active && "z-[200]",
              hovered
                ? "border-accent bg-accent-soft text-accent-ink"
                : "border-line-strong/70 bg-chrome/80 text-ink-faint",
            )}
          >
            <Archive className="size-5" />
          </motion.button>
        )}
      </AnimatePresence>
      {/* Persistent ghost outline so the corner reads as "something lives here". */}
      {!active && !hovered ? (
        <div className="grid size-11 place-items-center rounded-xl border-2 border-dashed border-line-strong/40 text-ink-faint/50">
          <Archive className="size-5" />
        </div>
      ) : null}
    </div>
  );
}
