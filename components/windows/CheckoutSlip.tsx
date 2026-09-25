"use client";

import { useRef, useState } from "react";
import { Loader2, Stamp } from "lucide-react";
import { PlaceholderNote } from "@/components/ui/parts";

/**
 * Checkout-style contact slip (shelf-atmosphere-features-manual.md §5).
 *
 * The contact form reframed as a library checkout: a name, one line about
 * what the visit is for, and a "Check Out" stamp button. Confirmation is a
 * stamped "CHECKED OUT — [date]" card in the same visual family as the
 * shelf's due-date cards, rather than a generic "message sent" toast.
 *
 * Delivery: the slip POSTs JSON to `NEXT_PUBLIC_CHECKOUT_ENDPOINT` when set
 * (any form-to-email route — the endpoint owns the real rate limit, secrets
 * and email sending; nothing client-side can expose them). Without an
 * endpoint the slip still stamps honestly, labelled as a demo slip — the
 * project's visible-placeholder pattern, so a dead form can't ship by
 * accident. Failures degrade to an explicit error line with the GitHub link
 * one window away as the fallback.
 */

const ENDPOINT = process.env.NEXT_PUBLIC_CHECKOUT_ENDPOINT;

/** Local YYYY-MM-DD ("en-CA" yields ISO order) for the stamp. */
function todayStamp(): string {
  return new Date().toLocaleDateString("en-CA");
}

type SlipState = "idle" | "sending" | "done" | "error";

/** Client-side throttle: one slip per 30s (the endpoint enforces the real limit). */
const THROTTLE_MS = 30_000;

export function CheckoutSlip() {
  const [name, setName] = useState("");
  const [topic, setTopic] = useState("");
  const [state, setState] = useState<SlipState>("idle");
  const [checkedOutAt, setCheckedOutAt] = useState<string | null>(null);
  const lastSubmitRef = useRef(0);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (state === "sending") return;

    const now = Date.now();
    if (now - lastSubmitRef.current < THROTTLE_MS) {
      setState("error");
      return;
    }
    lastSubmitRef.current = now;

    setState("sending");
    const today = todayStamp();

    if (!ENDPOINT) {
      // Demo mode: no delivery endpoint configured. The stamp still shows —
      // clearly labelled as a demo slip, never pretending mail left the desk.
      await new Promise((resolve) => setTimeout(resolve, 450));
      setCheckedOutAt(today);
      setState("done");
      return;
    }

    try {
      const response = await fetch(ENDPOINT, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: name.trim(),
          message: topic.trim(),
          source: "47 Tabs Open — checkout slip",
          date: today,
        }),
      });
      if (!response.ok) throw new Error(`checkout endpoint returned ${response.status}`);
      setCheckedOutAt(today);
      setState("done");
    } catch {
      setState("error");
    }
  };

  if (state === "done" && checkedOutAt) {
    return (
      <div>
        {/* The stamped confirmation — same visual family as the shelf's
            due-date card (manual §5: reuse the treatment, don't invent one). */}
        <div
          className="relative overflow-hidden rounded-[2px] border border-line bg-[#faf6ec] px-4 py-3 shadow-[0_4px_12px_-8px_rgb(38_35_31/0.4)]"
          style={{ transform: "rotate(-0.8deg)" }}
        >
          <div
            aria-hidden="true"
            className="pointer-events-none absolute inset-0 opacity-60"
            style={{
              backgroundImage: "linear-gradient(rgb(38 35 31 / 0.06) 1px, transparent 1px)",
              backgroundSize: "100% 18px",
              backgroundPosition: "0 22px",
            }}
          />
          <div className="relative flex items-center gap-3">
            <span
              className="inline-block rounded-[3px] border-2 border-dashed px-2.5 py-1 font-mono text-[11px] font-semibold uppercase tracking-[0.22em] text-[#8c3b2e]"
              style={{ borderColor: "#8c3b2e88", transform: "rotate(-2.2deg)" }}
            >
              Checked out
            </span>
            <span className="font-mono text-[13px] tracking-[0.08em] text-ink">
              {checkedOutAt}
            </span>
          </div>
          <p className="relative mt-2 text-[12px] leading-relaxed text-ink-soft">
            Slip stamped{ENDPOINT ? " and filed" : ""} — thanks, {name.trim() || "visitor"}.
            {ENDPOINT
              ? " I'll get back to anything specific."
              : " (Demo slip: no delivery endpoint is configured, so nothing was sent.)"}
          </p>
        </div>
        <button
          type="button"
          onClick={() => {
            setState("idle");
            setName("");
            setTopic("");
            setCheckedOutAt(null);
          }}
          className="mt-2 font-mono text-[10px] uppercase tracking-[0.14em] text-ink-faint underline decoration-line underline-offset-2 hover:text-ink-soft"
        >
          Write another slip
        </button>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-2.5">
      <div
        className="relative overflow-hidden rounded-[2px] border border-line bg-[#faf6ec] px-4 py-3 shadow-[0_4px_12px_-8px_rgb(38_35_31/0.4)]"
        style={{ transform: "rotate(0.4deg)" }}
      >
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 opacity-50"
          style={{
            backgroundImage: "linear-gradient(rgb(38 35 31 / 0.05) 1px, transparent 1px)",
            backgroundSize: "100% 22px",
            backgroundPosition: "0 30px",
          }}
        />
        <div className="relative space-y-2.5">
          <p className="font-mono text-[9px] uppercase tracking-[0.3em] text-ink-faint">
            circulation desk · borrower&apos;s slip
          </p>

          <label className="block">
            <span className="font-mono text-[10px] uppercase tracking-[0.14em] text-ink-faint">
              Name
            </span>
            <input
              type="text"
              value={name}
              onChange={(event) => setName(event.target.value)}
              required
              maxLength={120}
              autoComplete="name"
              placeholder="Your name"
              className="mt-1 w-full rounded-[2px] border border-line bg-white/85 px-2.5 py-1.5 text-[12.5px] text-ink placeholder:text-ink-faint/70 focus:border-accent focus:outline-none"
            />
          </label>

          <label className="block">
            <span className="font-mono text-[10px] uppercase tracking-[0.14em] text-ink-faint">
              What are you reaching out about?
            </span>
            <input
              type="text"
              value={topic}
              onChange={(event) => setTopic(event.target.value)}
              required
              maxLength={280}
              placeholder="One line is plenty"
              className="mt-1 w-full rounded-[2px] border border-line bg-white/85 px-2.5 py-1.5 text-[12.5px] text-ink placeholder:text-ink-faint/70 focus:border-accent focus:outline-none"
            />
          </label>

          <div className="flex items-center justify-between gap-2 pt-0.5">
            <button
              type="submit"
              disabled={state === "sending"}
              className="inline-flex items-center gap-1.5 rounded-[3px] border border-[#8c3b2e66] bg-[#8c3b2e0d] px-3 py-1.5 font-mono text-[11px] font-semibold uppercase tracking-[0.18em] text-[#8c3b2e] transition-colors hover:bg-[#8c3b2e1a] disabled:cursor-default disabled:opacity-60"
            >
              {state === "sending" ? (
                <Loader2 aria-hidden="true" className="size-3.5 animate-spin" />
              ) : (
                <Stamp aria-hidden="true" className="size-3.5" />
              )}
              Check out
            </button>
            <p aria-live="polite" className="text-right font-mono text-[9.5px] text-ink-faint">
              {state === "error"
                ? "The desk jammed — try again, or use GitHub."
                : ENDPOINT
                  ? "one slip per visit, please"
                  : "demo slip — nothing sends"}
            </p>
          </div>
        </div>
      </div>

      {!ENDPOINT ? (
        <PlaceholderNote>
          TODO: set NEXT_PUBLIC_CHECKOUT_ENDPOINT to a form-to-email endpoint and this slip
          sends for real. Until then it stamps a clearly-labelled demo confirmation.
        </PlaceholderNote>
      ) : null}
    </form>
  );
}
