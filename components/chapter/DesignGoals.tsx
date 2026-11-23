"use client";

import { AnimatePresence, motion } from "framer-motion";
import { Activity, BatteryCharging, Gauge, Layers, Lock, Shield } from "lucide-react";
import { useState } from "react";
import { DESIGN_GOALS } from "@/content/intro-data";

const ICONS = { Activity, BatteryCharging, Gauge, Layers, Lock, Shield };

export function DesignGoals() {
  const [open, setOpen] = useState<number | null>(0);
  return (
    <div className="not-prose my-8 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
      {DESIGN_GOALS.map((g, i) => {
        const Icon = ICONS[g.icon];
        const on = open === i;
        return (
          <motion.button
            key={g.title}
            type="button"
            layout
            onClick={() => setOpen(on ? null : i)}
            aria-expanded={on}
            transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
            className="glass focus-ring flex flex-col items-start gap-3 rounded-3xl p-4 text-left transition-[border-color] hover:border-[var(--line-strong)]"
            style={on ? { boxShadow: `0 0 0 2px var(--p${g.color}), var(--shadow)` } : undefined}
          >
            <div className="flex w-full items-center gap-3">
              <motion.span
                className="tint grid h-12 w-12 shrink-0 place-items-center rounded-2xl"
                style={{ ["--c" as string]: `var(--p${g.color})` }}
              >
                <Icon size={20} />
              </motion.span>
              <div>
                <p className="font-bold text-ink">{g.title}</p>
                <p className="text-sm text-muted">{g.short}</p>
              </div>
            </div>
            <AnimatePresence initial={false}>
              {on && (
                <motion.p initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} exit={{ opacity: 0, height: 0 }} transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }} className="overflow-hidden text-sm leading-relaxed text-ink">
                  {g.long}
                </motion.p>
              )}
            </AnimatePresence>
          </motion.button>
        );
      })}
    </div>
  );
}
