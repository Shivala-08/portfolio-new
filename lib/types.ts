/**
 * Shared types for the window manager.
 * Mirrors trd-47-tabs-open.md §3 (data model) with one extension noted below.
 */

export type WindowComponent =
  | "about"
  | "todo"
  | "browserHistory"
  | "project"
  | "resume"
  | "contact"
  /**
   * NOTE: extension beyond the TRD's union. The PRD (§6.2) asks for a
   * "Currently Obsessed With" taskbar entry, but the design doc (§4 Taskbar)
   * forbids decorative-only taskbar items. Giving it a real window satisfies
   * both. It is populated from the "Lab" section of the identity knowledge base.
   */
  | "lab"
  /** Second extension: the fake Task Manager (Ctrl+Alt+Del easter egg). */
  | "taskManager"
  /** Third extension: the bookshelf — project covers + paged reader. */
  | "shelf"
  /** Fourth extension: the engineering metrics dashboard (identity.txt §38). */
  | "metrics";

export type WindowState = {
  id: string;
  title: string;
  component: WindowComponent;
  /** only set when component === "project" */
  projectId?: string;
  position: { x: number; y: number };
  size: { width: number; height: number };
  zIndex: number;
  minimized: boolean;
  /** Briefly true during drag-to-archive, to trigger the suck-in animation. */
  archiving?: boolean;
};

/** A window that can be opened, plus its curated default placement. */
export type WindowDefinition = {
  id: string;
  /** Compact taskbar / title-bar label. */
  label: string;
  title: string;
  component: WindowComponent;
  projectId?: string;
  /** Reference placement, authored against a 1280x800 desktop. Clamped at render time. */
  defaultPosition: { x: number; y: number };
  defaultSize: { width: number; height: number };
};

export type Viewport = {
  width: number;
  height: number;
  /** false until after hydration — avoids server/client markup mismatch */
  ready: boolean;
  isMobile: boolean;
};
