"use client";

import { AnimatePresence, motion } from "framer-motion";
import { useMemo, useState } from "react";
import { SimulationPlayer } from "@/components/player/SimulationPlayer";
import { ProcBlob, Segmented, StageLabel, Terminal } from "@/components/viz/primitives";
import type { CodeFile } from "@/lib/sim";
import { simulateCpu } from "@/sims/intro/cpu";

export function CpuDemo({ files }: { files: CodeFile[] }) {
  const [n, setN] = useState(4);
  const steps = useMemo(() => simulateCpu({ n, rounds: 2 }), [n]);

  return (
    <SimulationPlayer
      title="One CPU, many programs"
      subtitle="Run several copies of cpu.c on a single core"
      files={files}
      steps={steps}
      controls={
        <Segmented
          label="Processes"
          value={n}
          onChange={setN}
          options={[
            { value: 1, label: "1" },
            { value: 2, label: "2" },
            { value: 4, label: "4" },
          ]}
        />
      }
    >
      {(s) => {
        const running = s.procs.find((p) => p.name === s.running);
        const ready = s.procs.filter((p) => p.name !== s.running);
        return (
            <div className="grid h-full grid-cols-1 gap-3 sm:grid-cols-[minmax(0,1fr)_190px]">
              <div className="flex flex-col items-center justify-between gap-3">
                <div className="flex w-full items-center justify-between text-[11px] font-semibold text-muted">
                  <span>
                    wall clock <span className="font-mono text-ink">{s.clock.toFixed(1)}s</span>
                  </span>
                  <span>
                    context switches <span className="font-mono text-ink">{s.switches}</span>
                  </span>
                </div>

                {/* The single physical CPU */}
                <div className="relative grid place-items-center py-2">
                  <div className="panel relative grid h-40 w-40 place-items-center rounded-[34px]">
                    {/* pins */}
                    {[0, 1, 2, 3].map((side) => (
                      <div
                        key={side}
                        aria-hidden
                        className="absolute flex gap-2"
                        style={{
                          ...(side === 0 && { top: -8, left: "50%", transform: "translateX(-50%)" }),
                          ...(side === 1 && { bottom: -8, left: "50%", transform: "translateX(-50%)" }),
                          ...(side === 2 && { left: -8, top: "50%", transform: "translateY(-50%)", flexDirection: "column" }),
                          ...(side === 3 && { right: -8, top: "50%", transform: "translateY(-50%)", flexDirection: "column" }),
                        }}
                      >
                        {[0, 1, 2, 3].map((k) => (
                          <span key={k} className={`rounded-sm bg-[var(--muted)] opacity-40 ${side < 2 ? "h-2 w-1.5" : "h-1.5 w-2"}`} />
                        ))}
                      </div>
                    ))}
                    <span className="absolute top-3 text-[10px] font-black tracking-[0.25em] opacity-60">CPU</span>
                    <AnimatePresence mode="popLayout" initial={false}>
                      {running ? (
                        <motion.div
                          key={running.name}
                          initial={{ y: 14, opacity: 0 }}
                          animate={{ y: 0, opacity: 1 }}
                          exit={{ y: 14, opacity: 0 }}
                          transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
                        >
                          <ProcBlob color={running.color} label={running.name} progress={running.spin} size={64} active />
                        </motion.div>
                      ) : (
                        <motion.span key="idle" initial={{ opacity: 0 }} animate={{ opacity: 0.5 }} exit={{ opacity: 0 }} className="text-xs">
                          idle
                        </motion.span>
                      )}
                    </AnimatePresence>
                  </div>
                </div>

                {/* Ready queue */}
                <div className="w-full">
                  <StageLabel>Ready queue</StageLabel>
                  <div className="glass flex min-h-[86px] items-center gap-2 overflow-x-auto rounded-2xl px-3 py-2">
                    {ready.length === 0 && <span className="text-xs text-muted">{s.procs.length ? "empty" : "no processes yet"}</span>}
                    <AnimatePresence mode="popLayout" initial={false}>
                      {ready.map((p) => (
                        <motion.div
                          key={p.name}
                          layout
                          initial={{ y: -10, opacity: 0 }}
                          animate={{ y: 0, opacity: 1 }}
                          exit={{ y: -10, opacity: 0 }}
                          transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
                        >
                          <ProcBlob color={p.color} label={p.name} progress={p.spin} size={44} />
                        </motion.div>
                      ))}
                    </AnimatePresence>
                  </div>
                </div>
              </div>

              <div className="flex min-h-[180px] flex-col gap-2">
                <Terminal lines={s.terminal} className="flex-1" />
                <div className="glass rounded-2xl p-2.5">
                  <StageLabel>Prints per process</StageLabel>
                  <div className="space-y-1">
                    {s.procs.map((p) => (
                      <div key={p.name} className="flex items-center gap-2 text-xs">
                        <span className="w-3 font-bold">{p.name}</span>
                        <div className="neu-inset h-2 flex-1 overflow-hidden rounded-full">
                          <motion.div className="h-full rounded-full" style={{ background: `var(--p${p.color})` }} animate={{ width: `${(p.prints / 2) * 100}%` }} />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
        );
      }}
    </SimulationPlayer>
  );
}
