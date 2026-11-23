import { Recorder } from "@/lib/sim";

export const STATES_FILE = "scheduler.c";
export const IO_TICKS = 3;

export type PState = "ready" | "running" | "blocked" | "done";
export type Transition = "scheduled" | "descheduled" | "io-start" | "io-done" | "finish" | null;

export type SProc = {
  name: string;
  color: number;
  state: PState;
  /** Remaining work: "cpu" ticks and at most one "io" request. */
  ops: ("cpu" | "io")[];
  ioLeft: number;
};

export type TraceRow = { t: number; states: PState[]; note: string };

export type StatesState = {
  t: number;
  procs: SProc[];
  rows: TraceRow[];
  busy: number;
  idle: number;
  transitions: Transition[];
};

export type StatesParams = { io: boolean; overlap: boolean };

const LINE: Record<Exclude<Transition, null>, number> = {
  scheduled: 9,
  descheduled: 16,
  "io-start": 12,
  "io-done": 22,
  finish: 14,
};

export function simulateStates({ io, overlap }: StatesParams) {
  const s: StatesState = {
    t: 0,
    procs: [
      { name: "P0", color: 0, state: "ready", ops: io ? ["cpu", "cpu", "io", "cpu", "cpu"] : ["cpu", "cpu", "cpu", "cpu"], ioLeft: 0 },
      { name: "P1", color: 1, state: "ready", ops: ["cpu", "cpu", "cpu", "cpu"], ioLeft: 0 },
    ],
    rows: [],
    busy: 0,
    idle: 0,
    transitions: [],
  };
  const r = new Recorder<StatesState>(STATES_FILE);

  r.push(
    s,
    [],
    io
      ? `Two processes are **ready**. P0 will compute, start a disk read that takes ${IO_TICKS} ticks, then compute some more. P1 only computes.`
      : "Two processes are **ready**, and both only use the CPU. There's one CPU, so only one of them can be **running** at a time.",
    "user",
  );

  const running = () => s.procs.find((p) => p.state === "running");
  const notes: string[] = [];

  while (s.procs.some((p) => p.state !== "done") && s.t < 30) {
    s.t++;
    s.transitions = [];
    notes.length = 0;
    const lines: number[] = [];

    // I/O progresses on the device in parallel with the CPU.
    for (const p of s.procs) {
      if (p.state === "blocked") {
        p.ioLeft--;
        if (p.ioLeft === 0) {
          p.state = "ready";
          s.transitions.push("io-done");
          lines.push(LINE["io-done"]);
          notes.push(`${p.name}'s I/O done`);
        }
      }
    }

    // Pick someone if the CPU is free.
    let cur = running();
    if (!cur) {
      // With overlap: run any ready process. Without: run processes strictly one
      // after another, so if the current one is blocked the CPU just idles.
      const next = overlap ? s.procs.find((p) => p.state === "ready") : s.procs.find((p) => p.state !== "done");
      if (next && next.state === "ready") {
        next.state = "running";
        s.transitions.push("scheduled");
        lines.push(LINE.scheduled);
        cur = next;
      }
    }

    if (cur) {
      const op = cur.ops.shift();
      s.busy++;
      if (op === "io") {
        cur.state = "blocked";
        cur.ioLeft = IO_TICKS;
        s.transitions.push("io-start");
        lines.push(LINE["io-start"]);
        notes.push(`${cur.name} initiates I/O`);
      } else if (cur.ops.length === 0) {
        cur.state = "done";
        s.transitions.push("finish");
        lines.push(LINE.finish);
        notes.push(`${cur.name} is done`);
      }
    } else {
      s.idle++;
      lines.push(6);
      notes.push("CPU idle");
    }

    // The row shows who was running during this tick.
    const rowStates = s.procs.map((p) => (p === cur && (p.state === "blocked" || p.state === "done") ? "running" : p.state));
    s.rows.push({ t: s.t, states: rowStates, note: notes.join(", ") });

    const who = cur ? `**${cur.name}** runs on the CPU` : "**Nobody** runs: the CPU is idle";
    const extra = s.transitions.includes("io-start")
      ? `. It issues a disk read, so it moves **Running → Blocked**${overlap ? " and the OS can run someone else" : ""}.`
      : s.transitions.includes("io-done") && s.transitions.includes("scheduled")
        ? `. Meanwhile the disk finished, so P0 moved **Blocked → Ready**.`
        : s.transitions.includes("io-done")
          ? `. The disk finished, so P0 moves **Blocked → Ready**.`
          : s.transitions.includes("finish")
            ? `. ${cur!.name} has no more work and finishes.`
            : s.transitions.includes("scheduled")
              ? `. The scheduler moved it **Ready → Running**.`
              : !cur && s.procs.some((p) => p.state === "blocked")
                ? ` while P0 waits for the disk${overlap ? "" : ", because this OS doesn't switch on I/O"}.`
                : ".";
    r.push(s, lines.length ? Array.from(new Set(lines)) : [10], `Time ${s.t}: ${who}${extra}`, s.transitions.includes("io-start") ? "os" : cur ? "user" : "danger");
  }

  s.transitions = [];
  const util = Math.round((s.busy / s.t) * 100);
  r.push(
    s,
    [],
    io
      ? overlap
        ? `Finished in ${s.t} ticks with the CPU busy ${util}% of the time. Running P1 while P0 was blocked **overlapped** I/O with computation.`
        : `Finished in ${s.t} ticks, CPU busy only ${util}% of the time. The CPU sat idle while P0 waited. Turn on "switch on I/O" to fix that.`
      : `Finished in ${s.t} ticks, CPU busy ${util}% of the time. Each process simply ran until it was done.`,
    io && !overlap ? "danger" : "success",
  );
  return r.steps;
}
