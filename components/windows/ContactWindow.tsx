import { ExternalLink, GitBranch, Mail, MapPin, Share2 } from "lucide-react";
import { PlaceholderNote, SectionHeading } from "@/components/ui/parts";
import { AVAILABILITY, PERSON } from "@/lib/content";
import { CheckoutSlip } from "@/components/windows/CheckoutSlip";

const isPending = (value: string) => value.startsWith("TODO");

/**
 * Contact window (design doc §6). GitHub is real; email and LinkedIn are not in
 * the knowledge base yet, so they render as explicit pending rows instead of
 * dead links.
 */
export function ContactWindow() {
  const rows = [
    { key: "github", label: "GitHub", value: PERSON.githubHandle, href: PERSON.github, Icon: GitBranch },
    { key: "email", label: "Email", value: PERSON.email, href: null, Icon: Mail },
    { key: "linkedin", label: "LinkedIn", value: PERSON.linkedin, href: null, Icon: Share2 },
  ];

  const pending = rows.filter((row) => isPending(row.value));

  return (
    <div className="space-y-4 text-[12.5px] leading-relaxed text-ink-soft">
      <p className="text-ink">
        Fastest way to reach me is GitHub or email — I&apos;ll reply to anything specific about the work.
      </p>

      <ul className="space-y-1">
        {rows.map(({ key, label, value, href, Icon }) => (
          <li key={key} className="flex items-center gap-2">
            <Icon aria-hidden="true" className="size-3.5 shrink-0 text-ink-faint" />
            <span className="w-[58px] shrink-0 text-[11px] text-ink-faint">{label}</span>
            {href ? (
              <a
                href={href}
                target="_blank"
                rel="noreferrer noopener"
                className="inline-flex min-w-0 items-center gap-1 truncate text-accent-ink underline decoration-accent/40 underline-offset-2 hover:decoration-accent"
              >
                {value}
                <ExternalLink aria-hidden="true" className="size-3 shrink-0" />
              </a>
            ) : (
              <span className="font-mono text-[11px] text-ink-faint">{value}</span>
            )}
          </li>
        ))}
        <li className="flex items-center gap-2">
          <MapPin aria-hidden="true" className="size-3.5 shrink-0 text-ink-faint" />
          <span className="w-[58px] shrink-0 text-[11px] text-ink-faint">Based</span>
          <span className="text-[11.5px]">{PERSON.location}</span>
        </li>
      </ul>

      {pending.length > 0 ? (
        <PlaceholderNote>
          TODO: email and LinkedIn aren&apos;t in the knowledge base yet. Set PERSON.email and
          PERSON.linkedin in lib/content.ts and these rows become real links.
        </PlaceholderNote>
      ) : null}

      <section>
        <SectionHeading>currently open to</SectionHeading>
        <ul className="space-y-1 text-[11.5px]">
          {AVAILABILITY.map((item) => (
            <li key={item} className="flex gap-2">
              <span aria-hidden="true" className="text-accent-ink">
                +
              </span>
              {item}
            </li>
          ))}
        </ul>
      </section>

      {/* Checkout-style contact flow (shelf-atmosphere-features-manual.md §5):
          the contact form as a library borrower's slip with a Check Out stamp. */}
      <section>
        <SectionHeading>check out a conversation</SectionHeading>
        <CheckoutSlip />
      </section>
    </div>
  );
}
