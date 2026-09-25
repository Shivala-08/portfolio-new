import { ExternalLink, GitBranch } from "lucide-react";
import {
  ArchChain,
  BulletList,
  CaseStudy,
  MetricGrid,
  PlaceholderNote,
  SectionHeading,
  StatusBadge,
  TagRow,
} from "@/components/ui/parts";
import { ProjectTile } from "@/components/ui/ProjectIcons";
import { getProject } from "@/lib/projects";

/**
 * One generic project window, driven entirely by project data (TRD §2).
 *
 * Structure follows identity.txt §37 without dumping the whole case study at
 * once: the summary, metrics and architecture stay visible, and the longer
 * narrative sections collapse into native <details> so the window is still
 * scannable in a few seconds.
 */
export function ProjectWindow({ projectId }: { projectId: string }) {
  const project = getProject(projectId);

  if (!project) {
    return <p className="text-[12px] text-ink-soft">Unknown project: {projectId}</p>;
  }

  const hasLinks = Boolean(project.links.github || project.links.demo);

  return (
    <article className="space-y-4 text-[12.5px] leading-relaxed text-ink-soft">
      <header className="space-y-1.5">
        <div className="flex items-center gap-3">
          <ProjectTile visual={project.visual} size={44} />
          <div className="flex flex-wrap items-center gap-2">
            <h1 className="text-[15px] font-semibold text-ink">{project.name}</h1>
            <StatusBadge status={project.status} />
          </div>
        </div>
        <p className="font-mono text-[10px] uppercase tracking-[0.14em] text-ink-faint">
          {project.category} · {project.role}
          {project.tier === 1 ? " · flagship" : ""}
        </p>
        <p className="text-ink">{project.tagline}</p>
      </header>

      <p>{project.summary}</p>

      {project.metrics.length > 0 ? (
        <section>
          <SectionHeading hint="every number carries what it measured">measured</SectionHeading>
          <MetricGrid metrics={project.metrics} />
        </section>
      ) : null}

      {project.architecture?.length ? (
        <section>
          <SectionHeading>architecture</SectionHeading>
          <ArchChain steps={project.architecture} />
        </section>
      ) : null}

      {project.constraint ? (
        <CaseStudy
          title={project.constraint.title}
          tone="warn"
          sequence={project.id === "deploy-forge" ? "deepDive" : undefined}
          sequencePart={project.id === "deploy-forge" ? "df-constraint" : undefined}
        >
          {project.constraint.body}
        </CaseStudy>
      ) : null}

      {project.experiment ? (
        <CaseStudy title={project.experiment.title}>{project.experiment.body}</CaseStudy>
      ) : null}

      {project.broke ? (
        <CaseStudy title={project.broke.title} tone="warn">
          {project.broke.body}
        </CaseStudy>
      ) : null}

      {project.tradeoffs?.length ? (
        <CaseStudy
          title="Tradeoffs I chose on purpose"
          sequence={project.id === "deploy-forge" ? "deepDive" : undefined}
          sequencePart={project.id === "deploy-forge" ? "df-tradeoffs" : undefined}
        >
          <BulletList items={project.tradeoffs} />
        </CaseStudy>
      ) : null}

      {project.stack.length ? (
        <section>
          <SectionHeading>stack</SectionHeading>
          <TagRow items={project.stack} />
        </section>
      ) : null}

      <section>
        <SectionHeading>source</SectionHeading>
        <div className="flex flex-wrap gap-2">
          {project.links.github ? (
            <a
              href={project.links.github}
              target="_blank"
              rel="noreferrer noopener"
              className="inline-flex items-center gap-1.5 rounded-md border border-line bg-chrome-muted px-2.5 py-1.5 text-[11.5px] text-ink transition-colors hover:border-line-strong hover:bg-chrome"
            >
              <GitBranch aria-hidden="true" className="size-3.5" />
              Source
            </a>
          ) : null}
          {project.links.demo ? (
            <a
              href={project.links.demo}
              target="_blank"
              rel="noreferrer noopener"
              className="inline-flex items-center gap-1.5 rounded-md border border-line bg-chrome-muted px-2.5 py-1.5 text-[11.5px] text-ink transition-colors hover:border-line-strong hover:bg-chrome"
            >
              <ExternalLink aria-hidden="true" className="size-3.5" />
              Live demo
            </a>
          ) : null}
        </div>
        {!hasLinks ? (
          <div className="mt-2">
            <PlaceholderNote>
              TODO: {project.name} has no public repository or demo link yet — add it to the
              `links` object in lib/projects.ts once it can be published.
            </PlaceholderNote>
          </div>
        ) : null}
      </section>
    </article>
  );
}
