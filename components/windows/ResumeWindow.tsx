"use client";

import { useEffect } from "react";
import { Download } from "lucide-react";
import { useAchievementStore } from "@/lib/achievements";
import { BulletList, PlaceholderNote, SectionHeading } from "@/components/ui/parts";
import { AVAILABILITY, PERSON } from "@/lib/content";
import { PROJECTS } from "@/lib/projects";

/**
 * The resume fast-path (PRD §6.9). This is the one feature not allowed to be
 * buried under the joke: the window is open on load, and the download is the
 * single most prominent control in it.
 */
export function ResumeWindow() {
  const flagships = PROJECTS.filter((project) => project.tier === 1);

  // The resume is the one thing that may not be buried — reaching it is an
  // achievement whether it opened from the taskbar or the default layout.
  useEffect(() => {
    useAchievementStore.getState().unlock("found-resume");
  }, []);
  useEffect(() => {
    useAchievementStore.getState().unlock("found-resume");
  }, []);

  return (
    <div className="space-y-4 text-[12.5px] leading-relaxed text-ink-soft">
      <a
        href={PERSON.resumeHref}
        download
        className="flex items-center justify-center gap-2 rounded-md bg-accent px-3 py-2.5 text-[12.5px] font-medium text-white transition-colors hover:bg-accent-ink"
      >
        <Download aria-hidden="true" className="size-4" />
        Download resume (PDF)
      </a>

      <PlaceholderNote>
        TODO: public/resume.pdf doesn&apos;t exist yet, so this button currently 404s. Drop your PDF at
        that path and it works.
      </PlaceholderNote>

      <section>
        <SectionHeading>at a glance</SectionHeading>
        <dl className="space-y-1.5 text-[11.5px]">
          <div className="flex gap-2">
            <dt className="w-[86px] shrink-0 text-ink-faint">Name</dt>
            <dd className="text-ink">{PERSON.name}</dd>
          </div>
          <div className="flex gap-2">
            <dt className="w-[86px] shrink-0 text-ink-faint">Position</dt>
            <dd className="text-ink">{PERSON.positioning}</dd>
          </div>
          <div className="flex gap-2">
            <dt className="w-[86px] shrink-0 text-ink-faint">Education</dt>
            <dd>{PERSON.education}</dd>
          </div>
          <div className="flex gap-2">
            <dt className="w-[86px] shrink-0 text-ink-faint">Location</dt>
            <dd>{PERSON.location}</dd>
          </div>
        </dl>
      </section>

      <section>
        <SectionHeading hint="the three that answer real questions">flagship work</SectionHeading>
        <ul className="space-y-1.5">
          {flagships.map((project) => (
            <li key={project.id}>
              <span className="text-ink">{project.name}</span>
              <span className="font-mono text-[10px] text-ink-faint"> · {project.category}</span>
              <span className="block text-[11.5px] text-ink-soft">{project.tagline}</span>
            </li>
          ))}
        </ul>
      </section>

      <section>
        <SectionHeading>open to</SectionHeading>
        <BulletList items={AVAILABILITY} />
      </section>
    </div>
  );
}
