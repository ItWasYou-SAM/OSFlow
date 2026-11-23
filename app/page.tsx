import Link from "next/link";
import { ArrowRight, Code2, Film, Lock, MessageSquareText, Network, Route } from "lucide-react";
import { ChapterProgress } from "@/components/home/ChapterProgress";
import { HeroPlayground } from "@/components/home/HeroPlayground";
import { PiecesTabs } from "@/components/home/PiecesTabs";
import { StatCounter } from "@/components/home/StatCounter";
import { Reveal } from "@/components/ui/Reveal";
import { Spotlight } from "@/components/ui/Spotlight";
import { API_QUIZ } from "@/content/api-data";
import { PARTS, READY_CHAPTERS, chapterNumber } from "@/content/curriculum";
import { INTRO_QUIZ } from "@/content/intro-data";
import { MINDMAP } from "@/content/mindmap";
import { PROCESS_QUIZ } from "@/content/process-data";
import { ALL_TOPICS, STAGES } from "@/content/roadmap";

const HOW = [
  { Icon: Code2, title: "Real code", body: "Short C programs from the classic textbook examples, with the running line highlighted." },
  { Icon: Film, title: "Step-synced animation", body: "Watch the CPU, memory and disk react to every line. Play, pause, rewind, scrub." },
  { Icon: MessageSquareText, title: "Plain-language narration", body: "Each step explains what just happened, and why the OS did it." },
];

export default function Home() {
  const demos = READY_CHAPTERS.reduce((n, c) => n + (c.demos ?? 0), 0);
  const questions = INTRO_QUIZ.length + PROCESS_QUIZ.length + API_QUIZ.length;
  const concepts = (MINDMAP.children ?? []).reduce((n, b) => n + (b.children?.length ?? 0), 0);

  return (
    <div className="mx-auto max-w-6xl px-4 sm:px-6">
      {/* Hero */}
      <section className="grid items-center gap-10 pb-12 pt-12 sm:pt-16 lg:grid-cols-[1.05fr_1fr]">
        <div>
          <Reveal>
            <Link href="/roadmap/" className="glass focus-ring inline-flex items-center gap-2 rounded-full px-3 py-1 text-xs font-semibold text-muted transition-colors hover:text-ink">
              <span className="h-2 w-2 rounded-full bg-success" /> {READY_CHAPTERS.length} chapters live · see the roadmap <ArrowRight size={12} />
            </Link>
          </Reveal>
          <Reveal delay={0.05}>
            <h1 className="mt-5 text-5xl font-bold leading-[1.02] tracking-tight text-ink sm:text-7xl">
              See the <span className="text-gradient">operating system</span> think.
            </h1>
          </Reveal>
          <Reveal delay={0.1}>
            <p className="mt-6 max-w-xl text-lg leading-relaxed text-muted">
              OSFLOW teaches operating systems one concept at a time: real code on one side, an animation of what the machine is doing on the other, stepping
              together line by line. Following <em>Operating Systems: Three Easy Pieces</em>.
            </p>
          </Reveal>
          <Reveal delay={0.15}>
            <div className="mt-8 flex flex-wrap items-center gap-3">
              <Link href="/learn/introduction/" className="solid focus-ring inline-flex items-center gap-2 rounded-2xl px-6 py-3.5 font-bold transition-opacity hover:opacity-90">
                Start Chapter 1 <ArrowRight size={18} />
              </Link>
              <Link href="/roadmap/" className="neu focus-ring inline-flex items-center gap-2 rounded-2xl px-5 py-3.5 text-sm font-semibold text-ink">
                <Route size={16} /> Roadmap
              </Link>
              <Link href="/mindmap/" className="neu focus-ring inline-flex items-center gap-2 rounded-2xl px-5 py-3.5 text-sm font-semibold text-ink">
                <Network size={16} /> Mind map
              </Link>
            </div>
          </Reveal>
          <Reveal delay={0.2}>
            <p className="mt-6 text-sm text-muted">
              <span className="text-ink">Try it →</span> click a process to schedule it, or add one with <span className="font-mono">+</span>.
            </p>
          </Reveal>
        </div>
        <Reveal delay={0.1}>
          <HeroPlayground />
        </Reveal>
      </section>

      {/* Stats */}
      <Reveal>
        <section aria-label="OSFLOW in numbers" className="glass grid grid-cols-2 gap-y-8 rounded-3xl px-4 py-8 sm:grid-cols-4">
          <StatCounter value={READY_CHAPTERS.length} label="chapters live" />
          <StatCounter value={demos} label="interactive demos" />
          <StatCounter value={questions} label="quiz questions" />
          <StatCounter value={ALL_TOPICS.length} label="roadmap topics" />
        </section>
      </Reveal>

      {/* Three easy pieces */}
      <section aria-labelledby="pieces" className="py-16">
        <Reveal>
          <p id="pieces" className="text-center text-sm font-bold uppercase tracking-[0.25em] text-[var(--kicker)]">
            Three easy pieces
          </p>
          <h2 className="mx-auto mt-3 max-w-2xl text-center text-3xl font-bold tracking-tight text-ink sm:text-4xl">Everything an OS does fits into three ideas</h2>
        </Reveal>
        <Reveal delay={0.05}>
          <div className="mt-8">
            <PiecesTabs />
          </div>
        </Reveal>
      </section>

      {/* How it works */}
      <section aria-labelledby="how" className="py-10">
        <Reveal>
          <h2 id="how" className="text-3xl font-bold tracking-tight text-ink sm:text-4xl">
            How every lesson works
          </h2>
        </Reveal>
        <div className="mt-8 grid gap-4 md:grid-cols-3">
          {HOW.map(({ Icon, title, body }, i) => (
            <Reveal key={title} delay={i * 0.06} className="h-full">
              <Spotlight className="glass h-full rounded-3xl p-6">
                <div className="flex items-center gap-3">
                  <span className="tint grid h-11 w-11 place-items-center rounded-2xl" style={{ ["--c" as string]: `var(--p${i})` }}>
                    <Icon size={20} />
                  </span>
                  <span className="font-mono text-sm text-muted">0{i + 1}</span>
                </div>
                <h3 className="mt-4 text-lg font-bold text-ink">{title}</h3>
                <p className="mt-1.5 leading-relaxed text-muted">{body}</p>
              </Spotlight>
            </Reveal>
          ))}
        </div>
      </section>

      {/* Explore: roadmap + mind map */}
      <section aria-labelledby="explore" className="py-14">
        <Reveal>
          <h2 id="explore" className="text-3xl font-bold tracking-tight text-ink sm:text-4xl">
            See the whole subject
          </h2>
          <p className="mt-2 max-w-2xl text-muted">Two maps of the same territory: one tells you what to learn next, the other shows how everything connects.</p>
        </Reveal>
        <div className="mt-8 grid gap-4 md:grid-cols-2">
          <Reveal className="h-full">
            <Link href="/roadmap/" className="focus-ring block h-full rounded-3xl">
              <Spotlight className="glass h-full rounded-3xl p-6" color="var(--p1)">
                <RoadmapPreview />
                <div className="mt-5 flex items-center justify-between">
                  <div>
                    <h3 className="text-xl font-bold text-ink">Learning roadmap</h3>
                    <p className="text-sm text-muted">
                      {ALL_TOPICS.length} topics in {STAGES.length} stages, in the order to learn them.
                    </p>
                  </div>
                  <ArrowRight className="shrink-0 text-muted" />
                </div>
              </Spotlight>
            </Link>
          </Reveal>
          <Reveal delay={0.06} className="h-full">
            <Link href="/mindmap/" className="focus-ring block h-full rounded-3xl">
              <Spotlight className="glass h-full rounded-3xl p-6" color="var(--p2)">
                <MindmapPreview />
                <div className="mt-5 flex items-center justify-between">
                  <div>
                    <h3 className="text-xl font-bold text-ink">Concept mind map</h3>
                    <p className="text-sm text-muted">{concepts} concepts around six big ideas, each linked to its lesson.</p>
                  </div>
                  <ArrowRight className="shrink-0 text-muted" />
                </div>
              </Spotlight>
            </Link>
          </Reveal>
        </div>
      </section>

      {/* Learning path */}
      <section id="path" aria-labelledby="path-h" className="scroll-mt-24 py-14">
        <Reveal>
          <h2 id="path-h" className="text-3xl font-bold tracking-tight text-ink sm:text-4xl">
            The learning path
          </h2>
          <p className="mt-2 max-w-2xl text-muted">
            One concept at a time, in the same order as OSTEP. New chapters unlock as they&apos;re built.{" "}
            <Link href="/roadmap/" className="text-accent underline underline-offset-4">
              Full roadmap →
            </Link>
          </p>
        </Reveal>

        <div className="mt-10 space-y-12">
          {PARTS.map((part) => (
            <div key={part.id}>
              <Reveal>
                <div className="mb-4 flex items-center gap-3">
                  <span className="h-3 w-3 rounded-full" style={{ background: part.color }} aria-hidden />
                  <h3 className="text-xl font-bold text-ink">{part.title}</h3>
                  <span className="hidden text-sm text-muted sm:inline">· {part.blurb}</span>
                </div>
              </Reveal>
              <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                {part.chapters.map((ch, i) => {
                  const n = chapterNumber(ch.slug);
                  const ready = ch.status === "ready";
                  const card = (
                    <Spotlight className={`glass h-full rounded-3xl p-5 transition-colors ${ready ? "hover:border-[var(--line-strong)]" : "opacity-60"}`} color={part.color}>
                      <div className="flex items-center justify-between">
                        <span className="font-mono text-xs font-bold text-muted">
                          {String(n).padStart(2, "0")} · {ch.ostep}
                        </span>
                        {ready ? (
                          <span className="tint rounded-full px-2 py-0.5 text-[10px] font-black uppercase" style={{ ["--c" as string]: "var(--p2)" }}>
                            Ready
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 text-[10px] font-bold uppercase text-muted">
                            <Lock size={10} /> Soon
                          </span>
                        )}
                      </div>
                      <h4 className="mt-3 text-lg font-bold leading-snug text-ink">{ch.title}</h4>
                      <p className="mt-1.5 text-sm leading-relaxed text-muted">{ch.summary}</p>
                      {ready && (
                        <div className="mt-4 flex items-center justify-between">
                          <ChapterProgress slug={ch.slug} />
                          <ArrowRight size={18} className="text-muted transition-colors group-hover/spot:text-ink" />
                        </div>
                      )}
                    </Spotlight>
                  );
                  return (
                    <Reveal key={ch.slug} delay={Math.min(i, 5) * 0.04} className="h-full">
                      <Link
                        href={ready ? `/learn/${ch.slug}/` : `/roadmap/#${ch.slug}`}
                        className="focus-ring block h-full rounded-3xl"
                        aria-label={ready ? undefined : `${ch.title} (coming soon): view on roadmap`}
                      >
                        {card}
                      </Link>
                    </Reveal>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}

/** Tiny static sketch of the roadmap: spine, stages and branches. */
function RoadmapPreview() {
  return (
    <div aria-hidden className="neu-inset relative rounded-2xl px-4 py-4">
      <div className="absolute bottom-3 left-1/2 top-3 w-0.5 -translate-x-1/2 bg-[var(--line-strong)]" />
      <div className="relative space-y-3">
        {STAGES.slice(0, 4).map((s) => (
          <div key={s.id} className="grid grid-cols-[1fr_auto_1fr] items-center gap-3">
            <div className="flex flex-col items-end gap-1">
              {s.left.slice(0, 2).map((t) => (
                <span key={t.id} className="neu h-3 w-16 rounded" />
              ))}
            </div>
            <span className="tint rounded-lg px-3 py-1 text-[11px] font-bold" style={{ ["--c" as string]: s.color }}>
              {s.title}
            </span>
            <div className="flex flex-col items-start gap-1">
              {s.right.slice(0, 2).map((t) => (
                <span key={t.id} className="neu h-3 w-16 rounded" />
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

/** Tiny static sketch of the radial mind map. */
function MindmapPreview() {
  const branches = MINDMAP.children ?? [];
  const leafAngle = (a: number, k: number, len: number) => a + (k - (len - 1) / 2) * 0.13;
  return (
    <div aria-hidden className="neu-inset grid place-items-center rounded-2xl py-2">
      <svg viewBox="-150 -100 300 200" className="h-[172px] w-full">
        {branches.map((b, i) => {
          const a = (i / branches.length) * Math.PI * 2 - Math.PI / 2;
          const bx = Math.cos(a) * 62;
          const by = Math.sin(a) * 62;
          const kids = b.children ?? [];
          return (
            <g key={b.id}>
              <line x1={0} y1={0} x2={bx} y2={by} stroke="var(--line-strong)" />
              {kids.map((c, k) => {
                const la = leafAngle(a, k, kids.length);
                return (
                  <g key={c.id}>
                    <line x1={bx} y1={by} x2={Math.cos(la) * 92} y2={Math.sin(la) * 92} stroke="var(--line)" />
                    <circle cx={Math.cos(la) * 92} cy={Math.sin(la) * 92} r={2.5} fill={`var(--p${i % 4})`} />
                  </g>
                );
              })}
              <circle cx={bx} cy={by} r={9} style={{ fill: `color-mix(in oklab, var(--p${i % 4}) 30%, var(--panel))`, stroke: `var(--p${i % 4})` }} />
            </g>
          );
        })}
        <circle r={18} fill="var(--accent)" />
      </svg>
    </div>
  );
}
