"use client";

import { useEffect, useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { useAchievementStore } from "@/lib/achievements";
import { cn } from "@/lib/cn";

/**
 * The fake Task Manager (the Ctrl+Alt+Del easter egg).
 *
 * The process list is the joke, tuned to the portfolio's real running gags
 * (the unverified 116 FPS, the self-redeploying Deploy Forge, npm, 47 tabs,
 * the 2am gremlin) rather than generic filler.
 * Values start deterministic so markup matches across renders; the CPU jitter
 * only starts after mount and never runs for reduced motion.
 *
 * Interactions, in rising order of effort-reward:
 *   - Overthinking / Perfectionism / npm / Deploy Forge can be "ended"… and
 *     respawn (each with its own excuse).
 *   - imposter_syndrome.dll is the only process that stays dead.
 *   - Discipline.sys refuses End Task: "Access Denied" (it's load-bearing).
 *   - Coffee.exe can be Resumed, which spikes the CPU and changes nothing.
 *   - 2am_gremlin.exe only Not-Responds between 2 and 5am, local time.
 */

type ProcessState = "running" | "notResponding" | "suspended" | "notFound";

type Process = {
  name: string;
  cpu: number | null;
  /** Preformatted, Task-Manager style ("47,000 K"). */
  mem: string;
  state: ProcessState;
  /** Shows an End Task button. */
  endable?: boolean;
  /** "Ended" — then immediately respawns, because of course it does. */
  respawns?: boolean;
  respawnNote?: string;
  /** Suspended + shows "Resume Task". */
  resumable?: boolean;
  /** End Task is refused: access denied. */
  critical?: boolean;
  /** Rendered as "(unverified)" next to the CPU value — metrics have context. */
  unverified?: boolean;
  /** Only Not-Responding between 2 and 5am, local time. */
  breaksAt2am?: boolean;
  /** Achievement unlocked on a successful End Task. */
  achievement?: string;
};

const PROCESSES: Process[] = [
  { name: "Overthinking.exe", cpu: 94, mem: "47,000 K", state: "running", endable: true, respawns: true, respawnNote: "restarted automatically" },
  { name: "Perfectionism.exe", cpu: 88, mem: "88,888 K", state: "running", endable: true, respawns: true, respawnNote: "one more pass. one more." },
  { name: "Chrome (47 tabs)", cpu: 31, mem: "4,700,000 K", state: "running" },
  { name: "17_Unfinished_Ideas.exe", cpu: null, mem: "0 K", state: "notResponding" },
  { name: "Actually_Shipping.exe", cpu: 6, mem: "512 K", state: "running" },
  { name: "Discipline.sys", cpu: 99, mem: "1,048,576 K", state: "running", endable: true, critical: true },
  { name: "Deploy_Forge.exe", cpu: 21, mem: "118,000 K", state: "running", endable: true, respawns: true, respawnNote: "redeployed the platform" },
  { name: "Omnitrix_116fps.exe", cpu: 116, mem: "116,000 K", state: "running", unverified: true },
  { name: "npm_install.exe", cpu: 47, mem: "66,600 K", state: "notResponding", endable: true, respawns: true, respawnNote: "installing dependencies…", achievement: "npm" },
  { name: "Skynet_renderer.exe", cpu: 8, mem: "25,000 K", state: "running" },
  { name: "2am_gremlin.exe", cpu: 4, mem: "12,047 K", state: "running", breaksAt2am: true },
  { name: "docstrange_portal.exe", cpu: 9, mem: "47,200 K", state: "running" },
  { name: "imposter_syndrome.dll", cpu: 3, mem: "6,400 K", state: "running", endable: true },
  { name: "Coffee.exe", cpu: null, mem: "0 K", state: "suspended", resumable: true },
  { name: "Sleep.exe", cpu: null, mem: "—", state: "notFound" },
];

const RESPAWN_MS = 1600;

export function TaskManagerWindow() {
  const reduceMotion = useReducedMotion();
  // Evaluated once at mount; this window is client-only (never in the default
  // server-rendered set), so a Date here is safe.
  const [twoAm] = useState(() => {
    const h = new Date().getHours();
    return h >= 2 && h < 5;
  });
  const [cpu, setCpu] = useState<Record<string, number>>(() =>
    Object.fromEntries(PROCESSES.filter((p) => p.cpu !== null).map((p) => [p.name, p.cpu!])),
  );
  const [resumed, setResumed] = useState<Set<string>>(new Set());
  const [terminated, setTerminated] = useState<Set<string>>(new Set());
  const [justRespawned, setJustRespawned] = useState<string | null>(null);
  const [denied, setDenied] = useState<string | null>(null);

  // Living values: every ~2s each running process drifts a little around its
  // base CPU. Skipped entirely for reduced motion — the numbers stay put.
  useEffect(() => {
    if (reduceMotion) return;
    const id = setInterval(() => {
      setCpu((prev) => {
        const next: Record<string, number> = { ...prev };
        for (const p of PROCESSES) {
          if (p.cpu === null) continue;
          const drift = Math.round((Math.random() - 0.45) * 7);
          next[p.name] = Math.min(130, Math.max(1, p.cpu + drift));
        }
        return next;
      });
    }, 2000);
    return () => clearInterval(id);
  }, [reduceMotion]);

  const endTask = (name: string) => {
    const proc = PROCESSES.find((p) => p.name === name);
    if (!proc) return;

    // Critical processes refuse to die. Windows rules apply.
    if (proc.critical) {
      setDenied(name);
      useAchievementStore.getState().unlock("discipline");
      setTimeout(() => setDenied(null), 1600);
      return;
    }
    if (!proc.endable) return;

    setTerminated((prev) => new Set(prev).add(name));
    if (proc.achievement) useAchievementStore.getState().unlock(proc.achievement);

    // The one that stays dead is the achievement.
    if (!proc.respawns) {
      if (proc.name === "imposter_syndrome.dll") {
        useAchievementStore.getState().unlock("end-imposter");
      }
      return;
    }
    setTimeout(() => {
      setTerminated((prev) => {
        const next = new Set(prev);
        next.delete(name);
        return next;
      });
      setJustRespawned(name);
      setTimeout(() => setJustRespawned(null), 1800);
    }, RESPAWN_MS);
  };

  const resumeTask = (name: string) => {
    setResumed((prev) => new Set(prev).add(name));
    setCpu((prev) => ({ ...prev, [name]: 73 }));
    useAchievementStore.getState().unlock("coffee");
  };

  const effectiveState = (p: Process): ProcessState => {
    if (resumed.has(p.name)) return "running";
    if (p.breaksAt2am && twoAm) return "notResponding";
    return p.state;
  };

  const alive = PROCESSES.filter((p) => !terminated.has(p.name));
  const running = alive.filter((p) => effectiveState(p) === "running");
  const totalCpu = running.reduce((sum, p) => sum + (cpu[p.name] ?? p.cpu ?? 0), 0);

  return (
    <div className="flex h-full flex-col text-[12px]">
      <div className="scroll-thin min-h-0 flex-1 overflow-auto rounded-md border border-line bg-chrome">
        <table className="w-full border-collapse font-mono text-[11px]">
          <thead>
            <tr className="border-b border-line bg-chrome-muted text-left text-ink-faint">
              <th scope="col" className="px-2.5 py-1.5 font-normal">Image Name</th>
              <th scope="col" className="px-2 py-1.5 text-right font-normal">CPU</th>
              <th scope="col" className="px-2 py-1.5 text-right font-normal">Mem Usage</th>
              <th scope="col" className="px-2 py-1.5 font-normal">Status</th>
              <th scope="col" className="px-2 py-1.5 font-normal sr-only">Actions</th>
            </tr>
          </thead>
          <tbody>
            {PROCESSES.map((p) => {
              const isTerminated = terminated.has(p.name);
              const state = effectiveState(p);
              const value = cpu[p.name] ?? p.cpu;
              const actionable = !isTerminated && (p.critical || p.endable || p.resumable);
              return (
                <tr
                  key={p.name}
                  className={cn(
                    "border-b border-line/60 last:border-b-0",
                    isTerminated && "opacity-40",
                  )}
                >
                  <td className="px-2.5 py-1.5 text-ink">
                    <span className={cn(isTerminated && "line-through")}>{p.name}</span>
                    {p.unverified ? (
                      <span
                        className="ml-2 cursor-help text-[9px] text-ink-faint"
                        title="A number without its measurement context is not a claim (identity.txt §38)."
                      >
                        (unverified)
                      </span>
                    ) : null}
                    <AnimatePresence>
                      {justRespawned === p.name ? (
                        <motion.span
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          exit={{ opacity: 0 }}
                          className="ml-2 text-[9.5px] text-accent-ink"
                        >
                          {PROCESSES.find((x) => x.name === justRespawned)?.respawnNote ??
                            "restarted automatically"}
                        </motion.span>
                      ) : null}
                    </AnimatePresence>
                  </td>
                  <td
                    className={cn(
                      "px-2 py-1.5 text-right tabular-nums",
                      value !== null && value >= 70 ? "text-accent-ink" : "text-ink-soft",
                    )}
                  >
                    {isTerminated ? "—" : value === null ? "" : `${value}%`}
                  </td>
                  <td className="px-2 py-1.5 text-right tabular-nums text-ink-soft">
                    {isTerminated ? "—" : p.mem}
                  </td>
                  <td className="px-2 py-1.5">
                    <span className={cn(stateClass(state), isTerminated && "text-ink-faint")}>
                      {denied === p.name ? (
                        <span className="text-accent-ink">Access Denied</span>
                      ) : isTerminated ? (
                        "terminated"
                      ) : (
                        stateLabel(state)
                      )}
                    </span>
                  </td>
                  <td className="px-2 py-1.5 text-right">
                    {actionable ? (
                      state === "suspended" && p.resumable ? (
                        <button
                          type="button"
                          onClick={() => resumeTask(p.name)}
                          className="rounded border border-line px-1.5 py-0.5 text-[9.5px] text-ink-soft transition-colors hover:border-accent hover:bg-accent-soft hover:text-accent-ink"
                        >
                          Resume Task
                        </button>
                      ) : (
                        <button
                          type="button"
                          onClick={() => endTask(p.name)}
                          className="rounded border border-line px-1.5 py-0.5 text-[9.5px] text-ink-soft transition-colors hover:border-accent hover:bg-accent-soft hover:text-accent-ink"
                        >
                          End Task
                        </button>
                      )
                    ) : null}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      <div className="mt-2 flex items-center justify-between border-t border-line pt-1.5 font-mono text-[10px] text-ink-faint">
        <span>
          Processes: {alive.length} · CPU Usage: {totalCpu}% (all cores, probably)
        </span>
        <span className="hidden sm:inline">commit charge: it&apos;s fine</span>
      </div>

      <p className="mt-1.5 font-hand text-[14px] leading-snug text-ink-faint">
        Discipline.sys is load-bearing. Coffee.exe is not — but resume it anyway.
      </p>
    </div>
  );
}

function stateLabel(state: ProcessState): string {
  switch (state) {
    case "running":
      return "Running";
    case "notResponding":
      return "Not Responding";
    case "suspended":
      return "Suspended";
    case "notFound":
      return "Not Found";
  }
}

function stateClass(state: ProcessState): string {
  switch (state) {
    case "running":
      return "text-ink-soft";
    case "notResponding":
      return "text-accent-ink";
    case "suspended":
      return "text-ink-faint italic";
    case "notFound":
      return "text-ink-faint italic";
  }
}
