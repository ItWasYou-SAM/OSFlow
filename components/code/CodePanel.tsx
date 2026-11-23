"use client";

import { motion } from "framer-motion";
import { useEffect, useRef, useState } from "react";
import type { CodeFile, Cursor } from "@/lib/sim";

const LINE_H = 26; // px; fixed so the highlight bar can be positioned by math
const CURSOR_W = 44; // px reserved left of the line numbers for process cursors

type Props = {
  files: CodeFile[];
  activeFile: string;
  lines: number[];
  /** Per-process markers ("P", "C") shown in the gutter. */
  cursors?: Cursor[];
  /** Reserve gutter space for cursors (keeps layout stable across steps). */
  cursorGutter?: boolean;
};

export function CodePanel({ files, activeFile, lines, cursors = [], cursorGutter = false }: Props) {
  // The tab follows the simulation, but the learner can peek at another file
  // until the next step moves on.
  const [peek, setPeek] = useState<string | null>(null);
  useEffect(() => setPeek(null), [activeFile, lines]);
  const shown = peek ?? activeFile;
  const file = files.find((f) => f.name === shown) ?? files[0];
  const highlighting = file.name === activeFile && lines.length > 0;
  const first = highlighting ? Math.min(...lines) : 0;
  const last = highlighting ? Math.max(...lines) : 0;
  // Group highlighted lines into contiguous runs so [15, 24] lights up two
  // separate lines, not everything in between.
  const runs: [number, number][] = [];
  if (highlighting) {
    for (const n of Array.from(new Set(lines)).sort((a, b) => a - b)) {
      const r = runs.at(-1);
      if (r && n === r[1] + 1) r[1] = n;
      else runs.push([n, n]);
    }
  }
  const lit = new Set(lines);

  const scroller = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const el = scroller.current;
    if (!el || !highlighting) return;
    const top = (first - 1) * LINE_H;
    const bottom = last * LINE_H;
    const pad = LINE_H * 2;
    if (top < el.scrollTop + pad || bottom > el.scrollTop + el.clientHeight - pad) {
      el.scrollTo({ top: Math.max(0, top - el.clientHeight / 2 + LINE_H), behavior: "smooth" });
    }
  }, [first, last, highlighting]);

  return (
    <div className="flex h-full min-h-0 flex-col overflow-hidden rounded-2xl border border-[var(--line)]" style={{ background: "var(--code-bg)" }}>
      <div className="flex items-center gap-1 border-b border-[var(--line)] px-2 py-1.5" role="tablist" aria-label="Source files">
        <span className="mr-1.5 flex gap-1.5 pl-1" aria-hidden>
          <i className="h-2.5 w-2.5 rounded-full bg-[#ff5f57]" />
          <i className="h-2.5 w-2.5 rounded-full bg-[#febc2e]" />
          <i className="h-2.5 w-2.5 rounded-full bg-[#28c840]" />
        </span>
        {files.map((f) => {
          const selected = f.name === file.name;
          return (
            <button
              key={f.name}
              type="button"
              role="tab"
              aria-selected={selected}
              onClick={() => setPeek(f.name === activeFile ? null : f.name)}
              className={`focus-ring relative rounded-lg px-2.5 py-1 font-mono text-xs transition ${selected ? "text-ink" : "text-muted hover:text-ink"}`}
            >
              {selected && (
                <motion.span layoutId={`tab-${files.map((x) => x.name).join()}`} className="neu-inset absolute inset-0 rounded-lg" transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }} />
              )}
              <span className="relative">{f.name}</span>
              {f.name === activeFile && files.length > 1 && <span className="relative ml-1.5 inline-block h-1.5 w-1.5 rounded-full bg-accent align-middle" aria-label="running" />}
            </button>
          );
        })}
      </div>

      <div ref={scroller} className="scroll-thin relative min-h-0 flex-1 overflow-auto py-3">
        <div className="relative min-w-max">
          {runs.map(([a, b], i) => (
            <motion.div
              key={i}
              aria-hidden
              className="absolute left-0 right-0 rounded-md"
              style={{ background: "var(--code-hl)", boxShadow: "inset 3px 0 0 var(--accent)" }}
              initial={i === 0 ? false : { opacity: 0, top: (a - 1) * LINE_H, height: (b - a + 1) * LINE_H }}
              animate={{ opacity: 1, top: (a - 1) * LINE_H, height: (b - a + 1) * LINE_H }}
              transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
            />
          ))}
          {cursorGutter && file.name === activeFile &&
            cursors.map((c, i) => {
              // Two processes on the same line sit side by side.
              const slot = cursors.slice(0, i).filter((o) => o.line === c.line).length;
              return (
                <motion.span
                  key={c.label}
                  aria-label={`${c.label === "P" ? "parent" : "child"} is at line ${c.line}`}
                  className="solid absolute z-10 grid h-[18px] w-[18px] place-items-center rounded-md font-sans text-[10px] font-black"
                  style={{ ["--c" as string]: `var(--p${c.color % 4})`, left: 4 + slot * 20 }}
                  initial={{ opacity: 0, top: (c.line - 1) * LINE_H + 4 }}
                  animate={{ opacity: 1, top: (c.line - 1) * LINE_H + 4 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
                >
                  {c.label}
                </motion.span>
              );
            })}
          <pre className="relative font-mono text-[13px]" style={cursorGutter ? { paddingLeft: CURSOR_W } : undefined} aria-label={`${file.name} source`}>
            {file.lines.map((tokens, i) => {
              const n = i + 1;
              const on = highlighting && (lit.has(n) || runs.some(([a, b]) => n >= a && n <= b));
              return (
                <div key={i} className="flex pr-4" style={{ height: LINE_H, lineHeight: `${LINE_H}px` }} aria-current={on ? "step" : undefined}>
                  <span className={`w-11 shrink-0 select-none pr-3 text-right tabular-nums ${on ? "font-bold text-accent" : ""}`} style={on ? undefined : { color: "var(--code-gutter)" }}>
                    {n}
                  </span>
                  <code className="whitespace-pre">
                    {tokens.length === 0 ? " " : tokens.map((t, j) => (
                      <span key={j} className="tok" style={{ ["--tl" as string]: t.light, ["--td" as string]: t.dark, fontStyle: t.italic ? "italic" : undefined }}>
                        {t.content}
                      </span>
                    ))}
                  </code>
                </div>
              );
            })}
          </pre>
        </div>
      </div>
    </div>
  );
}
