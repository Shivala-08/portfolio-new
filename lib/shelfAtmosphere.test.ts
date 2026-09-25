import { describe, expect, it } from "vitest";
import { PROJECTS } from "@/lib/projects";
import { CATALOG_TAGS, RESERVED_BOOK } from "@/lib/shelfAtmosphere";

/**
 * Shelf-atmosphere data contracts (shelf-atmosphere-features-manual.md).
 * The testing checklist in the manual starts with: stamp card dates are real,
 * the reserved book is distinguishable, margin notes appear on only 2–3
 * sheets, and the catalog's tags drive its filter. These tests pin those.
 */

describe("stamp cards (atmosphere §1)", () => {
  it("every featured project carries a stamp card with real ISO dates", () => {
    for (const project of PROJECTS) {
      expect(project.stampCard, project.id).toBeDefined();
      expect(project.stampCard!.length).toBeGreaterThanOrEqual(2);
      for (const entry of project.stampCard!) {
        expect(entry.label, project.id).toBeTruthy();
        // ISO YYYY-MM-DD, pulled from the GitHub API — not placeholder text.
        expect(entry.date, `${project.id}:${entry.label}`).toMatch(/^\d{4}-\d{2}-\d{2}$/);
      }
    }
  });

  it("stamp dates are plausible for this portfolio (2026, no future dates)", () => {
    const now = new Date();
    for (const project of PROJECTS) {
      for (const entry of project.stampCard ?? []) {
        const date = new Date(`${entry.date}T00:00:00Z`);
        expect(Number.isNaN(date.getTime()), `${project.id} ${entry.date}`).toBe(false);
        expect(date.getUTCFullYear()).toBeGreaterThanOrEqual(2025);
        expect(date.getTime()).toBeLessThanOrEqual(now.getTime() + 86_400_000);
      }
    }
  });

  it("actively-maintained repos carry the RENEWED stamp; untouched ones do not", () => {
    // Pulled 2026-09-26: deploy-forge, context-shifter and cinevault had
    // pushed_at meaningfully after created_at; malboro was one day only.
    const renewed = (id: string) =>
      PROJECTS.find((p) => p.id === id)!.stampCard!.some((entry) => entry.label === "RENEWED");
    expect(renewed("deploy-forge")).toBe(true);
    expect(renewed("context-shifter")).toBe(true);
    expect(renewed("cinevault")).toBe(true);
    expect(renewed("marlboro-red")).toBe(false);
  });
});

describe("reserved volume (atmosphere §2)", () => {
  it("is The Skynet, kept out of the featured 7", () => {
    expect(RESERVED_BOOK.id).toBe("the-skynet");
    expect(PROJECTS.some((p) => p.id === RESERVED_BOOK.id)).toBe(false);
  });

  it("opens as a single-sheet notice — no 5-sheet pretence", () => {
    expect(RESERVED_BOOK.sheets).toHaveLength(1);
    expect(RESERVED_BOOK.sheets[0].heading).toBe("Reserved");
    expect(RESERVED_BOOK.sheets[0].body).toMatch(/still being written/i);
  });

  it("is visually set apart: no cover art, dull spine, reserved markers", () => {
    expect(RESERVED_BOOK.coverImage).toBe("");
    expect(RESERVED_BOOK.spineColor).toMatch(/^#/);
    // Its spine must differ from all seven featured spines.
    for (const project of PROJECTS) {
      expect(RESERVED_BOOK.spineColor, project.id).not.toBe(project.spineColor);
    }
    expect(RESERVED_BOOK.tagline).toMatch(/reserved/i);
  });

  it("carries only claims documented in the knowledge base", () => {
    // The metrics context must state where the 883 KB → 24.9 KB figure comes
    // from (identity.txt §15) rather than inventing precision.
    expect(RESERVED_BOOK.metrics[0].context).toMatch(/97% reduction/);
    expect(RESERVED_BOOK.metrics[0].context).toMatch(/README/i);
  });
});

describe("margin notes (atmosphere §3)", () => {
  it("appear on only 2–3 sheets across the whole shelf", () => {
    const noted = PROJECTS.flatMap((p) =>
      p.sheets.filter((s) => s.marginNote).map((s) => `${p.id}/${s.heading}`),
    );
    expect(noted.length).toBeGreaterThanOrEqual(2);
    expect(noted.length).toBeLessThanOrEqual(3);
  });

  it("never sit on the Links sheet (links + stamps own Sheet 5)", () => {
    for (const project of PROJECTS) {
      for (const sheet of project.sheets) {
        if (sheet.marginNote) expect(sheet.heading, project.id).not.toBe("Links");
      }
    }
  });

  it("keep the note short — a margin, not a second paragraph", () => {
    for (const project of PROJECTS) {
      for (const sheet of project.sheets) {
        if (sheet.marginNote) {
          expect(sheet.marginNote.length, project.id).toBeLessThan(90);
        }
      }
    }
  });
});

describe("card catalog (atmosphere §4)", () => {
  it("every featured project and the reserved volume carry tags", () => {
    for (const project of PROJECTS) {
      expect(project.tags.length, project.id).toBeGreaterThan(0);
      for (const tag of project.tags) expect(tag, project.id).toMatch(/^[a-z0-9-]+$/);
    }
    expect(RESERVED_BOOK.tags.length).toBeGreaterThan(0);
  });

  it("CATALOG_TAGS is exactly the union of project tags, in first-seen order", () => {
    const expected = [...new Set([...PROJECTS, RESERVED_BOOK].flatMap((p) => p.tags))];
    expect(CATALOG_TAGS).toEqual(expected);
  });

  it("every tag actually filters at least one volume", () => {
    for (const tag of CATALOG_TAGS) {
      expect(
        [...PROJECTS, RESERVED_BOOK].some((p) => p.tags.includes(tag)),
        tag,
      ).toBe(true);
    }
  });

  it("each catalog entry can render a one-line card from its Overview sheet", () => {
    for (const project of [...PROJECTS, RESERVED_BOOK]) {
      expect(project.sheets[0].body.length, project.id).toBeGreaterThan(0);
    }
  });
});
