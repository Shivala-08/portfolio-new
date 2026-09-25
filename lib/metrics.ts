/**
 * The engineering metrics dashboard (identity.txt §38).
 *
 * Rule from the knowledge base: a metric never appears without what it actually
 * measured. Every entry here carries `context`, and the windows render it —
 * there is no code path that shows the bare number alone. All values come from
 * the project READMEs via identity.txt; nothing is invented.
 */

export type DashboardMetric = {
  /** Where the number comes from — ties the dashboard back to the case studies. */
  project: "deploy-forge" | "the-skynet" | "omnitrix-os";
  /** Display name for the source project. */
  projectLabel: string;
  /**
   * Window id that proves the number (project window or shelf). Absent when the
   * source project has no window yet — the dashboard then shows the label as
   * plain text rather than a dead link.
   */
  windowId?: string;
  value: string;
  label: string;
  /** What the number actually measures. Never render a metric without this. */
  context: string;
  /** Grouping on the dashboard. */
  group: "performance" | "tradeoff";
  /** Set when the number documents a cost, not just a win. */
  tradeoff?: boolean;
  /** Set when the claim is not yet backed by a documented measurement. */
  unverified?: boolean;
};

export const DASHBOARD_METRICS: DashboardMetric[] = [
  {
    project: "the-skynet",
    projectLabel: "The Skynet · reserved volume",
    windowId: "shelf",
    value: "883 KB → 24.9 KB",
    label: "3D bundle cost",
    context:
      "The Three.js + React Three Fiber stack was replaced with a hand-written ~500-line WebGL mini-renderer after measuring what the framework chunk cost. Reported as a 97% reduction in the 3D bundle.",
    group: "performance",
  },
  {
    project: "deploy-forge",
    projectLabel: "Deploy Forge",
    windowId: "project:deploy-forge",
    value: "~15s",
    label: "Local production build",
    context:
      "Local production build only. This is NOT the end-to-end deploy time — see the propagation metric.",
    group: "performance",
  },
  {
    project: "deploy-forge",
    projectLabel: "Deploy Forge",
    windowId: "project:deploy-forge",
    value: "~30–60s",
    label: "Vercel propagation delay",
    context:
      "Documented delay caused by deployment commits redeploying the platform itself. An architectural tradeoff, not a bug.",
    group: "tradeoff",
    tradeoff: true,
  },
  {
    project: "omnitrix-os",
    projectLabel: "Omnitrix OS",
    windowId: "project:omnitrix-os",
    value: "116 FPS",
    label: "Reported frame rate",
    context:
      "Claimed on mobile and desktop. UNVERIFIED AS STATED — device, browser, scene, measurement method and whether this is average/peak/sustained are not yet documented, so it is not presented as a general performance guarantee.",
    group: "performance",
    unverified: true,
  },
];
