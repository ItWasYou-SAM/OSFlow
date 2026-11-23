"use client";

import { animate, useInView } from "framer-motion";
import { useEffect, useRef, useState } from "react";

/** Counts up to `value` the first time it scrolls into view. */
export function StatCounter({ value, label }: { value: number; label: string }) {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, margin: "-40px" });
  const [shown, setShown] = useState(0);
  useEffect(() => {
    if (!inView) return;
    const ctl = animate(0, value, { duration: 1.1, ease: [0.22, 1, 0.36, 1], onUpdate: (v) => setShown(Math.round(v)) });
    return () => ctl.stop();
  }, [inView, value]);
  return (
    <div ref={ref} className="text-center">
      <div className="font-mono text-4xl font-black tabular-nums text-ink sm:text-5xl" aria-hidden>
        {shown}
      </div>
      <div className="mt-1 text-xs font-semibold uppercase tracking-[0.18em] text-muted">
        <span className="sr-only">{value} </span>
        {label}
      </div>
    </div>
  );
}
