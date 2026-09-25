import { describe, expect, it } from "vitest";
import { DASHBOARD_METRICS } from "@/lib/metrics";
import { getWindowDefinition } from "@/lib/windows";

describe("dashboard metrics", () => {
  it("carries value, label, source and context on every entry", () => {
    expect(DASHBOARD_METRICS.length).toBeGreaterThan(0);
    for (const metric of DASHBOARD_METRICS) {
      expect(metric.value.trim()).not.toBe("");
      expect(metric.label.trim()).not.toBe("");
      expect(metric.projectLabel.trim()).not.toBe("");
      // The portfolio rule: no bare numbers — context is mandatory.
      expect(metric.context.trim()).not.toBe("");
    }
  });

  it("only uses known groups", () => {
    for (const metric of DASHBOARD_METRICS) {
      expect(["performance", "tradeoff"]).toContain(metric.group);
    }
  });

  it("links only to windows that actually exist", () => {
    for (const metric of DASHBOARD_METRICS) {
      if (!metric.windowId) continue;
      expect(getWindowDefinition(metric.windowId)).toBeDefined();
    }
  });
});
