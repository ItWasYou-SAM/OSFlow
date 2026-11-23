"use client";

import { AnimatePresence, motion } from "framer-motion";
import { Check, RotateCcw, X } from "lucide-react";
import { useState } from "react";
import { API_QUIZ } from "@/content/api-data";
import { INTRO_QUIZ } from "@/content/intro-data";
import { PROCESS_QUIZ } from "@/content/process-data";
import { saveProgress } from "@/lib/progress";

const QUIZZES = { introduction: INTRO_QUIZ, processes: PROCESS_QUIZ, "process-api": API_QUIZ };

export function Quiz({ chapter }: { chapter: keyof typeof QUIZZES }) {
  const questions = QUIZZES[chapter];
  const [answers, setAnswers] = useState<(number | null)[]>(() => questions.map(() => null));
  const done = answers.every((a) => a !== null);
  const score = answers.filter((a, i) => a === questions[i].answer).length;

  const pick = (qi: number, oi: number) => {
    if (answers[qi] !== null) return;
    const next = answers.map((a, i) => (i === qi ? oi : a));
    setAnswers(next);
    if (next.every((a) => a !== null)) {
      saveProgress(chapter, { quizBest: next.filter((a, i) => a === questions[i].answer).length, quizTotal: questions.length });
    }
  };

  return (
    <div className="not-prose my-8 space-y-4">
      {questions.map((q, qi) => {
        const chosen = answers[qi];
        return (
          <fieldset key={qi} className="glass rounded-3xl p-4 sm:p-5">
            <legend className="sr-only">Question {qi + 1}</legend>
            <p className="mb-3 font-semibold text-ink">
              <span className="mr-2 font-mono text-sm text-muted">Q{qi + 1}.</span>
              {q.q}
            </p>
            <div className="grid gap-2 sm:grid-cols-2">
              {q.options.map((o, oi) => {
                const isRight = oi === q.answer;
                const isChosen = chosen === oi;
                const reveal = chosen !== null;
                const color = reveal && isRight ? "var(--success)" : reveal && isChosen ? "var(--danger)" : undefined;
                return (
                  <motion.button
                    key={oi}
                    type="button"
                    disabled={reveal}
                    onClick={() => pick(qi, oi)}
                    whileTap={reveal ? undefined : { scale: 0.98 }}
                    className={`focus-ring flex items-start gap-2 rounded-2xl px-3 py-2.5 text-left text-sm transition ${reveal ? "" : "neu"} ${reveal && !isRight && !isChosen ? "opacity-50" : ""}`}
                    style={color ? { boxShadow: `0 0 0 2px ${color}`, background: `color-mix(in oklab, ${color} 14%, transparent)` } : undefined}
                    aria-pressed={isChosen}
                  >
                    <span className="mt-0.5 grid h-5 w-5 shrink-0 place-items-center rounded-full text-[10px] font-bold" style={{ background: color ?? "color-mix(in oklab, var(--muted) 20%, transparent)", color: color ? "white" : "var(--ink)" }}>
                      {reveal && isRight ? <Check size={12} /> : reveal && isChosen ? <X size={12} /> : String.fromCharCode(65 + oi)}
                    </span>
                    <span className="text-ink">{o}</span>
                  </motion.button>
                );
              })}
            </div>
            <AnimatePresence>
              {chosen !== null && (
                <motion.p initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }} className="mt-3 overflow-hidden text-sm leading-relaxed text-muted">
                  <span className="font-semibold" style={{ color: chosen === q.answer ? "var(--success)" : "var(--danger)" }}>
                    {chosen === q.answer ? "Correct. " : "Not quite. "}
                  </span>
                  {q.why}{" "}
                  <a href={`#${q.section}`} className="text-accent underline underline-offset-2">
                    Revisit section
                  </a>
                </motion.p>
              )}
            </AnimatePresence>
          </fieldset>
        );
      })}

      <AnimatePresence>
        {done && (
          <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }} className="glass-strong flex flex-col items-center gap-3 rounded-3xl p-6 text-center sm:flex-row sm:text-left">
            <div className="relative">
              <span className="tint grid h-16 w-16 place-items-center rounded-3xl font-mono text-xl font-black" style={{ ["--c" as string]: score === questions.length ? "var(--p2)" : "var(--p3)" }}>
                {score}/{questions.length}
              </span>
            </div>
            <div className="flex-1">
              <p className="font-bold text-ink">{score === questions.length ? "Perfect! You've got the big picture." : score >= questions.length - 2 ? "Nice work. Revisit the ones you missed." : "Good start. Replay the demos and try again."}</p>
              <p className="text-sm text-muted">Your best score is saved in this browser.</p>
            </div>
            <button type="button" onClick={() => setAnswers(questions.map(() => null))} className="neu focus-ring flex items-center gap-2 rounded-xl px-4 py-2 text-sm font-semibold text-ink">
              <RotateCcw size={14} /> Retry
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
