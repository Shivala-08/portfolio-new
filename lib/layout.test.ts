import { describe, expect, it } from "vitest";
import { DEFAULT_OPEN_IDS, getWindowDefinition } from "@/lib/windows";
import { REFERENCE_VIEWPORT, usableArea } from "@/lib/viewport";
import type { WindowDefinition } from "@/lib/types";

/**
 * The default layout is hand-curated (design doc §8: true randomness reads as
 * broken, not charming), which means it can be broken by a careless position
 * change. These tests encode the two properties the curation is supposed to
 * guarantee, against the reference desktop the placements were authored for.
 */

/** Approximate rendered title-bar height: py-1.5 + 11px label. */
const TITLE_BAR_HEIGHT = 30;
/** A title bar needs at least this much visible width to stay readable. */
const MIN_VISIBLE_TITLE_WIDTH = 120;

const reference = { ...REFERENCE_VIEWPORT, ready: true, isMobile: false };

/** Windows in default z-order (later = on top, i.e. drawn last). */
const layout = DEFAULT_OPEN_IDS.map((id) => {
  const def = getWindowDefinition(id) as WindowDefinition;
  return {
    id,
    rect: {
      left: def.defaultPosition.x,
      top: def.defaultPosition.y,
      right: def.defaultPosition.x + def.defaultSize.width,
      bottom: def.defaultPosition.y + def.defaultSize.height,
    },
    titleRect: {
      left: def.defaultPosition.x,
      top: def.defaultPosition.y,
      right: def.defaultPosition.x + def.defaultSize.width,
      bottom: def.defaultPosition.y + TITLE_BAR_HEIGHT,
    },
  };
});

function overlapWidth(
  a: { left: number; right: number },
  b: { left: number; right: number },
): number {
  return Math.max(0, Math.min(a.right, b.right) - Math.max(a.left, b.left));
}

describe("default desktop layout", () => {
  it("keeps every window inside the usable desktop area", () => {
    const area = usableArea(reference);
    for (const win of layout) {
      expect(win.rect.left, `${win.id} left`).toBeGreaterThanOrEqual(0);
      expect(win.rect.top, `${win.id} top`).toBeGreaterThanOrEqual(0);
      expect(win.rect.right, `${win.id} right`).toBeLessThanOrEqual(area.width);
      expect(win.rect.bottom, `${win.id} bottom`).toBeLessThanOrEqual(area.height);
    }
  });

  it("leaves a readable strip of every title bar, including the bottom window", () => {
    layout.forEach((win, index) => {
      // Only windows drawn after this one can cover it.
      const above = layout.slice(index + 1);
      const coveredIntervals = above
        .filter((other) => {
          const verticalOverlap =
            Math.min(win.titleRect.bottom, other.rect.bottom) -
            Math.max(win.titleRect.top, other.rect.top);
          return verticalOverlap > 0;
        })
        .map((other) => ({ left: other.rect.left, right: other.rect.right }))
        .sort((a, b) => a.left - b.left);

      // Walk the covered intervals and measure what is left visible.
      let cursor = win.titleRect.left;
      let visible = 0;
      for (const interval of coveredIntervals) {
        if (interval.right <= cursor) continue;
        visible += Math.max(0, Math.min(interval.left, win.titleRect.right) - cursor);
        cursor = Math.max(cursor, interval.right);
      }
      visible += Math.max(0, win.titleRect.right - cursor);

      expect(visible, `${win.id} visible title width`).toBeGreaterThanOrEqual(
        MIN_VISIBLE_TITLE_WIDTH,
      );
    });
  });

  it("actually overlaps, so the mess is felt rather than described", () => {
    const idsWithOverlap = layout.filter((win, index) =>
      layout.some((other, otherIndex) => {
        if (otherIndex === index) return false;
        return (
          overlapWidth(win.rect, other.rect) > 0 &&
          Math.min(win.rect.bottom, other.rect.bottom) - Math.max(win.rect.top, other.rect.top) > 0
        );
      }),
    );
    expect(idsWithOverlap.length).toBeGreaterThanOrEqual(4);
  });

  it("stays inside the design doc's 4-6 window cap", () => {
    expect(layout.length).toBeGreaterThanOrEqual(4);
    expect(layout.length).toBeLessThanOrEqual(6);
  });
});
