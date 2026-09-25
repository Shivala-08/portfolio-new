import { PROJECTS, getProject } from "@/lib/projects";
import type { WindowDefinition } from "@/lib/types";

/**
 * Window definitions + curated default placement.
 *
 * Placements are authored against a 1280x800 reference desktop and clamped to
 * the real viewport at render time. They are hand-tuned, not generated
 * (design doc §8: true randomness reads as broken, not charming).
 *
 * Layout guarantee: no window's title bar is fully covered, so every title stays
 * readable through the overlap. The signed z-order lives in DEFAULT_WINDOWS.
 */

export const PROJECT_WINDOW_PREFIX = "project:";

export function projectWindowId(projectId: string): string {
  return `${PROJECT_WINDOW_PREFIX}${projectId}`;
}

export const WINDOW_DEFS: Record<string, WindowDefinition> = {
  about: {
    id: "about",
    label: "About",
    title: "about.md",
    component: "about",
    defaultPosition: { x: 300, y: 40 },
    defaultSize: { width: 470, height: 430 },
  },
  projects: {
    id: "projects",
    label: "Projects",
    title: "History — Projects",
    component: "browserHistory",
    defaultPosition: { x: 560, y: 24 },
    defaultSize: { width: 520, height: 390 },
  },
  todo: {
    id: "todo",
    label: "Todo",
    title: "todo.md",
    component: "todo",
    defaultPosition: { x: 330, y: 330 },
    defaultSize: { width: 330, height: 330 },
  },
  resume: {
    id: "resume",
    label: "Resume",
    title: "resume.md",
    component: "resume",
    defaultPosition: { x: 880, y: 150 },
    defaultSize: { width: 330, height: 400 },
  },
  contact: {
    id: "contact",
    label: "Contact",
    title: "contact.txt",
    component: "contact",
    defaultPosition: { x: 20, y: 330 },
    defaultSize: { width: 340, height: 320 },
  },
  lab: {
    id: "lab",
    label: "Lab",
    title: "currently_exploring.md",
    component: "lab",
    defaultPosition: { x: 700, y: 430 },
    defaultSize: { width: 420, height: 280 },
  },
  taskManager: {
    id: "taskManager",
    label: "Task Manager",
    title: "Task Manager",
    component: "taskManager",
    defaultPosition: { x: 380, y: 120 },
    defaultSize: { width: 560, height: 400 },
  },
  shelf: {
    id: "shelf",
    label: "Bookshelf",
    title: "bookshelf — 7 volumes",
    component: "shelf",
    // Larger than the other windows on purpose: this one hosts the full 3D
    // shelf (an editorial scene with a masthead, browse bar and detail panel),
    // which reads as cramped at the size the DOM reader used. Clamped to the
    // viewport at render time, so it still fits small screens.
    defaultPosition: { x: 250, y: 70 },
    defaultSize: { width: 1000, height: 660 },
  },
  metrics: {
    id: "metrics",
    label: "Metrics",
    title: "engineering_metrics.md",
    component: "metrics",
    // Not open by default — DEFAULT_OPEN_IDS stays at the design doc's 6-window
    // ceiling. Reachable from the taskbar.
    defaultPosition: { x: 210, y: 60 },
    defaultSize: { width: 560, height: 430 },
  },
};

/** Project windows are generated from project data rather than hand-listed. */
export const PROJECT_WINDOW_DEFS: WindowDefinition[] = PROJECTS.map((p) => ({
  id: projectWindowId(p.id),
  label: p.name,
  title: `${p.name}.md`,
  component: "project" as const,
  projectId: p.id,
  defaultPosition: { x: 620, y: 90 },
  defaultSize: { width: 520, height: 520 },
}));

export function getWindowDefinition(id: string): WindowDefinition | undefined {
  if (id.startsWith(PROJECT_WINDOW_PREFIX)) {
    const projectId = id.slice(PROJECT_WINDOW_PREFIX.length);
    const project = getProject(projectId);
    if (!project) return undefined;
    return {
      id,
      label: project.name,
      title: `${project.name}.md`,
      component: "project",
      projectId,
      defaultPosition: { x: 620, y: 90 },
      defaultSize: { width: 520, height: 520 },
    };
  }
  return WINDOW_DEFS[id];
}

/**
 * Windows open on load — 6, the design doc's stated ceiling.
 *
 * Array order is the initial z-order (later = on top). Overlaps were checked
 * window by window against that order: no title bar ends up fully covered, and
 * every one keeps at least ~200px of its title readable. Two things are open for
 * reasons beyond the joke — Resume (PRD §6.9, the one thing that may not be
 * buried) and Contact (TRD §5 wants contact details in the server-rendered DOM).
 */
export const DEFAULT_OPEN_IDS = ["about", "todo", "projects", "resume", "lab", "contact"] as const;

type TaskbarItem =
  | {
      kind: "window";
      id: string;
      label: string;
      icon: "about" | "projects" | "todo" | "resume" | "contact" | "lab" | "shelf" | "metrics";
    }
  | { kind: "link"; id: string; label: string; href: string };

/**
 * Taskbar entries. Every one is a real target (design doc §4) — 6 windows plus a
 * GitHub link is deliberately "a few more than feels necessary", which is the joke.
 */
export const TASKBAR_ITEMS: TaskbarItem[] = [
  { kind: "window", id: "about", label: "About", icon: "about" },
  { kind: "window", id: "projects", label: "Projects", icon: "projects" },
  { kind: "window", id: "shelf", label: "Bookshelf", icon: "shelf" },
  { kind: "window", id: "metrics", label: "Metrics", icon: "metrics" },
  { kind: "window", id: "todo", label: "Todo", icon: "todo" },
  { kind: "window", id: "lab", label: "Lab", icon: "lab" },
  { kind: "window", id: "contact", label: "Contact", icon: "contact" },
  { kind: "window", id: "resume", label: "Resume", icon: "resume" },
  { kind: "link", id: "github", label: "GitHub", href: "https://github.com/Shivala-08" },
];
