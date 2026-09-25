"use client";

import { useEffect, useState } from "react";
import {
  LiveblocksProvider,
  RoomProvider,
  useOthers,
  useUpdateMyPresence,
} from "@liveblocks/react";
import { useReducedMotion } from "framer-motion";
import { GhostCursor } from "@/components/desktop/GhostCursor";

/**
 * Multiplayer ghost cursors (the "technical flex" tier).
 *
 * Key-gated: without NEXT_PUBLIC_LIVEBLOCKS_KEY this renders null and the site
 * is unchanged — it activates the moment a key exists in the env. Everyone in
 * the one room ("portfolio") sees everyone else's cursor with a name tag:
 * visitor_47, visitor_48 … from a stable per-browser number in localStorage so
 * the tag doesn't reshuffle between visits. Updates are throttled to ~30fps
 * and published straight to Liveblocks presence — no re-renders on mousemove.
 */

const STORAGE_KEY = "portfolio.visitor-number";

type CursorPresence = { cursor: { x: number; y: number } | null; name: string };

function getVisitorNumber(): number {
  try {
    const cached = parseInt(localStorage.getItem(STORAGE_KEY) ?? "", 10);
    if (Number.isFinite(cached) && cached > 0) return cached;
    const next = 47 + Math.floor(Math.random() * 400);
    localStorage.setItem(STORAGE_KEY, String(next));
    return next;
  } catch {
    return 47;
  }
}

/** Publishes the local pointer to presence; renders nothing. */
function PublishCursor() {
  const updateMyPresence = useUpdateMyPresence();

  useEffect(() => {
    let last = 0;
    const onMove = (e: PointerEvent) => {
      const now = performance.now();
      if (now - last < 33) return; // ~30fps cap
      last = now;
      updateMyPresence({ cursor: { x: e.clientX, y: e.clientY } });
    };
    const onLeave = () => updateMyPresence({ cursor: null });
    document.addEventListener("pointermove", onMove);
    document.documentElement.addEventListener("mouseleave", onLeave);
    return () => {
      document.removeEventListener("pointermove", onMove);
      document.documentElement.removeEventListener("mouseleave", onLeave);
    };
  }, [updateMyPresence]);

  return null;
}

/** Renders everyone else's cursor. */
function RemoteCursors() {
  const others = useOthers();
  const reduceMotion = useReducedMotion();

  return (
    <>
      {others.map((other) => {
        const presence = other.presence as CursorPresence;
        if (!presence?.cursor) return null;
        return (
          <GhostCursor
            key={other.connectionId}
            x={presence.cursor.x}
            y={presence.cursor.y}
            name={presence.name ?? "visitor"}
            reduceMotion={reduceMotion}
          />
        );
      })}
    </>
  );
}

export function MultiplayerCursors() {
  const publicKey = process.env.NEXT_PUBLIC_LIVEBLOCKS_KEY;
  const [visitorNumber, setVisitorNumber] = useState<number | null>(null);

  useEffect(() => {
    if (!publicKey) return;
    setVisitorNumber(getVisitorNumber());
  }, [publicKey]);

  // Early return only after all hooks; nothing renders during SSR either.
  if (!publicKey || visitorNumber === null) return null;

  return (
    <LiveblocksProvider publicApiKey={publicKey}>
      <RoomProvider
        id="portfolio"
        initialPresence={{ cursor: null, name: `visitor_${visitorNumber}` } as CursorPresence}
      >
        <PublishCursor />
        <RemoteCursors />
      </RoomProvider>
    </LiveblocksProvider>
  );
}
