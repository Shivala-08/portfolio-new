import { describe, expect, it } from "vitest";
import {
  eventPoint,
  isElementOverHotspot,
  isOverHotspot,
  registerHotspot,
} from "@/lib/archiveHotspot";

function fakeEl(rect: { left: number; top: number; right: number; bottom: number }) {
  return {
    getBoundingClientRect: () => rect,
  } as unknown as HTMLElement;
}

describe("archive hotspot hit-testing", () => {
  it("hits inside the hotspot rect and misses outside it", () => {
    registerHotspot(fakeEl({ left: 12, top: 700, right: 56, bottom: 744 }));
    try {
      expect(isOverHotspot(30, 720)).toBe(true);
      expect(isOverHotspot(500, 100)).toBe(false);
      // Padding forgives near misses…
      expect(isOverHotspot(0, 720)).toBe(true);
      // …but not far ones.
      expect(isOverHotspot(0, 720, 4)).toBe(false);
    } finally {
      registerHotspot(null);
    }
  });

  it("never hits when no hotspot is registered", () => {
    registerHotspot(null);
    expect(isOverHotspot(30, 720)).toBe(false);
    expect(isElementOverHotspot(fakeEl({ left: 0, top: 0, right: 100, bottom: 100 }))).toBe(
      false,
    );
  });

  it("hits when the dragged window rect overlaps the hotspot", () => {
    registerHotspot(fakeEl({ left: 12, top: 700, right: 56, bottom: 744 }));
    try {
      // Big window covering the icon, cursor far away — still a drop.
      expect(
        isElementOverHotspot(fakeEl({ left: 0, top: 400, right: 500, bottom: 750 })),
      ).toBe(true);
      expect(
        isElementOverHotspot(fakeEl({ left: 300, top: 100, right: 700, bottom: 400 })),
      ).toBe(false);
      expect(isElementOverHotspot(null)).toBe(false);
      expect(isElementOverHotspot(undefined)).toBe(false);
    } finally {
      registerHotspot(null);
    }
  });

  it("reads coordinates from mouse, touch and garbage events", () => {
    expect(eventPoint({ clientX: 10, clientY: 20 })).toEqual({ x: 10, y: 20 });
    expect(eventPoint({ touches: [{ clientX: 30, clientY: 40 }] })).toEqual({
      x: 30,
      y: 40,
    });
    expect(eventPoint({ changedTouches: [{ clientX: 50, clientY: 60 }] })).toEqual({
      x: 50,
      y: 60,
    });
    // Touch events have no clientX — must not blow up, just no point.
    expect(eventPoint({ touches: [] })).toBeNull();
    expect(eventPoint(null)).toBeNull();
    expect(eventPoint(undefined)).toBeNull();
    expect(eventPoint("mousedown")).toBeNull();
    expect(eventPoint({})).toBeNull();
  });
});
