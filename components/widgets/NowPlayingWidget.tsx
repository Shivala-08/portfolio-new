"use client";

import { useEffect, useRef, useState } from "react";
import { Music, Pause, Play } from "lucide-react";
import { NOW_PLAYING } from "@/lib/content";
import { cn } from "@/lib/cn";

/**
 * Ambient "currently playing" widget (PRD §6.7).
 *
 * Plays the local NOW_PLAYING file — no Spotify OAuth, no backend (TRD §4).
 * It lives in the taskbar's tray corner rather than floating over the desktop,
 * so it stays small and low-visual-weight without ever covering content.
 * The Audio element is created on first play (a real user gesture), loops the
 * rain, and pauses on unmount.
 */
export function NowPlayingWidget() {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [playing, setPlaying] = useState(false);

  useEffect(() => {
    return () => {
      audioRef.current?.pause();
      audioRef.current = null;
    };
  }, []);

  const toggle = () => {
    if (!audioRef.current) {
      const audio = new Audio(NOW_PLAYING.src);
      audio.loop = true;
      audioRef.current = audio;
    }
    const audio = audioRef.current;
    if (playing) {
      audio.pause();
      setPlaying(false);
    } else {
      void audio.play().then(
        () => setPlaying(true),
        () => setPlaying(false),
      );
    }
  };

  return (
    <div className="flex items-center gap-2 rounded-md border border-line bg-chrome px-2 py-1">
      <Music aria-hidden="true" className="size-3.5 shrink-0 text-accent-ink" />
      <div className="min-w-0">
        <p className="truncate text-[11px] leading-tight text-ink">{NOW_PLAYING.track}</p>
        <p className="truncate text-[10px] leading-tight text-ink-faint">{NOW_PLAYING.artist}</p>
      </div>
      <button
        type="button"
        onClick={toggle}
        aria-pressed={playing}
        aria-label={playing ? `Pause ${NOW_PLAYING.track}` : `Play ${NOW_PLAYING.track}`}
        className="grid size-5 shrink-0 place-items-center rounded text-ink-faint transition-colors hover:bg-wallpaper-deep hover:text-ink"
      >
        {playing ? (
          <Pause aria-hidden="true" className="size-3" />
        ) : (
          <Play aria-hidden="true" className="size-3" />
        )}
      </button>
      <span
        aria-hidden="true"
        className={cn("flex h-3.5 items-end gap-[2px] motion-reduce:hidden", !playing && "opacity-40")}
      >
        <span className={cn("w-[2px] rounded-full bg-accent/70", playing ? "eq-bar h-3.5" : "h-1")} />
        <span
          className={cn("w-[2px] rounded-full bg-accent/70", playing ? "eq-bar h-3.5" : "h-1")}
          style={playing ? { animationDelay: "0.25s" } : undefined}
        />
        <span
          className={cn("w-[2px] rounded-full bg-accent/70", playing ? "eq-bar h-3.5" : "h-1")}
          style={playing ? { animationDelay: "0.5s" } : undefined}
        />
      </span>
      <span className="sr-only">
        Now playing widget. {NOW_PLAYING.track} by {NOW_PLAYING.artist}.
      </span>
    </div>
  );
}
