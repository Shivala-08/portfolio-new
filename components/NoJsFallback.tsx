import { AVAILABILITY, PERSON } from "@/lib/content";
import { PROJECTS } from "@/lib/projects";

/**
 * TRD §5 (no-JS / crawler fallback), non-negotiable.
 *
 * Two layers of defence:
 *  1. The desktop's default windows are server-rendered with real content, so
 *     crawlers and the first paint get everything without hydrating.
 *  2. This plain document, shown only when JS is disabled, so a JS-disabled
 *     visitor gets a readable page instead of an inert desktop they can't close.
 *
 * It is deliberately plain semantic HTML: no client components, no store, no
 * position: absolute.
 */
export function NoJsFallback() {
  return (
    <>
      {/*
        `noscript` content is inert while JS is on, so this style only ever runs
        without JS. It hides the (unusable, uncloseable) desktop and re-enables
        page scrolling, which the desktop normally suppresses.
      */}
      <style
        dangerouslySetInnerHTML={{
          __html: "[data-desktop]{display:none!important}body{overflow:auto!important}",
        }}
      />
      <main className="mx-auto max-w-2xl px-5 py-10 text-[13px] leading-relaxed text-ink-soft">
        <h1 className="text-lg font-semibold text-ink">{PERSON.name}</h1>
        <p className="font-mono text-[11px] uppercase tracking-[0.14em] text-accent-ink">
          {PERSON.positioning}
        </p>
        <p className="mt-2 text-ink">{PERSON.brandLine}</p>

        <ul className="mt-3 space-y-1 text-[12px]">
          <li>
            Resume:{" "}
            <a className="underline" href={PERSON.resumeHref}>
              {PERSON.resumeHref}
            </a>{" "}
            (TODO: add public/resume.pdf)
          </li>
          <li>
            GitHub:{" "}
            <a className="underline" href={PERSON.github}>
              {PERSON.github}
            </a>
          </li>
          <li>Email: {PERSON.email} (TODO — not in the knowledge base yet)</li>
          <li>Based in {PERSON.location}</li>
        </ul>

        <h2 className="mt-6 text-[13px] font-semibold text-ink">Projects</h2>
        <ul className="mt-2 space-y-3">
          {PROJECTS.map((project) => (
            <li key={project.id}>
              <span className="font-medium text-ink">{project.name}</span>
              <span className="font-mono text-[10px] text-ink-faint">
                {" "}
                · {project.category} · {project.status}
              </span>
              <p>{project.tagline}</p>
              <p>{project.summary}</p>
              {project.links.github ? (
                <a className="underline" href={project.links.github}>
                  {project.links.github}
                </a>
              ) : null}
            </li>
          ))}
        </ul>

        <h2 className="mt-6 text-[13px] font-semibold text-ink">Open to</h2>
        <ul className="mt-2 list-disc pl-5">
          {AVAILABILITY.map((item) => (
            <li key={item}>{item}</li>
          ))}
        </ul>
      </main>
    </>
  );
}
