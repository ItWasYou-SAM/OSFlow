"use client";

import { motion } from "framer-motion";
import { ChevronLeft, ChevronRight, Pause, Play, RotateCcw } from "lucide-react";
import { useEffect, useMemo, useReducer, type KeyboardEvent, type ReactNode } from "react";
import { CodePanel } from "@/components/code/CodePanel";
import { RichText } from "@/components/ui/RichText";
import type { CodeFile, Step, StepTag } from "@/lib/sim";
import { BASE_DELAY_MS, SPEEDS, initialPlayer, playerReducer } from "./playerReducer";

export const TAG_STYLE: Record<StepTag, { label: string; color: string }> = {
  user: { label: "user code", color: "var(--p0)" },
  os: { label: "OS at work", color: "var(--p2)" },
  switch: { label: "context switch", color: "var(--p3)" },
  output: { label: "output", color: "var(--p1)" },
  danger: { label: "uh-oh", color: "var(--danger)" },
  success: { label: "takeaway", color: "var(--success)" },
};

type Props<S> = {
  title: string;
  subtitle?: string;
  files: CodeFile[];
  steps: Step<S>[];
  /** Parameter controls shown in the header (e.g. "number of processes"). */
  controls?: ReactNode;
  /** Renders the animated machine for the current step. */
  children: (state: S, step: Step<S>, index: number) => ReactNode;
};

export function SimulationPlayer<S>({ title, subtitle, files, steps, controls, children }: Props<S>) {
  const total = steps.length;
  const [p, dispatch] = useReducer(playerReducer, initialPlayer);

  // New parameters → new trace → start over.
  useEffect(() => dispatch({ type: "reset", total }), [steps, total]);

  useEffect(() => {
    if (!p.playing) return;
    const t = setTimeout(() => dispatch({ type: "tick", total }), BASE_DELAY_MS / p.speed);
    return () => clearTimeout(t);
  }, [p.playing, p.index, p.speed, total]);

  const hasCursors = useMemo(() => steps.some((s) => s.cursors?.length), [steps]);
  const index = Math.min(p.index, total - 1);
  const step = steps[index];
  const tag = step.tag ? TAG_STYLE[step.tag] : null;

  const onKey = (e: KeyboardEvent) => {
    const el = e.target as HTMLElement;
    const tagName = el.tagName;
    const formish = tagName === "INPUT" || tagName === "SELECT" || tagName === "TEXTAREA";
    if (e.key === " " || e.key === "k") {
      if (formish || tagName === "BUTTON") return; // let the control handle its own key
      e.preventDefault();
      dispatch({ type: "toggle", total });
    } else if ((e.key === "ArrowRight" || e.key === "l") && !formish) {
      e.preventDefault();
      dispatch({ type: "next", total });
    } else if ((e.key === "ArrowLeft" || e.key === "j") && !formish) {
      e.preventDefault();
      dispatch({ type: "prev", total });
    } else if (e.key === "r" && !formish) {
      dispatch({ type: "reset", total });
    }
  };

  const cycleSpeed = () => {
    const i = SPEEDS.indexOf(p.speed as (typeof SPEEDS)[number]);
    dispatch({ type: "speed", speed: SPEEDS[(i + 1) % SPEEDS.length], total });
  };

  return (
    <div
      className="glass focus-ring not-prose my-10 rounded-[28px] p-3 sm:p-5"
      tabIndex={0}
      onKeyDown={onKey}
      role="group"
      aria-roledescription="simulation"
      aria-label={`${title} simulation. Space to play or pause, arrow keys to step.`}
    >
      {/* Header */}
      <div className="mb-4 flex flex-col gap-3 px-1 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h3 className="text-lg font-bold tracking-tight text-ink">{title}</h3>
          {subtitle && <p className="text-sm text-muted">{subtitle}</p>}
        </div>
        {controls && <div className="flex flex-wrap items-center gap-2">{controls}</div>}
      </div>

      {/* Code | Machine */}
      <div className="grid grid-cols-1 gap-3 lg:grid-cols-[minmax(0,5fr)_minmax(0,7fr)]">
        <div className="h-[260px] lg:h-[440px]">
          <CodePanel files={files} activeFile={step.file} lines={step.lines} cursors={step.cursors} cursorGutter={hasCursors} />
        </div>
        <div className="neu-inset relative min-h-[340px] overflow-hidden rounded-2xl p-3 sm:p-4 lg:h-[440px]">
          {children(step.state, step, index)}
        </div>
      </div>

      {/* Narration */}
      <div className="mt-3 flex min-h-[84px] items-start gap-3 rounded-2xl px-3 py-3 sm:px-4" style={{ background: "var(--code-bg)" }}>
        {tag && (
            <motion.span
              key={step.tag}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.2 }}
              className="tint mt-0.5 hidden shrink-0 rounded-full px-2.5 py-0.5 text-[11px] font-semibold uppercase tracking-wide sm:inline-block"
              style={{ ["--c" as string]: tag.color }}
            >
              {tag.label}
            </motion.span>
          )}
        {/* Keyed remount = fresh fade-in per step; no exit phase, so rapid stepping can never show stale text. */}
        <motion.p key={index} initial={{ opacity: 0, y: 3 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.2 }} className="text-[15px] leading-relaxed text-ink" aria-live="polite">
          <RichText text={step.narration} />
        </motion.p>
      </div>

      {/* Controls */}
      <div className="mt-3 flex flex-wrap items-center gap-2 sm:gap-3">
        <div className="flex items-center gap-2">
          <CtrlButton label="Restart (R)" onClick={() => dispatch({ type: "reset", total })}>
            <RotateCcw size={16} />
          </CtrlButton>
          <CtrlButton label="Previous step (←)" onClick={() => dispatch({ type: "prev", total })} disabled={index === 0}>
            <ChevronLeft size={18} />
          </CtrlButton>
          <motion.button
            type="button"
            whileTap={{ scale: 0.96 }}
            onClick={() => dispatch({ type: "toggle", total })}
            aria-label={p.playing ? "Pause (Space)" : "Play (Space)"}
            className="solid focus-ring grid h-12 w-12 place-items-center rounded-2xl"
            style={{ ["--c" as string]: "var(--p0)" }}
          >
            {p.playing ? <Pause size={20} /> : <Play size={20} className="translate-x-[1px]" />}
          </motion.button>
          <CtrlButton label="Next step (→)" onClick={() => dispatch({ type: "next", total })} disabled={index === total - 1}>
            <ChevronRight size={18} />
          </CtrlButton>
        </div>

        <Timeline steps={steps} index={index} onSeek={(i) => dispatch({ type: "seek", index: i, total })} />

        <div className="flex items-center gap-2">
          <button type="button" onClick={cycleSpeed} className="neu focus-ring h-10 min-w-14 rounded-xl px-3 font-mono text-xs font-semibold text-ink" aria-label={`Playback speed ${p.speed}x, click to change`}>
            {p.speed}×
          </button>
          <span className="font-mono text-xs tabular-nums text-muted" aria-label={`Step ${index + 1} of ${total}`}>
            {String(index + 1).padStart(2, "0")}/{String(total).padStart(2, "0")}
          </span>
        </div>
      </div>
      <p className="mt-2 hidden px-1 text-xs text-muted sm:block">
        Tip: click the panel, then use <kbd className="font-mono">Space</kbd> to play/pause and <kbd className="font-mono">←</kbd> <kbd className="font-mono">→</kbd> to step.
      </p>
    </div>
  );
}

function CtrlButton({ label, onClick, disabled, children }: { label: string; onClick: () => void; disabled?: boolean; children: ReactNode }) {
  return (
    <button type="button" onClick={onClick} disabled={disabled} aria-label={label} title={label} className="neu focus-ring grid h-10 w-10 place-items-center rounded-xl text-ink transition disabled:opacity-40">
      {children}
    </button>
  );
}

function Timeline<S>({ steps, index, onSeek }: { steps: Step<S>[]; index: number; onSeek: (i: number) => void }) {
  return (
    <div className="relative order-last h-10 w-full min-w-0 sm:order-none sm:w-auto sm:flex-1">
      <div className="neu-inset absolute inset-x-0 top-1/2 flex h-4 -translate-y-1/2 items-center gap-[2px] overflow-hidden rounded-full px-1.5" aria-hidden>
        {steps.map((s, i) => (
          <span
            key={i}
            className="h-2 flex-1 rounded-full transition-opacity duration-300"
            style={{ background: s.tag ? TAG_STYLE[s.tag].color : "var(--muted)", opacity: i <= index ? 1 : 0.25 }}
          />
        ))}
      </div>
      <motion.span
        aria-hidden
        className="solid absolute top-1/2 h-6 w-6 -translate-y-1/2 rounded-full"
        style={{ ["--c" as string]: "var(--p0)", marginLeft: -12 }}
        initial={false}
        animate={{ left: `calc(6px + (100% - 12px) * ${steps.length > 1 ? (index + 0.5) / steps.length : 0.5})` }}
        transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
      />
      <input
        type="range"
        min={0}
        max={steps.length - 1}
        value={index}
        onChange={(e) => onSeek(Number(e.target.value))}
        aria-label="Scrub through steps"
        className="focus-ring absolute inset-0 h-full w-full cursor-pointer opacity-0"
      />
    </div>
  );
}
