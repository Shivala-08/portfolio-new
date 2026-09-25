"use client";

import { useState } from "react";
import { useReducedMotion } from "framer-motion";
import { Volume2, VolumeX } from "lucide-react";
import { ShelfWindow } from "@/components/windows/ShelfWindow";
import { ROOM_SOUND_TRACKS } from "@/lib/shelfAtmosphere";
import { isSoundOn, startRoomTone, stopRoomTone } from "@/lib/roomSound";

/**
 * The Bookshelf (components/windows/ShelfExperience.tsx)
 *
 * Hosts the original shelf: `public/shelf/index.html` is the untouched
 * "Working Volumes" Three.js study from shelf-demo/file.html, regenerated with
 * only its contents swapped for this portfolio's seven projects (see
 * shelf-demo/build-port.py for the exact patch list).
 *
 * It runs in an iframe on purpose. The experience owns a full document: its own
 * `html`/`body` rules, `:root` palette, Google Fonts link, import map, DOM ids
 * and a WebGL canvas. In an iframe all of that stays contained — none of it
 * leaks into the desktop's "daylight" theme — and the original code runs
 * exactly as written rather than being rewritten against React's lifecycle.
 *
 * Two deliberate notes:
 *  - Keyboard events inside the iframe belong to the shelf (←/→ to move through
 *    the volumes, Esc to close the opened book). They do not reach the desktop,
 *    so Escape cannot also close this window while the shelf has focus; the
 *    title-bar close button remains the way out.
 *  - Reduced motion renders the static DOM shelf below instead. The original is
 *    a continuously animating 3D scene, and TRD §5 requires motion to degrade
 *    rather than be ignored.
 *
 * Ambient sound (shelf-atmosphere-features-manual.md §7): the toggle lives on
 * the window frame — outside the DOM shelf's state — so it stays in the corner
 * whether a book is open, the catalog is pulled, or nothing is. It defaults to
 * OFF and the audio engine only ever starts from this click handler (a real
 * user gesture; there is no autoplay path). The synthesized page-turn SFX in
 * lib/roomSound.ts reads this same module-level flag, so one toggle governs
 * both voices. Reduced-motion visitors get the DOM shelf and the same toggle;
 * the sound is kept subtler than the visuals by design, and honoring a
 * calmer-experience signal here means simply leaving it off.
 */
export function ShelfExperience() {
  const reduceMotion = useReducedMotion();
  const [soundOn, setSoundOn] = useState(false);
  const [track, setTrack] = useState(0);

  const toggleSound = () => {
    if (soundOn || isSoundOn()) {
      stopRoomTone();
      setSoundOn(false);
      return;
    }
    if (startRoomTone(track)) setSoundOn(true);
  };

  const cycleTrack = () => {
    const next = (track + 1) % ROOM_SOUND_TRACKS.length;
    setTrack(next);
    if (soundOn) startRoomTone(next);
  };

  return (
    <div className="flex h-full min-h-0 flex-col gap-1.5">
      <div className="relative min-h-0 flex-1">
        {reduceMotion ? (
          <ShelfWindow />
        ) : (
          <div className="h-full overflow-hidden rounded-md border border-line bg-[#171a24]">
            <iframe
              src="/shelf/index.html"
              title="Bookshelf — seven volumes"
              className="h-full w-full border-0"
              /* No `sandbox`: the shelf is this app's own static page, and it needs
               * both scripts (WebGL) and its own origin (to fetch /shelf/vendor and
               * /covers). Granting both flags is equivalent to no sandbox, and Chrome
               * logs a warning saying so — so the attribute is left off rather than
               * kept as decoration. */
            />
          </div>
        )}

        {/* Persistent corner toggle — overlays the shelf so it never fights the
            reader or the catalog for layout space. */}
        <div className="absolute right-2 top-2 z-10 flex items-center gap-1 rounded-md border border-line bg-chrome/95 px-1 py-1 shadow-[0_4px_14px_-10px_rgb(38_35_31/0.6)] backdrop-blur">
          <button
            type="button"
            onClick={toggleSound}
            aria-pressed={soundOn}
            aria-label={
              soundOn
                ? "Turn ambient room sound off"
                : "Turn ambient room sound on (off by default)"
            }
            className="inline-flex items-center gap-1 rounded px-1.5 py-0.5 font-mono text-[10px] uppercase tracking-[0.14em] text-ink-soft transition-colors hover:text-ink"
          >
            {soundOn ? (
              <Volume2 aria-hidden="true" className="size-3.5 text-accent-ink" />
            ) : (
              <VolumeX aria-hidden="true" className="size-3.5" />
            )}
            {soundOn ? "sound on" : "sound off"}
          </button>
          {soundOn ? (
            <button
              type="button"
              onClick={cycleTrack}
              aria-label={`Room tone: ${ROOM_SOUND_TRACKS[track]}. Switch to the next`}
              title={ROOM_SOUND_TRACKS[track]}
              className="max-w-[110px] truncate rounded px-1.5 py-0.5 font-mono text-[9px] uppercase tracking-[0.1em] text-ink-faint transition-colors hover:text-ink-soft"
            >
              {ROOM_SOUND_TRACKS[track]} ▸
            </button>
          ) : null}
        </div>
      </div>
    </div>
  );
}
