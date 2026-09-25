"use client";

import Image from "next/image";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useReducedMotion } from "framer-motion";
import {
  ChevronLeft,
  ChevronRight,
  ExternalLink,
  GitBranch,
  Library,
  Link2,
  Search,
  X,
} from "lucide-react";
import { cn } from "@/lib/cn";
import { PROJECTS } from "@/lib/projects";
import type { StampEntry } from "@/lib/projects";
import {
  CATALOG_TAGS,
  RESERVED_BOOK,
} from "@/lib/shelfAtmosphere";
import { playPageTurn } from "@/lib/roomSound";
import { useAchievementStore } from "@/lib/achievements";

/**
 * The Bookshelf (components/windows/ShelfWindow.tsx)
 *
 * A shelf of seven hardcovers — one per project, each bound in its real
 * generated cover art (public/covers/, uniform 3:4) — plus the features from
 * shelf-atmosphere-features-manual.md:
 *
 *  - §1 Due-date stamp card: Sheet 5 carries a library pocket card with the
 *    project's real GitHub dates (pulled once, hardcoded in lib/projects.ts).
 *  - §2 Reserved volume: an 8th spine, set apart by a gap and a RESERVED
 *    band — The Skynet, whose write-up is still being written. It opens a
 *    Sheet-1-only reserved notice instead of the full reader.
 *  - §3 Margin notes: faint handwritten asides on 2–3 sheets only (they live
 *    in the data as `marginNote`; rendering here is generic).
 *  - §4 Card catalog: a pull-open drawer of index cards, filterable by tag,
 *    fully keyboard-navigable, opening the same BookReader.
 *  - §7 Ambient sound: page-turn on open/turn + a quiet room-tone loop,
 *    OFF by default. The toggle lives on the window frame
 *    (ShelfExperience.tsx) so it persists across reader/catalog states;
 *    this component only calls the SFX hook (lib/roomSound.ts).
 *
 * Behaviour kept from the first build:
 *  - Every sheet reveal uses the same light animation (`sheet-in`); reduced
 *    motion collapses reveals to instant state changes, feedback preserved.
 *  - Sheet 5 renders only links that exist — no dead buttons (manual §4).
 *  - Keyboard: ←/→ page sheets, Escape closes the reader, Tab reaches every
 *    book, card and control (manual §3, TRD §5). Closing returns focus to
 *    the spine that was clicked.
 *
 * The 3D shelf (iframe) gets the atmosphere's light shaft/dust counterpart
 * via shelf-demo/build-port.py; sound stays a DOM-shelf feature because the
 * iframe owns its own document and audio context.
 */

/** Shelf order: flagships toward the center, supporting volumes at the ends. */
const SHELF_ORDER = [
  "deploy-forge",
  "omnitrix-os",
  "unisync",
  "context-shifter",
  "cinevault",
  "doc-strange",
  "marlboro-red",
] as const;

const SHEET_HINT: Record<string, string> = {
  Overview: "what it is",
  Problem: "why it exists",
  Build: "how it's built",
  Result: "where it landed",
  Links: "go read it",
  Reserved: "do not circulate",
};

/** Deterministic per-page tilt for the sheet paper, so SSR and client agree. */
const PAGE_TILT = [-1.2, 0.9, -0.6, 1.1, -0.9] as const;

/** Deterministic per-stamp tilt for the due-date card (manual §1: 1–3°). */
const STAMP_TILT = [-1.6, 1.2, -0.8, 1.9] as const;

/** Ink colours for the stamp card's stamps. */
const STAMP_INK = "#8c3b2e";

type Project = (typeof PROJECTS)[number];

/** All catalog entries: the 7 featured volumes in shelf order, then reserved. */
const CATALOG_BOOKS: Project[] = [
  ...SHELF_ORDER.map((id) => PROJECTS.find((p) => p.id === id)).filter(
    (p): p is Project => Boolean(p),
  ),
  RESERVED_BOOK,
];

/**
 * Library due-date pocket card (manual §1). Ruled lines, typewriter figures,
 * slightly rotated stamps — rendered on Sheet 5 next to the links.
 */
function StampCard({ entries }: { entries: StampEntry[] }) {
  return (
    <div
      className="relative mt-4 overflow-hidden rounded-[2px] border border-line bg-[#faf6ec] px-3 pb-2 pt-1.5 shadow-[0_4px_12px_-8px_rgb(38_35_31/0.4)]"
      style={{ transform: "rotate(-0.5deg)" }}
    >
      {/* Ruled lines, like the sheet paper but tighter */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 opacity-60"
        style={{
          backgroundImage: "linear-gradient(rgb(38 35 31 / 0.06) 1px, transparent 1px)",
          backgroundSize: "100% 18px",
          backgroundPosition: "0 22px",
        }}
      />
      <div className="relative">
        <div className="flex items-baseline justify-between border-b border-line/80 pb-1">
          <p className="font-mono text-[8px] uppercase tracking-[0.3em] text-ink-faint">
            date due
          </p>
          <p className="font-mono text-[8px] uppercase tracking-[0.2em] text-ink-faint">
            47 tabs open · circulation desk
          </p>
        </div>
        <ul className="mt-0.5">
          {entries.map((entry, i) => {
            const renewed = entry.label === "RENEWED";
            return (
              <li
                key={`${entry.label}-${entry.date}`}
                className="flex items-baseline justify-between gap-2 py-[5px]"
              >
                <span className="font-mono text-[9.5px] uppercase tracking-[0.08em] text-ink-faint">
                  {entry.label}
                </span>
                <span
                  className={cn(
                    "inline-block font-mono text-[11px] tracking-[0.06em]",
                    renewed ? "font-semibold" : "text-ink",
                  )}
                  style={{
                    color: renewed ? STAMP_INK : undefined,
                    transform: `rotate(${STAMP_TILT[i % STAMP_TILT.length]}deg)`,
                  }}
                >
                  {entry.date}
                </span>
              </li>
            );
          })}
        </ul>
      </div>
    </div>
  );
}

/**
 * Sheet-1-only reader for the reserved volume (manual §2): an honest
 * "still being written" notice, no full 5-sheet content, no links.
 */
function ReservedNotice({ project, onClose }: { project: Project; onClose: () => void }) {
  const panelRef = useRef<HTMLDivElement>(null);
  const reduceMotion = useReducedMotion();

  useEffect(() => {
    panelRef.current?.focus();
    playPageTurn();
  }, []);

  // Reserved notice keyboard contract: Escape shelves the volume. No ←/→ —
  // there is only the one sheet, and pretending otherwise would be lying
  // through navigation.
  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        event.preventDefault();
        event.stopPropagation();
        onClose();
      }
    };
    window.addEventListener("keydown", onKeyDown, true);
    return () => window.removeEventListener("keydown", onKeyDown, true);
  }, [onClose]);

  return (
    <div
      ref={panelRef}
      role="group"
      aria-label={`${project.name} — reserved volume notice`}
      tabIndex={-1}
      className="shelf-reader outline-none"
    >
      <div
        className={cn(
          "origin-top",
          reduceMotion ? "" : "animate-[sheet-in_260ms_cubic-bezier(0.2,0.72,0.24,1)_both]",
        )}
      >
        <div className="relative rounded-sm border border-line bg-white px-5 pb-6 pt-5 shadow-[0_10px_26px_-18px_rgb(38_35_31/0.45)]">
          <div
            aria-hidden="true"
            className="pointer-events-none absolute inset-0 rounded-sm opacity-70"
            style={{
              backgroundImage: "linear-gradient(rgb(38 35 31 / 0.05) 1px, transparent 1px)",
              backgroundSize: "100% 24px",
              backgroundPosition: "0 56px",
            }}
          />
          <div className="relative">
            <div className="flex items-baseline justify-between gap-3">
              <p className="font-mono text-[10px] uppercase tracking-[0.16em] text-accent-ink">
                Reserved · do not circulate
              </p>
              <p className="font-mono text-[10px] text-ink-faint">{project.name}</p>
            </div>

            {/* The RESERVED band itself — stamped, rotated, imperfect. */}
            <div className="mt-4 flex justify-center">
              <span
                className="inline-block rounded-[3px] border-2 border-dashed px-4 py-1.5 font-mono text-[13px] font-semibold uppercase tracking-[0.34em]"
                style={{ color: STAMP_INK, borderColor: `${STAMP_INK}88`, transform: "rotate(-2.4deg)" }}
              >
                Reserved
              </span>
            </div>

            <h3 className="mt-4 font-hand text-[26px] leading-tight text-ink">
              {project.name} — still being written
            </h3>
            <p className="mt-2.5 text-[12.5px] leading-relaxed text-ink-soft">
              {project.sheets[0].body}
            </p>

            {/* Rough progress note, in the todo-list honesty pattern. */}
            <p className="mt-4 border-t border-line pt-3 font-mono text-[10px] uppercase tracking-[0.14em] text-ink-faint">
              progress · engine shipped · case study 0/12 sections · un-reserves when the write-up lands
            </p>
          </div>
        </div>
      </div>

      <nav aria-label="Reserved volume" className="mt-3.5 flex justify-center">
        <button
          type="button"
          onClick={onClose}
          className="inline-flex items-center gap-1 rounded-md border border-line bg-chrome px-2.5 py-1.5 text-[11.5px] text-ink transition-colors hover:border-line-strong hover:bg-wallpaper-deep"
        >
          <ChevronLeft aria-hidden="true" className="size-3.5" />
          Back to the shelf
        </button>
      </nav>

      <p className="mt-2 text-center font-mono text-[10px] text-ink-faint">
        Esc to shelve
      </p>

      <p aria-live="polite" className="sr-only">
        {project.name}: reserved volume, still being written.
      </p>
    </div>
  );
}

function BookReader({ project, onClose }: { project: Project; onClose: () => void }) {
  const [page, setPage] = useState(0);
  const reduceMotion = useReducedMotion();
  const panelRef = useRef<HTMLDivElement>(null);
  const pageRef = useRef(0);
  pageRef.current = page;

  const sheet = project.sheets[page];
  const last = project.sheets.length - 1;
  const isLastPage = page === last;

  // Manual §7: a page-turn sound on open and on every turn. The sound engine
  // no-ops while the toggle is off, so these calls are free by default.
  const turn = useCallback(
    (next: number) => {
      const clamped = Math.max(0, Math.min(last, next));
      if (clamped === pageRef.current) return;
      setPage(clamped);
      playPageTurn();
    },
    [last],
  );

  const goPrev = useCallback(() => turn(pageRef.current - 1), [turn]);
  const goNext = useCallback(() => turn(pageRef.current + 1), [turn]);

  // Focus the panel on mount so the reader owns the keyboard immediately.
  useEffect(() => {
    panelRef.current?.focus();
    playPageTurn();
  }, []);

  // Manual §3 keyboard contract: ←/→ page through sheets, Escape shelves the
  // book. Bound at window capture phase *while a book is open* so it works no
  // matter where focus wandered inside the window, and so Escape stops here
  // instead of also triggering the desktop's Escape-closes-window handler
  // (Desktop.tsx deliberately leaves plain arrows unbound — no conflict there).
  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        event.preventDefault();
        event.stopPropagation();
        onClose();
        return;
      }
      if (event.key === "ArrowLeft") {
        event.preventDefault();
        event.stopPropagation();
        turn(pageRef.current - 1);
        return;
      }
      if (event.key === "ArrowRight") {
        event.preventDefault();
        event.stopPropagation();
        turn(pageRef.current + 1);
      }
    };
    window.addEventListener("keydown", onKeyDown, true);
    return () => window.removeEventListener("keydown", onKeyDown, true);
  }, [onClose, turn]);

  return (
    <div
      ref={panelRef}
      role="group"
      aria-label={`${project.name} — sheet ${page + 1} of ${project.sheets.length}`}
      tabIndex={-1}
      className="shelf-reader outline-none"
    >
      {/* Open-once transition: the sheet settles in (crossfades on page turns via key remount). */}
      <div
        key={page}
        className={cn(
          "origin-top",
          reduceMotion ? "" : "animate-[sheet-in_260ms_cubic-bezier(0.2,0.72,0.24,1)_both]",
        )}
      >
        {/* The sheet itself — a page of paper, faintly tilted per page for a hand-turned feel.
            Only the ruled-paper layer is aria-hidden; the page *content* (heading, body,
            Sheet 5 links, stamp card) must stay in the accessibility tree. */}
        <div
          className={cn(
            "relative rounded-sm border border-line bg-white px-5 pb-6 pt-5 shadow-[0_10px_26px_-18px_rgb(38_35_31/0.45)]",
            !reduceMotion && "transition-transform",
          )}
          style={{ transform: reduceMotion ? undefined : `rotate(${PAGE_TILT[page] ?? 0}deg)` }}
        >
          {/* Ruled paper */}
          <div
            aria-hidden="true"
            className="pointer-events-none absolute inset-0 rounded-sm opacity-70"
            style={{
              backgroundImage: "linear-gradient(rgb(38 35 31 / 0.05) 1px, transparent 1px)",
              backgroundSize: "100% 24px",
              backgroundPosition: "0 56px",
            }}
          />
          <div className="relative">
            <div className="flex items-baseline justify-between gap-3">
              <p className="font-mono text-[10px] uppercase tracking-[0.16em] text-accent-ink">
                Sheet {page + 1} / {project.sheets.length} · {SHEET_HINT[sheet.heading] ?? sheet.heading}
              </p>
              <p className="font-mono text-[10px] text-ink-faint">{project.name}</p>
            </div>
            <h3 className="mt-2 font-hand text-[26px] leading-tight text-ink">{sheet.heading}</h3>
            <p
              className={cn(
                "mt-2.5 min-h-[7.5rem] text-[12.5px] leading-relaxed text-ink-soft",
                // Manual §3: a margin note reserves its margin column — the body
                // wraps short of it instead of running underneath the handwriting.
                sheet.marginNote && "pr-[108px]",
              )}
            >
              {sheet.body}
            </p>

            {/* Manual §3 margin note: small, rotated, handwriting font, muted —
                pure flavour, populated on only 2–3 sheets across the shelf. */}
            {sheet.marginNote ? (
              <p
                className="absolute right-0 top-14 w-[100px] text-right font-hand text-[14.5px] leading-snug text-accent-ink/70"
                style={{ transform: "rotate(-2.8deg)" }}
              >
                {sheet.marginNote}
              </p>
            ) : null}

            {/* Manual §4: real links live on Sheet 5, and only when they exist —
                a project with neither link gets no empty rule. */}
            {isLastPage && (project.links.github || project.links.demo) ? (
              <div className="mt-4 flex flex-wrap items-center gap-2 border-t border-line pt-3.5">
                {project.links.github ? (
                  <a
                    href={project.links.github}
                    target="_blank"
                    rel="noreferrer noopener"
                    className="inline-flex items-center gap-1.5 rounded-md border border-line bg-chrome-muted px-2.5 py-1.5 text-[11.5px] text-ink transition-colors hover:border-line-strong hover:bg-wallpaper-deep"
                  >
                    <GitBranch aria-hidden="true" className="size-3.5" />
                    GitHub
                  </a>
                ) : null}
                {project.links.demo ? (
                  <a
                    href={project.links.demo}
                    target="_blank"
                    rel="noreferrer noopener"
                    className="inline-flex items-center gap-1.5 rounded-md border border-line bg-chrome-muted px-2.5 py-1.5 text-[11.5px] text-ink transition-colors hover:border-line-strong hover:bg-wallpaper-deep"
                  >
                    <ExternalLink aria-hidden="true" className="size-3.5" />
                    Live demo
                  </a>
                ) : null}
              </div>
            ) : null}

            {/* Manual §1: the due-date card shares Sheet 5 with the links. */}
            {isLastPage && project.stampCard ? <StampCard entries={project.stampCard} /> : null}
          </div>
        </div>
      </div>

      {/* Reader nav — every control Tab-reachable, per manual §3. */}
      <nav
        aria-label={`Pages of ${project.name}`}
        className="mt-3.5 flex items-center justify-between gap-2"
      >
        <button
          type="button"
          onClick={goPrev}
          disabled={page === 0}
          className="inline-flex items-center gap-1 rounded-md border border-line bg-chrome px-2.5 py-1.5 text-[11.5px] text-ink transition-colors hover:border-line-strong hover:bg-wallpaper-deep disabled:cursor-default disabled:opacity-35 disabled:hover:border-line disabled:hover:bg-chrome"
        >
          <ChevronLeft aria-hidden="true" className="size-3.5" />
          Prev
        </button>

        {/* Page dots: also clickable, and aria-current marks the position. */}
        <div className="flex items-center gap-1.5" role="tablist" aria-label="Go to sheet">
          {project.sheets.map((s, i) => (
            <button
              key={s.heading}
              type="button"
              role="tab"
              aria-selected={i === page}
              aria-label={`Sheet ${i + 1}: ${s.heading}`}
              onClick={() => turn(i)}
              className={cn(
                "h-1.5 rounded-full transition-all",
                i === page ? "w-5 bg-accent" : "w-1.5 bg-line-strong hover:bg-ink-faint",
              )}
            />
          ))}
        </div>

        <button
          type="button"
          onClick={goNext}
          disabled={isLastPage}
          className="inline-flex items-center gap-1 rounded-md border border-line bg-chrome px-2.5 py-1.5 text-[11.5px] text-ink transition-colors hover:border-line-strong hover:bg-wallpaper-deep disabled:cursor-default disabled:opacity-35 disabled:hover:border-line disabled:hover:bg-chrome"
        >
          Next
          <ChevronRight aria-hidden="true" className="size-3.5" />
        </button>
      </nav>

      <p className="mt-2 text-center font-mono text-[10px] text-ink-faint">
        ←/→ to turn · Esc to shelve
      </p>

      <button
        type="button"
        onClick={onClose}
        className="sr-only"
        aria-label={`Put ${project.name} back on the shelf`}
      >
        Close
      </button>

      {/* Turning a page moves no focus, so announce the new sheet instead. */}
      <p aria-live="polite" className="sr-only">
        {project.name}: sheet {page + 1} of {project.sheets.length}, {sheet.heading}
      </p>
    </div>
  );
}

/**
 * Card-catalog drawer (manual §4): wooden front, pull-open slide, index cards
 * per project, tag filter row. Fully keyboard-navigable — the drawer panel
 * takes focus on open, cards are a real focusable list, Escape closes.
 */
function CatalogDrawer({
  onClose,
  onOpenBook,
}: {
  onClose: () => void;
  onOpenBook: (id: string) => void;
}) {
  const [activeTag, setActiveTag] = useState<string | null>(null);
  const panelRef = useRef<HTMLDivElement>(null);
  const reduceMotion = useReducedMotion();

  useEffect(() => {
    panelRef.current?.focus();
  }, []);

  // Escape closes the drawer (capture phase, same contract as the reader).
  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        event.preventDefault();
        event.stopPropagation();
        onClose();
      }
    };
    window.addEventListener("keydown", onKeyDown, true);
    return () => window.removeEventListener("keydown", onKeyDown, true);
  }, [onClose]);

  const filtered = useMemo(
    () => CATALOG_BOOKS.filter((p) => !activeTag || p.tags.includes(activeTag)),
    [activeTag],
  );

  return (
    <div
      ref={panelRef}
      role="group"
      aria-label="Card catalog — search the collection"
      tabIndex={-1}
      className={cn(
        "shelf-reader flex h-full min-h-0 flex-col outline-none",
        reduceMotion
          ? ""
          : "animate-[catalog-slide_220ms_cubic-bezier(0.2,0.72,0.24,1)_both]",
      )}
    >
      {/* Wooden drawer front */}
      <div className="flex items-center justify-between gap-2 rounded-t-md border border-line bg-gradient-to-b from-[#8a5a3b] via-[#6e4128] to-[#5a3520] px-3 py-2.5 shadow-[inset_0_1px_0_rgb(255_255_255/0.18)]">
        <p className="font-mono text-[10px] uppercase tracking-[0.22em] text-[#f4eee6]">
          Card catalog · {CATALOG_BOOKS.length} volumes
        </p>
        <button
          type="button"
          onClick={onClose}
          aria-label="Push the catalog drawer closed"
          className="inline-flex items-center gap-1 rounded-md border border-[#f4eee633] bg-[#00000026] px-2 py-1 text-[11px] text-[#f4eee6] transition-colors hover:bg-[#0000004d]"
        >
          <X aria-hidden="true" className="size-3.5" />
          Close
        </button>
      </div>

      {/* Tag filter row (manual §4) */}
      <div className="border-b border-line bg-chrome-muted px-3 py-2">
        <div className="flex flex-wrap items-center gap-1.5" role="group" aria-label="Filter by tag">
          <button
            type="button"
            aria-pressed={activeTag === null}
            onClick={() => setActiveTag(null)}
            className={cn(
              "rounded-full border px-2.5 py-0.5 font-mono text-[10px] uppercase tracking-[0.08em] transition-colors",
              activeTag === null
                ? "border-accent bg-accent text-white"
                : "border-line bg-white text-ink-soft hover:border-line-strong hover:text-ink",
            )}
          >
            all
          </button>
          {CATALOG_TAGS.map((tag) => (
            <button
              key={tag}
              type="button"
              aria-pressed={activeTag === tag}
              onClick={() => setActiveTag((current) => (current === tag ? null : tag))}
              className={cn(
                "rounded-full border px-2.5 py-0.5 font-mono text-[10px] uppercase tracking-[0.08em] transition-colors",
                activeTag === tag
                  ? "border-accent bg-accent text-white"
                  : "border-line bg-white text-ink-soft hover:border-line-strong hover:text-ink",
              )}
            >
              {tag}
            </button>
          ))}
        </div>
        {/* Filter results announced politely; also honest UI for sighted users. */}
        <p aria-live="polite" className="mt-1.5 font-mono text-[9.5px] uppercase tracking-[0.14em] text-ink-faint">
          {filtered.length} of {CATALOG_BOOKS.length} volumes
          {activeTag ? ` · tag: ${activeTag}` : ""}
        </p>
      </div>

      {/* The index cards */}
      <div className="min-h-0 flex-1 overflow-y-auto bg-wallpaper px-3 py-3">
        <ul className="space-y-2" aria-label="Catalog cards">
          {filtered.map((project) => {
            const reserved = project.id === RESERVED_BOOK.id;
            return (
              <li key={project.id}>
                <button
                  type="button"
                  onClick={() => onOpenBook(project.id)}
                  className={cn(
                    "group block w-full rounded-[3px] border border-line bg-[#fdfaf2] px-3 pb-2.5 pt-2 text-left shadow-[0_3px_10px_-8px_rgb(38_35_31/0.5)] transition-colors hover:border-line-strong focus-visible:border-accent",
                    !reduceMotion && "transition-transform",
                  )}
                  style={{ transform: `rotate(${((project.name.length % 3) - 1) * 0.4}deg)` }}
                >
                  <span className="flex items-baseline justify-between gap-2">
                    <span className="font-hand text-[17px] leading-tight text-ink">
                      {project.name}
                    </span>
                    {reserved ? (
                      <span
                        className="shrink-0 font-mono text-[8px] font-semibold uppercase tracking-[0.24em]"
                        style={{ color: STAMP_INK }}
                      >
                        reserved
                      </span>
                    ) : (
                      <span className="shrink-0 font-mono text-[8.5px] uppercase tracking-[0.18em] text-ink-faint">
                        {project.category}
                      </span>
                    )}
                  </span>
                  <span className="mt-0.5 block text-[11.5px] leading-snug text-ink-soft">
                    {project.sheets[0].body.length > 140
                      ? `${project.sheets[0].body.slice(0, 137).trimEnd()}…`
                      : project.sheets[0].body}
                  </span>
                  <span className="mt-1.5 flex flex-wrap gap-1">
                    {project.tags.map((tag) => (
                      <span
                        key={tag}
                        className="rounded-sm border border-line bg-chrome-muted px-1.5 py-px font-mono text-[8.5px] uppercase tracking-[0.1em] text-ink-faint"
                      >
                        {tag}
                      </span>
                    ))}
                  </span>
                </button>
              </li>
            );
          })}
        </ul>
      </div>

      <p className="border-t border-line bg-chrome px-3 py-2 text-center font-mono text-[10px] text-ink-faint">
        Pick a card to pull its volume · Esc pushes the drawer back
      </p>
    </div>
  );
}

export function ShelfWindow() {
  const books = CATALOG_BOOKS.slice(0, SHELF_ORDER.length);
  const [openId, setOpenId] = useState<string | null>(null);
  const [catalogOpen, setCatalogOpen] = useState(false);
  const reduceMotion = useReducedMotion();
  const shelfRef = useRef<HTMLDivElement>(null);
  const catalogButtonRef = useRef<HTMLButtonElement>(null);
  /** The volume to hand focus back to once the reader closes. */
  const returnFocusRef = useRef<string | null>(null);

  const opened = CATALOG_BOOKS.find((b) => b.id === openId) ?? null;
  const isReserved = opened?.id === RESERVED_BOOK.id;

  const openBook = (id: string) => {
    returnFocusRef.current = id;
    setOpenId(id);
    setCatalogOpen(false);
    useAchievementStore.getState().unlock("bookworm");
  };

  // Keep the keyboard on the shelf: closing the reader returns focus to the
  // spine that was clicked rather than dropping it onto <body> (manual §3).
  useEffect(() => {
    const id = returnFocusRef.current;
    if (opened || catalogOpen || !id) return;
    returnFocusRef.current = null;
    shelfRef.current?.querySelector<HTMLButtonElement>(`[data-book-id="${id}"]`)?.focus();
  }, [opened, catalogOpen]);

  // Closing the catalog returns focus to the drawer pull.
  const closeCatalog = useCallback(() => {
    setCatalogOpen(false);
    catalogButtonRef.current?.focus();
  }, []);

  return (
    <div className="flex h-full flex-col">
      {opened ? (
        // Keyed by volume: a different book always opens on sheet 1. The
        // reserved volume opens its notice instead of the full reader.
        isReserved ? (
          <ReservedNotice key={opened.id} project={opened} onClose={() => setOpenId(null)} />
        ) : (
          <BookReader key={opened.id} project={opened} onClose={() => setOpenId(null)} />
        )
      ) : catalogOpen ? (
        <CatalogDrawer onClose={closeCatalog} onOpenBook={openBook} />
      ) : (
        <>
          <p className="mb-3 text-[12.5px] leading-relaxed text-ink-soft">
            Seven volumes, one per project — bound in their real covers.{" "}
            <span className="text-ink-faint">
              Click a spine to pull it off the shelf, or search the card catalog.
            </span>
          </p>

          {/* The shelf. Books bottom-aligned; taller volumes read as bigger formats.
              The reserved volume sits after a deliberate gap (manual §2). */}
          <div ref={shelfRef} className="relative mt-auto">
            <ul className="flex items-end justify-center gap-[3px] px-1" aria-label="Project volumes">
              {books.map((book, i) => (
                <li key={book.id} className="min-w-0">
                  <button
                    type="button"
                    onClick={() => openBook(book.id)}
                    data-book-id={book.id}
                    aria-label={`Open ${book.name} — ${book.tagline}`}
                    className={cn(
                      "group relative block w-[68px] outline-none",
                      !reduceMotion &&
                        "transition-transform duration-200 ease-out hover:-translate-y-2 focus-visible:-translate-y-2",
                    )}
                    style={{ height: 168 - (i % 3) * 12 }}
                  >
                    {/* Cover + spine in one press target; the spine is the left 10px. */}
                    <span
                      className="absolute inset-y-0 left-0 w-[10px] rounded-l-[3px]"
                      style={{ backgroundColor: book.spineColor }}
                      aria-hidden="true"
                    />
                    <span
                      className="absolute inset-y-0 left-[10px] right-0 overflow-hidden rounded-r-[4px] border border-line-strong/60 bg-wallpaper-deep"
                      aria-hidden="true"
                    >
                      <Image
                        src={book.coverImage}
                        alt=""
                        fill
                        sizes="58px"
                        className="object-cover object-left opacity-95 transition-opacity group-hover:opacity-100"
                      />
                      {/* Gloss + foil edge */}
                      <span className="absolute inset-0 bg-gradient-to-r from-black/12 via-transparent to-black/18" />
                    </span>
                    {/* Title along the spine, reading top-to-bottom like a real hardcover */}
                    <span
                      className="absolute inset-y-0 left-0 z-10 grid w-[10px] place-items-center"
                      aria-hidden="true"
                    >
                      <span
                        className="whitespace-nowrap font-mono text-[7.5px] font-medium uppercase tracking-[0.14em] text-white/90 [text-shadow:0_1px_2px_rgb(0_0_0/0.55)]"
                        style={{ writingMode: "vertical-rl" }}
                      >
                        {book.name}
                      </span>
                    </span>
                    <span className="sr-only">{book.name} — open the reader</span>
                  </button>
                </li>
              ))}

              {/* The deliberate gap before the reserved volume (manual §2) */}
              <li aria-hidden="true" className="w-[14px]" />

              {/* The reserved volume — set apart, duller, banded (manual §2).
                  The Skynet has no shelf cover art (the seven covers map to the
                  seven featured repos), so it renders as bound cloth: exactly
                  what an unfinished volume looks like on a real shelf. */}
              <li className="min-w-0">
                <button
                  type="button"
                  onClick={() => openBook(RESERVED_BOOK.id)}
                  data-book-id={RESERVED_BOOK.id}
                  aria-label={`Reserved: ${RESERVED_BOOK.name} — still being written. Open the reserved notice.`}
                  className={cn(
                    "group relative block w-[62px] outline-none",
                    !reduceMotion &&
                      "transition-transform duration-200 ease-out hover:-translate-y-1 focus-visible:-translate-y-1",
                  )}
                  style={{ height: 150 }}
                >
                  {/* Spine + bound cloth body, deliberately duller than the seven */}
                  <span
                    className="absolute inset-y-0 left-0 w-[10px] rounded-l-[3px] bg-[#1d262d]"
                    aria-hidden="true"
                  />
                  <span
                    className="absolute inset-y-0 left-[10px] right-0 rounded-r-[4px] border border-line-strong/60 bg-gradient-to-br from-[#2c3a44] via-[#26323a] to-[#1f2930]"
                    aria-hidden="true"
                  >
                    <span className="absolute inset-0 bg-gradient-to-r from-black/20 via-transparent to-black/25" />
                    <span
                      aria-hidden="true"
                      className="absolute left-1/2 top-2 -translate-x-1/2 text-white/60"
                    >
                      <Link2 className="size-3" />
                    </span>
                  </span>
                  {/* Title + RESERVED tag down the spine */}
                  <span
                    className="absolute inset-y-0 left-0 z-10 grid w-full place-items-center"
                    aria-hidden="true"
                  >
                    <span
                      className="whitespace-nowrap font-mono text-[7.5px] font-medium uppercase tracking-[0.14em] text-white/80 [text-shadow:0_1px_2px_rgb(0_0_0/0.55)]"
                      style={{ writingMode: "vertical-rl" }}
                    >
                      {RESERVED_BOOK.name} · reserved
                    </span>
                  </span>
                  <span className="sr-only">
                    {RESERVED_BOOK.name} — reserved volume, open the notice
                  </span>
                </button>
              </li>
            </ul>
            {/* The plank */}
            <div className="mt-0 h-[7px] rounded-b-[3px] bg-gradient-to-b from-[#8a5a3b] via-[#6e4128] to-[#4c2a18] shadow-[0_10px_18px_-8px_rgb(38_35_31/0.5)]" />

            {/* Footer: volume count, card-catalog pull, sound toggle (manual §4 + §7). */}
            <div className="mt-3 flex flex-wrap items-center justify-center gap-x-4 gap-y-2">
              <span className="inline-flex items-center gap-1.5 font-mono text-[10px] uppercase tracking-[0.16em] text-ink-faint">
                <Library aria-hidden="true" className="size-3.5" />
                {books.length} volumes + 1 reserved · covers are the real project art
              </span>

              <button
                ref={catalogButtonRef}
                type="button"
                onClick={() => setCatalogOpen(true)}
                aria-haspopup="dialog"
                className="inline-flex items-center gap-1.5 rounded-md border border-line bg-gradient-to-b from-[#8a5a3b] to-[#6e4128] px-2.5 py-1 font-mono text-[10px] uppercase tracking-[0.14em] text-[#f4eee6] shadow-[inset_0_1px_0_rgb(255_255_255/0.2)] transition-colors hover:from-[#7a4e33] hover:to-[#5c3722]"
              >
                <Search aria-hidden="true" className="size-3" />
                Card catalog
              </button>

            </div>
          </div>
        </>
      )}
    </div>
  );
}
