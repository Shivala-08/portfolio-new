"use client";

import { Activity } from "lucide-react";
import { useWindowStore } from "@/lib/windowStore";
import { useAchievementStore } from "@/lib/achievements";
import { playBootTransition } from "@/components/desktop/BootTransition";

/**
 * Taskbar tray button for the fake Task Manager.
 *
 * Browsers rarely see the real Ctrl+Alt+Del (the OS eats it), so this visible
 * entry point keeps the joke discoverable — same achievement, same one-time
 * boot-transition flourish on first open.
 */
export function TaskManagerTrayButton() {
  const toggle = useWindowStore((s) => s.toggle);

  const onClick = () => {
    const first = !useWindowStore.getState().windows.some((w) => w.id === "taskManager");
    toggle("taskManager");
    if (first) {
      useAchievementStore.getState().unlock("task-manager");
      playBootTransition();
    }
  };

  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={useWindowStore((s) => s.windows.some((w) => w.id === "taskManager" && !w.minimized))}
      title="Task Manager (also try Ctrl+Alt+Del)"
      className="flex shrink-0 items-center gap-1.5 rounded-md px-2 py-1.5 text-[11px] text-ink-soft transition-colors hover:bg-wallpaper-deep hover:text-ink"
    >
      <Activity aria-hidden="true" className="size-3.5" />
      <span className="hidden lg:inline">Task Manager</span>
      <span className="sr-only lg:hidden">Task Manager</span>
    </button>
  );
}
