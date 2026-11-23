"use client";

import { useEffect, useState } from "react";

const KEY = "osflow:progress";

export type ChapterProgress = { quizBest?: number; quizTotal?: number; visited?: boolean };
type Store = Record<string, ChapterProgress>;

function read(): Store {
  try {
    return JSON.parse(localStorage.getItem(KEY) ?? "{}") as Store;
  } catch {
    return {};
  }
}

export function saveProgress(slug: string, patch: ChapterProgress) {
  try {
    const all = read();
    const prev = all[slug] ?? {};
    const next = { ...prev, ...patch };
    if (patch.quizBest !== undefined) next.quizBest = Math.max(prev.quizBest ?? 0, patch.quizBest);
    all[slug] = next;
    localStorage.setItem(KEY, JSON.stringify(all));
    window.dispatchEvent(new Event("osflow-progress"));
  } catch {
    /* storage unavailable: progress simply isn't remembered */
  }
}

export function useProgress(slug: string): ChapterProgress {
  const [p, setP] = useState<ChapterProgress>({});
  useEffect(() => {
    const sync = () => setP(read()[slug] ?? {});
    sync();
    window.addEventListener("osflow-progress", sync);
    window.addEventListener("storage", sync);
    return () => {
      window.removeEventListener("osflow-progress", sync);
      window.removeEventListener("storage", sync);
    };
  }, [slug]);
  return p;
}

/** Progress for every chapter at once (for maps and overviews). */
export function useAllProgress(): Record<string, ChapterProgress> {
  const [all, setAll] = useState<Record<string, ChapterProgress>>({});
  useEffect(() => {
    const sync = () => setAll(read());
    sync();
    window.addEventListener("osflow-progress", sync);
    window.addEventListener("storage", sync);
    return () => {
      window.removeEventListener("osflow-progress", sync);
      window.removeEventListener("storage", sync);
    };
  }, []);
  return all;
}
