"use client";

import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { ArrowRight } from "lucide-react";
import Link from "next/link";
import { useEffect, useState, type ReactNode } from "react";
import { STAGES, topicStatus } from "@/content/roadmap";

const EASE = [0.22, 1, 0.36, 1] as const;

/** A shared clock for the mini animations (paused for reduced motion). */
function useTick(ms: number, mod: number) {
  const reduce = useReducedMotion();
  const [t, setT] = useState(0);
  useEffect(() => {
    if (reduce) return;
    const id = setInterval(() => setT((x) => (x + 1) % mod), ms);
    return () => clearInterval(id);
  }, [ms, mod, reduce]);
  return reduce ? mod - 1 : t;
}

const PIECES = [
  {
    id: "virtualization",
    title: "Virtualization",
    color: "var(--p1)",
    stages: ["cpu", "memory"],
    lead: "One CPU becomes many. One memory becomes a private space per program.",
    body: "The OS time-shares the processor so every process seems to have its own, and translates addresses so every process seems to have its own memory. Mechanisms do the switching; policies decide who goes next.",
    Mini: VirtMini,
  },
  {
    id: "concurrency",
    title: "Concurrency",
    color: "var(--p2)",
    stages: ["concurrency"],
    lead: "Many threads, one shared memory, and the bugs that hide in between.",
    body: "When threads share data, timing matters: an interrupt between a load and a store can lose an update. Locks, condition variables and semaphores restore order.",
    Mini: ConcMini,
  },
  {
    id: "persistence",
    title: "Persistence",
    color: "var(--p3)",
    stages: ["persistence"],
    lead: "Getting bytes onto a disk, and keeping them there through a crash.",
    body: "File systems turn raw blocks into files and directories. For speed they buffer writes in memory, so surviving a power cut takes care: fsync, journaling, careful ordering.",
    Mini: PersMini,
  },
] as const;

export function PiecesTabs() {
  const [sel, setSel] = useState(0);
  const p = PIECES[sel];
  const topics = STAGES.filter((s) => (p.stages as readonly string[]).includes(s.id)).flatMap((s) => [...s.left, ...s.right]).filter((t) => t.kind === "core");

  return (
    <div>
      <div role="tablist" aria-label="The three easy pieces" className="glass mx-auto flex w-fit gap-1 rounded-2xl p-1">
        {PIECES.map((x, i) => {
          const on = i === sel;
          return (
            <button
              key={x.id}
              type="button"
              role="tab"
              aria-selected={on}
              aria-controls={`piece-${x.id}`}
              onClick={() => setSel(i)}
              className={`focus-ring relative rounded-xl px-3 py-2 text-sm font-semibold transition-colors sm:px-5 ${on ? "text-[var(--clay-ink)]" : "text-muted hover:text-ink"}`}
            >
              {on && <motion.span layoutId="piece-pill" className="solid absolute inset-0 rounded-xl" style={{ ["--c" as string]: x.color }} transition={{ duration: 0.3, ease: EASE }} />}
              <span className="relative">{x.title}</span>
            </button>
          );
        })}
      </div>

      <AnimatePresence mode="wait" initial={false}>
        <motion.div
          key={p.id}
          id={`piece-${p.id}`}
          role="tabpanel"
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -8 }}
          transition={{ duration: 0.3, ease: EASE }}
          className="mt-6 grid gap-4 lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)]"
        >
          <div className="glass grid min-h-[260px] place-items-center rounded-3xl p-6">
            <p.Mini />
          </div>
          <div className="glass flex flex-col rounded-3xl p-6">
            <h3 className="text-2xl font-bold text-ink">{p.lead}</h3>
            <p className="mt-3 leading-relaxed text-muted">{p.body}</p>
            <p className="mt-5 text-[10px] font-bold uppercase tracking-[0.18em] text-muted">Topics in this piece</p>
            <div className="mt-2 flex flex-wrap gap-1.5">
              {topics.map((t) => {
                const st = topicStatus(t.id);
                return (
                  <Link
                    key={t.id}
                    href={st === "ready" ? `/learn/${t.id}/` : `/roadmap/#${t.id}`}
                    className={`focus-ring rounded-lg px-2.5 py-1 text-xs ${st === "ready" ? "solid font-semibold" : "neu text-muted hover:text-ink"}`}
                    style={st === "ready" ? { ["--c" as string]: p.color } : undefined}
                  >
                    {t.title}
                  </Link>
                );
              })}
            </div>
            <Link href="/roadmap/" className="focus-ring mt-auto inline-flex items-center gap-1.5 pt-5 text-sm font-semibold text-accent">
              See it on the roadmap <ArrowRight size={14} />
            </Link>
          </div>
        </motion.div>
      </AnimatePresence>
    </div>
  );
}

/* ───────────── mini animations (discrete steps, no looping motion) ───────────── */

function Caption({ children }: { children: ReactNode }) {
  return <p className="mt-4 text-center font-mono text-[11px] text-muted">{children}</p>;
}

function VirtMini() {
  const COLS = 12;
  const t = useTick(450, COLS + 4);
  const filled = Math.min(t, COLS);
  return (
    <div className="w-full max-w-sm">
      {["A", "B", "C"].map((name, row) => (
        <div key={name} className="mb-2 flex items-center gap-2">
          <span className="w-4 font-mono text-xs font-bold text-ink">{name}</span>
          <div className="grid flex-1 gap-1" style={{ gridTemplateColumns: `repeat(${COLS}, minmax(0, 1fr))` }}>
            {Array.from({ length: COLS }, (_, c) => {
              const mine = c % 3 === row && c < filled;
              return (
                <span
                  key={c}
                  className="h-6 rounded-md border border-[var(--line)] transition-[background-color,opacity] duration-300"
                  style={{ background: mine ? `var(--p${row})` : "var(--well)", opacity: mine ? 1 : 0.8, outline: c === filled - 1 && mine ? "2px solid var(--ink)" : "none", outlineOffset: -2 }}
                />
              );
            })}
          </div>
        </div>
      ))}
      <Caption>one CPU · time slices handed out round-robin →</Caption>
    </div>
  );
}

function ConcMini() {
  const t = useTick(650, 12);
  const STEPS = ["load", "add", "store"] as const;
  const thread = Math.floor(t / 3) % 2; // T1 does 3 steps, then T2
  const op = STEPS[t % 3];
  const counter = Math.floor((t + 1) / 3);
  return (
    <div className="w-full max-w-sm">
      <div className="flex items-center justify-center">
        <div className="panel flex items-baseline gap-3 rounded-2xl px-6 py-3">
          <span className="font-mono text-xs text-muted">counter</span>
          <motion.span key={counter} initial={{ opacity: 0, y: -6 }} animate={{ opacity: 1, y: 0 }} className="font-mono text-3xl font-black text-ink">
            {counter}
          </motion.span>
        </div>
      </div>
      <div className="mt-4 grid grid-cols-2 gap-3">
        {["T1", "T2"].map((name, i) => {
          const on = i === thread;
          return (
            <div key={name} className="glass rounded-2xl p-3 transition-opacity duration-300" style={{ opacity: on ? 1 : 0.5, outline: on ? `2px solid var(--p${i})` : "none", outlineOffset: -1 }}>
              <div className="mb-2 font-mono text-xs font-black text-ink">{name}</div>
              <div className="flex gap-1">
                {STEPS.map((s) => (
                  <span key={s} className={`flex-1 rounded-md py-1 text-center font-mono text-[10px] font-bold transition-colors duration-300 ${on && s === op ? "solid" : "neu-inset text-muted"}`} style={{ ["--c" as string]: `var(--p${i})` }}>
                    {s}
                  </span>
                ))}
              </div>
            </div>
          );
        })}
      </div>
      <Caption>counter++ is three steps: interrupt in between and updates get lost</Caption>
    </div>
  );
}

function PersMini() {
  const t = useTick(700, 8);
  const ram = t < 4 ? t + 1 : t === 4 ? 4 : 0;
  const synced = t >= 5;
  return (
    <div className="w-full max-w-sm">
      {[
        { label: "page cache (RAM)", count: ram, on: !synced, color: "var(--p1)" },
        { label: "disk", count: synced ? 4 : 0, on: synced, color: "var(--p2)" },
      ].map((row) => (
        <div key={row.label} className="mb-3">
          <div className="mb-1 text-[10px] font-bold uppercase tracking-widest text-muted">{row.label}</div>
          <div className="grid grid-cols-4 gap-1.5">
            {Array.from({ length: 4 }, (_, i) => (
              <span key={i} className="h-8 rounded-lg border border-[var(--line)] transition-[background-color] duration-300" style={{ background: i < row.count ? row.color : "var(--well)" }} />
            ))}
          </div>
        </div>
      ))}
      <div className="flex h-7 items-center justify-center">
        <AnimatePresence mode="wait" initial={false}>
          <motion.span key={t === 4 ? "fsync" : t < 4 ? "write" : "safe"} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="tint rounded-full px-3 py-0.5 font-mono text-[11px] font-bold">
            {t < 4 ? "write() → buffered in memory" : t === 4 ? "fsync() → flushing to disk" : "durable ✓ survives a crash"}
          </motion.span>
        </AnimatePresence>
      </div>
    </div>
  );
}
