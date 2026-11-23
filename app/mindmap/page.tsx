import type { Metadata } from "next";
import Link from "next/link";
import { MindMap } from "@/components/mindmap/MindMap";
import { Reveal } from "@/components/ui/Reveal";
import { MINDMAP } from "@/content/mindmap";
import { topicStatus } from "@/content/roadmap";

export const metadata: Metadata = {
  title: "Mind map",
  description: "An interactive mind map of operating system concepts, linked to OSFLOW's lessons and roadmap.",
};

export default function MindmapPage() {
  const branches = MINDMAP.children ?? [];
  const concepts = branches.reduce((n, b) => n + (b.children?.length ?? 0), 0);
  return (
    <div className="mx-auto max-w-[1400px] px-4 sm:px-6">
      <header className="pb-8 pt-12 sm:pt-16">
        <Reveal>
          <p className="font-mono text-xs font-bold uppercase tracking-[0.25em] text-muted">Mind map</p>
          <h1 className="mt-3 max-w-3xl text-4xl font-black leading-[1.05] tracking-tight text-ink sm:text-6xl">
            Every idea, <span className="text-gradient">connected</span>
          </h1>
          <p className="mt-4 max-w-2xl text-lg leading-relaxed text-muted">
            {concepts} core concepts grouped into {branches.length} big ideas. Filled dots have an interactive lesson; hollow ones are on the{" "}
            <Link href="/roadmap/" className="text-accent underline underline-offset-4">
              roadmap
            </Link>
            . Click any concept to see what it means and where to learn it.
          </p>
        </Reveal>
      </header>

      <MindMap />

      {/* Accessible / mobile-friendly outline of the same map */}
      <section aria-labelledby="outline" className="mt-14">
        <h2 id="outline" className="text-2xl font-extrabold tracking-tight text-ink">
          Outline view
        </h2>
        <p className="mt-1 text-sm text-muted">The same map as a list.</p>
        <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {branches.map((b, i) => (
            <div key={b.id} className="glass rounded-3xl p-5">
              <div className="flex items-center gap-2">
                <span className="h-3 w-3 rounded-full" style={{ background: `var(--p${i % 4})` }} />
                <h3 className="font-bold text-ink">{b.label}</h3>
              </div>
              <p className="mt-1 text-xs leading-relaxed text-muted">{b.desc}</p>
              <ul className="mt-3 space-y-1">
                {(b.children ?? []).map((c) => {
                  const st = c.topic ? topicStatus(c.topic) : "planned";
                  const href = st === "ready" ? `/learn/${c.topic}/${c.section ? `#${c.section}` : ""}` : `/roadmap/#${c.topic}`;
                  return (
                    <li key={c.id}>
                      <Link href={href} className="focus-ring flex items-center gap-2 rounded-lg px-1 py-0.5 text-sm hover:bg-[var(--code-hl)]">
                        <span
                          className="h-2 w-2 shrink-0 rounded-full border-2"
                          style={{ borderColor: `var(--p${i % 4})`, background: st === "ready" ? `var(--p${i % 4})` : "transparent" }}
                        />
                        <span className={st === "ready" ? "text-ink" : "text-muted"}>{c.label}</span>
                      </Link>
                    </li>
                  );
                })}
              </ul>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
