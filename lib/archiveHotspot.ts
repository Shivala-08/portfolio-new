/**
 * Shared registration for the archive hotspot's DOM element.
 *
 * react-rnd drags are mouse-event based (no HTML5 drag events), so "is the
 * pointer over the hotspot right now?" is answered by hit-testing the
 * registered element's rect against live pointer coordinates. A little padding
 * makes the drop forgiving.
 */

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
