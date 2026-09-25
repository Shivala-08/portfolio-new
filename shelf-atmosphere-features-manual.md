# Instruction Manual — Library Room Atmosphere & Flex Features
### Building on the finished 7-book shelf: stamp cards, catalog search, light/sound atmosphere, a locked book, margin notes, and the checkout-style contact flow

Build order matters here more than usual — atmosphere (light, sound) should go in *after* the shelf and reader are fully working and tested, since it's easy to chase polish and never finish the functional pieces. Suggested order: **Due-date stamp card → Locked book → Margin notes → Card catalog search → Checkout contact flow → Dust motes/light → Ambient sound.**

---

## 1. Due-date stamp card (highest priority — build this first)

**What it is:** a small library-pocket-card graphic on the last sheet (Sheet 5, alongside the Links) of every book, showing stamped dates.

**Data needed per project:**
```ts
type StampEntry = { label: string; date: string }; // e.g. { label: "First commit", date: "2026-03-12" }

// add to your existing Project type:
stampCard?: StampEntry[];
```
Pull real dates from GitHub — first commit date and last-updated date are both available via the GitHub API (`created_at` / `pushed_at` on the repo, or `git log --reverse --format=%ad | head -1` locally for the true first commit). Don't hand-guess these; pull them once and hardcode into your data file, no need for a live API call on every page load.

**Visual build:**
- A small rectangular "card" component styled like an actual library pocket card: horizontal ruled lines, a monospace or typewriter-style font, 2-4 stamped entries
- Each stamp can have a subtle rotation (1-3 degrees) and a slightly inked/imperfect edge (a low-opacity noise texture or a stamp-shaped SVG mask) so it doesn't read as a flat digital table
- Optional: a "RENEWED" stamp in a different color if `pushed_at` is meaningfully after `created_at` (i.e., actively maintained) — nice touch, skip if it adds too much conditional complexity for v1

**Where it lives:** render as part of the existing `BookReader` component's Sheet 5, next to the Links block — same paging mechanic already handles displaying it, no new navigation needed.

---

## 2. Locked / reserved book

**What it is:** an 8th spine on the shelf, visually set apart (chain icon, "RESERVED" tag, slightly duller color), for whatever's currently in progress — a good home for Jarvis now that it's off the main 7.

**Build:**
- Add it to the same `Project` array with a `status: "reserved"` field
- In the shelf-rendering loop, check `status` and apply a different material/overlay for reserved books — a simple approach is a semi-transparent chain-link texture plane positioned in front of the spine, or just a "RESERVED" ribbon graphic overlaid on the cover
- Clicking it should still open a reader, but Sheet 1 only — no full 5-sheet content, just an honest "still being written" message and maybe a rough progress note, consistent with the todo-list honesty pattern used elsewhere in this project
- Position it slightly separated from the main 7 (a small gap in the shelf) so it reads as deliberately set apart, not just another book

```tsx
{project.status === "reserved" ? (
  <ReservedNotice title={project.title} note="Still being written — check back soon." />
) : (
  <BookReader project={project} onClose={onClose} />
)}
```

---

## 3. Margin notes

**What it is:** a faint handwritten-style annotation in the margin of 2-3 select sheets (not all — restraint matters).

**Build:**
- Add an optional field to individual sheets: `marginNote?: string`
- Only populate it on 2-3 sheets total across the whole shelf — pick the ones with the best real anecdote (e.g. DeployForge's "stop deploys from redeploying the platform itself" energy)
- Style: small, rotated 2-4 degrees, handwriting-style font (reuse whatever handwriting font you already picked for the 47 Tabs Open concept if you want visual continuity across your explorations, or pick fresh for this room specifically), positioned absolutely in a margin area beside the main sheet text, muted color so it doesn't compete with the primary content
- This is pure flavor — no interaction needed beyond it just being visible

---

## 4. Card catalog search

**What it is:** an old library card-catalog drawer UI, pull-open interaction, index cards per project, filterable by tag.

**Data needed:**
```ts
// add to Project type:
tags: string[]; // e.g. ["AI/ML", "infra"], ["creative-coding"], etc.
```

**Build:**
- A drawer component (can literally be a `<div>` styled as a wooden drawer front, or a 3D drawer mesh if you want it embedded directly in the room scene rather than as a DOM overlay — DOM overlay is significantly less build effort and still fits the aesthetic)
- Drawer open state: slide-out animation revealing a vertical stack of index cards
- Each card: project title, one-line tagline (reuse Sheet 1's Overview text), tags as small labels
- Filter UI: a row of tag toggle-buttons above the card stack; clicking a tag filters the visible cards (`project.tags.includes(activeTag)`)
- Clicking a card should open that project's `BookReader` directly — same component reused, entered from a different UI path
- **Accessibility:** this needs the same keyboard nav discipline as the shelf itself — drawer should be operable via keyboard, cards should be a real focusable list, not just click targets

---

## 5. Checkout-style contact flow — RETIRED by owner decision

The contact form was removed from the site entirely (no form, no endpoint), so
this section is kept as build history only. The contact window now shows direct
links (GitHub / email / LinkedIn) with no submission path.

---

## 6. Dust motes / volumetric light shaft

**What it is:** a soft light shaft (implying a window off-scene) with slow-drifting particles, for atmosphere.

**Build (R3F/Three.js):**
- A simple cone or plane geometry with an additive-blend gradient shader for the light shaft itself — doesn't need to be physically accurate volumetric lighting, a convincing fake is far cheaper
- A small particle system (a few dozen points via `BufferGeometry` + `Points`) inside the shaft's bounds, each with a slow random vertical drift and slight horizontal sway, using a shared `uTime` uniform the same way your brain-concept shaders did
- Keep particle count low (30-60) — this is atmosphere, not a showcase; a few dozen well-lit motes read as "real room" far better than hundreds of aggressive particles
- Position it off to one side of the shelf, not directly in front of any book, so it never occludes content

---

## 7. Ambient room sound

**What it is:** faint ambient hum + a page-turn sound effect on book open/page-navigate, toggleable, off by default.

**Build:**
- Use the Web Audio API directly or a small helper like Howler.js
- Two assets needed: one short page-turn/paper sound (trigger on `BookReader` open and on each page change), one very quiet looping ambient room tone (library hum, distant clock, whatever fits — keep it subtle)
- A single mute/unmute toggle in a persistent UI corner, **defaulting to off** — never autoplay audio on load, both for UX politeness and because most browsers block autoplaying audio with sound until user interaction anyway
- Respect this alongside `prefers-reduced-motion` — if you're already gating animation on that preference, consider gating ambient sound similarly for visitors who've signaled a preference for a calmer experience

---

## Testing checklist across all seven

- [ ] Stamp card dates are real (pulled from actual GitHub data, not placeholder)
- [ ] Reserved book is clearly distinguishable from the 7 complete ones at a glance
- [ ] Margin notes appear on only 2-3 sheets, not all of them
- [ ] Card catalog drawer and its cards are fully keyboard-navigable
- [ ] Checkout confirmation actually sends (or correctly fails gracefully) — test both paths
- [ ] Dust motes render at low particle count without dropping frame rate
- [ ] Sound defaults to off and the toggle actually works both directions
- [ ] Everything above still respects `prefers-reduced-motion`/`prefers-reduced-data` where applicable
