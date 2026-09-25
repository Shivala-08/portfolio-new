import type { ProjectVisual } from "@/lib/projects";

/**
 * Per-repo icon motifs, drawn by hand as stroke paths on a 48x48 grid.
 *
 * Each repo gets its own figure (the "second-read" detail in the history
 * window): a speech bubble folding into a card, a portal wired to a commit
 * node, a watch dial with an hourglass heart, a film reel wearing a bookmark,
 * an anvil sitting on a commit line, a portal ring with a camera lens, and —
 * for the one repo that hasn't earned a motif yet — an honest abstract mark.
 *
 * Pure markup: server-renderable, JS-free, respects the palette spec per repo.
 */

const STROKE = {
  fill: "none",
  strokeWidth: 2.4,
  strokeLinecap: "round" as const,
  strokeLinejoin: "round" as const,
};

function ContextShifter({ fg, ring }: { fg: string; ring: string }) {
  return (
    <>
      {/* Speech bubble… */}
      <path
        {...STROKE}
        stroke={fg}
        d="M7 11 h15 a3 3 0 0 1 3 3 v7 a3 3 0 0 1 -3 3 h-7 l-5 5 v-5 h-3 a3 3 0 0 1 -3 -3 v-7 a3 3 0 0 1 3 -3 z"
      />
      {/* …morphing into a folded card. */}
      <path {...STROKE} stroke={fg} fill={ring} d="M27 20 h10 l5 5 v13 h-15 z" />
      <path {...STROKE} stroke={fg} d="M37 20 v5 h5" />
    </>
  );
}

function UniSync({ fg, ring }: { fg: string; ring: string }) {
  return (
    <>
      {/* Portal node. */}
      <circle cx="13" cy="24" r="7.5" {...STROKE} stroke={fg} fill={ring} />
      <circle cx="13" cy="24" r="3" {...STROKE} stroke={fg} />
      {/* Directional arrow. */}
      <path {...STROKE} stroke={fg} d="M23 24 h12 m-4.5 -4.5 l4.5 4.5 l-4.5 4.5" />
      {/* Git-commit node. */}
      <circle cx="39.5" cy="24" r="4.5" {...STROKE} stroke={fg} fill={ring} />
      <path {...STROKE} stroke={fg} d="M43.5 24 h2.5 M35 24 h-0.5" />
    </>
  );
}

function Omnitrix({ fg, ring }: { fg: string; ring: string }) {
  return (
    <>
      {/* Radiating dashboard ticks. */}
      <path
        {...STROKE}
        stroke={fg}
        d="M42 24 h3 M24 42 v3 M6 24 h-3 M24 6 v-3 M36.7 36.7 l2.1 2.1 M11.3 36.7 l-2.1 2.1 M36.7 11.3 l2.1 -2.1 M11.3 11.3 l-2.1 -2.1"
      />
      {/* Watch dial. */}
      <circle cx="24" cy="24" r="14.5" {...STROKE} stroke={fg} fill={ring} />
      {/* Hourglass heart. */}
      <path {...STROKE} stroke={fg} d="M18.5 17.5 h11 l-4.6 6.5 4.6 6.5 h-11 l4.6 -6.5 z" />
    </>
  );
}

function CineVault({ fg, ring }: { fg: string; ring: string }) {
  return (
    <>
      {/* Film reel. */}
      <circle cx="19" cy="27" r="12.5" {...STROKE} stroke={fg} fill={ring} />
      <circle cx="19" cy="27" r="2.2" {...STROKE} stroke={fg} />
      <circle cx="19" cy="20.5" r="2" {...STROKE} stroke={fg} />
      <circle cx="25.5" cy="27" r="2" {...STROKE} stroke={fg} />
      <circle cx="19" cy="33.5" r="2" {...STROKE} stroke={fg} />
      <circle cx="12.5" cy="27" r="2" {...STROKE} stroke={fg} />
      {/* Bookmark ribbon, merged into the reel's rim. */}
      <path {...STROKE} stroke={fg} d="M30 8 h13 v21 l-6.5 -5 -6.5 5 z" />
    </>
  );
}

function Marlboro({ fg, ring }: { fg: string; ring: string }) {
  return (
    <>
      {/* Abstract mark until the repo earns a real motif: crimson momentum. */}
      <path {...STROKE} stroke={fg} d="M10 32 L26 16" />
      <path {...STROKE} stroke={fg} d="M14 38 L32 20" />
      <path {...STROKE} stroke={fg} d="M22 40 L36 26" />
      <circle cx="37" cy="15" r="3.5" {...STROKE} stroke={fg} fill={ring} />
    </>
  );
}

function DeployForge({ fg, ring }: { fg: string; ring: string }) {
  return (
    <>
      {/* Anvil. */}
      <path
        {...STROKE}
        stroke={fg}
        fill={ring}
        d="M7 12 h26 c-1 6.5 -7.5 9.5 -13 10.5 v6 h5 v5 H15 v-5 h5 v-6 C13 21.5 8.5 18.5 7 12 z"
      />
      {/* Commit line it sits on. */}
      <path {...STROKE} stroke={fg} d="M12 40 h24" />
      <circle cx="12" cy="40" r="2.4" {...STROKE} stroke={fg} />
      <circle cx="24" cy="40" r="2.4" {...STROKE} stroke={fg} />
      <circle cx="36" cy="40" r="2.4" {...STROKE} stroke={fg} />
    </>
  );
}

function DocStrange({ fg, ring }: { fg: string; ring: string }) {
  return (
    <>
      {/* Portal ring. */}
      <circle cx="24" cy="24" r="16" {...STROKE} stroke={fg} strokeDasharray="4 3.5" />
      {/* Camera lens at the center. */}
      <circle cx="24" cy="24" r="9" {...STROKE} stroke={fg} fill={ring} />
      <path {...STROKE} stroke={fg} d="M24 19.5 l3.9 2.25 v4.5 L24 28.5 l-3.9 -2.25 v-4.5 z" />
      <circle cx="24" cy="24" r="1.2" fill={fg} />
    </>
  );
}

const MOTIFS: Record<ProjectVisual["icon"], (p: { fg: string; ring: string }) => React.ReactNode> = {
  "context-shifter": ContextShifter,
  unisync: UniSync,
  omnitrix: Omnitrix,
  cinevault: CineVault,
  marlboro: Marlboro,
  deployforge: DeployForge,
  "doc-strange": DocStrange,
};

/**
 * A repo's tile: its own background color with the motif centered on top.
 * Used in the browser-history rows (small) and the project-window header (big).
 */
export function ProjectTile({
  visual,
  size = 40,
  className,
}: {
  visual: ProjectVisual;
  size?: number;
  className?: string;
}) {
  const Motif = MOTIFS[visual.icon];
  return (
    <span
      aria-hidden="true"
      className={`inline-grid shrink-0 place-items-center rounded-[22%] ${className ?? ""}`}
      style={{ width: size, height: size, backgroundColor: visual.bg }}
    >
      <svg width={size * 0.72} height={size * 0.72} viewBox="0 0 48 48" role="img">
        <Motif fg={visual.fg} ring={visual.ring} />
      </svg>
    </span>
  );
}
