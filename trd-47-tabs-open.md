# Technical Requirements Document
## "47 Tabs Open" — Pallav's Portfolio (v2)

**Companion to:** prd-47-tabs-open.md, design-doc-47-tabs-open.md
**Last updated:** 2026-09-23

---

## 1. Stack

- **Framework:** Next.js (App Router), matches existing deploy pipeline/Vercel familiarity
- **Language:** TypeScript
- **Window management:** custom React state (no need for a full OS-simulation library) — each window is `{ id, title, component, position, zIndex, minimized }` in a `useReducer`/`zustand` store
- **Drag/resize:** `react-rnd` or `@dnd-kit/core` for draggable/resizable windows — both are lightweight and well-maintained; prefer `react-rnd` for simpler resize handling out of the box
- **Animation:** Framer Motion for window open/close/minimize transitions and taskbar interactions
- **Styling:** Tailwind CSS, with a small custom "OS chrome" component set (title bars, buttons, taskbar) rather than pulling in a full desktop-UI kit
- **State persistence (optional, v1.1+):** window positions/open-state saved to `localStorage` so a returning visitor's "mess" feels consistent across visits — nice touch, not required for v1

No 3D/WebGL is required for this concept — it's explicitly a lighter-weight, DOM-driven build than the Skynet/AI Lab direction, which is part of its appeal (faster to build, faster to load).

## 2. Architecture

```
app/
  layout.tsx              — root shell, loads global CSS, fonts
  page.tsx                — renders <Desktop />
components/
  desktop/
    Desktop.tsx            — renders wallpaper + window manager + taskbar
    Window.tsx              — generic draggable/resizable window chrome
    Taskbar.tsx
    StickyNote.tsx
  windows/
    AboutNotesWindow.tsx
    TodoWindow.tsx
    BrowserHistoryWindow.tsx
    ProjectWindow.tsx        — generic, takes project data as props
    ResumeWindow.tsx
    ContactWindow.tsx
  widgets/
    NowPlayingWidget.tsx
lib/
  windowStore.ts             — zustand store: open windows, z-index stack, positions
  projects.ts                 — typed project data (title, description, links, status)
public/
  wallpaper assets, icons, fonts
```

## 3. Data model

```ts
type WindowState = {
  id: string;
  title: string;
  component: 'about' | 'todo' | 'browserHistory' | 'project' | 'resume' | 'contact';
  projectId?: string;      // only for component === 'project'
  position: { x: number; y: number };
  size: { width: number; height: number };
  zIndex: number;
  minimized: boolean;
};

type Project = {
  id: string;
  name: string;            // e.g. "Synapse"
  tagline: string;
  status: 'shipped' | 'in-development' | 'archived';
  description: string;
  stack: string[];
  links: { github?: string; demo?: string };
};
```

Project data lives as a typed array/JSON in `lib/projects.ts` — no CMS/database needed for v1; this is static content that changes infrequently enough to be a code change + redeploy.

## 4. Key interactions — implementation notes

- **Window focus/z-index:** clicking any window brings it to the top of the z-stack; store a monotonically increasing `zCounter` in the window store, assign `zIndex: ++zCounter` on focus.
- **Taskbar as source of truth for nav:** taskbar items map 1:1 to windows; clicking an already-open window's taskbar entry toggles minimize/restore rather than opening a duplicate.
- **Fake browser history nav:** implement as its own `BrowserHistoryWindow` component styled like a browser history page, with a static list of "visited URLs" each mapped to `projectId`; clicking opens/focuses that `ProjectWindow`.
- **Crossed-out todo items:** simple `{ text: string; done: boolean }[]`, `done: true` renders with `line-through` — no backend needed, static or `localStorage`-backed if you want it to feel "live."
- **Now Playing widget:** ship as a static/curated value for v1 (per PRD open question) to avoid Spotify OAuth complexity; leave the component shaped so a real API integration can slot in later without a rewrite.

## 5. Accessibility & fallback requirements (non-negotiable)

- **Keyboard navigation:** every window must be openable, focusable, and closable via keyboard alone (Tab to taskbar item, Enter to open/focus, Escape to close focused window). This is the single most important technical requirement given the PRD's "chaos must not break findability" goal.
- **Reduced motion:** all window open/close/drag animations must respect `prefers-reduced-motion`, degrading to instant position changes.
- **No-JS / crawler fallback:** because this is DOM-based (not canvas/WebGL), ensure content is still present in the initial server-rendered HTML — render resume link, contact info, and a plain project list in the DOM even before any window-manager JS hydrates, so search crawlers and JS-disabled visitors still get the core content. This is easier to hit here than in the 3D concepts, and should not be skipped.
- **Screen reader support:** windows should use appropriate ARIA roles (`role="dialog"`, `aria-labelledby` pointing at the title bar) so window open/close state is announced.

## 6. Performance targets

- Lighthouse Performance ≥ 90, Accessibility ≥ 95 (this build has no heavy 3D/asset budget excuse — it should be fast)
- First Contentful Paint under 1.5s on a throttled 4G profile
- No more than a handful of windows open by default on load (limit initial "mess" to what's actually needed to sell the joke — 4-6 windows, not 15)

## 7. Browser support

Standard evergreen browsers (Chrome, Firefox, Safari, Edge) — no experimental APIs required for this concept, unlike the earlier HTML-in-Canvas exploration. This is a deliberate simplification: the concept's strength is in content/interaction design, not bleeding-edge rendering tech.

## 8. Deployment

- Vercel, matching existing pipeline knowledge
- Static project data compiled at build time — no runtime database dependency for v1
- If the Now Playing widget later becomes a real Spotify integration, that's the only piece requiring a serverless function + OAuth token refresh — scope it as a clearly separable v1.1 addition

## 9. Suggested build phases

1. Window manager core (open/close/drag/focus/z-index) + taskbar, with 1 placeholder window — get the mechanic feeling right before populating content
2. Real content windows: About/Notes, Todo, Resume, Contact
3. Browser History nav + Project windows populated with real project data
4. Sticky notes + Now Playing widget (pure flavor, lowest priority, cut first if time-constrained)
5. Accessibility pass (keyboard nav, ARIA, reduced-motion, no-JS fallback) — do not skip or leave to "later"
6. Performance/Lighthouse pass
