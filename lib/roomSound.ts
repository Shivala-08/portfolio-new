"use client";

/**
 * Ambient room sound (shelf-atmosphere-features-manual.md §7).
 *
 * Two synthesized voices, Web Audio API, no audio files:
 *  - page-turn: a short filtered-noise swish for book open / page turn.
 *  - room tone: a very quiet looping bed of filtered noise with a slow
 *    amplitude drift — reads as "quiet library room" at the levels used here.
 *
 * Hard rules from the manual:
 *  - The toggle DEFAULTS TO OFF. No AudioContext is ever created until the
 *    visitor explicitly turns sound on (never autoplay; browsers block it
 *    anyway, and politeness is the spec).
 *  - Everything is created lazily inside user-gesture handlers, so the
 *    context starts in "running" state — no resume races.
 *  - Failure is silent: audio is atmosphere, and any error must never break
 *    the shelf.
 */

let ctx: AudioContext | null = null;
let master: GainNode | null = null;
let roomNodes: {
  osc: OscillatorNode;
  gain: GainNode;
  lfo: OscillatorNode;
} | null = null;
/** Module-level echo of the toggle so SFX calls before "on" are no-ops. */
let soundOn = false;

function ensureContext(): AudioContext | null {
  if (typeof window === "undefined") return null;
  if (ctx) return ctx;
  try {
    const Ctor = window.AudioContext ?? (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
    if (!Ctor) return null;
    ctx = new Ctor();
    master = ctx.createGain();
    master.gain.value = 1;
    master.connect(ctx.destination);
  } catch {
    ctx = null;
    master = null;
  }
  return ctx;
}

/**
 * One short page-turn swish: pink-ish noise through a bandpass whose
 * frequency glides down, amplitude-shaped with a quick attack / soft decay.
 */
export function playPageTurn(): void {
  if (!soundOn) return;
  const context = ensureContext();
  if (!context || !master || context.state !== "running") return;
  try {
    const duration = 0.38;
    const buffer = context.createBuffer(1, Math.ceil(context.sampleRate * duration), context.sampleRate);
    const data = buffer.getChannelData(0);
    let last = 0;
    for (let i = 0; i < data.length; i += 1) {
      const white = Math.random() * 2 - 1;
      last = 0.97 * last + 0.03 * white; // one-pole low-pass → soft paper, not hiss
      data[i] = last * 3.2;
    }
    const source = context.createBufferSource();
    source.buffer = buffer;

    const filter = context.createBiquadFilter();
    filter.type = "bandpass";
    filter.Q.value = 0.8;
    const now = context.currentTime;
    filter.frequency.setValueAtTime(2400, now);
    filter.frequency.exponentialRampToValueAtTime(700, now + duration);

    const gain = context.createGain();
    gain.gain.setValueAtTime(0.0001, now);
    gain.gain.exponentialRampToValueAtTime(0.1, now + 0.05);
    gain.gain.exponentialRampToValueAtTime(0.0001, now + duration);

    source.connect(filter).connect(gain).connect(master);
    source.start(now);
    source.stop(now + duration + 0.02);
  } catch {
    // Atmosphere must never throw into the UI.
  }
}

/**
 * Start the ambient room-tone loop. Returns false if sound could not start
 * (no user gesture, unsupported browser) so the toggle can reflect reality.
 */
export function startRoomTone(track: number): boolean {
  const context = ensureContext();
  if (!context || !master) return false;
  if (context.state === "suspended") {
    // We are always called from a click handler, so this resumes immediately.
    void context.resume().catch(() => undefined);
  }
  try {
    stopRoomToneNodes();
    const now = context.currentTime;

    // Layer 1: a faint low drone (the "distant HVAC / building hum").
    const osc = context.createOscillator();
    osc.type = "triangle";
    const gain = context.createGain();
    const base = track === 1 ? 58 : track === 2 ? 92 : 74; // Hz per track
    osc.frequency.value = base;
    gain.gain.setValueAtTime(0.0001, now);
    gain.gain.linearRampToValueAtTime(0.016, now + 1.8);

    // Layer 2: a slow amplitude drift so the bed breathes instead of sitting.
    const lfo = context.createOscillator();
    lfo.frequency.value = 0.06 + track * 0.023;
    const lfoGain = context.createGain();
    lfoGain.gain.value = 0.006;
    lfo.connect(lfoGain).connect(gain.gain);
    osc.connect(gain).connect(master);

    osc.start();
    lfo.start();
    roomNodes = { osc, gain, lfo };
    soundOn = true;
    return true;
  } catch {
    soundOn = false;
    return false;
  }
}

function stopRoomToneNodes(): void {
  if (!roomNodes || !ctx) return;
  try {
    const { osc, gain, lfo } = roomNodes;
    const now = ctx.currentTime;
    gain.gain.cancelScheduledValues(now);
    gain.gain.setValueAtTime(gain.gain.value, now);
    gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.5);
    osc.stop(now + 0.55);
    lfo.stop(now + 0.55);
  } catch {
    // Already stopped or context closed.
  }
  roomNodes = null;
}

/** Stop the ambient loop and mark sound off. Never throws. */
export function stopRoomTone(): void {
  soundOn = false;
  try {
    stopRoomToneNodes();
  } catch {
    // ignore
  }
}

/** True when the engine believes sound is currently enabled. */
export function isSoundOn(): boolean {
  return soundOn;
}
