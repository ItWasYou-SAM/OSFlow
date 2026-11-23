"use client";

import { useRef, type PointerEvent, type ReactNode } from "react";

/** Card wrapper with a soft glow that follows the cursor on hover. */
export function Spotlight({ className = "", children, color = "var(--accent)" }: { className?: string; children: ReactNode; color?: string }) {
  const ref = useRef<HTMLDivElement>(null);
  const onMove = (e: PointerEvent<HTMLDivElement>) => {
    const el = ref.current;
    if (!el) return;
    const r = el.getBoundingClientRect();
    el.style.setProperty("--mx", `${e.clientX - r.left}px`);
    el.style.setProperty("--my", `${e.clientY - r.top}px`);
  };
  return (
    <div ref={ref} onPointerMove={onMove} className={`group/spot relative overflow-hidden ${className}`}>
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 opacity-0 transition-opacity duration-300 group-hover/spot:opacity-100"
        style={{ background: `radial-gradient(380px circle at var(--mx, 50%) var(--my, 50%), color-mix(in oklab, ${color} 16%, transparent), transparent 65%)` }}
      />
      <div className="relative h-full">{children}</div>
    </div>
  );
}
