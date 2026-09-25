/**
 * Shared registration for the archive hotspot's DOM element.
 *
 * react-rnd drags are mouse-event based (no HTML5 drag events), so "is the
 * pointer over the hotspot right now?" is answered by hit-testing the
 * registered element's rect against live pointer coordinates. A little padding
 * makes the drop forgiving.
 *
 * Two hit paths feed the drop decision in Window.tsx:
 *   1. cursor over the hotspot (the precise case), and
 *   2. the dragged window's own rect overlapping the hotspot (the forgiving
 *      case — a 500px window can cover the 44px icon while the cursor sits
 *      outside it, and that still reads as "dropped on the icon").
 */

export type Point = { x: number; y: number };

let hotspotEl: HTMLElement | null = null;

export function registerHotspot(el: HTMLElement | null) {
  hotspotEl = el;
}

export function isOverHotspot(x: number, y: number, pad = 14): boolean {
  if (!hotspotEl) return false;
  const rect = hotspotEl.getBoundingClientRect();
  return (
    x >= rect.left - pad &&
    x <= rect.right + pad &&
    y >= rect.top - pad &&
    y <= rect.bottom + pad
  );
}

/** True when the given element's rect overlaps the hotspot (with padding). */
export function isElementOverHotspot(
  el: { getBoundingClientRect: () => { left: number; top: number; right: number; bottom: number } } | null | undefined,
  pad = 14,
): boolean {
  if (!el || !hotspotEl) return false;
  const rect = el.getBoundingClientRect();
  const hot = hotspotEl.getBoundingClientRect();
  return (
    rect.left <= hot.right + pad &&
    rect.right >= hot.left - pad &&
    rect.top <= hot.bottom + pad &&
    rect.bottom >= hot.top - pad
  );
}

type TouchLike = { clientX?: unknown; clientY?: unknown };
type EventLike = {
  clientX?: unknown;
  clientY?: unknown;
  touches?: ArrayLike<TouchLike> | null;
  changedTouches?: ArrayLike<TouchLike> | null;
};

function pointFromTouchList(list: ArrayLike<TouchLike> | null | undefined): Point | null {
  if (!list || list.length === 0) return null;
  const first = list[0];
  if (first && typeof first.clientX === "number" && typeof first.clientY === "number") {
    return { x: first.clientX, y: first.clientY };
  }
  return null;
}

/**
 * Pointer coordinates from a drag/pointer event of any flavour. Mouse and
 * Pointer events carry clientX/Y directly; Touch events (react-rnd can deliver
 * those on touch-capable devices) carry them on touches[0]/changedTouches[0].
 * Returns null when no coordinates can be read, so callers fall back to the
 * rect-overlap path instead of comparing against undefined.
 */
export function eventPoint(event: unknown): Point | null {
  if (!event || typeof event !== "object") return null;
  const e = event as EventLike;
  if (typeof e.clientX === "number" && typeof e.clientY === "number") {
    return { x: e.clientX, y: e.clientY };
  }
  return pointFromTouchList(e.touches) ?? pointFromTouchList(e.changedTouches);
}
