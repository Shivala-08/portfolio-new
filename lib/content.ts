/**
 * Copy for the non-project windows.
 *
 * Everything factual here comes from identity.txt. The only placeholders left
 * are things the knowledge base genuinely does not contain: email, LinkedIn,
 * the resume file and the now-playing track. They are marked TODO and listed in
 * README "Placeholder checklist".
 */

export const PERSON = {
  name: "Pallav Dholariya",
  positioning: "AI/ML Engineer · Systems Builder",
  brandLine: "Curious enough to learn anything. Disciplined enough to ship.",
  status: "Building → measuring → breaking → fixing → shipping.",
  location: "Pune, India",
  education: "B.Tech CSE (AI & ML), Newton School of Technology × ADYPU",
  github: "https://github.com/Shivala-08",
  githubHandle: "Shivala-08",
  // TODO: add your email address
  email: "TODO",
  // TODO: add your LinkedIn URL
  linkedin: "TODO",
  // TODO: drop your PDF at public/resume.pdf
  resumeHref: "/resume.pdf",
} as const;

export const AVAILABILITY = [
  "Software Engineering internships",
  "AI/ML internships",
  "Systems / backend opportunities",
  "Developer infrastructure work",
  "Performance-focused engineering opportunities",
];

/** The five principles, real and load-bearing rather than motivational filler. */
export const PRINCIPLES = [
  { n: "01", title: "Constraints before architecture", body: "Understand the actual limitation before choosing the solution." },
  { n: "02", title: "Smallest useful system first", body: "Build enough to prove the idea before expanding the abstraction." },
  { n: "03", title: "Measure before optimizing", body: "No performance claim without a measurement." },
  { n: "04", title: "Optimize the bottleneck", body: "Don't rewrite the world because one component is slow." },
  { n: "05", title: "Ship → observe → iterate", body: "A deployed system teaches more than an unfinished abstraction." },
];

/**
 * About/Notes window body. Written as notes with genuine asides rather than a
 * formal bio paragraph (design doc §6).
 */
export const ABOUT_NOTES: string[] = [
  "I build systems across AI, infrastructure and interactive computing — and I like understanding what happens underneath the abstractions.",
  "That's not a tagline, it's just the pattern in everything I've made so far. I didn't want to deploy static sites by hand anymore, so I built a deployment pipeline. I didn't like what a 3D framework cost me in bundle size, so I wrote the renderer. I didn't want to claim my retrieval worked, so I built a 40-question ground truth and measured it.",
  "The through-line: I get suspicious of anything I can't explain from the bottom up. When camera picking broke in The Skynet, the answer was a column-major matrix inversion bug in my own Mat4.invert — no library to blame, which is exactly why I wanted to own that code.",
  "I'm a second-year B.Tech CSE (AI & ML) student at Newton School of Technology × ADYPU in Pune. Most of what I know came from shipping things and then reading up on why they were slow.",
];

export type LabTopic = { title: string; question: string; tag: string };

/** "Currently obsessed with" — pet topics, not finished work (identity.txt §34-35). */
export const LAB_TOPICS: LabTopic[] = [
  {
    tag: "RAG",
    title: "Chunking strategies",
    question: "Dynamic semantic boundary chunking versus fixed-token limits — where does the boundary actually belong?",
  },
  {
    tag: "RAG",
    title: "Retrieval evaluation",
    question: "Repeatable automated retrieval metrics, so an accuracy claim survives being re-run next month.",
  },
  {
    tag: "GPU",
    title: "GPU context",
    question: "Vertex and index buffers, and the shaders sitting underneath the rendering abstractions I use.",
  },
  {
    tag: "Infra",
    title: "Process isolation",
    question: "Safely isolating user-submitted scripts during compilation inside a build runner.",
  },
  {
    tag: "WebGL",
    title: "WebGL internals",
    question: "How much of a renderer can stay hand-written before the abstraction pays for itself again?",
  },
  {
    tag: "Infra",
    title: "Deployment systems",
    question: "Build pipelines, artifact handling and the cost of storing build output in Git.",
  },
];

export type Todo = { text: string; done: boolean };

/** Doubles as an honest "currently building" status (PRD §6.4). */
export const TODOS: Todo[] = [
  { text: "Deploy Forge: sub-path rewriter handles CSS url() references", done: true },
  { text: "The Skynet: replace Mat4.invert indexing fix with a tested matrix module", done: true },
  { text: "Shrink the Skynet 3D chunk below 25 KB", done: true },
  { text: "CineVault: API integration + discovery flow", done: true },
  { text: "Synapse: 40-question ground truth dataset", done: true },
  { text: "Synapse: cross-encoder reranker experiment", done: true },
  { text: "Synapse: multi-hop synthesis — semantic similarity isn't enough", done: false },
  { text: "Synapse: decide whether +11 accuracy pts is worth +200 ms", done: false },
  { text: "Omnitrix OS: document the 116 FPS methodology properly (device, scene, sustained?)", done: false },
  { text: "Deploy Forge: stop deploys from redeploying the platform itself", done: false },
  { text: "Write up the sub-path hosting story as a real case study", done: false },
];

export type NoteTone = "yellow" | "pink" | "blue";

export type StickyNoteContent = {
  id: string;
  text: string;
  tone: NoteTone;
  /** Authored rotation, hand-tuned — never random (design doc §8). */
  rotate: number;
  /** Reference placement against a 1280x800 desktop. */
  position: { x: number; y: number };
};

export const STICKY_NOTES: StickyNoteContent[] = [
  {
    id: "invert",
    text: "Mat4.invert was the whole bug. column-major. always column-major.",
    tone: "yellow",
    rotate: -2.5,
    position: { x: 8, y: 210 },
  },
  {
    id: "tradeoff",
    text: "+11 accuracy pts, +200 ms. is it worth it? (yes. maybe. measure again.)",
    tone: "pink",
    rotate: 1.8,
    position: { x: 16, y: 430 },
  },
  {
    id: "propagation",
    text: "30-60s propagation delay isn't a bug, it's the tradeoff I chose. write that down somewhere.",
    tone: "blue",
    rotate: -1.2,
    position: { x: 1010, y: 620 },
  },
  {
    id: "2am",
    text: "why does retrieval only break at 2am",
    tone: "yellow",
    rotate: 3.4,
    position: { x: 1080, y: 300 },
  },
  {
    id: "measure",
    text: "no perf claim without a measurement. (the 116 FPS one needs a scene + device first.)",
    tone: "pink",
    rotate: -3.1,
    position: { x: 1120, y: 90 },
  },
];

/** Static/curated for v1 per TRD §4 — no Spotify OAuth. */
export const NOW_PLAYING = {
  // TODO: pick a real track + artist (or wire the real Spotify API in v1.1)
  track: "TODO: track title",
  artist: "TODO: artist",
  album: "TODO: album",
  isPlaceholder: true,
} as const;
