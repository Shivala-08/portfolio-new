"use client";

import { DASHBOARD_METRICS } from "@/lib/metrics";
import type { DashboardMetric } from "@/lib/metrics";
import { getWindowDefinition } from "@/lib/windows";
import { useWindowStore } from "@/lib/windowStore";
import { SectionHeading } from "@/components/ui/parts";
import { cn } from "@/lib/cn";

/**
 * The engineering metrics dashboard (identity.txt §38).
 *
 * Every number carries what it actually measured — there is no code path that
 * shows a bare value alone. Each metric links to the window that proves it
 * (its `windowId` in lib/metrics.ts); entries whose project has no window yet
 * render the source as plain text rather than a dead link.
 */

const GROUPS = [
  { id: "performance", title: "performance" },
  { id: "tradeoff", title: "tradeoffs, documented" },
] as const;

function MetricRow({ metric }: { metric: DashboardMetric }) {
  const open = useWindowStore((s) => s.open);
  const unverified = metric.unverified === true;
  const target = metric.windowId ? getWindowDefinition(metric.windowId) : undefined;

  return (
    <li className="rounded-md border border-line bg-chrome-muted px-2.5 py-2">
      <div className="flex flex-wrap items-baseline justify-between gap-x-3 gap-y-0.5">
        <span className="font-mono text-sm leading-tight text-ink">{metric.value}</span>
        {target ? (
          <button
            type="button"
            onClick={() => open(target.id)}
            title={`Open ${target.title}`}
            className="font-mono text-[10px] uppercase tracking-[0.14em] text-accent-ink underline decoration-accent/40 underline-offset-2 hover:decoration-accent"
          >
            {metric.projectLabel}
          </button>
        ) : (
          <span className="font-mono text-[10px] uppercase tracking-[0.14em] text-ink-faint">
            {metric.projectLabel}
          </span>
        )}
      </div>
      <div className="mt-0.5 flex flex-wrap items-center gap-x-2 text-[11px] font-medium text-ink-soft">
        <span>{metric.label}</span>
        {metric.tradeoff ? (
          <span className="rounded border border-accent/40 bg-accent-soft px-1 py-px font-mono text-[9px] uppercase tracking-[0.1em] text-accent-ink">
            tradeoff
          </span>
        ) : null}
        {unverified ? (
          <span
            className="cursor-help font-mono text-[9px] text-ink-faint"
            title="A number without its measurement context is not a claim — see below."
          >
            (unverified)
          </span>
        ) : null}
      </div>
      <p className="mt-1 text-[10px] leading-snug text-ink-faint">{metric.context}</p>
    </li>
  );
}

export function MetricsWindow() {
  return (
    <div className="space-y-4 text-[12px] leading-relaxed text-ink-soft">
      <p className="text-ink">
        Numbers I&apos;m willing to defend — each one carries what it actually measured.
      </p>

      {GROUPS.map((group) => {
        const metrics = DASHBOARD_METRICS.filter((m) => m.group === group.id);
        if (metrics.length === 0) return null;
        return (
          <section key={group.id}>
            <SectionHeading>{group.title}</SectionHeading>
            <ul className={cn("space-y-2")}>
              {metrics.map((metric) => (
                <MetricRow key={`${metric.label}-${metric.value}`} metric={metric} />
              ))}
            </ul>
          </section>
        );
      })}

      <p className="border-t border-line pt-2 font-mono text-[10px] leading-snug text-ink-faint">
        Rule: a metric never appears without its context. The (unverified) flag means the
        measurement still needs its device, scene and method written down.
      </p>
    </div>
  );
}
