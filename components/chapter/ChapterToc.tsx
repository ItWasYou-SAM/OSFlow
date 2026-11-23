"use client";

import { motion, useScroll, useSpring } from "framer-motion";
import { useEffect, useState } from "react";
import type { Section } from "@/content/curriculum";

/** Sticky section rail (desktop) + reading progress bar (all sizes). */
export function ChapterToc({ sections }: { sections: Section[] }) {
  const [active, setActive] = useState(sections[0]?.id);
  const { scrollYProgress } = useScroll();
  const progress = useSpring(scrollYProgress, { stiffness: 200, damping: 30 });

  useEffect(() => {
    const els = sections.map((s) => document.getElementById(s.id)).filter((e): e is HTMLElement => !!e);
    const io = new IntersectionObserver(
      (entries) => {
        const visible = entries.filter((e) => e.isIntersecting).sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top);
        if (visible[0]) setActive(visible[0].target.id);
      },
      { rootMargin: "-20% 0px -65% 0px" },
    );
    els.forEach((e) => io.observe(e));
    return () => io.disconnect();
  }, [sections]);

  return (
    <>
      <motion.div aria-hidden className="fixed inset-x-0 top-0 z-50 h-1 origin-left" style={{ scaleX: progress, background: "linear-gradient(90deg, var(--accent), var(--accent-2))" }} />
      <nav aria-label="Sections in this chapter" className="glass sticky top-24 hidden rounded-3xl p-3 lg:block">
        <p className="px-2 pb-2 text-[10px] font-bold uppercase tracking-[0.2em] text-muted">In this chapter</p>
        <ol className="space-y-0.5">
          {sections.map((s, i) => {
            const on = s.id === active;
            return (
              <li key={s.id}>
                <a href={`#${s.id}`} className={`focus-ring relative flex items-center gap-2.5 rounded-xl px-2 py-1.5 text-sm transition ${on ? "font-semibold text-ink" : "text-muted hover:text-ink"}`} aria-current={on ? "location" : undefined}>
                  {on && <motion.span layoutId="toc-active" className="neu-inset absolute inset-0 rounded-xl" transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }} />}
                  <span className="relative font-mono text-[10px] opacity-60">{String(i + 1).padStart(2, "0")}</span>
                  <span className="relative">{s.title}</span>
                </a>
              </li>
            );
          })}
        </ol>
      </nav>
    </>
  );
}
