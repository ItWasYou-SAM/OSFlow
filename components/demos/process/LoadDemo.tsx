"use client";

import { AnimatePresence, motion } from "framer-motion";
import { HardDrive } from "lucide-react";
import { useMemo, type ReactNode } from "react";
import { SimulationPlayer } from "@/components/player/SimulationPlayer";
import { StateBadge } from "@/components/viz/ProcessViz";
import { StageLabel, Terminal, ValueBox } from "@/components/viz/primitives";
import type { CodeFile } from "@/lib/sim";
import { simulateLoad, type LoadState } from "@/sims/process/load";

export function LoadDemo({ files }: { files: CodeFile[] }) {
  const steps = useMemo(() => simulateLoad(), []);
  return (
    <SimulationPlayer title="From program to process" subtitle="What the OS does before main() runs" files={files} steps={steps}>
      {(s) => (
        <div className="flex h-full flex-col gap-3">
          <div className="grid flex-1 grid-cols-1 gap-3 sm:grid-cols-[minmax(0,0.9fr)_minmax(0,1.1fr)]">
            {/* Left: disk + process info */}
            <div className="flex flex-col gap-3">
              <Box on={s.focus === "disk"}>
                <StageLabel>Disk</StageLabel>
                <div className="flex items-center gap-2">
                  <HardDrive size={16} className="shrink-0 text-muted" />
                  <span className="font-mono text-xs font-bold text-ink">hello</span>
                  <span className="text-[10px] text-muted">executable (ELF)</span>
                </div>
                <div className="mt-2 grid grid-cols-2 gap-1.5 text-center font-mono text-[10px]">
                  <span className="tint rounded-md py-1" style={{ ["--c" as string]: "var(--p0)" }}>code</span>
                  <span className="tint rounded-md py-1" style={{ ["--c" as string]: "var(--p2)" }}>data</span>
                </div>
              </Box>

              <Box on={s.focus === "regs" || s.focus === "fds"}>
                <div className="mb-2 flex items-center justify-between">
                  <StageLabel>Process {s.pid ?? "—"}</StageLabel>
                  <StateBadge state={s.status} />
                </div>
                <div className="grid grid-cols-1 gap-1.5">
                  <ValueBox label="PC" value={s.regs.pc} />
                  <ValueBox label="SP" value={s.regs.sp} />
                </div>
                <div className="mt-2 space-y-0.5 font-mono text-[11px]">
                  {s.fds.length === 0 && <div className="text-muted">no open files</div>}
                  {s.fds.map((f) => (
                    <motion.div key={f.fd} initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex justify-between">
                      <span className="text-muted">
                        fd {f.fd} <span className="opacity-70">({f.name})</span>
                      </span>
                      <span className="text-ink">{f.target}</span>
                    </motion.div>
                  ))}
                </div>
              </Box>
            </div>

            {/* Right: address space */}
            <AddressSpace s={s} />
          </div>
          <Terminal lines={s.terminal} className="h-20 shrink-0" />
        </div>
      )}
    </SimulationPlayer>
  );
}

function Box({ on, children }: { on: boolean; children: ReactNode }) {
  return (
    <div className="glass rounded-2xl p-3 transition-[border-color] duration-300" style={on ? { borderColor: "var(--accent)" } : undefined}>
      {children}
    </div>
  );
}

function AddressSpace({ s }: { s: LoadState }) {
  const empty = s.status === "on disk";
  return (
    <div className="flex flex-col">
      <StageLabel>Address space (memory)</StageLabel>
      <div className="neu-inset flex flex-1 flex-col gap-1.5 rounded-2xl p-2">
        {empty ? (
          <div className="grid flex-1 place-items-center text-xs text-muted">not loaded yet</div>
        ) : (
          <>
            <Seg name="code" on={s.focus === "code"} color="var(--p0)" filled={s.code}>
              <span className="font-mono text-[10px]">main(), printf()…</span>
            </Seg>
            <Seg name="data" on={s.focus === "data"} color="var(--p2)" filled={s.data.total !== null}>
              <span className="font-mono text-[11px]">total = {s.data.total ?? "?"}</span>
            </Seg>
            <Seg name="heap ↓" on={s.focus === "heap"} color="var(--p3)" filled={s.focus === "heap" || s.heap.length > 0}>
              <AnimatePresence initial={false}>
                {s.heap.length === 0 ? (
                  <span className="text-[10px] opacity-70">empty</span>
                ) : (
                  s.heap.map((h) => (
                    <motion.span key={h.addr} initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="font-mono text-[11px]">
                      {h.addr}: {h.value ?? "?"}
                    </motion.span>
                  ))
                )}
              </AnimatePresence>
            </Seg>
            <div className="grid min-h-6 flex-1 place-items-center rounded-lg border border-dashed border-[var(--line)] text-[10px] text-muted">free</div>
            <Seg name="stack ↑" on={s.focus === "stack"} color="var(--p1)" filled={s.stack.length > 0}>
              <div className="w-full space-y-0.5">
                {s.stack.map((v) => (
                  <motion.div key={v.name} initial={{ opacity: 0, y: 4 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.25 }} className="flex justify-between gap-2 font-mono text-[10.5px]">
                    <span className="opacity-70">{v.name}</span>
                    <span className="truncate font-semibold">{v.value}</span>
                  </motion.div>
                ))}
              </div>
            </Seg>
          </>
        )}
      </div>
    </div>
  );
}

function Seg({ name, on, color, filled, children }: { name: string; on: boolean; color: string; filled: boolean; children: ReactNode }) {
  return (
    <div
      className={`flex min-h-9 items-start gap-2 rounded-lg px-2 py-1.5 transition-colors duration-300 ${filled ? "tint" : "neu"}`}
      style={{ ["--c" as string]: color, outline: on ? "2px solid var(--accent)" : "2px solid transparent", outlineOffset: 1 }}
    >
      <span className="w-14 shrink-0 text-[10px] font-bold uppercase tracking-wider">{name}</span>
      <div className="min-w-0 flex-1 text-right">{filled ? children : null}</div>
    </div>
  );
}
