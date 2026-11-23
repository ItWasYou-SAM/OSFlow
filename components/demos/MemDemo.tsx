"use client";

import { motion } from "framer-motion";
import { ArrowRight } from "lucide-react";
import { useMemo, useState } from "react";
import { SimulationPlayer } from "@/components/player/SimulationPlayer";
import { StageLabel, Switch, Terminal, procColor } from "@/components/viz/primitives";
import type { CodeFile } from "@/lib/sim";
import { simulateMem } from "@/sims/intro/mem";

export function MemDemo({ files }: { files: CodeFile[] }) {
  const [aslr, setAslr] = useState(false);
  const steps = useMemo(() => simulateMem({ aslr, iterations: 3 }), [aslr]);

  return (
    <SimulationPlayer
      title="Same address, different memory"
      subtitle="Two copies of mem.c, each with a private address space"
      files={files}
      steps={steps}
      controls={<Switch label="Address-space randomization" checked={aslr} onChange={setAslr} />}
    >
      {(s) => (
        <div className="flex h-full flex-col gap-3">
          <div className="grid flex-1 grid-cols-1 gap-3 sm:grid-cols-[minmax(0,1.15fr)_minmax(0,1fr)]">
            {/* Virtual address spaces */}
            <div className="flex flex-col gap-2">
              <StageLabel>Virtual address spaces (what each process sees)</StageLabel>
              {s.procs.map((p) => {
                const on = s.running === p.pid;
                return (
                  <motion.div
                    key={p.pid}
                    animate={{ opacity: on || s.running === null ? 1 : 0.6 }}
                    transition={{ duration: 0.3 }}
                    className="glass rounded-2xl p-2.5"
                    style={on ? { boxShadow: `0 0 0 2px ${procColor(p.color)}, var(--shadow)` } : undefined}
                  >
                    <div className="mb-1.5 flex items-center justify-between">
                      <span className="tint rounded-lg px-2 py-0.5 text-[11px] font-bold" style={{ ["--c" as string]: procColor(p.color) }}>
                        PID {p.pid}
                      </span>
                      {on && <span className="text-[10px] font-bold uppercase tracking-widest text-accent">on CPU</span>}
                    </div>
                    <div className="grid grid-cols-3 gap-1 text-center text-[10px] font-semibold text-muted">
                      <div className="neu-inset rounded-lg py-1">code</div>
                      <div className={`rounded-lg py-1 ${p.vaddr ? "tint" : "neu-inset"}`} style={p.vaddr ? { ["--c" as string]: procColor(p.color) } : undefined}>
                        heap
                      </div>
                      <div className="neu-inset rounded-lg py-1">stack</div>
                    </div>
                    <div className="mt-1.5 flex items-center gap-1.5 font-mono text-[11px]">
                      <span className="text-muted">p =</span>
                      <span className="font-semibold text-ink">{p.vaddr ?? "?"}</span>
                      {p.frame !== null && (
                        <>
                          <ArrowRight size={12} className="text-muted" />
                          <span className="text-muted">frame #{p.frame}</span>
                        </>
                      )}
                      <span className="ml-auto text-muted">*p =</span>
                      <motion.span key={p.value ?? "x"} initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="font-bold text-ink">
                        {p.value ?? "?"}
                      </motion.span>
                    </div>
                  </motion.div>
                );
              })}
            </div>

            {/* Physical memory */}
            <div>
              <StageLabel>Physical memory (the real RAM)</StageLabel>
              <div className="grid grid-cols-2 gap-1.5">
                {s.frames.map((f, i) => {
                  const owned = f.owner !== null;
                  const os = f.label === "OS";
                  const pulse = s.lastWrite === i;
                  return (
                    <motion.div
                      key={i}
                      layout
                      
                      className={`flex h-11 items-center justify-between rounded-xl px-2 text-[10px] ${owned ? "tint" : os ? "panel" : "neu-inset"}`}
                      style={{ ...(owned ? { ["--c" as string]: procColor(f.owner!) } : {}), outline: pulse ? "2px solid var(--accent)" : "2px solid transparent", outlineOffset: 2, transition: "outline-color 0.3s" }}
                    >
                      <span className="font-mono opacity-70">#{i}</span>
                      <span className="font-semibold">{os ? "OS" : owned ? `PID ${f.label}` : "free"}</span>
                      {f.value !== null && <span className="font-mono text-xs font-black">{f.value}</span>}
                    </motion.div>
                  );
                })}
              </div>
            </div>
          </div>
          <Terminal lines={s.terminal} className="h-28 shrink-0" />
        </div>
      )}
    </SimulationPlayer>
  );
}
