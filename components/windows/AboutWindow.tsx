import { GraduationCap, MapPin } from "lucide-react";
import { BulletList, SectionHeading } from "@/components/ui/parts";
import { ABOUT_NOTES, AVAILABILITY, PERSON, PRINCIPLES } from "@/lib/content";

/**
 * "Notes" window (design doc §6): About content written with real tangents
 * rather than a formal bio paragraph. Every claim here is from identity.txt.
 */
export function AboutWindow() {
  return (
    <div className="space-y-4 text-[12.5px] leading-relaxed text-ink-soft">
      <header className="space-y-1">
        <h1 className="text-[15px] font-semibold text-ink">{PERSON.name}</h1>
        <p className="font-mono text-[10.5px] uppercase tracking-[0.14em] text-accent-ink">
          {PERSON.positioning}
        </p>
        <p className="text-ink">{PERSON.brandLine}</p>
      </header>

      <div className="flex flex-col gap-1 border-y border-line py-2 text-[11px] text-ink-faint">
        <span className="inline-flex items-center gap-1.5">
          <MapPin aria-hidden="true" className="size-3.5" />
          {PERSON.location}
        </span>
        <span className="inline-flex items-center gap-1.5">
          <GraduationCap aria-hidden="true" className="size-3.5" />
          {PERSON.education}
        </span>
        <span className="font-mono text-ink-soft">{PERSON.status}</span>
      </div>

      <section>
        <SectionHeading>notes to self</SectionHeading>
        <div className="space-y-2.5">
          {ABOUT_NOTES.map((paragraph) => (
            <p key={paragraph.slice(0, 32)}>{paragraph}</p>
          ))}
        </div>
      </section>

      <section>
        <SectionHeading hint="the through-line">how I work</SectionHeading>
        <ol className="space-y-2">
          {PRINCIPLES.map((principle) => (
            <li key={principle.n} className="flex gap-2.5">
              <span className="mt-0.5 font-mono text-[10px] text-accent-ink">{principle.n}</span>
              <span>
                <span className="text-ink">{principle.title}</span>
                <span className="block text-[11.5px] text-ink-faint">{principle.body}</span>
              </span>
            </li>
          ))}
        </ol>
      </section>

      <section>
        <SectionHeading>open to</SectionHeading>
        <BulletList items={AVAILABILITY} />
      </section>
    </div>
  );
}
