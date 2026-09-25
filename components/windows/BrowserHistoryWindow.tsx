"use client";

import { ArrowUpRight, History } from "lucide-react";
import { PROJECTS, type Project } from "@/lib/projects";
import { projectWindowId } from "@/lib/windows";
import { useWindowStore } from "@/lib/windowStore";
import { ProjectTile } from "@/components/ui/ProjectIcons";

/**
 * Fake browser history as navigation (PRD §6.6, TRD §4): every entry is a real
 * project, and clicking one opens (or focuses) that project's window.
 *
 * Placement answers PRD open question §9: flagships get their own row, the
 * supporting projects are grouped underneath rather than crowding the list.
 */
const GROUPS: Array<{ placement: Project["placement"]; label: string; hint: string }> = [
  { placement: "history", label: "Today", hint: "still open on purpose" },
  { placement: "folder", label: "Earlier", hint: "bookmarked, not forgotten" },
];

export function BrowserHistoryWindow() {
  const open = useWindowStore((s) => s.open);

  return (
    <div className="space-y-3.5">
      <div className="flex items-center gap-2 border-b border-line pb-2">
        <History aria-hidden="true" className="size-3.5 text-ink-faint" />
        <p className="flex-1 text-[11.5px] text-ink-soft">
          {PROJECTS.length} entries · click any row to open it
        </p>
      </div>

      {GROUPS.map((group) => {
        const entries = PROJECTS.filter((p) => p.placement === group.placement);
        if (entries.length === 0) return null;

        return (
          <section key={group.placement}>
            <h3 className="mb-1 flex items-baseline gap-2 font-mono text-[10px] uppercase tracking-[0.14em] text-ink-faint">
              {group.label}
              <span className="normal-case tracking-normal text-ink-faint/80">{group.hint}</span>
            </h3>
            <ul className="space-y-0.5">
              {entries.map((project) => (
                <li key={project.id}>
                  <button
                    type="button"
                    onClick={() => open(projectWindowId(project.id))}
                    className="group flex w-full items-center gap-2 rounded-md px-2 py-1.5 text-left transition-colors hover:bg-wallpaper-deep"
                  >
                    <ProjectTile visual={project.visual} size={26} />
                    <span className="min-w-0 flex-1">
                      <span className="flex items-center gap-1.5">
                        <span className="truncate text-[12px] text-ink">{project.name}</span>
                        {project.tier === 1 ? (
                          <span className="shrink-0 rounded border border-accent/40 px-1 font-mono text-[9px] uppercase tracking-wider text-accent-ink">
                            flagship
                          </span>
                        ) : null}
                      </span>
                      <span className="block truncate font-mono text-[10px] text-ink-faint">
                        {project.url}
                        {/* Real project text in the DOM before any JS runs (TRD §5). */}
                        <span className="sr-only"> — {project.tagline}</span>
                      </span>
                    </span>
                    <ArrowUpRight
                      aria-hidden="true"
                      className="size-3.5 shrink-0 text-ink-faint opacity-0 transition-opacity group-hover:opacity-100"
                    />
                    <span className="sr-only">Open {project.name}</span>
                  </button>
                </li>
              ))}
            </ul>
          </section>
        );
      })}
    </div>
  );
}
