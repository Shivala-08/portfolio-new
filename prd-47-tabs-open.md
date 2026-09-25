# Product Requirements Document
## "47 Tabs Open" — Pallav's Portfolio (v2)

**Owner:** Pallav (Aj)
**Status:** Draft for review
**Last updated:** 2026-09-23

---

## 1. Vision

A portfolio that looks like a chaotic, over-committed desktop — overlapping windows, a taskbar with too much pinned, sticky notes with half-finished thoughts, a fake "browser history" nav — but is, underneath the chaos, faster and easier to navigate than a conventional portfolio. The joke is explicit and self-aware: *"yes it looks unhinged, no I did not lose track of anything important."*

This is not generic clutter for its own sake. It's a deliberate, ADHD-coded design language that's honest about how a lot of actual student engineering work happens — many things in flight, genuinely organized underneath, personality intact.

## 2. Problem statement

Most student developer portfolios converge on the same "hero → about → skills → project cards → contact" template. That format is saturated and says nothing about the person behind it. Pallav wants a portfolio that is instantly, distinctly *him* — technically competent, unmistakably Gen-Z in voice, and memorable enough that a recruiter or peer forwards it to someone else unprompted.

## 3. Target audience

- **Primary:** recruiters and technical interviewers screening a second-year AI/ML student's work — need to find real proof-of-work (GitHub, resume, real projects) inside 60 seconds, even through the "chaos" framing.
- **Secondary:** peers, other students, hackathon judges, and anyone who finds the link shared around — this audience rewards personality and craft more than pure recruiter-efficiency.

## 4. Goals

1. Make the portfolio unmistakably memorable and shareable (screenshot-worthy).
2. Keep genuine findability: resume, GitHub, contact, and top projects reachable in a few clicks/keystrokes regardless of how "chaotic" it looks.
3. Showcase real projects (Synapse, DeployForge, UniSync, CampusHub, EmotiSense, Jarvis, ResiliNet-NER, and others as relevant) with actual substance, not just aesthetic.
4. Keep the humor self-aware and specific to Pallav, not a generic "Gen-Z voice" filter.

## 5. Non-goals

- Not trying to be a literal desktop-OS simulator (that's the earlier Skynet/OS concept — this is a different, lighter-touch metaphor).
- Not adding chaos that actually breaks findability — clutter is a *costume*, not the real information architecture.
- Not attempting pixel-perfect recreation of any real OS's UI (avoids both legal murkiness and unnecessary build complexity).

## 6. Core features / user stories

### 6.1 The Desktop (landing experience)
- **As a visitor**, I see a "desktop" with several overlapping draggable windows already open on load, so the chaos is felt immediately rather than explained.
- **As a visitor**, I can drag, minimize, close, and reopen windows, because real interactivity sells the joke better than a static illustration of it.
- **As a visitor**, closing everything reveals a clean, minimal "desktop wallpaper" state with just a few icons — the "secretly organized" payoff.

### 6.2 Taskbar
- **As a visitor**, I see a taskbar with more items pinned than reasonable, functioning as the actual primary navigation (About, Projects, Resume, Contact, "Currently Obsessed With", GitHub).
- **As a visitor**, hovering/clicking a taskbar item opens or focuses the relevant window.

### 6.3 Sticky notes
- **As a visitor**, I see a scatter of sticky notes with short, half-finished, genuinely funny/honest thoughts (e.g. "ship EmotiSense v2 (?)", "why did the retrieval step break at 2am"). These are flavor, not navigation, and should be easy to visually deprioritize.

### 6.4 Todo list app (crossed-out items)
- **As a visitor**, I can open a "Todo" window showing a real-feeling list with some items crossed out (done) and some still open — this doubles as an honest "currently building" status.

### 6.5 Notes app with tangents
- **As a visitor**, I can open a "Notes" window styled like a real notes app, containing About-Me content written with genuine tangents/asides rather than a formal bio paragraph.

### 6.6 Fake browser history as nav
- **As a visitor**, I can open a "browser" window whose history list doubles as a project index — each history entry is a real project, clicking it opens that project's window.

### 6.7 Ambient "currently playing" widget
- **As a visitor**, I see a small Spotify-style widget in a corner, showing what Pallav's currently listening to (can be static/curated rather than live-API-driven for v1).

### 6.8 Project windows
- **As a visitor**, each project (Synapse, DeployForge, UniSync, CampusHub, EmotiSense, Jarvis, ResiliNet-NER, etc.) opens as its own window with real description, links, and status — reusing the "system diagram, not card" approach from prior portfolio work where it fits.

### 6.9 Resume/contact fast-path
- **As a recruiter with 30 seconds**, I can find a direct resume link and contact info within one or two clicks from the very first screen, regardless of how much chaos is on screen — this is the one feature that isn't allowed to be buried under the joke.

## 7. Success metrics

- Time-to-resume-link ≤ 2 interactions from landing, verified by manual test.
- Site is fully usable (all core windows reachable) via keyboard alone.
- At least 3 people outside Pallav's immediate circle describe it, unprompted, as "different from other portfolios I've seen."

## 8. Risks

- **Findability risk:** chaos-as-costume must not become chaos-as-actual-obstacle. Mitigate with the taskbar as a always-available, uncluttered real nav.
- **Tone risk:** self-aware humor can tip into try-hard if overdone. Mitigate by keeping copy short, specific, and honest rather than performative.
- **Scope risk:** many small interactive widgets (todo, notes, browser-history, sticky notes, music widget) is a lot of small surface area — see TRD for phased scope cuts if needed.

## 9. Open questions

- Should the "currently playing" widget be a real Spotify API integration (adds OAuth/backend complexity) or a manually-curated static value for v1?
- Which real projects make the cut for the "browser history" nav vs. get folder-grouped inside a single "more projects" window?
