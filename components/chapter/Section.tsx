import type { ReactNode } from "react";
import { Reveal } from "@/components/ui/Reveal";

export function Section({ id, n, title, kicker, children }: { id: string; n: string; title: string; kicker?: string; children: ReactNode }) {
  return (
    <section id={id} data-section className="scroll-mt-28 pt-14 first:pt-4">
      <Reveal>
        <div className="mb-6 flex items-center gap-4">
          <span className="tint grid h-12 w-12 shrink-0 place-items-center rounded-2xl font-mono text-sm font-black" style={{ ["--c" as string]: `var(--p${(Number(n) - 1) % 4})` }}>
            {n}
          </span>
          <div>
            {kicker && <p className="text-xs font-bold uppercase tracking-[0.2em] text-muted">{kicker}</p>}
            <h2 className="text-2xl font-extrabold tracking-tight text-ink sm:text-3xl">{title}</h2>
          </div>
        </div>
      </Reveal>
      <div className="prose-os">{children}</div>
    </section>
  );
}
