"use client";

import { AnimatePresence, motion } from "framer-motion";
import { useEffect, useId, useRef, type ReactNode } from "react";

export const procColor = (i: number) => (i < 0 ? "var(--muted)" : `var(--p${i % 4})`);

import { base } from "@/lib/motion";

const spring = base;

/** A puffy clay blob representing a process or thread. */
export function ProcBlob({
  color,
  label,
  progress,
  size = 56,
  active,
  sub,
}: {
  color: number;
  label: string;
  progress?: number;
  size?: number;
  active?: boolean;
  sub?: string;
}) {
  const r = size / 2 + 6;
  const c = 2 * Math.PI * r;
  return (
    <div className="relative grid shrink-0 place-items-center" style={{ width: size + 14, height: size + 14 }}>
      {progress !== undefined && (
        <svg className="absolute inset-0" viewBox={`0 0 ${size + 14} ${size + 14}`} aria-hidden>
          <circle cx={(size + 14) / 2} cy={(size + 14) / 2} r={r} fill="none" stroke="currentColor" strokeOpacity={0.12} strokeWidth={3} />
          <motion.circle
            cx={(size + 14) / 2}
            cy={(size + 14) / 2}
            r={r}
            fill="none"
            stroke={procColor(color)}
            strokeWidth={3}
            strokeLinecap="round"
            strokeDasharray={c}
            initial={false}
            animate={{ strokeDashoffset: c * (1 - progress) }}
            transition={spring}
            transform={`rotate(-90 ${(size + 14) / 2} ${(size + 14) / 2})`}
          />
        </svg>
      )}
      <div
        className="clay grid place-items-center rounded-[38%] font-extrabold transition-shadow duration-300"
        style={{
          ["--c" as string]: procColor(color),
          width: size,
          height: size,
          fontSize: size * 0.36,
          outline: active ? `2px solid ${procColor(color)}` : undefined,
          outlineOffset: 3,
        }}
      >
        <span className="leading-none">{label}</span>
        {sub && <span className="-mt-1 text-[9px] font-semibold opacity-70">{sub}</span>}
      </div>
    </div>
  );
}

/** Dark glass terminal that auto-scrolls to the newest line. */
export function Terminal({ lines, className = "" }: { lines: { text: string; color: number }[]; className?: string }) {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    ref.current?.scrollTo({ top: ref.current.scrollHeight, behavior: "smooth" });
  }, [lines.length]);
  return (
    <div className={`flex min-h-0 flex-col overflow-hidden rounded-2xl border border-white/10 ${className}`} style={{ background: "var(--term-bg)" }}>
      <div className="flex items-center gap-1.5 border-b border-white/10 px-3 py-1.5 text-[10px] font-semibold uppercase tracking-widest text-white/40">
        <span className="h-2 w-2 rounded-full bg-[#28c840]" /> terminal
      </div>
      <div ref={ref} className="scroll-thin min-h-0 flex-1 overflow-y-auto px-3 py-2 font-mono text-[12px] leading-5" aria-label="Terminal output">
        <AnimatePresence initial={false}>
          {lines.map((l, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 4 }}
              animate={{ opacity: 1, y: 0 }}
              transition={spring}
              className="whitespace-pre-wrap break-all"
              style={{ color: l.color < 0 ? "var(--term-ink)" : procColor(l.color) }}
            >
              {l.text}
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </div>
  );
}

/** Register / memory cell whose value pops when it changes. */
export function ValueBox({ label, value, mono = true, tone, className = "" }: { label: string; value: ReactNode; mono?: boolean; tone?: string; className?: string }) {
  return (
    <div className={`neu-inset flex min-w-0 items-center justify-between gap-3 rounded-xl px-3 py-1.5 ${className}`}>
      <span className="shrink-0 text-[10px] font-bold uppercase tracking-widest text-muted">{label}</span>
      <AnimatePresence mode="popLayout" initial={false}>
        <motion.span
          key={String(value)}
          initial={{ y: -6, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 6, opacity: 0 }}
          transition={{ duration: 0.2 }}
          className={`${mono ? "font-mono" : ""} min-w-0 truncate text-sm font-semibold`}
          style={{ color: tone ?? "var(--ink)" }}
        >
          {value}
        </motion.span>
      </AnimatePresence>
    </div>
  );
}

export function StageLabel({ children }: { children: ReactNode }) {
  return <div className="mb-1.5 text-[10px] font-bold uppercase tracking-[0.18em] text-muted">{children}</div>;
}

/* ───────────── Parameter controls (neumorphic) ───────────── */

export function Segmented<T extends string | number>({
  label,
  value,
  options,
  onChange,
}: {
  label: string;
  value: T;
  options: { value: T; label: string }[];
  onChange: (v: T) => void;
}) {
  const id = `seg-${useId()}`;
  return (
    <div className="flex items-center gap-2">
      <span className="text-xs font-medium text-muted" id={id}>
        {label}
      </span>
      <div className="neu-inset flex rounded-xl p-1" role="radiogroup" aria-labelledby={id}>
        {options.map((o) => {
          const on = o.value === value;
          return (
            <button
              key={String(o.value)}
              type="button"
              role="radio"
              aria-checked={on}
              onClick={() => onChange(o.value)}
              className={`focus-ring relative rounded-lg px-2.5 py-1 text-xs font-semibold transition ${on ? "text-[var(--clay-ink)]" : "text-muted hover:text-ink"}`}
            >
              {on && <motion.span layoutId={id} className="solid absolute inset-0 rounded-lg" style={{ ["--c" as string]: "var(--p0)" }} transition={spring} />}
              <span className="relative">{o.label}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}

export function Switch({ label, checked, onChange, danger = false }: { label: string; checked: boolean; onChange: (v: boolean) => void; danger?: boolean }) {
  return (
    <label className="flex cursor-pointer items-center gap-2 text-xs font-medium text-muted">
      <button
        type="button"
        role="switch"
        aria-checked={checked}
        onClick={() => onChange(!checked)}
        className="neu-inset focus-ring relative flex h-7 w-12 items-center rounded-full px-1"
      >
        <motion.span
          layout
          transition={spring}
          className="solid h-5 w-5 rounded-full"
          style={{ ["--c" as string]: checked ? (danger ? "var(--danger)" : "var(--accent)") : "var(--muted)", marginLeft: checked ? "auto" : 0 }}
        />
      </button>
      {label}
    </label>
  );
}

export function SmallButton({ children, onClick, label }: { children: ReactNode; onClick: () => void; label?: string }) {
  return (
    <motion.button
      type="button"
      whileTap={{ scale: 0.94 }}
      onClick={onClick}
      aria-label={label}
      className="neu focus-ring flex h-8 items-center gap-1.5 rounded-xl px-3 text-xs font-semibold text-ink"
    >
      {children}
    </motion.button>
  );
}
