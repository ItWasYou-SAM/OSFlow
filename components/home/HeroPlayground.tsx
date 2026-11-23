"use client";

import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { Minus, Pause, Play, Plus } from "lucide-react";
import { useEffect, useState } from "react";
import { ProcBlob } from "@/components/viz/primitives";

const LETTERS = "ABCDEF";
const SLICE_MS = 1800;
const EASE = [0.22, 1, 0.36, 1] as const;

/**
 * A tiny, hands-on scheduler: one CPU, up to six processes. A timer
 * interrupt rotates them round-robin; clicking a process schedules it now.
 */
export function HeroPlayground() {
  const reduce = useReducedMotion();
  const [n, setN] = useState(4);
  const [run, setRun] = useState(0);
  const [auto, setAuto] = useState(true);
  const [switches, setSwitches] = useState(0);
  const [log, setLog] = useState("timer running: round robin");

  useEffect(() => {
    if (reduce) setAuto(false);
  }, [reduce]);

  // The "timer interrupt".
  useEffect(() => {
    if (!auto) return;
    const t = setTimeout(() => {
      const next = (run + 1) % n;
      setRun(next);
      setSwitches((s) => s + 1);
      setLog(`timer interrupt → switch to ${LETTERS[next]}`);
    }, SLICE_MS);
    return () => clearTimeout(t);
  }, [auto, run, n, switches]);

  const schedule = (i: number) => {
    if (i === run) return;
    setRun(i);
    setSwitches((s) => s + 1);
    setLog(`you scheduled ${LETTERS[i]}`);
  };
  const add = () => {
    if (n >= LETTERS.length) return;
    setLog(`fork() → process ${LETTERS[n]} created`);
    setN(n + 1);
  };
  const remove = () => {
    if (n <= 1) return;
    setLog(`process ${LETTERS[n - 1]} exited`);
    if (run >= n - 1) setRun(0);
    setN(n - 1);
  };

  const R = 2 * Math.PI * 86;

  return (
    <div className="mx-auto w-full max-w-[440px]">
      <div className="relative aspect-square w-full">
        <div className="absolute inset-[6%] rounded-full border border-dashed border-[var(--line-strong)]" aria-hidden />
        <div className="absolute inset-[24%] rounded-full" style={{ background: "radial-gradient(circle, color-mix(in oklab, var(--accent) 16%, transparent), transparent 70%)" }} aria-hidden />

        {/* CPU with time-slice ring */}
        <div className="absolute left-1/2 top-1/2 z-10 -translate-x-1/2 -translate-y-1/2">
          <svg width="196" height="196" viewBox="0 0 196 196" className="absolute -left-[26px] -top-[26px]" aria-hidden>
            <circle cx="98" cy="98" r="86" fill="none" stroke="var(--line)" strokeWidth="3" />
            {auto ? (
              <motion.circle
                key={`${run}-${switches}`}
                cx="98"
                cy="98"
                r="86"
                fill="none"
                stroke="var(--accent)"
                strokeWidth="3"
                strokeLinecap="round"
                strokeDasharray={R}
                initial={{ strokeDashoffset: 0 }}
                animate={{ strokeDashoffset: R }}
                transition={{ duration: SLICE_MS / 1000, ease: "linear" }}
                transform="rotate(-90 98 98)"
              />
            ) : null}
          </svg>
          <div className="panel relative h-36 w-36 rounded-[36px]">
            <span className="absolute inset-x-0 top-3 text-center text-[10px] font-black tracking-[0.3em] text-muted">CPU</span>
            <span className="absolute inset-x-0 bottom-3 text-center font-mono text-[10px] text-muted">{auto ? "time slice" : "timer paused"}</span>
          </div>
        </div>

        {/* processes */}
        {Array.from({ length: n }, (_, i) => {
          const on = i === run;
          const angle = (i / n) * Math.PI * 2 - Math.PI / 2;
          return (
            <motion.button
              key={LETTERS[i]}
              type="button"
              onClick={() => schedule(i)}
              aria-label={on ? `Process ${LETTERS[i]} is running` : `Schedule process ${LETTERS[i]}`}
              aria-pressed={on}
              className="focus-ring absolute -translate-x-1/2 -translate-y-1/2 rounded-[40%]"
              style={{ zIndex: on ? 20 : 5 }}
              initial={{ opacity: 0, left: "50%", top: "50%" }}
              animate={{
                opacity: 1,
                left: on ? "50%" : `${50 + Math.cos(angle) * 44}%`,
                top: on ? "51%" : `${50 + Math.sin(angle) * 44}%`,
                scale: on ? 1.08 : 0.9,
              }}
              exit={{ opacity: 0 }}
              whileHover={on ? undefined : { scale: 0.98 }}
              transition={{ duration: 0.6, ease: [0.65, 0, 0.35, 1] }}
            >
              <ProcBlob color={i % 4} label={LETTERS[i]} size={54} active={on} />
            </motion.button>
          );
        })}
      </div>

      {/* controls */}
      <div className="glass mt-2 flex flex-wrap items-center gap-2 rounded-2xl p-2">
        <button type="button" onClick={() => setAuto((a) => !a)} className="neu focus-ring flex h-9 items-center gap-1.5 rounded-xl px-3 text-xs font-semibold text-ink" aria-label={auto ? "Pause the timer" : "Start the timer"}>
          {auto ? <Pause size={14} /> : <Play size={14} />} {auto ? "Timer on" : "Timer off"}
        </button>
        <button type="button" onClick={add} disabled={n >= LETTERS.length} className="neu focus-ring grid h-9 w-9 place-items-center rounded-xl text-ink disabled:opacity-40" aria-label="Add a process">
          <Plus size={15} />
        </button>
        <button type="button" onClick={remove} disabled={n <= 1} className="neu focus-ring grid h-9 w-9 place-items-center rounded-xl text-ink disabled:opacity-40" aria-label="Remove a process">
          <Minus size={15} />
        </button>
        <span className="ml-auto pr-2 font-mono text-[11px] text-muted">
          switches <span className="text-ink">{switches}</span>
        </span>
      </div>
      <div className="mt-2 flex h-6 items-center justify-center font-mono text-xs text-muted" aria-live="polite">
        <span className="mr-2 text-accent">$</span>
        <AnimatePresence mode="wait" initial={false}>
          <motion.span key={log + switches + n} initial={{ opacity: 0, y: 4 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} transition={{ duration: 0.2, ease: EASE }}>
            {log}
          </motion.span>
        </AnimatePresence>
      </div>
    </div>
  );
}
