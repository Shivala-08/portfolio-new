import { SectionHeading } from "@/components/ui/parts";
import { LAB_TOPICS } from "@/lib/content";

/**
 * "Currently obsessed with" (PRD §6.2) — real pet topics rather than decoration,
 * which is why it earns a taskbar slot at all (design doc §4). This is the part
 * that shows what he explores, not only what he finished.
 */
export function LabWindow() {
  return (
    <div className="space-y-3">
      <div>
        <p className="text-[12.5px] text-ink">The Lab</p>
        <p className="text-[11.5px] text-ink-faint">
          Open questions I&apos;m currently poking at. Not shippable, not bragging — just what I keep
          reading about after the work is done.
        </p>
      </div>

      <ul className="space-y-2.5">
        {LAB_TOPICS.map((topic) => (
          <li key={topic.title} className="border-l-2 border-line pl-2.5">
            <div className="flex items-center gap-2">
              <span className="font-mono text-[10px] uppercase tracking-wider text-accent-ink">
                {topic.tag}
              </span>
              <h3 className="text-[12px] font-medium text-ink">{topic.title}</h3>
            </div>
            <p className="text-[11.5px] leading-snug text-ink-soft">{topic.question}</p>
          </li>
        ))}
      </ul>

      <SectionHeading hint="none of these have a deadline">how the list works</SectionHeading>
      <p className="text-[11.5px] leading-relaxed text-ink-soft">
        A topic stays here until it turns into a measurement, an architecture decision, or a project.
        One already did: retrieval evaluation became Synapse&apos;s 40-question ground truth. Process
        isolation is heading the same way — Deploy Forge already compiles in an isolated build zone.
      </p>
    </div>
  );
}
