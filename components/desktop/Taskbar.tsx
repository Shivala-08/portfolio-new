"use client";

import { useEffect, useState } from "react";
import {
  Activity,
  ExternalLink,
  FileText,
  FlaskConical,
  FolderGit2,
  Library,
  ListTodo,
  Mail,
  User,
} from "lucide-react";
import { cn } from "@/lib/cn";
import { TASKBAR_ITEMS } from "@/lib/windows";
import { useWindowStore } from "@/lib/windowStore";
import { NowPlayingWidget } from "@/components/widgets/NowPlayingWidget";
import { ScreenTimeWidget } from "@/components/widgets/ScreenTimeWidget";
import { TaskManagerTrayButton } from "@/components/desktop/TaskManagerTrayButton";

const ICONS = {
  about: User,
  projects: FolderGit2,
  shelf: Library,
  todo: ListTodo,
  lab: FlaskConical,
  contact: Mail,
  resume: FileText,
  metrics: Activity,
} as const;

/**
 * The taskbar is the actual primary navigation (PRD §6.2): more items pinned than
 * reasonable, but every single one is a real target — no decorative entries
 * (design doc §4).
 */
export function Taskbar() {
  const windows = useWindowStore((s) => s.windows);
  const focusedId = useWindowStore((s) => s.focusedId);
  const toggle = useWindowStore((s) => s.toggle);

  const openIds = new Set(windows.map((w) => w.id));

  return (
    <div className="flex h-14 w-full shrink-0 items-center gap-2 border-t border-line bg-chrome/95 px-2 backdrop-blur">
      <nav aria-label="Portfolio navigation" className="scroll-thin min-w-0 flex-1 overflow-x-auto">
        <ul className="flex items-center gap-1">
          {TASKBAR_ITEMS.map((item) => {
            if (item.kind === "link") {
              return (
                <li key={item.id}>
                  <a
                    href={item.href}
                    target="_blank"
                    rel="noreferrer noopener"
                    className="flex shrink-0 items-center gap-1.5 rounded-md px-2 py-1.5 text-[11px] text-ink-soft transition-colors hover:bg-wallpaper-deep hover:text-ink"
                  >
                    <ExternalLink aria-hidden="true" className="size-3.5" />
                    <span className="hidden sm:inline">{item.label}</span>
                    <span className="sr-only sm:hidden">{item.label}</span>
                  </a>
                </li>
              );
            }

            const Icon = ICONS[item.icon];
            const isOpen = openIds.has(item.id);
            const isFocused = focusedId === item.id;
            const win = windows.find((w) => w.id === item.id);
            const isCollapsed = Boolean(win?.minimized);

            return (
              <li key={item.id}>
                <button
                  type="button"
                  onClick={() => toggle(item.id)}
                  aria-pressed={isOpen && !isCollapsed}
                  className={cn(
                    "relative flex shrink-0 items-center gap-1.5 rounded-md px-2 py-1.5 text-[11px] transition-colors",
                    isFocused
                      ? "bg-accent-soft text-accent-ink"
                      : "text-ink-soft hover:bg-wallpaper-deep hover:text-ink",
                  )}
                >
                  <Icon aria-hidden="true" className="size-3.5" />
                  <span className="hidden sm:inline">{item.label}</span>
                  <span className="sr-only sm:hidden">{item.label}</span>
                  {/* Open/active indicator (design doc §4). */}
                  <span
                    aria-hidden="true"
                    className={cn(
                      "absolute -bottom-0.5 left-1/2 h-[3px] -translate-x-1/2 rounded-full",
                      isOpen ? "w-4 bg-accent" : "w-0",
                      isCollapsed && "bg-line-strong",
                    )}
                  />
                </button>
              </li>
            );
          })}
        </ul>
      </nav>

      <div className="flex shrink-0 items-center gap-2">
        <TaskManagerTrayButton />
        <div className="hidden sm:block">
          <ScreenTimeWidget />
        </div>
        <div className="hidden sm:block">
          <NowPlayingWidget />
        </div>
        <TaskbarClock />
      </div>
    </div>
  );
}

/** Rendered only after mount so the server HTML can't disagree with the clock. */
function TaskbarClock() {
  const [now, setNow] = useState<Date | null>(null);

  useEffect(() => {
    setNow(new Date());
    const id = setInterval(() => setNow(new Date()), 30_000);
    return () => clearInterval(id);
  }, []);

  return (
    <time
      className="hidden min-w-[52px] text-right font-mono text-[11px] text-ink-soft sm:block"
      suppressHydrationWarning
    >
      {now
        ? now.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
        : "--:--"}
    </time>
  );
}
