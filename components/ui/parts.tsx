"use client";

import { AlertTriangle, ChevronRight } from "lucide-react";
import { cn } from "@/lib/cn";
import { SEQUENCES, useAchievementStore } from "@/lib/achievements";
import type { Metric, ProjectStatus } from "@/lib/projects";

/**
 * Shared window content primitives.
 *
 * Plain, server-renderable markup on purpose: everything here works without JS
 * and stays in the initial HTML (TRD §5). Case-study sections use <details>
 * because it is natively keyboard-operable, needs no JS, and keeps a window
 * scannable instead of dumping a wall of text.
 */

const STATUS_LABEL: Record<ProjectStatus, string> = {
  shipped: "shipped",
  "in-development": "in development",
  archived: "archived",
};

const STATUS_CLASS: Record<ProjectStatus, string> = {
  shipped: "border-status-shipped/40 bg-status-shipped/8 text-status-shipped",
  "in-development": "border-accent/40 bg-accent-soft text-accent-ink",
  archived: "border-line-strong bg-chrome-muted text-status-archived",
};

export function StatusBadge({ status, className }: { status: ProjectStatus; className?: string }) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full border px-2 py-0.5 font-mono text-[10px]",
        "uppercase tracking-wider",
        STATUS_CLASS[status],
        className,
      )}
    >
      <span aria-hidden="true" className="size-1.5 rounded-full bg-current" />
      {STATUS_LABEL[status]}
    </span>
  );
}

export function Tag({ children }: { children: React.ReactNode }) {
  return (
    <span className="rounded border border-line bg-chrome-muted px-1.5 py-0.5 font-mono text-[10px] text-ink-soft">
      {children}
    </span>
  );
}

export function TagRow({ items }: { items: string[] }) {
  return (
    <ul className="flex flex-wrap gap-1.5">
      {items.map((item) => (
        <li key={item}>
          <Tag>{item}</Tag>
        </li>
      ))}
    </ul>
  );
}

export function SectionHeading({
  children,
  hint,
}: {
  children: React.ReactNode;
  hint?: string;
}) {
  return (
    <h3 className="mb-1.5 flex items-baseline gap-2 font-mono text-[10px] uppercase tracking-[0.14em] text-ink-faint">
      {children}
      {hint ? <span className="normal-case tracking-normal text-ink-faint/80">{hint}</span> : null}
    </h3>
  );
}

/**
 * Metrics always carry their context (identity knowledge base §38): a bare
 * number is not allowed to stand in for what it measured.
 */
export function MetricCard({ metric }: { metric: Metric }) {
  const unverified = metric.context.toUpperCase().includes("UNVERIFIED");
  return (
    <div
      className={cn(
        "rounded-md border bg-chrome-muted px-2.5 py-2",
        unverified ? "border-accent/40" : "border-line",
      )}
    >
      <div className="font-mono text-sm leading-tight text-ink">{metric.value}</div>
      <div className="text-[11px] font-medium text-ink-soft">{metric.label}</div>
      <p className="mt-1 text-[10px] leading-snug text-ink-faint">{metric.context}</p>
    </div>
  );
}

export function MetricGrid({ metrics }: { metrics: Metric[] }) {
  if (metrics.length === 0) return null;
  return (
    <div className="grid gap-2 sm:grid-cols-2">
      {metrics.map((metric) => (
        <MetricCard key={`${metric.label}-${metric.value}`} metric={metric} />
      ))}
    </div>
  );
}

/** Native disclosure — keyboard accessible and JS-free by construction. */
export function CaseStudy({
  title,
  children,
  tone = "default",
  icon,
  /** Sequences (e.g. "deepDive") count each opened section towards its achievement. */
  sequence,
  sequencePart,
}: {
  title: string;
  children: React.ReactNode;
  tone?: "default" | "warn";
  icon?: React.ReactNode;
  sequence?: keyof typeof SEQUENCES;
  sequencePart?: string;
}) {
  // First open of a sequenced case study counts towards that sequence.
  const onToggle =
    sequence && sequencePart
      ? (event: React.ToggleEvent<HTMLDetailsElement>) => {
          if (event.currentTarget.open) {
            useAchievementStore.getState().record(sequence, sequencePart);
          }
        }
      : undefined;

  return (
    <details
      onToggle={onToggle}
      className="group rounded-md border border-line bg-chrome-muted/60 open:bg-chrome-muted">
      <summary className="flex cursor-pointer list-none items-center gap-1.5 px-2.5 py-1.5 text-[11px] font-medium text-ink marker:hidden">
        <ChevronRight
          aria-hidden="true"
          className="size-3.5 shrink-0 text-ink-faint transition-transform group-open:rotate-90 motion-reduce:transition-none"
        />
        {tone === "warn" ? (
          <AlertTriangle aria-hidden="true" className="size-3.5 shrink-0 text-accent-ink" />
        ) : null}
        {icon}
        <span>{title}</span>
      </summary>
      <div className="border-t border-line px-2.5 py-2 text-[11.5px] leading-relaxed text-ink-soft">
        {children}
      </div>
    </details>
  );
}

/** Renders the pipeline / flow chains as a wrap-friendly sequence. */
export function ArchChain({ steps }: { steps: string[] }) {
  return (
    <ol className="flex flex-wrap items-center gap-x-1 gap-y-1">
      {steps.map((step, i) => (
        <li key={`${step}-${i}`} className="flex items-center gap-1">
          <span className="rounded border border-line bg-chrome px-1.5 py-0.5 font-mono text-[10px] text-ink-soft">
            {step}
          </span>
          {i < steps.length - 1 ? (
            <span aria-hidden="true" className="text-[10px] text-ink-faint">
              →
            </span>
          ) : null}
        </li>
      ))}
    </ol>
  );
}

/**
 * Visible marker for content that genuinely does not exist yet. These are meant
 * to be impossible to miss and trivial to delete — see README "Placeholder
 * checklist" for the full list.
 */
export function PlaceholderNote({ children }: { children: React.ReactNode }) {
  return (
    <p className="flex items-start gap-1.5 rounded-md border border-dashed border-accent/50 bg-accent-soft px-2 py-1.5 font-mono text-[10px] leading-snug text-accent-ink">
      <AlertTriangle aria-hidden="true" className="mt-px size-3 shrink-0" />
      <span>{children}</span>
    </p>
  );
}

export function BulletList({ items }: { items: string[] }) {
  return (
    <ul className="space-y-1.5">
      {items.map((item) => (
        <li key={item} className="flex gap-2">
          <span aria-hidden="true" className="text-ink-faint">
            ·
          </span>
          <span>{item}</span>
        </li>
      ))}
    </ul>
  );
}
