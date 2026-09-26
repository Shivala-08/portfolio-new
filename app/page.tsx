import { Desktop } from "@/components/desktop/Desktop";
import { NoJsFallback } from "@/components/NoJsFallback";
import { PERSON } from "@/lib/content";

/**
 * The page is a single desktop. Its default windows are server-rendered with real
 * content, so the resume link, contact details and project list are all present in
 * the initial HTML (TRD §5).
 */
export default function Page() {
  return (
    <>
      {/* Document outline for crawlers and screen readers — the desktop itself
          is an app surface with per-window headings. */}
      <h1 className="sr-only">
        {PERSON.name} — {PERSON.positioning}: {PERSON.brandLine}
      </h1>
      <Desktop />
      <noscript>
        <NoJsFallback />
      </noscript>
    </>
  );
}
