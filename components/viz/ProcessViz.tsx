"use client";

import { AnimatePresence, motion } from "framer-motion";
import { FileText } from "lucide-react";
import type { ApiProc, ApiState } from "@/sims/api/model";
import { Terminal, procColor } from "./primitives";

const STATE_COLOR: Record<string, string> = {
  running: "var(--accent)",
  RUNNING: "var(--accent)",
  ready: "var(--p2)",
  RUNNABLE: "var(--p2)",
  blocked: "var(--p3)",
  SLEEPING: "var(--p3)",
  zombie: "var(--p1)",
  ZOMBIE: "var(--p1)",
  done: "var(--muted)",
  exited: "var(--muted)",
  UNUSED: "var(--muted)",
  EMBRYO: "var(--p0)",
  "on disk": "var(--muted)",
  loading: "var(--p0)",
};

export function StateBadge({ state }: { state: string }) {
  return (
    <motion.span
      key={state}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.25 }}
      className="tint inline-block rounded-md px-1.5 py-0.5 font-mono text-[10px] font-bold uppercase tracking-wide"
      style={{ ["--c" as string]: STATE_COLOR[state] ?? "var(--muted)" }}
    >
      {state}
    </motion.span>
  );
}

/** Parent/child process cards + terminal (+ optional output file) for the Process API demos. */
export function ApiViz({ s, showFds = false }: { s: ApiState; showFds?: boolean }) {
  const parent = s.procs.find((p) => p.role === "parent");
  const child = s.procs.find((p) => p.role === "child");
  return (
    <div className="flex h-full flex-col gap-3">
      <div className="flex h-6 items-center justify-center">
        <AnimatePresence mode="popLayout" initial={false}>
          {s.event && (
            <motion.span
              key={s.event}
              initial={{ opacity: 0, y: -4 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.25 }}
              className="tint rounded-full px-3 py-0.5 font-mono text-xs font-bold"
            >
              system call: {s.event}
            </motion.span>
          )}
        </AnimatePresence>
      </div>

      <div className="relative grid flex-1 grid-cols-1 gap-3 sm:grid-cols-2">
        {parent && <ProcCard p={parent} showFds={showFds} />}
        <AnimatePresence initial={false}>
          {child ? (
            <motion.div key="child" initial={{ opacity: 0, x: -12 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}>
              <ProcCard p={child} showFds={showFds} />
            </motion.div>
          ) : (
            <div key="empty" className="hidden place-items-center rounded-2xl border border-dashed border-[var(--line-strong)] text-xs text-muted sm:grid">
              no child yet
            </div>
          )}
        </AnimatePresence>
      </div>

      <div className={`grid shrink-0 gap-3 ${s.file ? "sm:grid-cols-[minmax(0,1.4fr)_minmax(0,1fr)]" : ""}`}>
        <Terminal lines={s.terminal} className="h-24" />
        {s.file && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="neu-inset flex h-24 flex-col rounded-2xl p-2.5">
            <div className="mb-1 flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-widest text-muted">
              <FileText size={12} /> {s.file.name}
            </div>
            <div className="font-mono text-[11px] text-ink">{s.file.content ?? <span className="text-muted">(empty)</span>}</div>
          </motion.div>
        )}
      </div>
    </div>
  );
}

function ProcCard({ p, showFds }: { p: ApiProc; showFds: boolean }) {
  const gone = p.state === "exited";
  return (
    <div
      className="glass h-full rounded-2xl p-3 transition-opacity duration-300"
      style={{ opacity: gone ? 0.45 : 1, outline: p.state === "running" ? `2px solid ${procColor(p.color)}` : "2px solid transparent", outlineOffset: -1 }}
    >
      <div className="mb-2 flex items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <span className="clay grid h-7 w-7 place-items-center rounded-lg text-xs font-black" style={{ ["--c" as string]: procColor(p.color) }}>
            {p.role === "parent" ? "P" : "C"}
          </span>
          <div className="leading-tight">
            <div className="text-xs font-bold text-ink">{p.role}</div>
            <div className="font-mono text-[10px] text-muted">pid {p.pid}</div>
          </div>
        </div>
        <StateBadge state={p.state} />
      </div>

      <div className="mb-2 flex items-center justify-between rounded-lg px-2 py-1 neu-inset">
        <span className="text-[10px] font-bold uppercase tracking-widest text-muted">program</span>
        <motion.span key={p.image} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.3 }} className="font-mono text-xs font-bold text-ink">
          {p.image}
        </motion.span>
      </div>

      <div className="space-y-1">
        {p.vars.map((v) => (
          <div key={v.k} className="flex items-center justify-between gap-2 font-mono text-[11px]">
            <span className="text-muted">{v.k}</span>
            <motion.span key={v.v} initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="truncate font-semibold text-ink">
              {v.v}
            </motion.span>
          </div>
        ))}
      </div>

      {showFds && (
        <div className="mt-2 border-t border-[var(--line)] pt-2">
          <div className="mb-1 text-[10px] font-bold uppercase tracking-widest text-muted">open files</div>
          <div className="space-y-0.5 font-mono text-[11px]">
            {[0, 1, 2].map((fd) => {
              const f = p.fds.find((x) => x.fd === fd);
              const redirected = f && f.target !== "terminal";
              return (
                <div key={fd} className="flex items-center justify-between rounded px-1" style={redirected ? { background: "var(--code-hl)" } : undefined}>
                  <span className="text-muted">fd {fd}</span>
                  <span className={f ? (redirected ? "font-bold text-accent" : "text-ink") : "italic text-muted"}>{f ? f.target : "closed"}</span>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
