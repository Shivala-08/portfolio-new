"use client";

import { motion, useReducedMotion } from "framer-motion";
import { Minus, X } from "lucide-react";
import { Rnd } from "react-rnd";
import { cn } from "@/lib/cn";
import { eventPoint, isElementOverHotspot, isOverHotspot } from "@/lib/archiveHotspot";
import { useWindowStore } from "@/lib/windowStore";
import { clampPosition, clampSize, sheetPosition, sheetSize } from "@/lib/viewport";
import type { Viewport, WindowState } from "@/lib/types";

type WindowProps = {
  win: WindowState;
  /** Index among visible windows — drives the mobile sheet cascade. */
  index: number;
  focused: boolean;
  viewport: Viewport;
  children: React.ReactNode;
};

/**
 * Generic window chrome: title bar, minimize + close, drag on the title bar,
 * resize on the bottom-right corner only (design doc §4).
 *
 * Position/size are store-owned and committed on drag/resize *stop* rather than
 * mid-gesture, so dragging stays directly attached to the cursor with no easing
 * lag (design doc §5).
 */
export function Window({ win, index, focused, viewport, children }: WindowProps) {
  const focus = useWindowStore((s) => s.focus);
  const close = useWindowStore((s) => s.close);
  const minimize = useWindowStore((s) => s.minimize);
  const move = useWindowStore((s) => s.move);
  const resize = useWindowStore((s) => s.resize);
  const archive = useWindowStore((s) => s.archive);
  const setDragCandidate = useWindowStore((s) => s.setDragCandidate);
  // Read fresh during exit: AnimatePresence freezes this component's props when
  // it unmounts, but hook subscriptions stay live, so the archive flag set in
  // the same store update that removed the window is still seen here.
  const isArchiving = useWindowStore((s) =>
    Boolean(s.windows.find((w) => w.id === win.id)?.archiving),
  );
  const reduceMotion = useReducedMotion();

  const isMobile = viewport.isMobile;
  const size = isMobile ? sheetSize(win.size, viewport) : clampSize(win.size, viewport);
  const position = isMobile
    ? sheetPosition(index, size, viewport)
    : clampPosition(win.position, size, viewport);

  const titleId = `${win.id.replace(/[^a-z0-9]+/gi, "-")}-title`;

  // Opening scales up from the bottom edge, so it reads as coming from the
  // taskbar entry that was clicked. Closing is the reverse, and faster. When
  // archived via drag-to-drop, the window gets sucked into the corner icon.
  const openTransition = reduceMotion
    ? { duration: 0 }
    : { type: "spring" as const, stiffness: 430, damping: 34, mass: 0.7 };
  const closeTransition = reduceMotion ? { duration: 0 } : { duration: 0.12, ease: "easeOut" as const };
  const archiveTransition = reduceMotion
    ? { duration: 0 }
    : { duration: 0.32, ease: [0.5, 0, 0.75, 0] as [number, number, number, number] };

  return (
    <Rnd
      size={size}
      position={position}
      minWidth={Math.min(260, size.width)}
      minHeight={150}
      bounds="parent"
      dragHandleClassName="window-drag-handle"
      cancel=".window-no-drag"
      disableDragging={isMobile}
      enableResizing={isMobile ? false : { bottomRight: true }}
      onDragStart={() => {
        // Only title-bar drags participate in drag-to-archive (content drags
        // like text selection would otherwise set the candidate).
        if (!isMobile) setDragCandidate(win.id);
      }}
      onDragStop={(event, data) => {
        setDragCandidate(null);
        // Two hit paths: the cursor over the icon (precise), or the dragged
        // window's own rect overlapping it (forgiving — a big window can cover
        // the 44px icon while the cursor sits outside it). Touch drags have no
        // clientX, so a null point just skips the cursor path.
        const point = eventPoint(event);
        const droppedOnHotspot =
          (point ? isOverHotspot(point.x, point.y) : false) ||
          isElementOverHotspot(data?.node);
        if (droppedOnHotspot) {
          // Commit the drop position first: the exit animation reads the store
          // position, and without this the window visibly snaps back to where
          // the drag started before being sucked into the hotspot.
          move(win.id, clampPosition({ x: data.x, y: data.y }, size, viewport));
          archive(win.id);
          return;
        }
        move(win.id, clampPosition({ x: data.x, y: data.y }, size, viewport));
      }}
      onResizeStop={(_event, _direction, ref, _delta, nextPosition) => {
        const nextSize = clampSize(
          { width: ref.offsetWidth, height: ref.offsetHeight },
          viewport,
        );
        resize(win.id, nextSize, clampPosition(nextPosition, nextSize, viewport));
      }}
      style={{ zIndex: win.zIndex }}
    >
      <motion.div
        role="dialog"
        aria-labelledby={titleId}
        initial={{ opacity: 0, scale: 0.94, y: 18 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={
          // Archive = sucked into the bottom-left hotspot icon; close = the
          // plain quick fade. archive() sets `archiving` before unmounting the
          // window, so AnimatePresence plays this exit with the right flavour.
          isArchiving && !reduceMotion
            ? {
                opacity: 0,
                scale: 0.08,
                x: "-42vw",
                y: "38vh",
                rotate: -10,
                transition: archiveTransition,
              }
            : {
                opacity: 0,
                scale: 0.97,
                y: 10,
                transition: closeTransition,
              }
        }
        transition={openTransition}
        style={{ transformOrigin: "bottom center" }}
        onMouseDown={() => focus(win.id)}
        onFocus={() => focus(win.id)}
        className={cn(
          "flex h-full w-full flex-col overflow-hidden rounded-[var(--radius-window)] border bg-chrome",
          // Unfocused windows recede via their shadow only — content stays fully legible.
          focused
            ? "border-line-strong shadow-[0_20px_44px_-16px_rgb(38_35_31/0.30)]"
            : "border-line shadow-[0_10px_24px_-16px_rgb(38_35_31/0.22)]",
        )}
      >
        <div
          className={cn(
            "window-drag-handle flex shrink-0 select-none items-center gap-2 border-b border-line bg-chrome-muted px-2.5 py-1.5",
            isMobile ? "cursor-default" : "cursor-grab active:cursor-grabbing",
          )}
        >
          <div className="window-no-drag flex items-center gap-1">
            <button
              type="button"
              onClick={() => minimize(win.id)}
              aria-label={`Minimize ${win.title}`}
              className="grid size-5 place-items-center rounded text-ink-faint transition-colors hover:bg-wallpaper-deep hover:text-ink"
            >
              <Minus aria-hidden="true" className="size-3" />
            </button>
            <button
              type="button"
              onClick={() => close(win.id)}
              aria-label={`Close ${win.title}`}
              className="grid size-5 place-items-center rounded text-ink-faint transition-colors hover:bg-accent hover:text-white"
            >
              <X aria-hidden="true" className="size-3" />
            </button>
          </div>
          <h2 id={titleId} className="truncate font-mono text-[11px] text-ink-soft">
            {win.title}
          </h2>
        </div>

        <div className="scroll-thin min-h-0 flex-1 overflow-auto p-3.5">{children}</div>
      </motion.div>
    </Rnd>
  );
}
