# 47 Tabs Open — Pallav Dholariya

A portfolio that looks like an over-committed desktop, and is faster to navigate
than a conventional one. Built to the three spec documents in this repo:

- `prd-47-tabs-open.md` — what it is and why
- `design-doc-47-tabs-open.md` — chaotic costume, organized skeleton
- `trd-47-tabs-open.md` — stack, architecture, accessibility requirements

Content comes from `identity.txt` (the portfolio knowledge base).

## Run it

Dev (live-reload):

```bash
npm install
npm run dev        # http://localhost:3000
npm test           # 24 unit tests: window store + layout math
npm run typecheck  # tsc --noEmit
npm run build      # production build (prerendered static)
```

One-click (macOS): double-click `start.command` in Finder. It installs
dependencies on first run, starts the dev server, opens the browser as soon as
the server responds, and reuses an already-running server instead of starting a
second one. Keep the Terminal window open — closing it stops the site.

Always-on production (macOS LaunchAgent):

```bash
npm run build
cp deploy/com.pallav.newportfolio.plist ~/Library/LaunchAgents/
launchctl load ~/Library/LaunchAgents/com.pallav.newportfolio.plist
```

- Serves the production bundle at http://localhost:3000 at every login
  (`RunAtLoad`), and relaunches it if it ever crashes (`KeepAlive`).
- Logs: `~/Library/Logs/new-portfolio.log`.
- After changing code: `npm run build`, then
  `launchctl kickstart -k gui/$(id -u)/com.pallav.newportfolio`.
- Stop / remove: `launchctl unload ~/Library/LaunchAgents/com.pallav.newportfolio.plist`.
- No terminal window needed; the server runs headless under launchd. Content
  changes require a rebuild — it serves the compiled bundle, not live code.

## What's built

All five phases from TRD §9:

| Phase | State |
|---|---|
| 1. Window manager core (open/close/drag/focus/z-index) + taskbar | done |
| 2. About/Notes, Todo, Resume, Contact windows | done |
| 3. Browser-history nav + project windows with real data | done |
| 4. Sticky notes + Now Playing widget | done |
| 5. Accessibility pass (keyboard, ARIA, reduced motion, no-JS) | done |
| 6. Performance/Lighthouse pass | not measured yet — see below |
| 7. Easter-egg layer (Task Manager, achievements, BSOD, archive, context menu, Clippy, multiplayer cursors) | done |
| 8. Bookshelf — Three.js 3D shelf of the 7 projects, paged reader, generated from `shelf-demo/` | done |
| 9. Shelf atmosphere (per `shelf-atmosphere-features-manual.md`) — stamp cards, reserved volume, margin notes, card catalog, light shaft + motes, ambient sound | done |

## Structure

```
app/                     root shell, design tokens, page
components/
  desktop/               Desktop, Window (chrome), Taskbar, StickyNote,
                         Assistant (Clippy), GhostCursor, MultiplayerCursors,
                         ArchiveHotspot, ContextMenu, CrashOverlay (BSOD),
                         BootTransition (Windows-Update), TaskManagerTrayButton
  windows/               About, Todo, BrowserHistory, Project, Resume, Contact,
                         Lab, TaskManager, Bookshelf (DOM + iframe)
  widgets/               Now Playing, Screen-time counter, Achievement toasts
  ui/parts.tsx           status badges, tags, metric cards, <details> case studies
  NoJsFallback.tsx       noscript readable page
public/
  shelf/                 the Bookshelf's Three.js page — generated, not hand-edited
  covers/                project cover art (764×1024)
lib/
  windowStore.ts         zustand store: windows, z-index stack, focus, announcements
  windows.ts             window definitions + curated placement + taskbar items
  projects.ts            typed project data (the case studies)
  shelfAtmosphere.ts     reserved volume (The Skynet) + room-sound track names
  roomSound.ts           Web Audio: synthesized page-turn + room tone (off by default)
  content.ts             about/todo/sticky/lab/contact copy
  viewport.ts            viewport hook + clamp / mobile-sheet placement math
  achievements.ts        achievement ids, sequences + zustand toast queue
  *.test.ts              unit tests
start.command           double-click launcher: deps → dev server → browser
deploy/                 LaunchAgent plist for always-on production serving
```

## Accessibility (TRD §5)

- **Keyboard:** `Tab` reaches every taskbar entry; `Enter`/`Space` opens, focuses or
  minimizes it. `Escape` closes the focused window. `Alt` + arrow keys move the
  focused window (hold `Shift` for a 64px step). Plain arrows are deliberately
  *not* bound, because window content scrolls.
- **Screen readers:** each window is `role="dialog"` with `aria-labelledby` pointing
  at its title bar, and open/close/minimize is announced through a polite live region.
- **Reduced motion:** Framer Motion animations collapse to instant state changes via
  `useReducedMotion`, with a CSS `prefers-reduced-motion` block as a backstop.
  Feedback is never removed, only made instantaneous.
- **No-JS / crawler fallback:** the desktop's six default windows are server-rendered
  with real content, so the resume link, contact details and project list are in the
  initial HTML. With JS disabled a `noscript` document hides the inert desktop and
  serves a plain readable page instead.
- **Mobile (< 900px):** floating windows stop being usable, so they become
  full-width cascaded sheets — drag and resize are disabled rather than broken.

## Easter-egg layer

Everything below is client-side only and additive — the server-rendered desktop,
the no-JS fallback and the accessibility contract are untouched.

| Feature | How to see it |
|---|---|
| **Fake Task Manager** | `Ctrl+Alt+Del` (or `Ctrl+Alt+T` / `Ctrl+Alt+Backspace` aliases, or the tray button — browsers usually never see the real combo). 15 processes of jokes with real interactions: Overthinking.exe respawns, Discipline.sys refuses End Task (Access Denied — it's load-bearing), Coffee.exe can be Resumed, npm_install.exe always comes back, docstrange_portal.exe runs quietly, 2am_retrieval.exe only Not-Responds between 2–5am, and imposter_syndrome.dll is the only one you can actually kill. Omnitrix_116fps.exe shows 116% CPU, flagged *(unverified)*. |
| **Achievement toasts** | Open the resume, open every window, read the Deploy Forge constraint AND tradeoffs sections, pull a volume off the Bookshelf, end imposter_syndrome.dll, try to end Discipline.sys, kill npm_install.exe, resume Coffee.exe, archive a window, archive everything via right-click, survive the crash, dismiss Clippy, or visit between 2–5am. |
| **BSOD flash** | Rare random trigger (never in the first minute, ≥4 min apart, ~1.1s) or right-click → "Trigger a critical error". |
| **Screen-time counter** | Taskbar tray, counts up honestly from page load. |
| **Drag-to-archive** | Drag any window's title bar onto the bottom-left dashed icon. The drop zone is a fixed-size hit area that stays put while a drag is active, the icon lifts above the dragged window so the target is visible, and the drop position is committed before the suck-in animation plays (no snap-back to the pre-drag spot). |
| **Custom context menu** | Right-click the desktop (inputs and text selections keep the native menu). "View Source" opens the real GitHub. |
| **Windows-Update transition** | Plays once on load ("Configuring updates… 47%"); replays the first time the Task Manager opens. |
| **Clippy assistant** | Starts 20s in, ≥45s between quips, max 5 per visit, "Never again" persists. |
| **Multiplayer ghost cursors** | Set `NEXT_PUBLIC_LIVEBLOCKS_KEY` and open the site in two tabs: cursors with `visitor_NNN` tags. Without a key the code never ships to the browser (lazy chunk). |

### Multiplayer setup (optional)

1. Create a project at [liveblocks.io](https://liveblocks.io) and copy the public key.
2. Add it to `.env.local`:

```bash
NEXT_PUBLIC_LIVEBLOCKS_KEY=pk_live_...
```

That's it — the room is `portfolio`, everyone gets a stable `visitor_NNN` name tag
stored in localStorage. Liveblocks' free tier covers a portfolio's traffic.

## Deliberate decisions worth knowing

**The Bookshelf is the original study, re-bound.** `public/shelf/index.html` is
`shelf-demo/file.html` — the "Working Volumes" Three.js library — with only its *contents*
replaced: the real cover art in place of the demo's embedded atlas, the seven real projects'
write-ups (from `details.txt`, verbatim) on the interior pages, the collection re-identified
as 47 Tabs Open, and Three.js vendored into `public/shelf/vendor/` so nothing is fetched from
a CDN. The behaviour, staging, physics and presentation are untouched. It is regenerated
rather than hand-edited:

```bash
python3 shelf-demo/build-port.py   # demo + real content -> public/shelf/index.html
```

The script fails loudly if any patch doesn't match exactly, so a change to the demo surfaces
as an error rather than a silent partial port. `ShelfExperience.tsx` hosts the page in an
iframe (it owns a whole document: its own fonts, palette, import map and canvas, none of
which leak into the desktop theme) and falls back to the DOM shelf in `ShelfWindow.tsx` when
the visitor prefers reduced motion.

**One addition to the TRD's data model.** The window `component` union gained `"lab"`.
The PRD (§6.2) asks for a "Currently Obsessed With" taskbar entry, but the design doc
(§4) forbids decorative-only taskbar items. Giving it a real window populated from the
Lab topics in `identity.txt` satisfies both. Drop it if you'd rather not have the entry.

**One open conflict between the docs.** `identity.txt` §40 describes the visual
personality as *Technical Futurism* (terminal / systems / minimal), while the design doc
§3 and §8 explicitly rule out dark-cyberpunk and specify a warm daylight desktop — that
palette is reserved for The Skynet as a separate project. **This build follows the design
doc**: warm off-white wallpaper, soft-shadowed white windows, one coral accent, with the
"systems" feel carried by monospace for metrics, URLs, tags and architecture chains rather
than by a dark palette. Switching directions is mostly a `@theme` change in
`app/globals.css`.

**Metrics never appear without their context** (`identity.txt` §38). The Omnitrix OS
116 FPS figure is rendered as an explicitly *unverified* claim, because the knowledge base
does not document the device, browser, scene, or whether it is average/peak/sustained.
That's intentional: better an honest caveat than a number that reads as a guarantee.

**Not done on purpose:** `localStorage` window persistence (TRD §1 lists it as optional
v1.1 — and keeping the initial state deterministic is what makes the server-rendered
first paint possible), and a real Spotify integration (TRD §8 scopes it as a separable
v1.1 addition; `NowPlayingWidget` is already shaped for it).

## Shelf atmosphere (features manual)

The seven features from `shelf-atmosphere-features-manual.md`, all live:

| Feature | Where |
|---|---|
| **Due-date stamp cards** | Sheet 5 of every book — real GitHub dates (`created_at`/`pushed_at`, pulled 2026-09-26) hardcoded in `lib/projects.ts`; actively-maintained repos get a RENEWED stamp. |
| **Reserved volume** | An 8th spine, set apart by a gap: **The Skynet** (the manual's example "Jarvis" isn't a real project here). Opens a Sheet-1-only "still being written" notice in the DOM shelf; in the 3D shelf it's bound in dull slate cloth with a stamped RESERVED band instead of cover art. |
| **Margin notes** | Handwritten asides on exactly 2 sheets (Deploy Forge's Result, UniSync's Build) — `marginNote` in the data. |
| **Card catalog** | "Card catalog" pull in the shelf footer: wooden drawer, index cards per volume, tag filter row, fully keyboard-navigable, opens the same reader. |
| **Light shaft + dust motes** | 3D shelf only: additive-blend gradient shaft off to the right (never in front of a book) + 44 drifting motes. The demo's `addDust()` was dead code — defined, never called; the port replaces it and calls it. Frozen under reduced motion. |
| **Ambient sound** | Page-turn SFX on open/turn + a quiet synthesized room tone (3 variants), toggle in the shelf's top-right corner. **Defaults off**, no `AudioContext` is created until the visitor opts in. |

Two notes:

- The reserved volume stays out of the featured `PROJECTS` array on purpose —
  the 7-project feature set is a contract (`build-port.py` fails on any other
  count), and the shelf's reserved slot reads `RESERVED_BOOK` from
  `lib/shelfAtmosphere.ts` instead.

## Placeholder checklist

Everything below is a genuine gap, not invented filler. Each one is marked `TODO` in the
source so it shows up in a grep, and the ones that surface in the UI render as visible
dashed notes so they can't be shipped by accident.

| What | Where | Action |
|---|---|---|
| Repo slugs (7) | `lib/projects.ts` → `links.github` | **click-tested 2026-09-24**: 6 of 7 resolve; `unisync` returns 404 (repo not public yet), so its link is withheld rather than shipped dead — restore it once published |
| New repo copy (4) | `lib/projects.ts` → context-shifter, unisync, marlboro-red, doc-strange | summaries/taglines are **placeholders**; replace with real copy + stacks |
| Narrated projects | About/Lab/Todo windows reference The Skynet as **history** | it's real work but no longer a featured tile — trim if unwanted |
| 116 FPS methodology | `lib/projects.ts` → Omnitrix metrics | document device/scene/measurement, or drop the metric |
| Skynet write-up | `lib/shelfAtmosphere.ts` → `RESERVED_BOOK` | the reserved volume un-reserves once the full case study is written |

To find them all:

```bash
grep -rn "TODO" lib components app
```

## Still worth doing

- Lighthouse pass against TRD §6 (Performance ≥ 90, Accessibility ≥ 95, FCP < 1.5s on
  throttled 4G). Not measured yet — the code is static-prerendered at 172 kB First Load JS,
  so it should clear these, but that's an assumption until it's run.
- Per-project case-study depth (`identity.txt` §37 lists 12 sections; the windows currently
  carry summary + metrics + architecture + constraint/experiment/failure/tradeoffs).
- The engineering metrics dashboard (`identity.txt` §38) as its own window. (Done: Metrics taskbar entry → `MetricsWindow`, fed by `lib/metrics.ts`.)
- `localStorage` persistence and the real Spotify widget, once v1 is live.
