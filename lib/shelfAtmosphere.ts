/**
 * Shelf atmosphere — shared data for the features from
 * shelf-atmosphere-features-manual.md that are not per-featured-project:
 *
 *  - RESERVED_BOOK (§2): an 8th volume, set apart from the 7 complete ones.
 *    The manual's example used "Jarvis", a project that does not exist in the
 *    knowledge base — the owner chose The Skynet instead (identity.txt §13–18,
 *    the flagship that became a production WebGL OS). It stays OUT of
 *    PROJECTS on purpose: the featured set is contractually exactly 7
 *    repositories, and shelf-demo/build-port.py enforces that count. Only the
 *    shelf's reserved slot (DOM + 3D) reads this entry.
 *
 *  - ROOM_SOUND_TRACKS (§7): the Web-Audio-synthesized ambient room tone and
 *    page-turn sound. Two reasons there are no audio files: (1) the project
 *    ships zero binary assets beyond the covers, and (2) a quiet filtered
 *    noise bed + paper swish are honestly indistinguishable from library-room
 *    recordings at the levels used here. The toggle defaults OFF — the code
 *    never creates an AudioContext until the visitor asks for sound.
 */

import { PROJECTS } from "@/lib/projects";
import type { Project } from "@/lib/projects";

/**
 * The reserved volume. Sheets hold only Sheet 1 — an honest "still being
 * written" notice, per manual §2 and the portfolio's todo-list honesty
 * pattern — and every claim below is documented in identity.txt.
 */
export const RESERVED_BOOK: Project = {
  id: "the-skynet",
  name: "The Skynet",
  tier: 1,
  category: "WebGL / Performance / Graphics",
  role: "Solo",
  status: "in-development",
  tagline: "Reserved — the write-up is still being written.",
  summary:
    "A custom WebGL portfolio OS: the Three.js + React Three Fiber stack was replaced by a ~500-line hand-written renderer after measuring what it cost — 883 KB of 3D bundle down to 24.9 KB, a ~97% reduction.",
  metrics: [
    {
      value: "883 KB → 24.9 KB",
      label: "3D bundle after the rewrite",
      context:
        "Three.js + React Three Fiber chunk replaced by a ~500-line custom WebGL mini-renderer — the ~97% reduction documented in the project README.",
    },
  ],
  stack: ["WebGL", "TypeScript", "Custom Mat4 math", "Shader gradients"],
  // Reserved volume: no links sheet exists to put them on. The reserved notice
  // is the whole book, per manual §2.
  links: {},
  url: "the-skynet (write-up pending)",
  placement: "folder",
  // Skynet never appeared on the shelf's cover grid — the seven covers map to
  // the seven featured repos — so the reserved spine renders as bound cloth
  // with a RESERVED band instead of cover art. Honest, and distinct at a glance.
  visual: {
    icon: "context-shifter", // unused by the shelf; placeholder to satisfy the type
    bg: "#12291c",
    fg: "#9ac9a8",
    ring: "#9ac9a826",
  },
  coverImage: "",
  spineColor: "#26323a",
  sheets: [
    {
      heading: "Reserved",
      body: "Still being written — check back soon. The short version while you wait: the original Three.js + React Three Fiber stack measured 883 KB of JavaScript, so it was replaced with a ~500-line hand-written WebGL renderer (custom matrix math, raycast hit testing, shaded instancing) that ships the same scene in 24.9 KB — a ~97% reduction. The debugging story is real too: camera picking broke until Mat4.invert's column-major indexing was fixed. The full 12-section case study is being written now; this shelf will un-reserve the volume when it's done.",
    },
  ],
  tags: ["webgl", "performance"],
};

/** Ambient loop choices for the shelf's sound toggle (manual §7). */
export const ROOM_SOUND_TRACKS = ["Library room tone", "Evening rain", "Server closet"] as const;

/**
 * Card-catalog drawer filter tags (manual §4): derived as the union of every
 * project's `tags` (featured set + reserved volume), in first-seen order so
 * the row is deterministic between server and client renders. Adding a tag to
 * any project makes it appear here automatically — no second list to drift.
 */
export const CATALOG_TAGS: string[] = [
  ...new Set([...PROJECTS, RESERVED_BOOK].flatMap((project) => project.tags)),
];
