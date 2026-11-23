"use client";

import { AnimatePresence, motion } from "framer-motion";
import { ArrowLeft, ArrowRight, BookOpen, Check, ExternalLink, X } from "lucide-react";
import Link from "next/link";
import { useCallback, useEffect, useRef, useState } from "react";
import { useAllProgress } from "@/lib/progress";
import { ALL_TOPICS, STAGES, TOPIC_ORDER, topicStatus, type Stage, type Topic } from "@/content/roadmap";

type Sel = { kind: "topic"; id: string } | { kind: "stage"; id: string } | null;

const STATUS_LABEL = { ready: "Ready", soon: "Coming soon", planned: "Planned" } as const;
const OSTEP_URL = "https://pages.cs.wisc.edu/~remzi/OSTEP/";

export function RoadmapMap() {
  const [sel, setSel] = useState<Sel>(null);
  const progress = useAllProgress();

  // Deep links: /roadmap#paging opens that topic.
  useEffect(() => {
    const open = () => {
      const id = decodeURIComponent(location.hash.slice(1));
      if (ALL_TOPICS.some((t) => t.id === id)) {
        setSel({ kind: "topic", id });
        document.getElementById(`node-${id}`)?.scrollIntoView({ block: "center" });
      }
    };
    open();
    window.addEventListener("hashchange", open);
    return () => window.removeEventListener("hashchange", open);
  }, []);

  const close = useCallback(() => setSel(null), []);

  return (
    <>
      <div className="relative">
        {STAGES.map((stage, i) => (
          <StageRow key={stage.id} stage={stage} index={i} last={i === STAGES.length - 1} sel={sel} onSelect={setSel} progress={progress} />
        ))}
      </div>
      <Drawer sel={sel} onClose={close} onSelect={setSel} progress={progress} />
    </>
  );
}

function StageRow({
  stage,
  index,
  last,
  sel,
  onSelect,
  progress,
}: {
  stage: Stage;
  index: number;
  last: boolean;
  sel: Sel;
  onSelect: (s: Sel) => void;
  progress: Record<string, { quizBest?: number; quizTotal?: number }>;
}) {
  const stageOn = sel?.kind === "stage" && sel.id === stage.id;
  return (
    <section aria-labelledby={`stage-${stage.id}`} className="relative grid grid-cols-1 gap-y-4 py-8 lg:grid-cols-[minmax(0,1fr)_260px_minmax(0,1fr)] lg:gap-y-0">
      {/* spine */}
      <div aria-hidden className="absolute bottom-0 left-1/2 top-0 hidden w-0.5 -translate-x-1/2 lg:block" style={{ background: index === 0 ? "linear-gradient(transparent, var(--line-strong) 40%)" : last ? "linear-gradient(var(--line-strong) 60%, transparent)" : "var(--line-strong)" }} />

      {/* left topics */}
      <Side topics={stage.left} side="left" sel={sel} onSelect={onSelect} progress={progress} color={stage.color} />

      {/* stage node */}
      <div className="relative order-first flex items-center justify-center lg:order-none lg:px-8">
        {stage.left.length > 0 && <span aria-hidden className="absolute left-0 top-1/2 hidden w-8 border-t-2 border-[var(--line-strong)] lg:block" />}
        {stage.right.length > 0 && <span aria-hidden className="absolute right-0 top-1/2 hidden w-8 border-t-2 border-[var(--line-strong)] lg:block" />}
        <button
          type="button"
          id={`stage-${stage.id}`}
          onClick={() => onSelect({ kind: "stage", id: stage.id })}
          className="tint focus-ring relative z-10 w-full rounded-2xl px-5 py-4 text-left transition-shadow duration-300"
          style={{
            ["--c" as string]: stage.color,
            // opaque, so the spine doesn't show through
            background: `color-mix(in oklab, ${stage.color} 15%, var(--bg))`,
            outline: stageOn ? `2px solid ${stage.color}` : undefined,
            outlineOffset: 3,
          }}
        >
          <span className="block font-mono text-[10px] font-bold uppercase tracking-[0.2em] opacity-80">Stage {index + 1}</span>
          <span className="block text-lg font-extrabold text-ink">{stage.title}</span>
          <span className="mt-0.5 block text-xs leading-snug text-muted">{stage.blurb}</span>
        </button>
      </div>

      {/* right topics */}
      <Side topics={stage.right} side="right" sel={sel} onSelect={onSelect} progress={progress} color={stage.color} />
    </section>
  );
}

function Side({
  topics,
  side,
  sel,
  onSelect,
  progress,
  color,
}: {
  topics: Topic[];
  side: "left" | "right";
  sel: Sel;
  onSelect: (s: Sel) => void;
  progress: Record<string, { quizBest?: number; quizTotal?: number }>;
  color: string;
}) {
  if (topics.length === 0) return <div className="hidden lg:block" />;
  return (
    <div className={`relative flex flex-col justify-center gap-2.5 ${side === "left" ? "lg:items-end lg:pr-8" : "lg:items-start lg:pl-8"}`}>
      {/* bracket joining this side's topics */}
      {topics.length > 1 && (
        <span
          aria-hidden
          className={`absolute top-[22px] bottom-[22px] hidden border-[var(--line-strong)] lg:block ${side === "left" ? "right-0 border-r-2" : "left-0 border-l-2"}`}
        />
      )}
      {topics.map((t) => (
        <TopicNode key={t.id} t={t} side={side} on={sel?.kind === "topic" && sel.id === t.id} onSelect={onSelect} done={!!progress[t.id]?.quizTotal} color={color} />
      ))}
    </div>
  );
}

function TopicNode({ t, side, on, onSelect, done, color }: { t: Topic; side: "left" | "right"; on: boolean; onSelect: (s: Sel) => void; done: boolean; color: string }) {
  const status = topicStatus(t.id);
  const optional = t.kind === "optional";
  return (
    <div className="relative w-full lg:max-w-[300px]">
      <span aria-hidden className={`absolute top-1/2 hidden w-8 border-t-2 border-[var(--line-strong)] lg:block ${side === "left" ? "left-full" : "right-full"} ${optional ? "border-dashed" : ""}`} />
      <button
        id={`node-${t.id}`}
        type="button"
        onClick={() => onSelect({ kind: "topic", id: t.id })}
        aria-label={`${t.title}, ${STATUS_LABEL[status]}${optional ? ", optional" : ""}`}
        className={`focus-ring group flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left transition-[border-color,background-color] duration-200 ${status === "ready" ? "panel" : "neu"} ${optional ? "border-dashed" : ""}`}
        style={{
          borderColor: on ? color : status === "ready" ? `color-mix(in oklab, ${color} 55%, transparent)` : undefined,
          outline: on ? `2px solid ${color}` : undefined,
          outlineOffset: 2,
        }}
      >
        <span
          className={`grid h-6 w-6 shrink-0 place-items-center rounded-md font-mono text-[10px] font-bold ${status === "ready" ? "solid" : "neu-inset text-muted"}`}
          style={status === "ready" ? { ["--c" as string]: color } : undefined}
        >
          {done ? <Check size={12} /> : TOPIC_ORDER[t.id]}
        </span>
        <span className="min-w-0 flex-1">
          <span className={`block truncate text-sm font-semibold ${status === "planned" ? "text-muted" : "text-ink"}`}>{t.title}</span>
          <span className="block font-mono text-[10px] text-muted">
            OSTEP {t.ostep}
            {optional && " · optional"}
          </span>
        </span>
        <StatusDot status={status} />
      </button>
    </div>
  );
}

function StatusDot({ status }: { status: keyof typeof STATUS_LABEL }) {
  const c = status === "ready" ? "var(--success)" : status === "soon" ? "var(--p3)" : "var(--line-strong)";
  return <span aria-hidden title={STATUS_LABEL[status]} className="h-2 w-2 shrink-0 rounded-full" style={{ background: c }} />;
}

/* ───────────────────────── Drawer ───────────────────────── */

function Drawer({ sel, onClose, onSelect, progress }: { sel: Sel; onClose: () => void; onSelect: (s: Sel) => void; progress: Record<string, { quizBest?: number; quizTotal?: number }> }) {
  const closeRef = useRef<HTMLButtonElement>(null);
  useEffect(() => {
    if (!sel) return;
    closeRef.current?.focus({ preventScroll: true });
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [sel, onClose]);

  return (
    <AnimatePresence>
      {sel && (
        <motion.aside
          key="drawer"
          role="dialog"
          aria-modal="false"
          aria-label="Topic details"
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 16 }}
          transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
          className="glass-strong fixed inset-x-3 bottom-3 z-50 max-h-[75dvh] overflow-y-auto rounded-3xl p-5 sm:inset-x-auto sm:bottom-6 sm:right-6 sm:top-24 sm:max-h-none sm:w-[380px]"
        >
          <button ref={closeRef} type="button" onClick={onClose} aria-label="Close details" className="neu focus-ring absolute right-4 top-4 grid h-8 w-8 place-items-center rounded-lg text-ink">
            <X size={16} />
          </button>
          <AnimatePresence mode="wait" initial={false}>
            <motion.div key={`${sel.kind}-${sel.id}`} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.15 }}>
              {sel.kind === "stage" ? <StageDetails id={sel.id} onSelect={onSelect} /> : <TopicDetails id={sel.id} onSelect={onSelect} done={progress[sel.id]} />}
            </motion.div>
          </AnimatePresence>
        </motion.aside>
      )}
    </AnimatePresence>
  );
}

function StageDetails({ id, onSelect }: { id: string; onSelect: (s: Sel) => void }) {
  const stage = STAGES.find((s) => s.id === id)!;
  const topics = [...stage.left, ...stage.right];
  return (
    <div className="pr-8">
      <p className="font-mono text-[10px] font-bold uppercase tracking-[0.2em] text-muted">Stage {STAGES.indexOf(stage) + 1}</p>
      <h3 className="mt-1 text-xl font-extrabold text-ink">{stage.title}</h3>
      {stage.explain.map((p, i) => (
        <p key={i} className="mt-3 text-sm leading-relaxed text-muted">
          {p}
        </p>
      ))}
      <p className="mt-4 text-[10px] font-bold uppercase tracking-[0.18em] text-muted">Topics, in order</p>
      <ol className="mt-2 space-y-1.5">
        {topics.map((t) => (
          <li key={t.id}>
            <button type="button" onClick={() => onSelect({ kind: "topic", id: t.id })} className="neu focus-ring flex w-full items-center gap-2 rounded-xl px-3 py-2 text-left text-sm text-ink">
              <span className="font-mono text-[10px] text-muted">{TOPIC_ORDER[t.id]}</span>
              <span className="flex-1">{t.title}</span>
              <StatusDot status={topicStatus(t.id)} />
            </button>
          </li>
        ))}
      </ol>
    </div>
  );
}

function TopicDetails({ id, onSelect, done }: { id: string; onSelect: (s: Sel) => void; done?: { quizBest?: number; quizTotal?: number } }) {
  const t = ALL_TOPICS.find((x) => x.id === id)!;
  const stage = STAGES.find((s) => [...s.left, ...s.right].includes(t))!;
  const status = topicStatus(t.id);
  const i = ALL_TOPICS.indexOf(t);
  const prev = ALL_TOPICS[i - 1];
  const next = ALL_TOPICS[i + 1];
  return (
    <div>
      <div className="flex flex-wrap items-center gap-1.5 pr-10">
        <span className="tint rounded-full px-2 py-0.5 text-[10px] font-bold uppercase" style={{ ["--c" as string]: stage.color }}>
          {stage.title}
        </span>
        <span className="neu rounded-full px-2 py-0.5 text-[10px] font-bold uppercase text-muted">{STATUS_LABEL[status]}</span>
        {t.kind === "optional" && <span className="neu rounded-full px-2 py-0.5 text-[10px] font-bold uppercase text-muted">optional</span>}
      </div>
      <h3 className="mt-3 text-xl font-extrabold text-ink">
        <span className="mr-2 font-mono text-sm text-muted">{TOPIC_ORDER[t.id]}.</span>
        {t.title}
      </h3>
      <p className="mt-1 flex items-center gap-1.5 text-xs text-muted">
        <BookOpen size={12} /> OSTEP {t.ostep}
      </p>
      <p className="mt-3 text-sm leading-relaxed text-ink">{t.desc}</p>
      <p className="mt-4 text-[10px] font-bold uppercase tracking-[0.18em] text-muted">You&apos;ll learn</p>
      <ul className="mt-2 space-y-1.5">
        {t.learn.map((l) => (
          <li key={l} className="flex items-start gap-2 text-sm text-ink">
            <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full" style={{ background: stage.color }} />
            {l}
          </li>
        ))}
      </ul>

      <div className="mt-5">
        {status === "ready" ? (
          <Link href={`/learn/${t.id}/`} className="solid focus-ring flex items-center justify-center gap-2 rounded-xl px-4 py-2.5 text-sm font-bold">
            {done?.quizTotal ? `Review lesson · quiz ${done.quizBest}/${done.quizTotal}` : "Start lesson"} <ArrowRight size={16} />
          </Link>
        ) : (
          <div className="space-y-2">
            <div className="neu-inset rounded-xl px-4 py-2.5 text-center text-sm text-muted">{status === "soon" ? "Interactive lesson coming soon" : "Planned for a later release"}</div>
            <a href={OSTEP_URL} target="_blank" rel="noreferrer" className="neu focus-ring flex items-center justify-center gap-2 rounded-xl px-4 py-2 text-sm font-semibold text-ink">
              Read OSTEP {t.ostep} meanwhile <ExternalLink size={14} />
            </a>
          </div>
        )}
      </div>

      <div className="mt-4 flex justify-between gap-2">
        {prev ? (
          <button type="button" onClick={() => onSelect({ kind: "topic", id: prev.id })} className="focus-ring flex items-center gap-1 rounded-lg text-xs text-muted hover:text-ink">
            <ArrowLeft size={12} /> {prev.title}
          </button>
        ) : (
          <span />
        )}
        {next && (
          <button type="button" onClick={() => onSelect({ kind: "topic", id: next.id })} className="focus-ring flex items-center gap-1 rounded-lg text-right text-xs text-muted hover:text-ink">
            {next.title} <ArrowRight size={12} />
          </button>
        )}
      </div>
    </div>
  );
}
