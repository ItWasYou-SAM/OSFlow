import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, ArrowRight, BookOpen, Clock } from "lucide-react";
import { ChapterToc } from "@/components/chapter/ChapterToc";
import { ALL_CHAPTERS, READY_CHAPTERS, chapterNumber, getChapter } from "@/content/curriculum";

// Each ready chapter maps to its MDX module. Add a line here when a chapter ships.
const CONTENT: Record<string, () => Promise<{ default: React.ComponentType }>> = {
  introduction: () => import("@/content/chapters/introduction.mdx"),
  processes: () => import("@/content/chapters/processes.mdx"),
  "process-api": () => import("@/content/chapters/process-api.mdx"),
};

export const dynamicParams = false;

export function generateStaticParams() {
  return READY_CHAPTERS.map((c) => ({ chapter: c.slug }));
}

type Props = { params: Promise<{ chapter: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const ch = getChapter((await params).chapter);
  return ch ? { title: ch.title, description: ch.summary } : {};
}

export default async function ChapterPage({ params }: Props) {
  const { chapter: slug } = await params;
  const ch = getChapter(slug);
  const load = CONTENT[slug];
  if (!ch || ch.status !== "ready" || !load) notFound();
  const { default: Content } = await load();

  const idx = ALL_CHAPTERS.findIndex((c) => c.slug === slug);
  const next = ALL_CHAPTERS[idx + 1];
  const prev = ALL_CHAPTERS[idx - 1];

  return (
    <div className="mx-auto max-w-6xl px-4 sm:px-6">
      {/* Chapter hero */}
      <header className="pb-6 pt-12 sm:pt-16">
        <Link href="/#path" className="focus-ring mb-6 inline-flex items-center gap-1.5 rounded-lg text-sm text-muted hover:text-ink">
          <ArrowLeft size={14} /> All chapters
        </Link>
        <div className="flex flex-wrap items-center gap-2 text-xs font-semibold">
          <span className="tint rounded-full px-3 py-1" style={{ ["--c" as string]: "var(--p0)" }}>
            Chapter {chapterNumber(slug)}
          </span>
          <span className="glass inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-muted">
            <BookOpen size={12} /> {ch.ostep}
          </span>
          {ch.minutes && (
            <span className="glass inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-muted">
              <Clock size={12} /> ~{ch.minutes} min
            </span>
          )}
        </div>
        <h1 className="mt-4 max-w-3xl text-4xl font-black leading-[1.05] tracking-tight text-ink sm:text-6xl">
          {ch.title.split(" ").slice(0, -2).join(" ")} <span className="text-gradient">{ch.title.split(" ").slice(-2).join(" ")}</span>
        </h1>
        <p className="mt-4 max-w-2xl text-lg leading-relaxed text-muted">{ch.summary}</p>
      </header>

      <div className="grid gap-8 lg:grid-cols-[210px_minmax(0,1fr)]">
        <aside>{ch.sections && <ChapterToc sections={ch.sections} />}</aside>
        <article className="min-w-0">
          <Content />

          <nav className="mt-16 grid gap-3 sm:grid-cols-2" aria-label="Chapter navigation">
            {prev ? (
              <Link href={`/learn/${prev.slug}/`} className="glass focus-ring rounded-3xl p-5">
                <span className="text-xs text-muted">← Previous</span>
                <p className="font-bold text-ink">{prev.title}</p>
              </Link>
            ) : (
              <span />
            )}
            {next && (
              <div className="glass rounded-3xl p-5 text-right sm:col-start-2">
                <span className="inline-flex items-center gap-1 text-xs text-muted">
                  Next {next.status === "soon" && "· coming soon"} <ArrowRight size={12} />
                </span>
                {next.status === "ready" ? (
                  <Link href={`/learn/${next.slug}/`} className="focus-ring block font-bold text-ink">
                    {next.title}
                  </Link>
                ) : (
                  <p className="font-bold text-ink">{next.title}</p>
                )}
                <p className="mt-1 text-sm text-muted">{next.summary}</p>
              </div>
            )}
          </nav>
        </article>
      </div>
    </div>
  );
}
