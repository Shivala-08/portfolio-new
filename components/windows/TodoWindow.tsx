import { cn } from "@/lib/cn";
import { TODOS } from "@/lib/content";

/**
 * Todo window (PRD §6.4, TRD §4). Doubles as an honest "currently building"
 * status: the crossed-out items are shipped work, the open ones are the real
 * backlog — including the two Synapse questions he hasn't answered yet.
 */
export function TodoWindow() {
  const doneCount = TODOS.filter((todo) => todo.done).length;
  const openCount = TODOS.length - doneCount;

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between border-b border-line pb-1.5">
        <span className="font-mono text-[10px] uppercase tracking-[0.14em] text-ink-faint">status</span>
        <span className="font-mono text-[10.5px] text-ink-soft">
          {doneCount} done · <span className="text-accent-ink">{openCount} open</span>
        </span>
      </div>

      <ul className="space-y-1.5">
        {TODOS.map((todo) => (
          <li key={todo.text} className="flex items-start gap-2 text-[12px] leading-snug">
            <span
              aria-hidden="true"
              className={cn(
                "mt-[3px] grid size-3.5 shrink-0 place-items-center rounded-[3px] border",
                todo.done ? "border-line-strong bg-wallpaper-deep" : "border-line-strong bg-chrome",
              )}
            >
              {todo.done ? <span className="text-[9px] leading-none text-ink-faint">✓</span> : null}
            </span>
            <span className={cn(todo.done ? "text-ink-faint line-through" : "text-ink")}>
              {todo.text}
              <span className="sr-only">{todo.done ? " — done" : " — not done"}</span>
            </span>
          </li>
        ))}
      </ul>

      {/* Handwriting used sparingly, for flavour only (design doc §3). */}
      <p className="font-hand text-[15px] leading-snug text-ink-faint">
        the struck-through ones shipped. the rest is the real status, not a roadmap I&apos;m selling.
      </p>
    </div>
  );
}
