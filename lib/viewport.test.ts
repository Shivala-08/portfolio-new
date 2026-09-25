import { describe, expect, it } from "vitest";
import {
  TASKBAR_HEIGHT,
  clampPosition,
  clampSize,
  sheetPosition,
  sheetSize,
  usableArea,
} from "@/lib/viewport";
import type { Viewport } from "@/lib/types";

const viewport = (width: number, height: number, isMobile = false): Viewport => ({
  width,
  height,
  ready: true,
  isMobile,
});

describe("usableArea", () => {
  it("subtracts the taskbar from the available height", () => {
    const area = usableArea(viewport(1280, 800));
    expect(area.width).toBe(1280);
    expect(area.height).toBe(800 - TASKBAR_HEIGHT);
  });

  it("never collapses to a negative height on very short viewports", () => {
    expect(usableArea(viewport(320, 100)).height).toBe(240);
  });
});

describe("clampPosition", () => {
  it("keeps authored reference placements inside the desktop", () => {
    const size = { width: 520, height: 390 };
    const position = clampPosition({ x: 560, y: 24 }, size, viewport(1280, 800));
    expect(position).toEqual({ x: 560, y: 24 });
  });

  it("pulls a window back when the viewport is smaller than its authored slot", () => {
    const size = { width: 520, height: 390 };
    const position = clampPosition({ x: 900, y: 600 }, size, viewport(1000, 600));
    const area = usableArea(viewport(1000, 600));
    expect(position.x).toBe(area.width - size.width);
    expect(position.y).toBe(area.height - size.height);
  });

  it("never returns negative coordinates", () => {
    const position = clampPosition({ x: -200, y: -50 }, { width: 300, height: 200 }, viewport(800, 600));
    expect(position.x).toBe(0);
    expect(position.y).toBe(0);
  });
});

describe("clampSize", () => {
  it("shrinks a window that is wider than the viewport", () => {
    const size = clampSize({ width: 520, height: 390 }, viewport(320, 700));
    expect(size.width).toBe(320);
  });

  it("enforces a floor so a window can never be collapsed to nothing", () => {
    const size = clampSize({ width: 40, height: 20 }, viewport(1280, 800));
    expect(size.width).toBe(260);
    expect(size.height).toBe(150);
  });
});

describe("mobile sheet placement", () => {
  const mobile = viewport(390, 700, true);

  it("makes sheets full width, less a small margin", () => {
    const size = sheetSize({ width: 470, height: 430 }, mobile);
    expect(size.width).toBe(390 - 16);
    expect(size.height).toBe(430);
  });

  it("caps sheet height to the available area", () => {
    const size = sheetSize({ width: 470, height: 5000 }, mobile);
    expect(size.height).toBe(usableArea(mobile).height - 40);
  });

  it("cascades sheets and never lets one hang off the bottom", () => {
    const size = sheetSize({ width: 300, height: 430 }, mobile);
    const area = usableArea(mobile);
    for (let index = 0; index < 8; index += 1) {
      const position = sheetPosition(index, size, mobile);
      expect(position.y).toBeGreaterThanOrEqual(0);
      expect(position.y + size.height).toBeLessThanOrEqual(area.height);
    }
  });
});
