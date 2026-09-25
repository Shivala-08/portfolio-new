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
  project: "deploy-forge" | "the-skynet" | "synapse";
  value: string;
  label: string;
  /** What the number actually measures. Never render a metric without this. */
  context: string;
  /** Grouping on the dashboard. */
  group: "performance" | "ai-retrieval" | "tradeoff";
  /** Set when the number documents a cost, not just a win. */
  tradeoff?: boolean;
  /** Set when the claim is not yet backed by a documented measurement. */
  unverified?: boolean;
};

export const DASHBOARD_METRICS: DashboardMetric[] = [
  {
    project: "the-skynet",
    value: "883 KB → 24.9 KB",
    label: "3D bundle cost",
    context:
      "The Three.js + React Three Fiber stack was replaced with a hand-written ~500-line WebGL mini-renderer after measuring what the framework chunk cost. Reported as a 97% reduction in the 3D bundle.",
    group: "performance",
  },
  {
    project: "deploy-forge",
    value: "~15s",
    label: "Local production build",
    context:
      "Local production build only. This is NOT the end-to-end deploy time — see the propagation metric.",
    group: "performance",
  },
  {
    project: "deploy-forge",
    value: "~30–60s",
    label: "Vercel propagation delay",
    context:
      "Documented delay caused by deployment commits redeploying the platform itself. An architectural tradeoff, not a bug.",
    group: "tradeoff",
    tradeoff: true,
  },
  {
    project: "synapse",
    value: "0.875",
    label: "Recall@5",
    context:
      "Measured on a 40-question ground-truth dataset with LLM generation disabled (LLM-disabled evaluation) and a local SentenceTransformer sandbox.",
    group: "ai-retrieval",
  },
  {
    project: "synapse",
    value: "0.667",
    label: "MRR",
    context:
      "Mean Reciprocal Rank on the same 40-question ground truth — how high the correct document lands on average.",
    group: "ai-retrieval",
  },
  {
    project: "synapse",
    value: "62.5%",
    label: "Retrieval accuracy",
    context:
      "Ground-truth hit rate on the 40-question dataset under LLM-disabled evaluation — measures retrieval, not answer quality.",
    group: "ai-retrieval",
  },
  {
    project: "synapse",
    value: "207 ms",
    label: "Query latency",
    context:
      "Measured end-to-end retrieval query latency on the same evaluation harness.",
    group: "performance",
  },
  {
    project: "synapse",
    value: "+11 pts",
    label: "Cross-encoder reranking",
    context:
      "The largest single accuracy improvement — bought with a latency cost, see the paired metric.",
    group: "tradeoff",
    tradeoff: true,
  },
  {
    project: "synapse",
    value: "~200 ms",
    label: "Reranker latency penalty",
    context:
      "What the +11 accuracy points cost in query time. Roughly doubles the 207 ms baseline — the tradeoff is documented, not hidden.",
    group: "tradeoff",
    tradeoff: true,
  },
  {
    project: "the-skynet",
    value: "116 FPS",
    label: "Reported frame rate",
    context:
      "Claimed on mobile and desktop. UNVERIFIED AS STATED — device, browser, scene, measurement method and whether this is average/peak/sustained are not yet documented, so it is not presented as a general performance guarantee.",
    group: "performance",
    unverified: true,
  },
];
