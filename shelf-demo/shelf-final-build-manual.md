# Instruction Manual — Wiring the Finished Shelf
### 7 cover images ready, 5-sheet content ready per project. This is the final assembly pass.

Final roster: **Context Shifter, UniSync, Omnitrix OS, CineVault, Marlboro Red, DeployForge, doc--strange**

This builds directly on the earlier customization manual — that one covered finding the data array and swapping placeholder books. This one covers the two things that are new now that assets exist: **wiring real cover images in**, and **building the 5-sheet paged reader** for when a book opens (not just a single static panel, since you now have 5 distinct pages of content per project).

---

## Step 1 — Asset checklist before touching code

- [ ] All 7 cover images exported at the **same aspect ratio** (you settled on this in the sizing discussion — confirm 3:4 or whichever you locked in, and confirm all 7 match, including the regenerated Context Shifter)
- [ ] All 7 exported at the **same resolution** (recommended: 1024×1536 or whatever matches the component's existing placeholder image dimensions — check this before exporting if you haven't)
- [ ] Consistent file naming: `context-shifter.jpg`, `unisync.jpg`, `omnitrix-os.jpg`, `cinevault.jpg`, `marlboro-red.jpg`, `deployforge.jpg`, `doc-strange.jpg` — lowercase, hyphenated, matching whatever slug convention the component's data schema expects
- [ ] Place them wherever the original placeholder covers lived (likely `public/covers/` or similar — check the placeholder image `src` paths to confirm the expected directory)

---

## Step 2 — Update the data array with real content

Using the schema from the earlier manual, populate all 7 entries fully now — including the 5-sheet content as structured data, not just a single description string:

```ts
type ProjectSheet = {
  heading: string;   // e.g. "Overview", "Problem", "Build", "Result", "Links"
  body: string;
};

type Project = {
  id: string;              // "context-shifter"
  title: string;            // "Context Shifter"
  coverImage: string;       // "/covers/context-shifter.jpg"
  spineColor: string;       // matches the palette from your cover art
  status: "complete";       // all 7 are complete now, per the straight-swap decision
  sheets: [ProjectSheet, ProjectSheet, ProjectSheet, ProjectSheet, ProjectSheet]; // exactly 5
  links: { github?: string; demo?: string };
};

const myProjects: Project[] = [
  {
    id: "context-shifter",
    title: "Context Shifter",
    coverImage: "/covers/context-shifter.jpg",
    spineColor: "#3d5166", // slate-blue, matches the cover
    status: "complete",
    sheets: [
      { heading: "Overview", body: "A native macOS menu bar app that turns any LLM or app conversation into a portable context card you can paste into a new session to resume work." },
      { heading: "Problem", body: "Switching between ChatGPT, Claude, or any other AI tool means losing the thread — you re-explain context from scratch every time." },
      { heading: "Build", body: "100% local via Ollama — no API key, no telemetry. Native SwiftUI menu bar app for macOS 13+." },
      { heading: "Result", body: "Free and open source (MIT). First public release shipped source-only (v0.1.0)." },
      { heading: "Links", body: "GitHub: Shivala-08/context-shifter · Live: context-transfer.vercel.app" },
    ],
    links: { github: "https://github.com/Shivala-08/context-shifter", demo: "https://context-transfer.vercel.app" },
  },
  // ...repeat for the other 6, pulling directly from shelf-project-content.md
];
```

Copy the sheet content straight from your `shelf-project-content.md` — don't paraphrase it again by hand, that's how inconsistencies creep in between what you wrote and what's actually live.

---

## Step 3 — Build the 5-sheet paged reader (the new piece)

When a book opens, it now needs to page through 5 sheets rather than showing one static panel. This is a small state machine layered on top of the existing "pull out and open" animation from the earlier manual:

```tsx
function BookReader({ project, onClose }: { project: Project; onClose: () => void }) {
  const [page, setPage] = useState(0);
  const sheet = project.sheets[page];

  return (
    <div className="book-reader">
      <header>{project.title} — {sheet.heading}</header>
      <p>{sheet.body}</p>
      <nav>
        <button disabled={page === 0} onClick={() => setPage(p => p - 1)}>← Prev</button>
        <span>{page + 1} / {project.sheets.length}</span>
        <button disabled={page === project.sheets.length - 1} onClick={() => setPage(p => p + 1)}>Next →</button>
      </nav>
      {page === project.sheets.length - 1 && (
        <div className="links">
          {project.links.github && <a href={project.links.github}>GitHub</a>}
          {project.links.demo && <a href={project.links.demo}>Live Demo</a>}
        </div>
      )}
      <button onClick={onClose}>Close</button>
    </div>
  );
}
```

**Animation note:** reuse the book's existing open/flip transition for the *first* page reveal (cover → Sheet 1), but page-to-page transitions (Sheet 1 → Sheet 2, etc.) should be a lighter, faster transition — a simple crossfade or slide is enough. Don't run the full "pull off shelf and open" animation on every page turn, or navigating through 5 sheets will feel sluggish instead of snappy.

**Keyboard support (carry this over from every other portfolio concept you've built):** left/right arrow keys should move between pages while a book is open, and Escape should close it — this is a hard requirement, not optional polish, same as everywhere else in this project.

---

## Step 4 — Wire real links onto Sheet 5

Sheet 5 of every project is "Links." Make sure:
- GitHub links point to the exact real repo URLs (verify each — a few were left as placeholders in the content doc)
- Live demo links only render if `project.links.demo` actually exists — don't show a dead/broken link button for a project with no live deploy

---

## Step 5 — Handle the two incomplete projects

Marlboro Red and doc--strange still have `[FILL]` placeholders in the content doc. Two options:
- **Best:** fill in the real content before wiring these two in, so all 7 books are equally substantive when this ships
- **If you need to ship before that's ready:** temporarily exclude those two from the shelf array (5 books, not 7) rather than shipping visibly thin/placeholder content next to five detailed write-ups — a shorter, fully-real shelf reads better than a longer one with two obvious gaps

---

## Step 6 — Test checklist

- [ ] All 7 covers render at consistent size/ratio on the shelf, no stretching or letterboxing
- [ ] Clicking each book opens to Sheet 1, and paging reaches all 5 sheets in order
- [ ] Keyboard: arrow keys page through sheets, Escape closes, Tab reaches every book and every reader control
- [ ] Every GitHub/demo link on Sheet 5 actually resolves (click-test all of them, don't trust the placeholder text)
- [ ] No book ships with `[FILL]` text still visible — check Marlboro Red and doc--strange specifically
- [ ] Shelf spacing still looks correct with all 7 books present (revisit the width/spacing check from the earlier manual)
