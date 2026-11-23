import { Recorder } from "@/lib/sim";

export const CPU_FILE = "cpu.c";
export const SLICE = 0.5; // seconds of CPU a process gets per time slice
const NAMES = ["A", "B", "C", "D"];

export type CpuProc = {
  name: string;
  color: number;
  status: "ready" | "running";
  spin: number; // progress through the current Spin(1), 0..1
  prints: number;
};

export type CpuState = {
  procs: CpuProc[];
  running: string | null;
  terminal: { text: string; color: number }[];
  clock: number; // wall-clock seconds
  switches: number;
};

export type CpuParams = { n: number; rounds: number };

export function simulateCpu({ n, rounds }: CpuParams) {
  const names = NAMES.slice(0, Math.max(1, Math.min(NAMES.length, n)));
  const multi = names.length > 1;
  const command = multi ? names.map((x) => `./cpu ${x} &`).join(" ") : `./cpu ${names[0]}`;

  const s: CpuState = {
    procs: [],
    running: null,
    terminal: [{ text: `prompt> ${command}`, color: -1 }],
    clock: 0,
    switches: 0,
  };
  const r = new Recorder<CpuState>(CPU_FILE);

  r.push(
    s,
    [],
    multi
      ? `You launch ${names.length} copies of the same program at once, on a machine with only **one** CPU.`
      : "You run a single copy of `cpu`. The machine has exactly one physical CPU.",
    "user",
  );

  names.forEach((name, i) => {
    s.procs.push({ name, color: i, status: "ready", spin: 0, prints: 0 });
    r.push(
      s,
      10,
      `The OS creates process **${name}**: it loads the code, sets up memory and passes \`argv[1] = "${name}"\`. ${name} waits in the ready queue.`,
      "os",
    );
  });

  const target = names.length * Math.max(1, rounds);
  let total = 0;
  let turn = 0;
  let prev: string | null = null;

  while (total < target) {
    const p = s.procs[turn % s.procs.length];
    turn++;

    if (prev !== p.name) {
      for (const q of s.procs) q.status = "ready";
      p.status = "running";
      s.running = p.name;
      if (prev) s.switches++;
      r.push(
        s,
        p.spin > 0 ? 12 : 11,
        prev
          ? `⏱ **Timer interrupt!** The OS pauses ${prev}, saves its registers, and restores ${p.name}'s. This is a *context switch*.`
          : `The scheduler picks **${p.name}** and gives it the CPU.`,
        "switch",
      );
      prev = p.name;
    }

    p.spin = Math.min(1, p.spin + SLICE);
    s.clock += SLICE;
    r.push(s, 12, `${p.name} runs \`Spin(1)\`: ${Math.round(p.spin * 100)}% of its one second of work is done.`, "user");

    if (p.spin >= 1) {
      p.spin = 0;
      p.prints++;
      total++;
      s.terminal.push({ text: p.name, color: p.color });
      r.push(
        s,
        13,
        multi
          ? `${p.name} prints "${p.name}". From ${p.name}'s point of view it simply ran for one second. It has no idea it shared the CPU.`
          : `${p.name} prints "${p.name}", then loops around to spin again.`,
        "output",
      );
    }
  }

  s.running = null;
  for (const q of s.procs) q.status = "ready";
  r.push(
    s,
    [],
    multi
      ? `After ${s.clock}s of real time every process has printed ${rounds} time(s). With ${s.switches} quick switches, one CPU looked like ${names.length}. That is **virtualizing the CPU**.`
      : "One process, one CPU: no sharing needed. Now try 4 processes and watch the OS juggle them.",
    "success",
  );
  return r.steps;
}
