import { Recorder, type Cursor, type StepTag } from "@/lib/sim";

export type ApiPState = "running" | "ready" | "blocked" | "zombie" | "exited";

export type Fd = { fd: number; target: string };

export type ApiProc = {
  pid: number;
  role: "parent" | "child";
  color: number;
  state: ApiPState;
  /** Program the process is currently running (changes on exec). */
  image: string;
  /** Line it is at in the shown source file; null once it runs another program. */
  line: number | null;
  vars: { k: string; v: string }[];
  fds: Fd[];
};

export type ApiState = {
  procs: ApiProc[];
  terminal: { text: string; color: number }[];
  file: { name: string; content: string | null } | null;
  /** Short label for the current OS event (fork, exec, …) shown in the visual. */
  event: string | null;
};

export const PARENT = 29146;
export const CHILD = 29147;
export const STD_FDS: Fd[] = [
  { fd: 0, target: "terminal" },
  { fd: 1, target: "terminal" },
  { fd: 2, target: "terminal" },
];

/** Recorder that also emits a gutter cursor for every live process running `program`. */
export class ApiRecorder extends Recorder<ApiState> {
  constructor(
    private readonly file: string,
    private readonly program: string,
  ) {
    super(file);
  }

  step(s: ApiState, lines: number | number[], narration: string, tag?: StepTag) {
    const cursors: Cursor[] = s.procs
      .filter((p) => p.line !== null && p.image === this.program && p.state !== "exited" && p.state !== "zombie")
      .map((p) => ({ line: p.line!, color: p.color, label: p.role === "parent" ? "P" : "C" }));
    this.push(s, lines, narration, tag, this.file, cursors);
  }
}

export function setVar(p: ApiProc, k: string, v: string) {
  const found = p.vars.find((x) => x.k === k);
  if (found) found.v = v;
  else p.vars.push({ k, v });
}

export function newParent(image: string, line: number): ApiProc {
  return { pid: PARENT, role: "parent", color: 0, state: "running", image, line, vars: [], fds: STD_FDS.map((f) => ({ ...f })) };
}

/** fork(): an almost exact copy of the parent, starting life inside fork(). */
export function forkChild(parent: ApiProc): ApiProc {
  return {
    ...structuredClone(parent),
    pid: CHILD,
    role: "child",
    color: 1,
    state: "ready",
  };
}

export function run(s: ApiState, pid: number) {
  for (const p of s.procs) if (p.state === "running") p.state = "ready";
  s.procs.find((p) => p.pid === pid)!.state = "running";
}
