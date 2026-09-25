"use client";

import { useEffect, useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { Archive } from "lucide-react";
import { cn } from "@/lib/cn";
import { isOverHotspot, registerHotspot } from "@/lib/archiveHotspot";
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
    const onMove = (e: PointerEvent) => setHovered(isOverHotspot(e.clientX, e.clientY));
    document.addEventListener("pointermove", onMove);
    return () => document.removeEventListener("pointermove", onMove);
  }, [active]);

  return (
    <div
      id="archive-hotspot"
      className="absolute bottom-3 left-3 z-[5] hidden md:block"
      aria-hidden="true"
    >
      <AnimatePresence>
        {(active || hovered) && (
          <motion.button
            type="button"
            tabIndex={-1}
            key="archive-icon"
            initial={reduceMotion ? false : { opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: hovered ? 1.15 : 1 }}
            exit={reduceMotion ? { opacity: 0 } : { opacity: 0, scale: 0.8 }}
            transition={{ type: "spring", stiffness: 400, damping: 22 }}
            onClick={() => archive(useWindowStore.getState().dragCandidateId ?? "")}
            className={cn(
              "absolute bottom-0 left-0 grid size-11 place-items-center rounded-xl border-2 border-dashed",
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
