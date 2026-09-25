"use client";

import { useEffect, useState } from "react";
import type { Viewport } from "@/lib/types";

/**
 * Reference desktop the curated placements were authored against.
 * The server render (and the first client render, for hydration) uses this,
 * then a post-mount effect swaps in the real viewport. That ordering is what
 * keeps the server HTML and the first client paint identical.
 */
export const REFERENCE_VIEWPORT = { width: 1280, height: 800 };

export const TASKBAR_HEIGHT = 56;
export const MOBILE_BREAKPOINT = 900;

export function useViewport(): Viewport {
  const [viewport, setViewport] = useState<Viewport>({
    ...REFERENCE_VIEWPORT,
    ready: false,
    isMobile: false,
  });

  useEffect(() => {
    const update = () => {
      const width = window.innerWidth;
      const height = window.innerHeight;
      setViewport({ width, height, ready: true, isMobile: width < MOBILE_BREAKPOINT });
    };
    update();
    window.addEventListener("resize", update);
    return () => window.removeEventListener("resize", update);
  }, []);

  return viewport;
}

function clamp(value: number, min: number, max: number): number {
  return Math.min(Math.max(value, min), max);
}

/** Desktop area available to windows: full viewport minus the taskbar. */
export function usableArea(viewport: Viewport) {
  return {
    width: viewport.width,
    height: Math.max(240, viewport.height - TASKBAR_HEIGHT),
  };
}

export function clampSize(size: { width: number; height: number }, viewport: Viewport) {
  const area = usableArea(viewport);
  const minWidth = Math.min(260, area.width);
  return {
    width: clamp(size.width, minWidth, area.width),
    height: clamp(size.height, 150, area.height),
  };
}

export function clampPosition(
  position: { x: number; y: number },
  size: { width: number; height: number },
  viewport: Viewport,
) {
  const area = usableArea(viewport);
  return {
    x: clamp(position.x, 0, Math.max(0, area.width - size.width)),
    y: clamp(position.y, 0, Math.max(0, area.height - Math.min(size.height, area.height))),
  };
}

/**
 * Mobile (< 900px): floating windows stop being usable, so windows become
 * full-width sheets cascaded by a small offset. The focused window is on top via
 * the same z-stack, so nothing is lost — it just stops pretending to be a desktop.
 */
export function sheetSize(def: { width: number; height: number }, viewport: Viewport) {
  const area = usableArea(viewport);
  return {
    width: area.width - 16,
    height: Math.min(def.height, area.height - 40),
  };
}

export function sheetPosition(
  index: number,
  size: { width: number; height: number },
  viewport: Viewport,
) {
  const area = usableArea(viewport);
  const cascade = Math.min(index * 26, 150);
  return {
    x: 8 + Math.min(index * 4, 16),
    y: clamp(12 + cascade, 0, Math.max(0, area.height - size.height - 8)),
  };
}
