/**
 * Project data — static, compiled at build time (TRD §3).
 *
 * FEATURED SET (v1.1): exactly these 7 repositories, per owner direction.
 * (The shelf additionally carries one RESERVED volume — The Skynet — which
 * lives in RESERVED_BOOK below rather than in this array; see lib/shelfAtmosphere.ts.)
 * Each carries a `visual` spec (icon motif + accent colors) used by the
 * browser-history rows and the project-window header.
 *
 * Metrics/claims reproduced with their measurement context (identity.txt §38).
 *
 * The shelf (Bookshelf window) additionally renders every project as a book:
 * coverImage + spineColor drive the spines, and `sheets` is the 5-page content
 * shown in the paged reader (Overview / Problem / Build / Result / Links).
 * Sheet copy comes verbatim from shelf-demo/details.txt — repo slugs on the
 * Links sheet were verified against it (ben-10-os, malboro, doc--strange are
 * the real repo names, not the earlier assumed ones).
 *
 * All 6 live links were then click-tested (manual §4 / §6, 2026-09-24): every
 * one resolves except UniSync's repo, so that one link is withheld rather than
 * shipped as a 404 button — see the note on the unisync entry.
 */

export type ProjectStatus = "shipped" | "in-development" | "archived";

export type Metric = {
  value: string;
  label: string;
  /** What the number actually measures. Never render a metric without this. */
  context: string;
};

/**
 * Per-repo visual identity: an icon motif key (drawn in
 * components/ui/ProjectIcons.tsx) plus the card/tile background colors.
 */
export type ProjectVisual = {
  icon:
    | "context-shifter"
    | "unisync"
    | "omnitrix"
    | "cinevault"
    | "marlboro"
    | "deployforge"
    | "doc-strange";
  /** Tile/card background. */
  bg: string;
  /** Stroke/fill accent on top of the background. */
  fg: string;
  /** Subtle shape tint on top of the background. */
  ring: string;
};

/** One page of the shelf's paged reader. Exactly 5 per project. */
export type ProjectSheet = {
  heading: string;
  body: string;
  /** Faint handwritten margin annotation (shelf-atmosphere §3). Pure flavor:
   * populated on at most 2–3 sheets across the whole shelf, never everywhere. */
  marginNote?: string;
};

/** One stamped line of the library due-date card on Sheet 5 (atmosphere §1). */
export type StampEntry = { label: string; date: string };

export type Project = {
  id: string;
  name: string;
  /** Tier from the portfolio hierarchy: 1 = flagship, 2 = product/creative, 3 = supporting. */
  tier: 1 | 2 | 3;
  category: string;
  role: string;
  status: ProjectStatus;
  tagline: string;
  summary: string;
  /** The pipeline / flow, rendered as a chain. */
  architecture?: string[];
  /** The interesting technical problem. */
  constraint?: { title: string; body: string };
  /** The experiment and its measured outcome. */
  experiment?: { title: string; body: string };
  /** Honest failure / limitation. */
  broke?: { title: string; body: string };
  tradeoffs?: string[];
  metrics: Metric[];
  stack: string[];
  links: { github?: string; demo?: string };
  /** The fake "visited URL" shown in the browser-history window. */
  url: string;
  /** Where it appears in the fake browser history. */
  placement: "history" | "folder";
  /** Icon motif + colors for the repo's tile. */
  visual: ProjectVisual;
  /** Cover art for the shelf's book (3:4 JPEG in public/covers/). */
  coverImage: string;
  /** Spine/edge colour on the shelf — matches the cover's palette. */
  spineColor: string;
  /** The 5-page reader content: Overview, Problem, Build, Result, Links. */
  sheets: ProjectSheet[];
  /** Library-catalog tags, driving the card-catalog drawer filter (atmosphere §4). */
  tags: string[];
  /** Real dates pulled once from the GitHub API (created_at / pushed_at on
   * 2026-09-26) and hardcoded — no live call on page load (atmosphere §1). */
  stampCard?: StampEntry[];
};

const GH = "https://github.com/Shivala-08"; // confirmed username

export const PROJECTS: Project[] = [
  {
    id: "deploy-forge",
    name: "Deploy Forge",
    tier: 1,
    category: "Developer Infrastructure",
    role: "Solo",
    status: "shipped",
    tagline: "Git-backed deployment pipeline: repo in, live site out.",
    summary:
      "Turns a repository into a deployed site through automated builds, artifact processing, GitHub Actions and Vercel. Built to delete a repetitive manual workflow, not to add another dashboard.",
    architecture: [
      "GitHub Repository",
      "Deploy Forge API",
      "repository_dispatch",
      "GitHub Actions Runner",
      "Isolated Build Zone",
      "clone → npm install → npm build",
      "Path Rewriter",
      "Git commit & push",
      "Vercel auto-redeploy",
      "Live URL",
    ],
    constraint: {
      title: "Making arbitrary static sites work under dynamic sub-paths",
      body:
        "A generated site ships absolute references like /main.js, but the deployment lives at /sites/{id}/. The pipeline recursively rewrites HTML and CSS inside the build output before committing the artifacts, so the site never knows it was relocated.",
    },
    tradeoffs: [
      "Committing build output back to the repository gives simple persistence and real version history — but each deployment can redeploy the Deploy Forge platform itself, producing a documented 30–60s propagation delay.",
      "Compilation runs outside the application request lifecycle on purpose: typical serverless environments are not designed to compile arbitrary code.",
    ],
    metrics: [
      {
        value: "~15s",
        label: "Local production build",
        context:
          "Local production build only. This is NOT the end-to-end deploy time — see the propagation metric.",
      },
      {
        value: "~30–60s",
        label: "Vercel propagation delay",
        context:
          "Documented delay caused by deployment commits redeploying the platform itself. A known architectural tradeoff, not a bug.",
      },
    ],
    stack: ["GitHub Actions", "Vercel", "Docker", "Linux", "Node.js"],
    links: { github: `${GH}/deploy-forge`, demo: "https://deploy-forge-4klc.vercel.app" },
    url: "github.com/Shivala-08/deploy-forge",
    placement: "history",
    visual: {
      icon: "deployforge",
      bg: "#2b2723",
      fg: "#e8823a",
      ring: "#e8823a33",
    },
    coverImage: "/covers/deployforge.jpg",
    spineColor: "#b35727",
    tags: ["infra", "automation", "ci-cd"],
    stampCard: [
      { label: "First commit", date: "2026-06-17" },
      { label: "Last returned", date: "2026-09-20" },
      { label: "RENEWED", date: "2026-09-20" },
    ],
    sheets: [
      {
        heading: "Overview",
        body: "Git-backed deployment infrastructure that turns a repository into a deployed static site through an automated build pipeline.",
      },
      {
        heading: "Problem",
        body: "Static-site deployment normally requires a repetitive compile loop: clone → install → build → copy → commit → push → deploy. Serverless application runtimes also cannot safely compile arbitrary external projects inside the request lifecycle.",
      },
      {
        heading: "Build",
        body: "A repository_dispatch event triggers a GitHub Actions runner, which clones the target repository, installs dependencies, and builds it inside an isolated build zone. A path-rewriter then fixes absolute asset references before the compiled site is committed into public/sites/{siteId}/, allowing Vercel to redeploy it automatically.",
      },
      {
        heading: "Result",
        body: "Production deployment infrastructure with a measured local production build time of approximately 15 seconds. The Git-backed architecture provides version history and persistence, with a documented 30–60 second Vercel propagation tradeoff.",
        // Margin note (atmosphere §3, one of only two on the whole shelf): the
        // manual's own example anecdote — the pipeline really can redeploy the
        // platform under itself, which is exactly what the Result sheet documents.
        marginNote: "it once redeployed itself. we let it finish, then wrote this down.",
      },
      {
        heading: "Links",
        body: "GitHub: Shivala-08/deploy-forge · Live Demo: deploy-forge-4klc.vercel.app",
      },
    ],
  },
  {
    id: "omnitrix-os",
    name: "Omnitrix OS",
    tier: 1,
    category: "Interactive Frontend / Graphics",
    role: "Solo",
    status: "shipped",
    tagline: "Proves the systems work can also be fun to touch.",
    summary:
      "An immersive browser-based Omnitrix OS: 3D interaction, animation, procedural audio and real UX, built with Next.js, React Three Fiber, GSAP and the Web Audio API.",
    metrics: [
      {
        value: "116 FPS",
        label: "Reported frame rate",
        context:
          "Claimed on mobile and desktop. UNVERIFIED AS STATED — device, browser, scene, measurement method and whether this is average/peak/sustained are not yet documented, so do not present this as a general performance guarantee.",
      },
    ],
    stack: ["Next.js", "React Three Fiber", "GSAP", "Web Audio", "React"],
    links: { github: `${GH}/ben-10-os`, demo: "https://ben-10-os.vercel.app" },
    tags: ["webgl", "creative-coding", "audio"],
    stampCard: [
      { label: "First commit", date: "2026-05-26" },
      { label: "Last returned", date: "2026-08-20" },
    ],
    url: "github.com/Shivala-08/ben-10-os",
    placement: "history",
    visual: {
      icon: "omnitrix",
      bg: "#12291c",
      fg: "#4ade80",
      ring: "#4ade8026",
    },
    coverImage: "/covers/omnitrix-os.jpg",
    spineColor: "#1d5c38",
    sheets: [
      {
        heading: "Overview",
        body: "An immersive, high-fidelity interactive digital replication of the classic Ben 10 Omnitrix interface, built as a premium browser-based WebGL experience.",
      },
      {
        heading: "Problem",
        body: "Most interface recreations stop at static visuals or flat mockups. The goal was to recreate the feeling of an actual interactive device — with 3D rendering, motion, sound, voice control, responsive controls, and persistent state.",
      },
      {
        heading: "Build",
        body: "Next.js 16 and React 19 with Three.js / React Three Fiber for 3D rendering, GSAP and Framer Motion for motion, Zustand for state, TanStack Query for network data, and Howler.js for sound. Includes an interactive 3D dial, Web Speech API commands, microphone-driven waveform visualization, a 62-species DNA Codex, fusion lab, radar, session statistics, and offline PWA support.",
      },
      {
        heading: "Result",
        body: "A fully deployed interactive Omnitrix experience with 3D controls, voice commands, synthesized interface audio, persistent session data, responsive layouts, and offline-installable PWA support.",
      },
      {
        heading: "Links",
        body: "GitHub: Shivala-08/ben-10-os · Live Demo: ben-10-os.vercel.app",
      },
    ],
  },
  {
    id: "doc-strange",
    name: "doc--strange",
    tier: 2,
    category: "Creative / Tooling",
    role: "Solo",
    status: "in-development",
    tagline: "A portal for documents — the weird kind of docs tool.",
    summary:
      "A real-time webcam experience that tracks hand gestures and turns them into Doctor Strange-style magical portals, rune shields, sparks, and spatial effects.",
    metrics: [],
    stack: ["MediaPipe", "OpenCV", "Canvas 2D", "Web Audio", "Python"],
    links: { github: `${GH}/doc--strange`, demo: "https://doctor-strange-filter.vercel.app" },
    tags: ["computer-vision", "creative-coding"],
    stampCard: [
      { label: "First commit", date: "2026-08-17" },
      { label: "Last returned", date: "2026-08-20" },
    ],
    url: "github.com/Shivala-08/doc--strange",
    placement: "history",
    visual: {
      icon: "doc-strange",
      bg: "#2a1d47",
      fg: "#c4b5fd",
      ring: "#c4b5fd29",
    },
    coverImage: "/covers/doc-strange.jpg",
    spineColor: "#3b2a66",
    sheets: [
      {
        heading: "Overview",
        body: "A real-time webcam experience that tracks hand gestures and turns them into Doctor Strange-style magical portals, rune shields, sparks, and spatial effects.",
      },
      {
        heading: "Problem",
        body: "Build a webcam interaction that feels responsive rather than like a static visual overlay. The system needs to translate noisy real-world hand movement into stable gestures while synchronizing visual effects, portal geometry, particles, and audio in real time.",
      },
      {
        heading: "Build",
        body: "MediaPipe performs real-time hand landmark tracking with EMA smoothing to reduce jitter. The web client uses Vanilla JavaScript and HTML5 Canvas 2D, while the Python version uses MediaPipe with OpenCV. Gesture states control portal summoning, dismissal, palette switching, fingertip sparks, and the large two-hand spatial portal. Web Audio API and Python audio synthesis provide contextual sound effects. Portal geometry is mathematically tuned so the destination mask remains inside the fiery ring without visual bleed-through.",
      },
      {
        heading: "Result",
        body: "A cross-platform real-time hand-controlled visual experience available as both a browser application and a local Python application. It supports multiple gesture-driven spell states, dynamic portal scaling, rotating rune shields, particle effects, spatial portal composition, and synthesized audio.",
      },
      {
        heading: "Links",
        body: "GitHub: Shivala-08/doc--strange · Live: doctor-strange-filter.vercel.app",
      },
    ],
  },
  {
    id: "unisync",
    name: "UniSync",
    tier: 2,
    category: "Developer Tooling",
    role: "Solo",
    status: "in-development",
    tagline: "Two worlds, one commit: keeping things in sync.",
    summary:
      "College Portal → GitHub Code Synchronizer. Solve on the portal, submit, and it lands in your GitHub repo — automatically.",
    metrics: [],
    stack: ["Chrome Extension (MV3)", "TypeScript", "GraphQL", "chrome.storage"],
    // GitHub link withheld on purpose: `github.com/Shivala-08/unisync` returns
    // 404 (checked 2026-09-24 — the repo is not public yet). The shelf, the
    // project window and the no-JS fallback all build their link buttons from
    // this field, so leaving it empty is what keeps a dead button off all three
    // (manual §4). Restore `github: `${GH}/unisync`` once the repo is published.
    links: {},
    tags: ["browser-extensions", "automation"],
    stampCard: [
      { label: "First stamped", date: "2026-08-24" },
      { label: "Last worked on", date: "2026-08-24" },
    ],
    url: "github.com/Shivala-08/unisync",
    placement: "history",
    visual: {
      icon: "unisync",
      bg: "#0f2e2e",
      fg: "#2dd4bf",
      ring: "#2dd4bf29",
    },
    coverImage: "/covers/unisync.jpg",
    spineColor: "#0e514f",
    sheets: [
      {
        heading: "Overview",
        body: "College Portal → GitHub Code Synchronizer. Solve on the portal, submit, and it lands in your GitHub repo — automatically.",
      },
      {
        heading: "Problem",
        body: "Coding portal/LMS submissions live and die on the portal itself — no public record, no personal GitHub history, and no persistent proof of the work outside the platform.",
      },
      {
        heading: "Build",
        body: "Manifest V3 Chrome extension. Patches fetch/XHR in the page’s MAIN world to capture submissions even under strict CSPs. DOM/Shadow-DOM fallback crawling recovers code if network payloads are missed. A durable FIFO retry queue in chrome.storage.local survives service-worker shutdowns, with exponential backoff through chrome.alarms. Commits land through a single atomic GraphQL createCommitOnBranch mutation.",
        // Margin note (atmosphere §3, two of two): the retry queue is the real
        // hero of this build — it outlives the worker that feeds it.
        marginNote: "the queue outlives the worker that feeds it. on purpose.",
      },
      {
        heading: "Result",
        body: "v1.0.0, zero runtime dependencies. 39 tests across 4 suites, all passing. Auto-bootstraps empty repositories, detects the default branch with main → master fallback, and includes one-click repository creation and connectivity testing.",
      },
      {
        heading: "Links",
        body: "Source not public yet · Planned: LeetCode and Codeforces as additional sources",
      },
    ],
  },
  {
    id: "context-shifter",
    name: "Context Shifter",
    tier: 2,
    category: "Productivity / UX",
    role: "Solo",
    status: "in-development",
    tagline: "Talk in, structure out — context that folds into shape.",
    summary:
      "A native macOS menu bar app that turns any LLM or app conversation into a portable context card you can paste into a new session to resume work.",
    metrics: [],
    stack: ["SwiftUI", "Ollama", "macOS 13+"],
    links: { github: `${GH}/context-shifter`, demo: "https://context-transfer.vercel.app" },
    tags: ["native", "ai-ml", "productivity"],
    stampCard: [
      { label: "First commit", date: "2026-09-13" },
      { label: "Last returned", date: "2026-09-20" },
      { label: "RENEWED", date: "2026-09-20" },
    ],
    url: "github.com/Shivala-08/context-shifter",
    placement: "history",
    visual: {
      icon: "context-shifter",
      bg: "#33415c",
      fg: "#a5c4f2",
      ring: "#a5c4f226",
    },
    coverImage: "/covers/context-shifter.jpg",
    spineColor: "#3d5166",
    sheets: [
      {
        heading: "Overview",
        body: "A native macOS menu bar app that turns any LLM or app conversation into a portable context card you can paste into a new session to resume work.",
      },
      {
        heading: "Problem",
        body: "Switching between ChatGPT, Claude, or any other AI tool means losing the thread — you re-explain context from scratch every time you change apps or start a new session.",
      },
      {
        heading: "Build",
        body: "100% local via Ollama — no API key required, no telemetry. Native SwiftUI menu bar app for macOS 13+. Captures conversations from ChatGPT, Claude, or any macOS app and extracts them into a structured, portable context card.",
      },
      {
        heading: "Result",
        body: "Free and open source under the MIT license. The first public release shipped as source-only (v0.1.0), self-built through ./Scripts/build-app.sh.",
      },
      {
        heading: "Links",
        body: "GitHub: Shivala-08/context-shifter · Live: context-transfer.vercel.app",
      },
    ],
  },
  {
    id: "cinevault",
    name: "CineVault",
    tier: 3,
    category: "Full-stack / API Integration",
    role: "Solo",
    status: "shipped",
    tagline: "Movie discovery, as an exercise in API and UX patterns.",
    summary:
      "A full-stack movie discovery app exploring third-party API integration, discovery UX and scalable frontend patterns. Supporting work, not a flagship.",
    metrics: [],
    stack: ["React", "REST APIs", "Tailwind"],
    links: { github: `${GH}/cinevault`, demo: "https://cinevault-eight-red.vercel.app" },
    tags: ["full-stack", "api-integration"],
    stampCard: [
      { label: "First commit", date: "2026-03-23" },
      { label: "Last returned", date: "2026-08-20" },
      { label: "RENEWED", date: "2026-08-20" },
    ],
    url: "github.com/Shivala-08/cinevault",
    placement: "history",
    visual: {
      icon: "cinevault",
      bg: "#3a1c1c",
      fg: "#f2b366",
      ring: "#f2b36629",
    },
    coverImage: "/covers/cinevault.jpg",
    spineColor: "#7a4a26",
    sheets: [
      {
        heading: "Overview",
        body: "A cinematic movie discovery and watchlist application built around the TMDB API.",
      },
      {
        heading: "Problem",
        body: "Movie discovery can easily become either a basic search interface or an overloaded streaming-service clone. CineVault focuses instead on a focused discovery experience built around browsing, mood, and personal watchlists.",
      },
      {
        heading: "Build",
        body: "Built with Next.js 16 App Router, Tailwind CSS, Framer Motion, Zustand, React Query, and the TMDB API. Includes an infinite trending feed, dynamic search overlay, mood-based recommendations, locally persisted watchlists and favorites, trailer modals with cast/genre/plot information, and responsive layouts from mobile to ultra-wide displays.",
      },
      {
        heading: "Result",
        body: "Live and shipped as a responsive cinematic discovery experience. The current version includes a Next.js 16 upgrade, responsive layouts down to 320px screens, polished Tailwind-based UI, and persistent browser-side watchlists.",
      },
      {
        heading: "Links",
        body: "GitHub: Shivala-08/cinevault · Live Demo: cinevault-eight-red.vercel.app",
      },
    ],
  },
  {
    id: "marlboro-red",
    name: "Marlboro Red",
    tier: 3,
    category: "Creative Coding",
    role: "Solo",
    status: "in-development",
    tagline: "Crimson first, questions later.",
    summary:
      "A small React + TypeScript + Vite web experiment kept in the rotation for its attitude — currently built from the standard Vite starter structure, honestly documented as such.",
    metrics: [],
    stack: ["React", "TypeScript", "Vite", "ESLint"],
    links: { github: `${GH}/malboro`, demo: "https://malboro-rho.vercel.app" },
    tags: ["creative-coding", "experiments"],
    stampCard: [
      { label: "First commit", date: "2026-06-14" },
      { label: "Last returned", date: "2026-06-14" },
    ],
    url: "github.com/Shivala-08/malboro",
    placement: "history",
    visual: {
      icon: "marlboro",
      bg: "#4a0e12",
      fg: "#f2b8b5",
      ring: "#f2b8b529",
    },
    coverImage: "/covers/marlboro-red.jpg",
    spineColor: "#7a1420",
    sheets: [
      {
        heading: "Overview",
        body: "A small React + TypeScript + Vite web experiment currently built from the standard Vite React starter structure.",
      },
      {
        heading: "Problem",
        body: "The repository does not currently document a distinct product problem, user workflow, or technical objective beyond establishing a React/Vite application.",
      },
      {
        heading: "Build",
        body: "React + TypeScript + Vite with the standard Vite React setup and ESLint configuration. The repository currently contains the default starter structure rather than a documented custom architecture.",
      },
      {
        heading: "Result",
        body: "The repository is publicly available and has a deployed Vercel instance, but the current repository contains only one commit and its README remains the default Vite template.",
      },
      {
        heading: "Links",
        body: "GitHub: Shivala-08/malboro · Live: malboro-rho.vercel.app",
      },
    ],
  },
];

export const PROJECTS_BY_ID = new Map(PROJECTS.map((p) => [p.id, p]));

export function getProject(id: string): Project | undefined {
  return PROJECTS_BY_ID.get(id);
}

/** Tier 1 flagships, used for the "open with" default windows. */
export const FLAGSHIP_IDS = PROJECTS.filter((p) => p.tier === 1).map((p) => p.id);
