# Design Document
## "47 Tabs Open" — Pallav's Portfolio (v2)

**Companion to:** prd-47-tabs-open.md, trd-47-tabs-open.md
**Last updated:** 2026-09-23

---

## 1. Design principle

**Chaotic costume, organized skeleton.** Every visual choice should read as "unhinged but secretly fine" — never actually confusing. If a visitor can't find the resume link within a few seconds because the "chaos" got in the way, the design has failed regardless of how charming it looks in a screenshot.

## 2. Voice & tone

- Self-aware, honest, specific to Pallav — not a generic "Gen-Z internet voice" filter.
- Good: *"ship EmotiSense v2 (?)"*, *"why did retrieval break at 2am and why did I stay up to find out"*
- Bad: forced slang, meme references with no personal connection, jokes that could belong to literally any student's portfolio
- Humor lands because it's true and specific — every sticky note, todo item, and tangent should be something Pallav could actually say about his own week, not invented filler.

## 3. Visual language

### Color
- Base: a neutral, slightly warm off-white or light grey "desktop wallpaper" background — NOT black/cyberpunk (that's the previous Skynet direction; this concept should feel like daylight, not a lab at 2am).
- Windows: clean white/light-grey chrome, soft shadows for depth between overlapping windows.
- Accent: one confident accent color (pick one — a warm coral, a soft violet, or a mustard-yellow all fit "handwritten sticky-note" energy) used sparingly for links, active states, and the sticky notes themselves.
- Sticky notes: 2-3 rotating pastel tones (yellow, pink, blue) at slight random rotation angles for a hand-placed feel.

### Typography
- UI chrome (title bars, taskbar): a clean geometric sans (Inter, General Sans, or similar) — this is the "organized skeleton" half of the metaphor and should look genuinely competent.
- Sticky notes / handwritten flavor text: a casual handwriting-style webfont (e.g. Caveat, Shadows Into Light) used sparingly — only on sticky notes and maybe todo-list flavor text, never on core content like project descriptions or resume text, which stay in the clean sans for actual readability.

### Iconography
- Simple, flat, slightly playful icons for taskbar items and window title-bar controls (minimize/close) — avoid skeuomorphic realism; a light, modern icon set (Lucide, Phosphor) fits better than trying to recreate a literal OS's icon style.

## 4. Layout patterns

### The Desktop (default state)
- 4-6 windows open and overlapping on load, arranged with intentional (not random) stagger so titles are readable even overlapped — true randomness looks broken, curated-looking randomness looks charming.
- A few sticky notes scattered near the edges, rotated slightly.
- Taskbar pinned to the bottom (or top), always visible regardless of window state.
- Now Playing widget tucked in a corner, small and low-visual-weight.

### Window chrome
- Standard title bar with title text, minimize and close controls (both functional).
- Drag handle = entire title bar.
- Resize handle on the bottom-right corner only, to keep the interaction predictable.
- Focused window gets a subtle border/shadow lift; unfocused windows recede slightly (lower opacity on the shadow, not the content).

### Taskbar
- Left-aligned or centered row of pinned items — intentionally a few more than feels "necessary" (the joke), but every single one must be a real, working nav target. No decorative-only taskbar items.
- Active/open windows get a small indicator dot or underline on their taskbar entry.

### Project windows
- Reuse the "system, not card" instinct from earlier portfolio work: a short real description, tech stack as plain tags (not progress bars), status label (shipped / in development / archived, matching real state honestly), and real links (GitHub, live demo where applicable).

## 5. Motion

- Window open: quick scale+fade in from the taskbar item's position (feels like it's "coming from" the click).
- Window close: reverse of open, slightly faster.
- Window drag: no easing lag — should feel snappy and directly attached to the cursor, since laggy drag reads as janky rather than charming.
- Sticky notes: a very subtle idle wobble/rotation drift (barely perceptible) — optional polish, cut first under time pressure.
- All motion respects `prefers-reduced-motion` per the TRD — instant state changes as the fallback, not literally zero feedback.

## 6. Content architecture (what lives where)

| Window | Content |
|---|---|
| Notes (About) | Bio written with real tangents, not a formal paragraph |
| Todo | Real-feeling mixed list of done (crossed out) and open items — doubles as "currently building" status |
| Browser History | Fake browser history list, each entry = a real project, click opens that Project window |
| Project (×N) | Synapse, DeployForge, UniSync, CampusHub, EmotiSense, Jarvis, ResiliNet-NER, etc. — one window per project or grouped if the taskbar/history gets too dense |
| Resume | Direct resume link/embed, reachable within 1-2 clicks from landing, no exceptions |
| Contact | Email, GitHub, LinkedIn — real, working links |
| Sticky notes | Flavor only, not navigation — short, honest, specific |
| Now Playing | Flavor widget, static or curated for v1 |

## 7. Accessibility as a design constraint, not an afterthought

- Every window must have a real, sensible tab order and be operable without a mouse — this is a design requirement, not just an engineering checkbox (see TRD §5).
- Contrast: verify the pastel sticky-note text and accent color choices against WCAG AA on their backgrounds before finalizing the palette — playful colors often fail contrast if picked purely by eye.
- Nothing essential (resume, contact, project links) should exist ONLY inside a component that requires JS interaction with no server-rendered fallback (see TRD §5's no-JS requirement).

## 8. What to explicitly avoid

- Dark/cyberpunk palette (that's the previous Skynet concept — this one should feel like a different person built it, in a good way).
- Randomly-generated chaos with no curation — true randomness in window placement/rotation reads as broken, not charming; hand-tune the "mess."
- Overloading every window with jokes — let some content (resume, contact, project descriptions) be straightforwardly clean and readable; the humor lives in the sticky notes, todo list, and about-notes, not everywhere at once.
- More than ~6 windows open by default — the joke works better restrained than maximal.
