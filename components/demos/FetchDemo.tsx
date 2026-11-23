"use client";

import { AnimatePresence, motion } from "framer-motion";
import { useMemo } from "react";
import { SimulationPlayer } from "@/components/player/SimulationPlayer";
import { StageLabel, ValueBox } from "@/components/viz/primitives";
import type { CodeFile } from "@/lib/sim";
import { PROGRAM, addr, simulateFetch, type Phase } from "@/sims/intro/fetch";

const PHASES: Phase[] = ["fetch", "decode", "execute"];

export function FetchDemo({ files }: { files: CodeFile[] }) {
  const steps = useMemo(() => simulateFetch(5), []);
  return (
    <SimulationPlayer title="Fetch → Decode → Execute" subtitle="What a CPU does with x = x + 2" files={files} steps={steps}>
      {(s, _step, index) => (
        <div className="grid h-full grid-cols-1 gap-2 sm:grid-cols-[minmax(0,1fr)_36px_minmax(0,1fr)] sm:items-center">
          {/* Memory */}
          <div className="glass min-w-0 overflow-hidden rounded-2xl p-2.5">
            <StageLabel>Memory</StageLabel>
            <ul className="space-y-1.5 font-mono text-[11px]">
              {PROGRAM.map((ins, i) => {
                const current = s.phase !== "halt" && i === s.pc;
                return (
                  <li key={i} className={`relative flex items-center gap-1.5 rounded-lg px-1.5 py-1.5 transition ${current ? "neu-inset" : ""}`}>
                    {current && <motion.span layoutId="fetch-pc" className="absolute -left-1 h-4 w-1.5 rounded-full bg-accent" />}
                    <span className="text-muted">{addr(i)}</span>
                    <span className={`whitespace-nowrap ${current ? "font-semibold text-ink" : "text-muted"}`}>{ins.text}</span>
                  </li>
                );
              })}
              <li className="my-2 border-t border-dashed border-[var(--line)]" aria-hidden />
              <li className="flex items-center gap-2 px-2">
                <span className="text-muted">0x1000</span>
                <motion.span
                  key={s.x}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="tint rounded-lg px-2 py-0.5 font-bold"
                  style={{ ["--c" as string]: "var(--p2)" }}
                >
                  x = {s.x}
                </motion.span>
              </li>
            </ul>
          </div>

          {/* Bus */}
          <div className="relative flex h-14 items-center justify-center sm:h-full" aria-hidden>
            <div className="h-full w-1.5 rounded-full sm:h-1.5 sm:w-full" style={{ background: "color-mix(in oklab, var(--muted) 25%, transparent)" }} />
            <AnimatePresence>
              {s.bus !== "none" && (
                <motion.div
                  key={index}
                  className="tint absolute rounded-full px-2 py-0.5 font-mono text-[10px] font-bold whitespace-nowrap"
                  style={{ ["--c" as string]: s.bus === "instr" ? "var(--p0)" : "var(--p2)" }}
                  initial={{ opacity: 0, ...(s.bus === "data-out" ? { x: 30 } : { x: -30 }) }}
                  animate={{ opacity: 1, x: s.bus === "data-out" ? -30 : 30 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.9, ease: "easeInOut" }}
                >
                  {s.bus === "instr" ? "instr" : s.bus === "data-in" ? `${s.x} →` : `← ${s.eax}`}
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* CPU */}
          <div className="panel min-w-0 rounded-3xl p-3">
            <div className="mb-2 flex items-center justify-between">
              <span className="text-xs font-black tracking-[0.2em]">CPU</span>
              <span className="text-[10px] font-semibold opacity-70">{s.cycles} instr done</span>
            </div>
            <div className="mb-3 flex gap-1">
              {PHASES.map((ph) => {
                const on = s.phase === ph;
                return (
                  <div key={ph} className="relative flex-1 rounded-lg py-1 text-center text-[10px] font-bold uppercase">
                    {on && <motion.span layoutId="fetch-phase" className="solid absolute inset-0 rounded-lg" style={{ ["--c" as string]: "var(--p3)" }} />}
                    <span className={`relative ${on ? "" : "opacity-50"}`}>{ph}</span>
                  </div>
                );
              })}
            </div>
            <div className="space-y-1.5">
              <ValueBox label="PC" value={s.phase === "halt" ? "—" : addr(s.pc)} />
              <ValueBox label="IR" value={s.ir ?? "—"} />
              <ValueBox label="Decoded" value={s.decoded ?? "—"} mono={false} />
              <ValueBox label="eax" value={s.eax ?? "—"} tone="var(--accent)" />
            </div>
          </div>
        </div>
      )}
    </SimulationPlayer>
  );
}
