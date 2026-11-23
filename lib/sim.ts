/**
 * Core model for every OSFLOW demo.
 *
 * A simulator is a pure function `simulate(params) => Step[]`. Each Step is a
 * full, immutable snapshot of the simulated machine plus the code line(s) that
 * produced it and a plain-language explanation. The player only moves an
 * index through this array, which gives us free rewind/scrub/step-back and
 * makes every demo unit-testable.
 */

export type StepTag = "user" | "os" | "switch" | "output" | "danger" | "success";

/** A per-process marker in the code gutter (e.g. parent and child after fork()). */
export type Cursor = { line: number; color: number; label: string };

export type Step<S> = {
  /** Which code file the highlighted lines belong to (also the tab shown). */
  file: string;
  /** 1-based line numbers to highlight. Empty = no highlight. */
  lines: number[];
  state: S;
  /** Narration. Text wrapped in `backticks` is rendered as code. */
  narration: string;
  tag?: StepTag;
  /** Where each live process is in `file`, when several run the same code. */
  cursors?: Cursor[];
};

export type CodeToken = {
  content: string;
  light?: string;
  dark?: string;
  italic?: boolean;
};

export type CodeFile = {
  name: string;
  lang: string;
  lines: CodeToken[][];
};

export function clone<S>(s: S): S {
  return structuredClone(s);
}

/** Small helper that snapshots state every time a step is recorded. */
export class Recorder<S> {
  readonly steps: Step<S>[] = [];
  constructor(private readonly defaultFile: string) {}

  push(
    state: S,
    lines: number | number[],
    narration: string,
    tag?: StepTag,
    file?: string,
    cursors?: Cursor[],
  ): void {
    this.steps.push({
      file: file ?? this.defaultFile,
      lines: Array.isArray(lines) ? lines : [lines],
      state: clone(state),
      narration,
      tag,
      ...(cursors && cursors.length ? { cursors } : {}),
    });
  }
}

/** Deterministic PRNG (mulberry32) so "random" interleavings are replayable. */
export function rng(seed: number): () => number {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}
