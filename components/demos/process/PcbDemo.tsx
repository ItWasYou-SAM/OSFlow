"use client";

import { AnimatePresence, motion } from "framer-motion";
import { ArrowDown, ArrowUp } from "lucide-react";
import { useMemo, type ReactNode } from "react";
import { SimulationPlayer } from "@/components/player/SimulationPlayer";
import { StateBadge } from "@/components/viz/ProcessViz";
import { StageLabel, ValueBox, procColor } from "@/components/viz/primitives";
import type { CodeFile } from "@/lib/sim";
import { simulatePcb, type Field, type Pcb, type PcbState } from "@/sims/process/pcb";

const REGS = ["eip", "esp", "ebx", "ebp"] as const;

export function PcbDemo({ files }: { files: CodeFile[] }) {
  const steps = useMemo(() => simulatePcb(), []);
  return (
    <SimulationPlayer title="The process list" subtitle="xv6's struct proc, and a context switch through it" files={files} steps={steps}>
      {(s) => {
        const owner = s.procs.find((p) => p.pid === s.owner);
        return (
          <div className="flex h-full flex-col gap-2.5">
            {/* CPU registers */}
            <div className="panel rounded-2xl p-2.5" style={s.transfer ? { borderColor: "var(--accent)" } : undefined}>
              <div className="mb-1.5 flex items-center justify-between">
                <StageLabel>CPU registers</StageLabel>
                <span className="text-[11px] text-muted">
                  holding: <span className="font-semibold text-ink">{owner ? `${owner.name} (pid ${owner.pid})` : "—"}</span>
                </span>
              </div>
              <div className="grid grid-cols-2 gap-1.5">
                {REGS.map((r) => (
                  <ValueBox key={r} label={r} value={s.cpu[r]} />
                ))}
              </div>
            </div>

            <div className="flex h-4 items-center justify-center">
              <AnimatePresence mode="popLayout" initial={false}>
                {s.transfer && (
                  <motion.span
                    key={s.transfer}
                    initial={{ opacity: 0, y: s.transfer === "save" ? -4 : 4 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.3 }}
                    className="tint flex items-center gap-1 rounded-full px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider"
                  >
                    {s.transfer === "save" ? <ArrowDown size={12} /> : <ArrowUp size={12} />}
                    {s.transfer === "save" ? "save registers → PCB" : "restore PCB → registers"}
                  </motion.span>
                )}
              </AnimatePresence>
            </div>

            {/* Process list */}
            <div className="grid flex-1 grid-cols-1 gap-2 sm:grid-cols-3">
              {s.procs.map((p) => (
                <PcbCard key={p.pid} p={p} s={s} />
              ))}
            </div>
          </div>
        );
      }}
    </SimulationPlayer>
  );
}

function PcbCard({ p, s }: { p: Pcb; s: PcbState }) {
  const hit = (f: Field) => (s.focus.field === "all" && (s.focus.pid === null || s.focus.pid === p.pid)) || (s.focus.field === f && (s.focus.pid === null || s.focus.pid === p.pid));
  const unused = p.state === "UNUSED";
  return (
    <div
      className="glass flex flex-col gap-0.5 rounded-2xl p-2.5 transition-opacity duration-300"
      style={{ opacity: unused ? 0.5 : 1, outline: p.state === "RUNNING" ? `2px solid ${procColor(p.color)}` : "2px solid transparent", outlineOffset: -1 }}
    >
      <div className="mb-1 flex items-center justify-between">
        <span className="clay grid h-6 min-w-6 place-items-center rounded-md px-1 text-[11px] font-black" style={{ ["--c" as string]: procColor(p.color) }}>
          {p.name}
        </span>
        <StateBadge state={p.state} />
      </div>
      <Row on={hit("pid")} k="pid" v={p.pid} />
      <Row on={hit("state")} k="state" v={p.state} />
      <Row on={hit("parent")} k="parent" v={p.parent ?? "—"} />
      <Row on={hit("mem")} k="mem" v={unused ? "—" : p.mem} />
      <Row on={hit("ofile")} k="ofile" v={unused ? "—" : `[${p.ofile}]`} />
      <Row on={hit("chan")} k="chan" v={p.chan ?? "0"} />
      <div className="mt-1 rounded-lg p-1.5 transition-colors duration-300" style={{ background: hit("context") ? "var(--code-hl)" : "var(--well)" }}>
        <div className="mb-0.5 text-[9px] font-bold uppercase tracking-widest text-muted">context</div>
        <div className="grid grid-cols-1 font-mono text-[10px] leading-4">
          {REGS.map((r) => (
            <div key={r} className="flex justify-between">
              <span className="text-muted">{r}</span>
              <motion.span key={p.context[r]} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.3 }} className="text-ink">
                {p.context[r]}
              </motion.span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function Row({ k, v, on }: { k: string; v: ReactNode; on: boolean }) {
  return (
    <div className="flex items-center justify-between rounded px-1 font-mono text-[10.5px] leading-[18px] transition-colors duration-300" style={on ? { background: "var(--code-hl)" } : undefined}>
      <span className="text-muted">{k}</span>
      <span className={on ? "font-bold text-ink" : "text-ink"}>{v}</span>
    </div>
  );
}
