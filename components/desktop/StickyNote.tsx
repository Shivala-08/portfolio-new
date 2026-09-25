"use client";

import { cn } from "@/lib/cn";
import { clampPosition, usableArea } from "@/lib/viewport";
import type { StickyNoteContent } from "@/lib/content";
import type { Viewport } from "@/lib/types";

const TONE_CLASS: Record<StickyNoteContent["tone"], string> = {
  yellow: "bg-note-yellow",
  pink: "bg-note-pink",
  blue: "bg-note-blue",
};

const NOTE_SIZE = { width: 172, height: 132 };

/**
 * Flavour, not navigation (design doc §4). Deliberately low z-index so windows
 * always win the overlap, and rotated by an authored angle rather than a random
 * one — true randomness reads as broken.
 */
export function StickyNote({
  note,
  viewport,
}: {
  note: StickyNoteContent;
  viewport: Viewport;
}) {
  const position = clampPosition(note.position, NOTE_SIZE, viewport);
  const area = usableArea(viewport);

  return (
    <div
      className={cn(
        "note-paper absolute hidden rounded-sm px-3 py-2.5 font-hand text-[15px] leading-snug text-ink shadow-[0_6px_16px_-8px_rgb(38_35_31/0.35)] md:block",
        TONE_CLASS[note.tone],
      )}
      style={{
        left: position.x,
        top: position.y,
        width: NOTE_SIZE.width,
        minHeight: NOTE_SIZE.height,
        rotate: `${note.rotate}deg`,
        // Notes never outrank a window (windows start at z-10).
        zIndex: 1,
        // Mobile hides them entirely; below that, the desktop stops being a desktop.
        display: area.width < 768 ? "none" : undefined,
      }}
    >
      <p>{note.text}</p>
    </div>
  );
}
