"use client";

import { motion } from "framer-motion";
import { Shuffle } from "lucide-react";
import { useMemo, useState } from "react";
import { SimulationPlayer } from "@/components/player/SimulationPlayer";
import { SmallButton, Segmented, StageLabel, Terminal, ValueBox, procColor } from "@/components/viz/primitives";
import type { CodeFile } from "@/lib/sim";
import { simulateThreads, type Mode } from "@/sims/intro/threads";

const OPS = ["load", "add", "store"] as const;

export function ThreadsDemo({ files }: { files: CodeFile[] }) {
  const [loops, setLoops] = useState(3);
  const [mode, setMode] = useState<Mode>("race");
  const [seed, setSeed] = useState(7);
  const steps = useMemo(() => simulateThreads({ loops, mode, seed }), [loops, mode, seed]);

  return (
    <SimulationPlayer
      title="Two threads, one counter"
      subtitle="Each thread runs counter++ in a loop"
      files={files}
      steps={steps}
      controls={
        <>
          <Segmented label="loops" value={loops} onChange={setLoops} options={[2, 3, 5].map((v) => ({ value: v, label: String(v) }))} />
          <Segmented
            label="Timing"
            value={mode}
            onChange={setMode}
            options={[
              { value: "safe", label: "Lucky" },
              { value: "race", label: "Unlucky" },
              { value: "random", label: "Random" },
            ]}
          />
          {mode === "random" && (
            <SmallButton onClick={() => setSeed((x) => x + 1)} label="Shuffle the schedule">
              <Shuffle size={13} /> Shuffle
            </SmallButton>
          )}
        </>
      }
    >
      {(s) => {
        const expected = s.threads.reduce((n, t) => n + t.i, 0);
        return (
          <div className="flex h-full flex-col gap-3">
            {/* Shared memory */}
            <div className="flex flex-col items-center">
              <StageLabel>Shared memory</StageLabel>
              <motion.div
                                className="tint relative flex items-center gap-4 rounded-3xl px-6 py-3"
                style={{ ["--c" as string]: s.lostFlash ? "var(--danger)" : "var(--muted)", transition: "background-color 0.3s, box-shadow 0.3s" }}
              >
                <span className="font-mono text-xs font-bold opacity-70">counter</span>
                <motion.span key={s.counter} initial={{ y: -6, opacity: 0 }} animate={{ y: 0, opacity: 1 }} className="font-mono text-3xl font-black">
                  {s.counter}
                </motion.span>
              </motion.div>
              <div className="mt-2 flex gap-3 text-[11px] font-semibold text-muted">
                <span>
                  increments done <span className="font-mono text-ink">{expected}</span>
                </span>
                <span>
                  lost <span className="font-mono" style={{ color: s.lost ? "var(--danger)" : "var(--ink)" }}>{s.lost}</span>
                </span>
              </div>
            </div>

            {/* Threads */}
            <div className="grid flex-1 grid-cols-2 gap-3">
              {s.threads.map((t) => {
                const on = s.running === t.id;
                return (
                  <motion.div
                    key={t.id}
                    animate={{ opacity: on || s.running === "main" ? 1 : 0.6 }}
                    transition={{ duration: 0.3 }}
                    className="glass rounded-2xl p-2.5"
                    style={on ? { boxShadow: `0 0 0 2px ${procColor(t.color)}, var(--shadow)` } : undefined}
                  >
                    <div className="mb-2 flex items-center justify-between">
                      <span className="tint rounded-lg px-2 py-0.5 text-xs font-black" style={{ ["--c" as string]: procColor(t.color) }}>
                        {t.id}
                      </span>
                      <span className="text-[10px] font-bold uppercase tracking-widest" style={{ color: on ? "var(--accent)" : "var(--muted)" }}>
                        {t.next === "idle" ? "not started" : t.next === "done" ? "finished" : on ? "on CPU" : "waiting"}
                      </span>
                    </div>
                    <ValueBox label="eax" value={t.eax ?? "—"} tone="var(--accent)" />
                    <div className="mt-2 flex gap-1">
                      {OPS.map((op) => (
                        <span
                          key={op}
                          className={`flex-1 rounded-lg py-1 text-center font-mono text-[10px] font-bold ${t.next === op ? "tint" : "neu-inset text-muted"}`}
                          style={t.next === op ? { ["--c" as string]: procColor(t.color) } : undefined}
                        >
                          {op}
                        </span>
                      ))}
                    </div>
                    <div className="mt-2 text-[11px] text-muted">
                      loop <span className="font-mono text-ink">{t.i}</span> / {s.loops}
                    </div>
                  </motion.div>
                );
              })}
            </div>
            <Terminal lines={s.terminal} className="h-[84px] shrink-0" />
          </div>
        );
      }}
    </SimulationPlayer>
  );
}
