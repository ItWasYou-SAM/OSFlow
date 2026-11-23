"use client";

import { AnimatePresence, motion } from "framer-motion";
import { useState } from "react";
import { HISTORY } from "@/content/intro-data";

export function HistoryTimeline() {
  const [sel, setSel] = useState(0);
  const item = HISTORY[sel];
  return (
    <div className="not-prose my-8">
      <div className="scroll-thin relative overflow-x-auto pb-2">
        <div className="relative flex min-w-max gap-2 px-1 pt-2">
          <div className="absolute left-6 right-6 top-[30px] h-1 rounded-full" style={{ background: "linear-gradient(90deg, var(--p0), var(--p1), var(--p2), var(--p3))", opacity: 0.6 }} aria-hidden />
          {HISTORY.map((h, i) => {
            const on = i === sel;
            return (
              <button key={h.title} type="button" onClick={() => setSel(i)} aria-pressed={on} className="focus-ring group relative flex w-32 flex-col items-center gap-2 rounded-2xl pb-2 sm:w-36">
                <motion.span
                  animate={{ scale: on ? 1.1 : 1 }}
                  transition={{ duration: 0.25 }}
                  className={`relative z-10 h-8 w-8 rounded-full ${on ? "solid" : "neu"}`}
                  style={on ? { ["--c" as string]: `var(--p${i % 4})` } : undefined}
                />
                <span className={`font-mono text-[11px] font-bold ${on ? "text-ink" : "text-muted"}`}>{h.era}</span>
                <span className={`text-center text-xs font-semibold leading-tight ${on ? "text-ink" : "text-muted group-hover:text-ink"}`}>{h.title}</span>
              </button>
            );
          })}
        </div>
      </div>
      <AnimatePresence mode="wait">
        <motion.div
          key={sel}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          transition={{ duration: 0.25 }}
          className="glass mt-3 max-w-[68ch] rounded-3xl p-5"
        >
          <p className="text-xs font-bold uppercase tracking-[0.18em] text-muted">{item.era}</p>
          <p className="mt-1 text-lg font-bold text-ink">{item.title}</p>
          <p className="mt-2 leading-relaxed text-ink/90">{item.body}</p>
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
