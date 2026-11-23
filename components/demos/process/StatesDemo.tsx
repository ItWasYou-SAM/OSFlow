"use client";

import { AnimatePresence, motion } from "framer-motion";
import { useEffect, useMemo, useRef, useState } from "react";
import { SimulationPlayer } from "@/components/player/SimulationPlayer";
import { ProcBlob, StageLabel, Switch } from "@/components/viz/primitives";
import type { CodeFile } from "@/lib/sim";
import { simulateStates, type PState, type Transition } from "@/sims/process/states";

const NODES: { id: PState; title: string; hint: string }[] = [
  { id: "ready", title: "Ready", hint: "could run, waiting for the CPU" },
  { id: "running", title: "Running", hint: "on the CPU now" },
  { id: "blocked", title: "Blocked", hint: "waiting for I/O" },
];

const EDGES: { id: Exclude<Transition, null | "finish">; from: string; to: string; label: string }[] = [
  { id: "scheduled", from: "Ready", to: "Running", label: "scheduled" },
  { id: "descheduled", from: "Running", to: "Ready", label: "descheduled" },
  { id: "io-start", from: "Running", to: "Blocked", label: "I/O: initiate" },
  { id: "io-done", from: "Blocked", to: "Ready", label: "I/O: done" },
];

export function StatesDemo({ files }: { files: CodeFile[] }) {
  const [io, setIo] = useState(true);
  const [overlap, setOverlap] = useState(true);
  const steps = useMemo(() => simulateStates({ io, overlap }), [io, overlap]);

  return (
    <SimulationPlayer
      title="Process states"
      subtitle="Two processes, one CPU, one disk"
      files={files}
      steps={steps}
      controls={
        <>
          <Switch label="P0 reads from disk" checked={io} onChange={setIo} />
          {io && <Switch label="Switch on I/O" checked={overlap} onChange={setOverlap} />}
        </>
      }
    >
      {(s) => (
        <div className="flex h-full flex-col gap-3">
          {/* State nodes */}
          <div className="grid grid-cols-3 gap-2">
            {NODES.map((n) => {
              const here = s.procs.filter((p) => p.state === n.id);
              return (
                <div key={n.id} className={`flex flex-col rounded-2xl p-2 ${n.id === "running" ? "panel" : "glass"}`}>
                  <div className="text-xs font-bold text-ink">{n.title}</div>
                  <div className="hidden text-[10px] leading-tight text-muted sm:block">{n.hint}</div>
                  <div className="mt-1 flex min-h-[58px] flex-wrap items-center justify-center gap-1">
                    <AnimatePresence mode="popLayout" initial={false}>
                      {here.map((p) => (
                        <motion.div key={p.name} initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -6 }} transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}>
                          <ProcBlob color={p.color} label={p.name} size={36} progress={p.state === "blocked" ? 1 - p.ioLeft / 3 : undefined} active={p.state === "running"} />
                        </motion.div>
                      ))}
                    </AnimatePresence>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Transitions */}
          <div className="flex flex-wrap gap-1.5">
            {EDGES.map((e) => {
              const on = s.transitions.includes(e.id);
              return (
                <span
                  key={e.id}
                  className={`rounded-lg px-2 py-1 font-mono text-[10px] transition-colors duration-300 ${on ? "solid font-bold" : "neu-inset text-muted"}`}
                >
                  {e.from} → {e.to}: {e.label}
                </span>
              );
            })}
            <span className="ml-auto text-[11px] text-muted">
              done:{" "}
              <span className="font-mono text-ink">
                {s.procs
                  .filter((p) => p.state === "done")
                  .map((p) => p.name)
                  .join(", ") || "—"}
              </span>
            </span>
          </div>

          {/* Trace table + utilization */}
          <TraceTable rows={s.rows} names={s.procs.map((p) => p.name)} />
          <div className="flex items-center gap-3 text-[11px] text-muted">
            <span className="shrink-0">CPU busy</span>
            <div className="neu-inset h-2 flex-1 overflow-hidden rounded-full">
              <motion.div className="h-full rounded-full bg-accent" animate={{ width: s.t ? `${(s.busy / s.t) * 100}%` : "0%" }} transition={{ duration: 0.3 }} />
            </div>
            <span className="w-24 shrink-0 text-right font-mono text-ink">
              {s.busy}/{s.t} ticks
            </span>
          </div>
        </div>
      )}
    </SimulationPlayer>
  );
}

function TraceTable({ rows, names }: { rows: { t: number; states: PState[]; note: string }[]; names: string[] }) {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    ref.current?.scrollTo({ top: ref.current.scrollHeight, behavior: "smooth" });
  }, [rows.length]);
  return (
    <div ref={ref} className="neu-inset scroll-thin min-h-[96px] flex-1 overflow-y-auto rounded-2xl">
      <table className="w-full text-left font-mono text-[11px]">
        <thead className="sticky top-0 text-[10px] uppercase tracking-wider text-muted" style={{ background: "var(--well)" }}>
          <tr>
            <th className="px-2 py-1.5 font-semibold">Time</th>
            {names.map((n) => (
              <th key={n} className="px-2 py-1.5 font-semibold">
                {n}
              </th>
            ))}
            <th className="px-2 py-1.5 font-semibold">Notes</th>
          </tr>
        </thead>
        <tbody>
          {rows.length === 0 && (
            <tr>
              <td colSpan={names.length + 2} className="px-2 py-3 text-center text-muted">
                press play
              </td>
            </tr>
          )}
          {rows.map((r, i) => (
            <tr key={r.t} className="border-t border-[var(--line)]" style={i === rows.length - 1 ? { background: "var(--code-hl)" } : undefined}>
              <td className="px-2 py-1 text-muted">{r.t}</td>
              {r.states.map((st, k) => (
                <td key={k} className={`px-2 py-1 ${st === "running" ? "font-bold text-ink" : "text-muted"}`}>
                  {st === "done" ? "–" : st}
                </td>
              ))}
              <td className="px-2 py-1 text-muted">{r.note}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
