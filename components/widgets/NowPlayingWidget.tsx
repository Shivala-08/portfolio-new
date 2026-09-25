import { Music } from "lucide-react";
import { NOW_PLAYING } from "@/lib/content";

/**
 * Ambient "currently playing" widget (PRD §6.7).
 *
 * Static/curated for v1 — no Spotify OAuth, no backend (TRD §4). It lives in the
 * taskbar's tray corner rather than floating over the desktop, so it stays small
 * and low-visual-weight without ever covering a window's content.
 *
 * Shaped so a real integration can replace the source without a rewrite: swap
 * NOW_PLAYING for a fetch and the presentation below is unchanged.
 */
export function NowPlayingWidget() {
  return (
    <div className="flex items-center gap-2 rounded-md border border-line bg-chrome px-2 py-1">
      <Music aria-hidden="true" className="size-3.5 shrink-0 text-accent-ink" />
      <div className="min-w-0">
        <p className="truncate text-[11px] leading-tight text-ink">{NOW_PLAYING.track}</p>
        <p className="truncate text-[10px] leading-tight text-ink-faint">{NOW_PLAYING.artist}</p>
      </div>
      <span aria-hidden="true" className="flex h-3.5 items-end gap-[2px] motion-reduce:hidden">
        <span className="eq-bar h-3.5 w-[2px] rounded-full bg-accent/70" />
        <span className="eq-bar h-3.5 w-[2px] rounded-full bg-accent/70" style={{ animationDelay: "0.25s" }} />
        <span className="eq-bar h-3.5 w-[2px] rounded-full bg-accent/70" style={{ animationDelay: "0.5s" }} />
      </span>
      <span className="sr-only">
        Now playing widget. Track and artist are placeholder values awaiting real content.
      </span>
    </div>
  );
}
