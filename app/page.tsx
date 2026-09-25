import { Desktop } from "@/components/desktop/Desktop";
import { NoJsFallback } from "@/components/NoJsFallback";

/**
 * The page is a single desktop. Its default windows are server-rendered with real
 * content, so the resume link, contact details and project list are all present in
 * the initial HTML (TRD §5).
 */
export default function Page() {
  return (
    <>
      <Desktop />
      <noscript>
        <NoJsFallback />
      </noscript>
    </>
  );
}
