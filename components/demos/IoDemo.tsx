"use client";

import { AnimatePresence, motion } from "framer-motion";
import { HardDrive, Zap } from "lucide-react";
import { useMemo, useState, type ReactNode } from "react";
import { SimulationPlayer } from "@/components/player/SimulationPlayer";
import { Switch } from "@/components/viz/primitives";
import type { CodeFile } from "@/lib/sim";
import { simulateIo, type Layer } from "@/sims/intro/io";

export function IoDemo({ files }: { files: CodeFile[] }) {
  const [crash, setCrash] = useState(false);
  const steps = useMemo(() => simulateIo({ crash }), [crash]);

  return (
    <SimulationPlayer
      title="Saving a file"
      subtitle="From write() in your program to bytes on the disk"
      files={files}
      steps={steps}
      controls={<Switch label="Crash before fsync()" checked={crash} onChange={setCrash} danger />}
    >
      {(s) => (
        <div className="relative flex h-full flex-col gap-2">
          {/* User space */}
          <Band title="User space" active={s.active === "app"} hint={s.mode === "user" ? "CPU is here" : undefined}>
            <Box active={s.active === "app"} title="io.c process">
              <Row k="buffer" v={s.buffer ? JSON.stringify(s.buffer) : "—"} />
              <Row k="fd" v={s.fd ?? "—"} />
            </Box>
          </Band>

          {/* Trap boundary */}
          <div className="relative flex items-center gap-2 px-1">
            <div className="h-px flex-1 border-t-2 border-dashed" style={{ borderColor: "color-mix(in oklab, var(--muted) 45%, transparent)" }} />
            <motion.span
              key={s.mode}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="tint rounded-full px-2.5 py-0.5 text-[10px] font-black uppercase tracking-widest"
              style={{ ["--c" as string]: s.mode === "kernel" ? "var(--p3)" : "var(--p2)" }}
            >
              {s.mode} mode
            </motion.span>
            <AnimatePresence>
              {s.call && (
                <motion.span
                  key={s.call}
                  initial={{ y: -16, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  exit={{ y: 16, opacity: 0 }}
                  className="neu rounded-full px-2.5 py-0.5 font-mono text-[11px] font-bold text-ink"
                >
                  syscall: {s.call}()
                </motion.span>
              )}
            </AnimatePresence>
            <div className="h-px flex-1 border-t-2 border-dashed" style={{ borderColor: "color-mix(in oklab, var(--muted) 45%, transparent)" }} />
          </div>

          {/* Kernel */}
          <Band title="Kernel" active={isKernel(s.active)} hint={s.mode === "kernel" ? "CPU is here" : undefined}>
            <div className="grid grid-cols-2 gap-2">
              <Box active={s.active === "kernel"} title="File system">
                <Row k="fd table" v={s.fd !== null ? `3 → /tmp/file` : "—"} />
              </Box>
              <Box active={s.active === "cache"} title="Page cache (RAM)">
                <Row k="inode" v={s.cache.inode ? "in memory" : "—"} />
                <Row k="data" v={s.cache.data ? JSON.stringify(s.cache.data) : "—"} />
                {s.cache.dirty && (
                  <motion.span initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="tint mt-1 inline-block rounded-md px-1.5 text-[9px] font-black uppercase" style={{ ["--c" as string]: "var(--p1)" }}>
                    dirty: not on disk
                  </motion.span>
                )}
              </Box>
            </div>
          </Band>

          {/* Hardware */}
          <Band title="Hardware" active={s.active === "disk"}>
            <div className="flex items-center gap-3">
              <div
                className="panel grid h-12 w-12 shrink-0 place-items-center rounded-full transition-colors duration-300"
                style={s.active === "disk" ? { color: "var(--accent)", borderColor: "var(--accent)" } : undefined}
              >
                <HardDrive size={18} />
              </div>
              <div className="grid flex-1 grid-cols-2 gap-2">
                <DiskBlock label="inode block" filled={s.disk.inode} text={s.disk.inode ? "size 12" : "empty"} />
                <DiskBlock label="data block" filled={!!s.disk.data} text={s.disk.data ? JSON.stringify(s.disk.data) : "empty"} />
              </div>
            </div>
          </Band>

          {/* Crash overlay */}
          <AnimatePresence>
            {s.crashed && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="absolute inset-0 grid place-items-center rounded-2xl"
                style={{ background: s.rebooted ? "color-mix(in oklab, var(--bg) 55%, transparent)" : "color-mix(in oklab, var(--danger) 35%, transparent)", backdropFilter: "blur(3px)" }}
              >
                <motion.div initial={{ y: 8, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ duration: 0.3 }} className="glass-strong max-w-[80%] rounded-2xl px-5 py-4 text-center">
                  <Zap className="mx-auto mb-1" style={{ color: "var(--danger)" }} />
                  <p className="text-sm font-bold text-ink">{s.rebooted ? "Rebooted: /tmp/file does not exist" : "Power failure!"}</p>
                  <p className="text-xs text-muted">{s.rebooted ? "The disk never received the data." : "RAM (and the page cache) is wiped."}</p>
                </motion.div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      )}
    </SimulationPlayer>
  );
}

const isKernel = (l: Layer | null) => l === "kernel" || l === "cache";

function Band({ title, active, hint, children }: { title: string; active: boolean; hint?: string; children: ReactNode }) {
  return (
    <div className="glass relative flex-1 rounded-2xl p-2.5 transition-shadow" style={active ? { boxShadow: "0 0 0 2px var(--accent), var(--shadow)" } : undefined}>
      <div className="mb-1.5 flex items-center justify-between text-[10px] font-bold uppercase tracking-[0.18em] text-muted">
        {title}
        {hint && <span className="text-accent">{hint}</span>}
      </div>
      {children}
    </div>
  );
}

function Box({ title, active, children }: { title: string; active: boolean; children: ReactNode }) {
  return (
    <div className={`rounded-xl p-2 transition-colors duration-300 ${active ? "neu" : "neu-inset"}`} style={active ? { borderColor: "var(--accent)" } : undefined}>
      <div className="mb-1 text-[11px] font-bold text-ink">{title}</div>
      <div className="space-y-0.5">{children}</div>
    </div>
  );
}

function Row({ k, v }: { k: string; v: ReactNode }) {
  return (
    <div className="flex items-center justify-between gap-2 font-mono text-[10.5px]">
      <span className="text-muted">{k}</span>
      <span className="truncate font-semibold text-ink">{v}</span>
    </div>
  );
}

function DiskBlock({ label, filled, text }: { label: string; filled: boolean; text: string }) {
  return (
    <motion.div
            className={`rounded-xl px-2 py-1.5 ${filled ? "tint" : "neu-inset"}`}
      style={filled ? { ["--c" as string]: "var(--p2)" } : undefined}
    >
      <div className="text-[9px] font-bold uppercase tracking-wider opacity-70">{label}</div>
      <div className="truncate font-mono text-[10.5px] font-semibold">{text}</div>
    </motion.div>
  );
}
