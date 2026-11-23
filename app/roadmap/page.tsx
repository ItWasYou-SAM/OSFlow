import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, Network } from "lucide-react";
import { RoadmapMap } from "@/components/roadmap/RoadmapMap";
import { Reveal } from "@/components/ui/Reveal";
import { ALL_TOPICS, STAGES, TOPIC_ORDER, topicStatus } from "@/content/roadmap";

export const metadata: Metadata = {
  title: "Roadmap",
  description: "The complete operating systems learning roadmap, from processes to file systems, linked to OSFLOW's interactive lessons.",
};

export default function RoadmapPage() {
  const ready = ALL_TOPICS.filter((t) => topicStatus(t.id) === "ready").length;
  const core = ALL_TOPICS.filter((t) => t.kind === "core").length;
  return (
    <div className="mx-auto max-w-6xl px-4 sm:px-6">
      <header className="pb-4 pt-12 sm:pt-16">
        <Reveal>
          <p className="font-mono text-xs font-bold uppercase tracking-[0.25em] text-muted">Learning roadmap</p>
          <h1 className="mt-3 max-w-3xl text-4xl font-black leading-[1.05] tracking-tight text-ink sm:text-6xl">
            The road to <span className="text-gradient">understanding an OS</span>
          </h1>
          <p className="mt-4 max-w-2xl text-lg leading-relaxed text-muted">
            {ALL_TOPICS.length} topics in six stages, in the order OSTEP teaches them. Follow the spine from top to bottom, and click any box to see what it covers and
            jump into its lesson.
          </p>
        </Reveal>

        <Reveal delay={0.05}>
          <div className="mt-8 flex flex-wrap items-center gap-x-6 gap-y-3">
            <div className="glass flex items-center gap-3 rounded-2xl px-4 py-2.5">
              <div className="neu-inset h-2 w-32 overflow-hidden rounded-full">
                <div className="h-full rounded-full bg-success" style={{ width: `${(ready / ALL_TOPICS.length) * 100}%` }} />
              </div>
              <span className="text-sm text-muted">
                <span className="font-bold text-ink">{ready}</span> of {ALL_TOPICS.length} lessons live
              </span>
            </div>
            <Legend />
          </div>
        </Reveal>
      </header>

      <RoadmapMap />

      {/* Explanation of the whole map */}
      <section aria-labelledby="reading" className="mt-16">
        <Reveal>
          <h2 id="reading" className="text-3xl font-extrabold tracking-tight text-ink sm:text-4xl">
            Reading the map
          </h2>
          <div className="prose-os mt-4">
            <p>
              The roadmap follows the three &ldquo;easy pieces&rdquo; of OSTEP: <strong>virtualization</strong> (CPU and memory), <strong>concurrency</strong> and{" "}
              <strong>persistence</strong>, preceded by foundations and followed by optional advanced topics. Each stage builds on the ones above it, so going
              top to bottom is the smoothest path.
            </p>
            <p>
              The <strong>{core} core topics</strong> (solid boxes) form the backbone that every OS course covers. <strong>Optional topics</strong> (dashed
              boxes) go deeper. Skip them on a first pass and come back later. Numbers give the suggested order, a green dot means the interactive lesson is
              live, and a check mark means you&apos;ve completed its quiz.
            </p>
          </div>
        </Reveal>

        <div className="mt-10 space-y-6">
          {STAGES.map((s, i) => (
            <Reveal key={s.id}>
              <article id={`about-${s.id}`} className="glass scroll-mt-28 rounded-3xl p-5 sm:p-7">
                <div className="flex items-center gap-3">
                  <span className="tint grid h-10 w-10 place-items-center rounded-xl font-mono text-sm font-black" style={{ ["--c" as string]: s.color }}>
                    {i + 1}
                  </span>
                  <h3 className="text-xl font-extrabold text-ink">{s.title}</h3>
                </div>
                <div className="mt-3 space-y-3 text-[15px] leading-relaxed text-muted">
                  {s.explain.map((p, k) => (
                    <p key={k}>{p}</p>
                  ))}
                </div>
                <div className="mt-4 flex flex-wrap gap-2">
                  {[...s.left, ...s.right].map((t) => {
                    const st = topicStatus(t.id);
                    return st === "ready" ? (
                      <Link key={t.id} href={`/learn/${t.id}/`} className="solid focus-ring inline-flex items-center gap-1.5 rounded-lg px-2.5 py-1 text-xs font-semibold" style={{ ["--c" as string]: s.color }}>
                        {TOPIC_ORDER[t.id]}. {t.title} <ArrowRight size={12} />
                      </Link>
                    ) : (
                      <a key={t.id} href={`#${t.id}`} className={`neu focus-ring inline-flex items-center gap-1.5 rounded-lg px-2.5 py-1 text-xs ${t.kind === "optional" ? "border-dashed text-muted" : "text-ink"}`}>
                        {TOPIC_ORDER[t.id]}. {t.title}
                      </a>
                    );
                  })}
                </div>
              </article>
            </Reveal>
          ))}
        </div>

        <Reveal>
          <Link href="/mindmap/" className="glass focus-ring mt-10 flex items-center gap-4 rounded-3xl p-5 transition-colors hover:border-[var(--line-strong)]">
            <span className="tint grid h-12 w-12 place-items-center rounded-2xl" style={{ ["--c" as string]: "var(--p2)" }}>
              <Network size={22} />
            </span>
            <span className="flex-1">
              <span className="block font-bold text-ink">Prefer the big picture?</span>
              <span className="block text-sm text-muted">Explore the same ideas as an interactive mind map of concepts.</span>
            </span>
            <ArrowRight className="text-muted" />
          </Link>
        </Reveal>
      </section>
    </div>
  );
}

function Legend() {
  const item = (el: React.ReactNode, label: string) => (
    <span className="flex items-center gap-2 text-xs text-muted">
      {el}
      {label}
    </span>
  );
  return (
    <div className="flex flex-wrap items-center gap-x-4 gap-y-2">
      {item(<span className="h-2 w-2 rounded-full bg-success" />, "Lesson live")}
      {item(<span className="h-2 w-2 rounded-full" style={{ background: "var(--p3)" }} />, "Coming soon")}
      {item(<span className="h-2 w-2 rounded-full" style={{ background: "var(--line-strong)" }} />, "Planned")}
      {item(<span className="h-4 w-7 rounded-md border border-[var(--line-strong)]" />, "Core")}
      {item(<span className="h-4 w-7 rounded-md border border-dashed border-[var(--line-strong)]" />, "Optional")}
    </div>
  );
}
