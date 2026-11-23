import { Recorder, rng } from "@/lib/sim";

export const THREADS_FILE = "threads.c";
export const ASM_FILE = "counter.s";

export type Op = "load" | "add" | "store";
export type ThreadId = "T1" | "T2";
export type Mode = "safe" | "race" | "random";

export type Thread = {
  id: ThreadId;
  color: number;
  i: number; // completed iterations
  next: Op | "done" | "idle";
  eax: number | null;
  loaded: number | null; // value of counter when this thread loaded it
};

export type ThreadsState = {
  threads: Thread[];
  counter: number;
  running: "main" | ThreadId | null;
  lost: number;
  lostFlash: boolean;
  terminal: { text: string; color: number }[];
  loops: number;
};

export type ThreadsParams = { loops: number; mode: Mode; seed?: number };

const OP_LINE: Record<Op, number> = { load: 2, add: 3, store: 4 };
const OPS: Op[] = ["load", "add", "store"];

/** Build the order in which the two threads execute micro-instructions. */
export function buildSchedule(loops: number, mode: Mode, seed = 1): ThreadId[] {
  const out: ThreadId[] = [];
  if (mode === "safe") {
    for (let i = 0; i < loops; i++) out.push("T1", "T1", "T1", "T2", "T2", "T2");
    return out;
  }
  if (mode === "race") {
    for (let i = 0; i < loops; i++) {
      if (i % 2 === 0) out.push("T1", "T1", "T2", "T2", "T2", "T1");
      else out.push("T1", "T1", "T1", "T2", "T2", "T2");
    }
    return out;
  }
  const rand = rng(seed);
  const left: Record<ThreadId, number> = { T1: loops * 3, T2: loops * 3 };
  let cur: ThreadId = rand() < 0.5 ? "T1" : "T2";
  while (left.T1 + left.T2 > 0) {
    const other: ThreadId = cur === "T1" ? "T2" : "T1";
    if (left[cur] === 0 || (left[other] > 0 && rand() < 0.4)) cur = other;
    out.push(cur);
    left[cur]--;
  }
  return out;
}

export function simulateThreads({ loops, mode, seed = 1 }: ThreadsParams) {
  const s: ThreadsState = {
    threads: [
      { id: "T1", color: 0, i: 0, next: "idle", eax: null, loaded: null },
      { id: "T2", color: 1, i: 0, next: "idle", eax: null, loaded: null },
    ],
    counter: 0,
    running: "main",
    lost: 0,
    lostFlash: false,
    terminal: [{ text: `prompt> ./threads ${loops}`, color: -1 }],
    loops,
  };
  const r = new Recorder<ThreadsState>(THREADS_FILE);
  const byId = (id: ThreadId) => s.threads.find((t) => t.id === id)!;

  r.push(s, 18, `\`main\` reads \`loops = ${loops}\`. Each thread will add 1 to \`counter\` ${loops} times, so we expect ${2 * loops}.`, "user");
  s.terminal.push({ text: "Initial value : 0", color: -1 });
  r.push(s, 20, "`main` prints the initial value of the shared `counter`: 0.", "output");

  (["T1", "T2"] as ThreadId[]).forEach((id, k) => {
    byId(id).next = "load";
    r.push(
      s,
      21 + k,
      `\`Pthread_create\` starts thread **${id}** running \`worker\`. It shares \`counter\` (and all memory) with \`main\` and the other thread, but gets its own registers.`,
      "os",
    );
  });
  r.push(s, 23, "`main` waits in `Pthread_join` while the two workers run.", "os");

  const schedule = buildSchedule(loops, mode, seed);
  let prev: ThreadId | null = null;
  let firstOp = true;

  for (const id of schedule) {
    const t = byId(id);
    if (t.next === "done" || t.next === "idle") continue;
    const op = t.next;
    const switched = prev !== null && prev !== id;
    s.running = id;
    s.lostFlash = false;
    let tag: "user" | "switch" | "danger" = switched ? "switch" : "user";
    const prefix = switched ? `⏱ Switch to **${id}** (its own \`eax\` is restored). ` : "";
    let msg: string;

    if (op === "load") {
      t.eax = s.counter;
      t.loaded = s.counter;
      msg = `${id} loads \`counter\` (${s.counter}) into its \`eax\`.`;
      if (firstOp) msg = `\`counter++\` looks like one step, but the CPU does it in **three** instructions. ${msg}`;
      t.next = "add";
    } else if (op === "add") {
      t.eax = (t.eax ?? 0) + 1;
      msg = `${id} adds 1 in its register: \`eax = ${t.eax}\`. Memory still says ${s.counter}.`;
      t.next = "store";
    } else {
      const before = s.counter;
      const stale = before !== t.loaded;
      s.counter = t.eax ?? s.counter;
      t.i++;
      // Invariant: lost = increments performed so far − value in memory.
      const done = s.threads.reduce((n, th) => n + th.i, 0);
      const lost = done - s.counter;
      const newlyLost = lost - s.lost;
      s.lost = lost;
      if (stale && newlyLost > 0) {
        s.lostFlash = true;
        tag = "danger";
        msg = `${id} stores ${s.counter}, but \`counter\` was already ${before}: the other thread updated it after ${id} loaded. **${newlyLost === 1 ? "One increment is" : `${newlyLost} increments are`} lost!**`;
      } else {
        msg = `${id} stores ${s.counter} back to \`counter\`.`;
      }
      t.eax = null;
      t.loaded = null;
      t.next = t.i >= loops ? "done" : "load";
    }

    r.push(s, OP_LINE[op], prefix + msg, tag, ASM_FILE);
    prev = id;
    firstOp = false;
  }

  s.running = "main";
  s.lostFlash = false;
  r.push(s, [23, 24], "Both workers finish; `Pthread_join` returns and `main` continues.", "os");
  s.terminal.push({ text: `Final value   : ${s.counter}`, color: -1 });
  const expected = 2 * loops;
  r.push(
    s,
    25,
    s.counter === expected
      ? `Final value: ${s.counter}, exactly as expected. This time the threads never interrupted each other mid-update. Lucky! Try the "unlucky timing" or "random" schedule.`
      : `Final value: **${s.counter}**, not ${expected}. ${s.lost} update(s) were lost because \`counter++\` isn't **atomic**. This is a *race condition*, and it's why we need locks.`,
    s.counter === expected ? "success" : "danger",
  );
  return r.steps;
}
