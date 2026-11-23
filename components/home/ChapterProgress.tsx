"use client";

import { motion } from "framer-motion";
import { useProgress } from "@/lib/progress";

/** Small progress ring showing the learner's best quiz score for a chapter. */
export function ChapterProgress({ slug }: { slug: string }) {
  const p = useProgress(slug);
  const frac = p.quizTotal ? (p.quizBest ?? 0) / p.quizTotal : 0;
  const r = 15;
  const c = 2 * Math.PI * r;
  return (
    <div className="flex items-center gap-2" title={p.quizTotal ? `Best quiz score ${p.quizBest}/${p.quizTotal}` : "Not started"}>
      <svg width="38" height="38" viewBox="0 0 38 38" aria-hidden>
        <circle cx="19" cy="19" r={r} fill="none" stroke="currentColor" strokeOpacity="0.15" strokeWidth="4" />
        <motion.circle
          cx="19"
          cy="19"
          r={r}
          fill="none"
          stroke="var(--success)"
          strokeWidth="4"
          strokeLinecap="round"
          strokeDasharray={c}
          initial={{ strokeDashoffset: c }}
          animate={{ strokeDashoffset: c * (1 - frac) }}
          transform="rotate(-90 19 19)"
        />
      </svg>
      <span className="text-xs text-muted">{p.quizTotal ? `Quiz ${p.quizBest}/${p.quizTotal}` : "Not started"}</span>
    </div>
  );
}
