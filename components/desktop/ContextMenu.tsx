"use client";

import { useEffect, useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { Archive, Bug, ChevronRight, ExternalLink, Wrench } from "lucide-react";
import { cn } from "@/lib/cn";
import { PERSON } from "@/lib/content";
import { triggerCrash } from "@/components/desktop/CrashOverlay";
import { useAchievementStore } from "@/lib/achievements";
import { useWindowStore } from "@/lib/windowStore";

/**
 * The custom right-click menu.
 *
 * Replaces the browser menu on the desktop surface only — inputs, textareas
 * and text selections keep their native menu, so copy/paste is never
 * sabotaged. Mixes joke items with real ones: View Source goes to the actual
 * GitHub, and one item has a real consequence.
 */

type MenuItem = {
  label: string;
  hint: string;
  icon: React.ComponentType<{ className?: string }>;
  danger?: boolean;
  onSelect: () => void;
};

const MENU_W = 250;
const MENU_H = 200;

export function ContextMenu() {
  const [pos, setPos] = useState<{ x: number; y: number } | null>(null);
  const reduceMotion = useReducedMotion();

  useEffect(() => {
    const onContextMenu = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      // Native menu stays for editable elements and existing text selections.
      if (target.closest("input, textarea, [contenteditable]")) return;
      if (String(window.getSelection?.() ?? "").length > 0) return;
      e.preventDefault();
      setPos({
        x: Math.min(e.clientX, window.innerWidth - MENU_W - 8),
        y: Math.min(e.clientY, window.innerHeight - MENU_H - 8),
      });
    };
    window.addEventListener("contextmenu", onContextMenu);
    return () => window.removeEventListener("contextmenu", onContextMenu);
  }, []);

  const items: MenuItem[] = [
    {
      label: "Inspect Element",
      hint: "no.",
      icon: Wrench,
      onSelect: () => setPos(null),
    },
    {
      label: "View Source",
      hint: "the real thing",
      icon: ExternalLink,
      onSelect: () => {
        window.open(PERSON.github, "_blank", "noopener,noreferrer");
        setPos(null);
      },
    },
    {
      label: "Archive all windows",
      hint: "productivity",
      icon: Archive,
      onSelect: () => {
        for (const win of useWindowStore.getState().windows) {
          if (!win.minimized) useWindowStore.getState().archive(win.id);
        }
        if (useWindowStore.getState().windows.length >= 6) {
          useAchievementStore.getState().unlock("table-flip");
        }
        setPos(null);
      },
    },
    {
      label: "Trigger a critical error",
      hint: "you asked for it",
      icon: Bug,
      danger: true,
      onSelect: () => {
        setPos(null);
        triggerCrash();
      },
    },
  ];

  return (
    <AnimatePresence>
      {pos ? (
        <>
          <div className="fixed inset-0 z-[9500]" onPointerDown={() => setPos(null)} />
          <motion.div
            key="context-menu"
            role="menu"
            initial={reduceMotion ? false : { opacity: 0, scale: 0.96 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={reduceMotion ? { opacity: 0 } : { opacity: 0, scale: 0.98 }}
            transition={{ duration: 0.1 }}
            style={{ left: pos.x, top: pos.y }}
            className="fixed z-[9600] w-[250px] overflow-hidden rounded-lg border border-line-strong bg-chrome py-1 shadow-[0_16px_40px_-16px_rgb(38_35_31/0.4)]"
          >
            {items.map((item) => (
              <button
                key={item.label}
                type="button"
                role="menuitem"
                onClick={item.onSelect}
                className={cn(
                  "flex w-full items-center gap-2 px-3 py-1.5 text-left text-[12px] transition-colors",
                  item.danger
                    ? "text-accent-ink hover:bg-accent-soft"
                    : "text-ink hover:bg-wallpaper-deep",
                )}
              >
                <item.icon aria-hidden="true" className="size-3.5 shrink-0 text-ink-faint" />
                <span className="flex-1">{item.label}</span>
                <ChevronRight aria-hidden="true" className="size-3 shrink-0 text-ink-faint" />
                <span className="sr-only">{item.hint}</span>
              </button>
            ))}
            <div className="mt-1 border-t border-line px-3 pb-0.5 pt-1.5 font-mono text-[9px] text-ink-faint">
              Windows portfolio · build 47.0
            </div>
          </motion.div>
        </>
      ) : null}
    </AnimatePresence>
  );
}
