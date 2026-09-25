"use client";

import { AboutWindow } from "@/components/windows/AboutWindow";
import { BrowserHistoryWindow } from "@/components/windows/BrowserHistoryWindow";
import { ContactWindow } from "@/components/windows/ContactWindow";
import { LabWindow } from "@/components/windows/LabWindow";
import { ProjectWindow } from "@/components/windows/ProjectWindow";
import { ResumeWindow } from "@/components/windows/ResumeWindow";
import { ShelfExperience } from "@/components/windows/ShelfExperience";
import { TaskManagerWindow } from "@/components/windows/TaskManagerWindow";
import { TodoWindow } from "@/components/windows/TodoWindow";
import type { WindowState } from "@/lib/types";

/**
 * The store holds only serializable state, so the mapping from `component` to a
 * React component lives here rather than in the store. That keeps lib/windowStore
 * free of JSX and makes the window definitions usable from plain modules.
 */
export function WindowContent({ win }: { win: WindowState }) {
  switch (win.component) {
    case "about":
      return <AboutWindow />;
    case "todo":
      return <TodoWindow />;
    case "browserHistory":
      return <BrowserHistoryWindow />;
    case "project":
      return win.projectId ? <ProjectWindow projectId={win.projectId} /> : null;
    case "resume":
      return <ResumeWindow />;
    case "contact":
      return <ContactWindow />;
    case "lab":
      return <LabWindow />;
    case "taskManager":
      return <TaskManagerWindow />;
    case "shelf":
      // The original Three.js shelf; falls back to the DOM reader under
      // prefers-reduced-motion (see ShelfExperience).
      return <ShelfExperience />;
    default:
      return null;
  }
}
