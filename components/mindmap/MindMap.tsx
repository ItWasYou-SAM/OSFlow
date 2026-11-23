"use client";

import { animate, AnimatePresence, motion } from "framer-motion";
import { ArrowRight, Maximize2, Minus, Plus, Shrink, Expand, Map as MapIcon } from "lucide-react";
import Link from "next/link";
import { useCallback, useEffect, useMemo, useRef, useState, type KeyboardEvent, type PointerEvent } from "react";
import { MINDMAP, type MindNode } from "@/content/mindmap";
import { topicStatus } from "@/content/roadmap";

/* ───────────────────────── Layout ───────────────────────── */

const R1 = 200; // branch ring
const R2 = 400; // leaf ring
const SX = 1.32; // stretch horizontally: an ellipse fits wide screens better
const FULL = 1640; // default viewBox width
const ASPECT = 0.75; // viewBox height / width
const GAP = 0.7; // empty slots between branches

type Placed = { node: MindNode; depth: 0 | 1 | 2; angle: number; x: number; y: number; color: number; parent?: string };

// Rounded so server and browser render identical numbers (trig can differ in the last digit).
const round = (v: number) => Math.round(v * 100) / 100;
const polar = (r: number, a: number) => ({ x: round(Math.cos(a) * r * SX), y: round(Math.sin(a) * r) });

function layout(expanded: Set<string>): Placed[] {
  const branches = MINDMAP.children ?? [];
  const slotsFor = (b: MindNode) => (expanded.has(b.id) ? (b.children?.length ?? 1) : 1);
  const total = branches.reduce((s, b) => s + slotsFor(b), 0) + GAP * branches.length;
  const step = (Math.PI * 2) / total;
  const out: Placed[] = [{ node: MINDMAP, depth: 0, angle: 0, x: 0, y: 0, color: 0 }];
  let cursor = -Math.PI / 2 - step * (slotsFor(branches[0]) - 1) * 0.5; // first branch centered at the top
  branches.forEach((b, bi) => {
    const slots = slotsFor(b);
    const angles = Array.from({ length: slots }, (_, i) => cursor + i * step);
    const mid = angles.reduce((a, c) => a + c, 0) / angles.length;
    out.push({ node: b, depth: 1, angle: mid, ...polar(R1, mid), color: bi % 4 });
    if (expanded.has(b.id)) {
      (b.children ?? []).forEach((leaf, li) => out.push({ node: leaf, depth: 2, angle: angles[li], ...polar(R2, angles[li]), color: bi % 4, parent: b.id }));
    }
    cursor += (slots + GAP) * step;
  });
  return out;
}

function edgePath(from: Placed, to: Placed) {
  if (from.depth === 0) {
    const a = { x: round(Math.cos(to.angle) * 66), y: round(Math.sin(to.angle) * 66) };
    return `M ${a.x} ${a.y} C ${polar(R1 * 0.55, to.angle).x} ${polar(R1 * 0.55, to.angle).y} ${polar(R1 * 0.75, to.angle).x} ${polar(R1 * 0.75, to.angle).y} ${to.x} ${to.y}`;
  }
  const mid = (R1 + R2) / 2;
  const s = polar(R1 + 18, from.angle);
  const c1 = polar(mid, from.angle);
  const c2 = polar(mid, to.angle);
  const e = polar(R2 - 8, to.angle);
  return `M ${s.x} ${s.y} C ${c1.x} ${c1.y} ${c2.x} ${c2.y} ${e.x} ${e.y}`;
}

const findPath = (id: string): string[] => {
  for (const b of MINDMAP.children ?? []) {
    if (b.id === id) return ["os", b.id];
    if (b.children?.some((c) => c.id === id)) return ["os", b.id, id];
  }
  return ["os"];
};

const findNode = (id: string): MindNode => {
  if (id === MINDMAP.id) return MINDMAP;
  for (const b of MINDMAP.children ?? []) {
    if (b.id === id) return b;
    const c = b.children?.find((x) => x.id === id);
    if (c) return c;
  }
  return MINDMAP;
};

const ALL_BRANCHES = (MINDMAP.children ?? []).map((b) => b.id);
const EASE = [0.22, 1, 0.36, 1] as const;
const CSS_EASE = "transform 0.5s cubic-bezier(0.22, 1, 0.36, 1), opacity 0.3s";

/* ───────────────────────── Component ───────────────────────── */

export function MindMap() {
  const [expanded, setExpanded] = useState<Set<string>>(() => new Set(ALL_BRANCHES));
  const [selected, setSelected] = useState("os");
  const [hovered, setHovered] = useState<string | null>(null);
  const [view, setView] = useState({ cx: 0, cy: 0, w: FULL });
  const svgRef = useRef<SVGSVGElement>(null);
  const drag = useRef<{ x: number; y: number; cx: number; cy: number; moved: boolean } | null>(null);

  // On narrow screens start zoomed in on the branches.
  useEffect(() => {
    if (window.innerWidth < 640) setView({ cx: 0, cy: 0, w: 900 });
  }, []);

  const placed = useMemo(() => layout(expanded), [expanded]);
  const byId = useMemo(() => Object.fromEntries(placed.map((p) => [p.node.id, p])), [placed]);
  const focusPath = useMemo(() => new Set(findPath(hovered ?? selected)), [hovered, selected]);

  // Smoothly animate the camera; always starts from the current view.
  const viewRef = useRef(view);
  viewRef.current = view;
  const tween = useRef<{ stop: () => void } | null>(null);
  const tweenView = useCallback((to: { cx: number; cy: number; w: number }) => {
    tween.current?.stop();
    const from = viewRef.current;
    tween.current = animate(0, 1, {
      duration: 0.5,
      ease: EASE,
      onUpdate: (t) => setView({ cx: from.cx + (to.cx - from.cx) * t, cy: from.cy + (to.cy - from.cy) * t, w: from.w + (to.w - from.w) * t }),
    });
  }, []);

  const zoom = (f: number) => tweenView({ ...view, w: Math.min(2200, Math.max(420, view.w * f)) });

  // Ctrl/⌘ + wheel (and trackpad pinch) zooms; plain wheel keeps scrolling the page.
  useEffect(() => {
    const el = svgRef.current;
    if (!el) return;
    const onWheel = (e: WheelEvent) => {
      if (!e.ctrlKey && !e.metaKey) return;
      e.preventDefault();
      setView((v) => ({ ...v, w: Math.min(2200, Math.max(420, v.w * (e.deltaY > 0 ? 1.08 : 0.92))) }));
    };
    el.addEventListener("wheel", onWheel, { passive: false });
    return () => el.removeEventListener("wheel", onWheel);
  }, []);

  const onPointerDown = (e: PointerEvent<SVGSVGElement>) => {
    tween.current?.stop();
    drag.current = { x: e.clientX, y: e.clientY, cx: view.cx, cy: view.cy, moved: false };
  };
  const onPointerMove = (e: PointerEvent<SVGSVGElement>) => {
    const d = drag.current;
    if (!d || !svgRef.current) return;
    const dx = e.clientX - d.x;
    const dy = e.clientY - d.y;
    if (!d.moved && Math.hypot(dx, dy) < 4) return;
    if (!d.moved) svgRef.current.setPointerCapture(e.pointerId);
    d.moved = true;
    const scale = view.w / svgRef.current.clientWidth;
    setView((v) => ({ ...v, cx: d.cx - dx * scale, cy: d.cy - dy * scale }));
  };
  const endDrag = () => {
    setTimeout(() => (drag.current = null), 0);
  };

  const select = (id: string) => {
    if (drag.current?.moved) return;
    setSelected(id);
    const isBranch = ALL_BRANCHES.includes(id);
    if (isBranch && !expanded.has(id)) setExpanded((s) => new Set(s).add(id));
    // When zoomed in, glide to the selection.
    const p = byId[id];
    if (p && view.w < FULL * 0.9) tweenView({ cx: p.x * 0.85, cy: p.y * 0.85, w: view.w });
  };

  const toggleBranch = (id: string) =>
    setExpanded((s) => {
      const n = new Set(s);
      if (n.has(id)) n.delete(id);
      else n.add(id);
      return n;
    });

  const onNodeKey = (e: KeyboardEvent, id: string) => {
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      select(id);
    }
  };

  const vh = view.w * ASPECT;
  const vb = `${view.cx - view.w / 2} ${view.cy - vh / 2} ${view.w} ${vh}`;

  return (
    <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_300px]">
      {/* Map */}
      <div className="glass relative overflow-hidden rounded-3xl">
        <div className="absolute left-3 top-3 z-10 flex flex-wrap gap-1.5">
          <ToolBtn label="Zoom in" onClick={() => zoom(0.8)}>
            <Plus size={15} />
          </ToolBtn>
          <ToolBtn label="Zoom out" onClick={() => zoom(1.25)}>
            <Minus size={15} />
          </ToolBtn>
          <ToolBtn label="Reset view" onClick={() => tweenView({ cx: 0, cy: 0, w: FULL })}>
            <Maximize2 size={14} />
          </ToolBtn>
          <ToolBtn label="Expand all" onClick={() => setExpanded(new Set(ALL_BRANCHES))}>
            <Expand size={14} />
          </ToolBtn>
          <ToolBtn label="Collapse all" onClick={() => setExpanded(new Set())}>
            <Shrink size={14} />
          </ToolBtn>
        </div>
        <p className="pointer-events-none absolute bottom-3 left-3 z-10 hidden text-[11px] text-muted sm:block">Drag to pan · Ctrl + scroll to zoom · click a concept</p>

        <svg
          ref={svgRef}
          viewBox={vb}
          className="block aspect-[4/3] max-h-[82vh] w-full cursor-grab touch-none select-none active:cursor-grabbing"
          role="tree"
          aria-label="Operating systems mind map"
          onPointerDown={onPointerDown}
          onPointerMove={onPointerMove}
          onPointerUp={endDrag}
          onPointerLeave={endDrag}
        >
          {/* rings */}
          <ellipse rx={R1 * SX} ry={R1} fill="none" stroke="var(--line)" strokeDasharray="2 6" />
          <ellipse rx={R2 * SX} ry={R2} fill="none" stroke="var(--line)" strokeDasharray="2 6" />

          {/* edges */}
          {placed
            .filter((p) => p.depth > 0)
            .map((p) => {
              const from = p.depth === 1 ? byId.os : byId[p.parent!];
              const on = focusPath.has(p.node.id) && focusPath.has(from.node.id);
              return (
                <motion.path
                  key={`e-${p.node.id}`}
                  initial={{ opacity: 0, d: edgePath(from, p) }}
                  animate={{ opacity: 1, d: edgePath(from, p) }}
                  transition={{ duration: 0.5, ease: EASE }}
                  fill="none"
                  stroke={on ? `var(--p${p.color})` : "var(--line-strong)"}
                  strokeWidth={on ? 2.5 : 1.25}
                  style={{ transition: "stroke 0.25s, stroke-width 0.25s" }}
                />
              );
            })}

          {/* leaves */}
          <AnimatePresence>
            {placed
              .filter((p) => p.depth === 2)
              .map((p) => {
                const deg = round((p.angle * 180) / Math.PI);
                const flip = deg > 90 && deg < 270;
                const status = p.node.topic ? topicStatus(p.node.topic) : "planned";
                const on = selected === p.node.id;
                const lit = focusPath.has(p.node.id);
                return (
                  <motion.g
                    key={p.node.id}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.25 }}
                  >
                    <g
                      role="treeitem"
                      aria-selected={on}
                      tabIndex={0}
                      aria-label={`${p.node.label}${status === "ready" ? ", lesson available" : ""}`}
                      onClick={() => select(p.node.id)}
                      onKeyDown={(e) => onNodeKey(e, p.node.id)}
                      onPointerEnter={() => setHovered(p.node.id)}
                      onPointerLeave={() => setHovered(null)}
                      className="cursor-pointer outline-none"
                      style={{ transform: `translate(${p.x}px, ${p.y}px) rotate(${flip ? deg + 180 : deg}deg)`, transition: CSS_EASE }}
                    >
                      <circle r={on ? 8 : 6} fill={status === "ready" ? `var(--p${p.color})` : "var(--bg)"} stroke={`var(--p${p.color})`} strokeWidth={2} style={{ transition: "r 0.2s" }} />
                      <text
                        x={flip ? -14 : 14}
                        dy="0.35em"
                        textAnchor={flip ? "end" : "start"}
                        fontSize={18}
                        fontWeight={on || lit ? 700 : 500}
                        fill={status === "ready" || lit ? "var(--ink)" : "var(--muted)"}
                        style={{ transition: "fill 0.2s" }}
                      >
                        {p.node.label}
                      </text>
                    </g>
                  </motion.g>
                );
              })}
          </AnimatePresence>

          {/* branches */}
          {placed
            .filter((p) => p.depth === 1)
            .map((p) => {
              const w = p.node.label.length * 11 + 50;
              const on = selected === p.node.id;
              const open = expanded.has(p.node.id);
              return (
                <g
                  key={p.node.id}
                  role="treeitem"
                  aria-expanded={open}
                  aria-selected={on}
                  tabIndex={0}
                  aria-label={p.node.label}
                  onClick={() => select(p.node.id)}
                  onKeyDown={(e) => onNodeKey(e, p.node.id)}
                  onPointerEnter={() => setHovered(p.node.id)}
                  onPointerLeave={() => setHovered(null)}
                  className="cursor-pointer outline-none"
                  style={{ transform: `translate(${p.x}px, ${p.y}px)`, transition: CSS_EASE }}
                >
                  <rect
                    x={-w / 2}
                    y={-24}
                    width={w}
                    height={48}
                    rx={24}
                    style={{
                      fill: `color-mix(in oklab, var(--p${p.color}) ${on ? 34 : 18}%, var(--panel))`,
                      stroke: `var(--p${p.color})`,
                      strokeWidth: on ? 2.5 : 1.5,
                      transition: "fill 0.25s, stroke-width 0.25s",
                    }}
                  />
                  <text textAnchor="middle" x={-6} dy="0.35em" fontSize={19} fontWeight={800} fill="var(--ink)">
                    {p.node.label}
                  </text>
                  <text x={w / 2 - 16} dy="0.35em" textAnchor="middle" fontSize={15} fontWeight={700} fill="var(--muted)">
                    {open ? "−" : "+"}
                  </text>
                </g>
              );
            })}

          {/* root */}
          <g role="treeitem" aria-selected={selected === "os"} tabIndex={0} aria-label="Operating Systems" onClick={() => select("os")} onKeyDown={(e) => onNodeKey(e, "os")} className="cursor-pointer outline-none">
            <circle r={66} style={{ fill: "var(--accent)" }} />
            <circle r={74} fill="none" stroke="var(--accent)" strokeOpacity={0.3} strokeWidth={selected === "os" ? 3 : 1.5} />
            <text textAnchor="middle" y={-6} fontSize={18} fontWeight={900} fill="var(--clay-ink)">
              Operating
            </text>
            <text textAnchor="middle" y={15} fontSize={18} fontWeight={900} fill="var(--clay-ink)">
              Systems
            </text>
          </g>
        </svg>
      </div>

      {/* Details */}
      <InfoPanel id={selected} onSelect={select} expanded={expanded} onToggle={toggleBranch} />
    </div>
  );
}

function ToolBtn({ label, onClick, children }: { label: string; onClick: () => void; children: React.ReactNode }) {
  return (
    <button type="button" onClick={onClick} aria-label={label} title={label} className="neu focus-ring grid h-8 w-8 place-items-center rounded-lg text-ink">
      {children}
    </button>
  );
}

function InfoPanel({ id, onSelect, expanded, onToggle }: { id: string; onSelect: (id: string) => void; expanded: Set<string>; onToggle: (id: string) => void }) {
  const node = findNode(id);
  const path = findPath(id);
  const branch = path[1] ? findNode(path[1]) : null;
  const branchIndex = branch ? ALL_BRANCHES.indexOf(branch.id) : -1;
  const color = branchIndex >= 0 ? `var(--p${branchIndex % 4})` : "var(--accent)";
  const status = node.topic ? topicStatus(node.topic) : null;
  const isBranch = ALL_BRANCHES.includes(id);
  const kids = id === "os" ? MINDMAP.children ?? [] : isBranch ? node.children ?? [] : [];

  return (
    <aside className="glass-strong h-fit rounded-3xl p-5 lg:sticky lg:top-24" aria-live="polite">
      <AnimatePresence mode="wait" initial={false}>
        <motion.div key={id} initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} transition={{ duration: 0.2 }}>
          <div className="flex flex-wrap items-center gap-1.5 text-[10px] font-bold uppercase tracking-wider text-muted">
            {path.map((p, i) => (
              <span key={p} className="flex items-center gap-1.5">
                {i > 0 && <span aria-hidden>›</span>}
                <button type="button" onClick={() => onSelect(p)} className="focus-ring rounded hover:text-ink">
                  {findNode(p).label}
                </button>
              </span>
            ))}
          </div>
          <h2 className="mt-2 text-2xl font-extrabold text-ink">{node.label}</h2>
          <p className="mt-2 text-sm leading-relaxed text-muted">{node.desc}</p>

          {node.topic && status && (
            <div className="mt-4">
              {status === "ready" ? (
                <Link
                  href={`/learn/${node.topic}/${node.section ? `#${node.section}` : ""}`}
                  className="solid focus-ring flex items-center justify-center gap-2 rounded-xl px-4 py-2.5 text-sm font-bold"
                  style={{ ["--c" as string]: color }}
                >
                  Open the lesson <ArrowRight size={16} />
                </Link>
              ) : (
                <Link href={`/roadmap/#${node.topic}`} className="neu focus-ring flex items-center justify-center gap-2 rounded-xl px-4 py-2.5 text-sm font-semibold text-ink">
                  <MapIcon size={15} /> {status === "soon" ? "Lesson coming soon: see roadmap" : "Planned: see roadmap"}
                </Link>
              )}
            </div>
          )}

          {isBranch && (
            <button type="button" onClick={() => onToggle(id)} className="neu focus-ring mt-3 w-full rounded-xl px-4 py-2 text-xs font-semibold text-ink">
              {expanded.has(id) ? "Collapse this branch" : "Expand this branch"}
            </button>
          )}

          {kids.length > 0 && (
            <>
              <p className="mt-5 text-[10px] font-bold uppercase tracking-[0.18em] text-muted">{id === "os" ? "Big ideas" : "Concepts"}</p>
              <div className="mt-2 flex flex-wrap gap-1.5">
                {kids.map((k) => {
                  const st = k.topic ? topicStatus(k.topic) : null;
                  return (
                    <button
                      key={k.id}
                      type="button"
                      onClick={() => onSelect(k.id)}
                      className={`focus-ring rounded-lg px-2.5 py-1 text-xs ${st === "ready" ? "tint font-semibold" : "neu text-ink"}`}
                      style={st === "ready" ? { ["--c" as string]: color } : undefined}
                    >
                      {k.label}
                    </button>
                  );
                })}
              </div>
            </>
          )}
        </motion.div>
      </AnimatePresence>
    </aside>
  );
}
