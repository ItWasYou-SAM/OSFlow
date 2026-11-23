import { Recorder } from "@/lib/sim";

export const MEM_FILE = "mem.c";
export const FRAME_COUNT = 8;

export type MemProc = {
  pid: number;
  color: number;
  vaddr: string | null;
  frame: number | null;
  value: number | null;
};

export type Frame = { owner: number | null; label: string | null; value: number | null };

export type MemState = {
  procs: MemProc[];
  frames: Frame[];
  running: number | null; // pid
  terminal: { text: string; color: number }[];
  lastWrite: number | null; // frame index
  aslr: boolean;
};

export type MemParams = { aslr: boolean; iterations: number };

const PIDS = [24113, 24114];
const PHYS_FRAMES = [5, 2]; // where each process's page really lives
const VADDR_FIXED = "0x200000";
const VADDR_ASLR = ["0x55d0a2c012a0", "0x5611e94a52a0"];

export function simulateMem({ aslr, iterations }: MemParams) {
  const frames: Frame[] = Array.from({ length: FRAME_COUNT }, (_, i) =>
    i < 2 ? { owner: null, label: "OS", value: null } : { owner: null, label: null, value: null },
  );
  const s: MemState = {
    procs: PIDS.map((pid, i) => ({ pid, color: i, vaddr: null, frame: null, value: null })),
    frames,
    running: null,
    terminal: [{ text: "prompt> ./mem & ./mem &", color: -1 }],
    lastWrite: null,
    aslr,
  };
  const r = new Recorder<MemState>(MEM_FILE);
  r.push(
    s,
    [],
    "Two copies of `mem` start at the same time. Both run the exact same code. Physical memory (right) is one big array shared by everyone.",
    "user",
  );

  const switchTo = (i: number, why: string) => {
    s.running = s.procs[i].pid;
    r.push(s, [], why, "switch");
  };

  // Setup: each process allocates, prints, zeroes.
  s.procs.forEach((p, i) => {
    switchTo(i, `The OS runs process **${p.pid}**.`);

    p.vaddr = aslr ? VADDR_ASLR[i] : VADDR_FIXED;
    p.frame = PHYS_FRAMES[i];
    s.frames[p.frame] = { owner: i, label: String(p.pid), value: null };
    r.push(
      s,
      8,
      `\`malloc\` hands ${p.pid} a pointer \`${p.vaddr}\`. Behind the scenes the OS backs it with physical frame **#${p.frame}**.`,
      "os",
    );

    s.terminal.push({ text: `(${p.pid}) address pointed to by p: ${p.vaddr}`, color: i });
    r.push(
      s,
      [10, 11],
      i === 1 && !aslr
        ? `${p.pid} prints its address and it is **the same** as the other process's: \`${p.vaddr}\`. Yet they live in different physical frames.`
        : `${p.pid} prints the address it was given: \`${p.vaddr}\`.`,
      "output",
    );

    p.value = 0;
    s.frames[p.frame].value = 0;
    s.lastWrite = p.frame;
    r.push(s, 12, `\`*p = 0\`: the write goes to virtual \`${p.vaddr}\`, which the hardware translates to frame #${p.frame}.`, "user");
    s.lastWrite = null;
  });

  // Loop: alternate increments.
  for (let it = 0; it < iterations; it++) {
    s.procs.forEach((p, i) => {
      switchTo(i, `⏱ Context switch → **${p.pid}**. Its address mappings are switched in too.`);
      p.value = (p.value ?? 0) + 1;
      s.frames[p.frame!].value = p.value;
      s.lastWrite = p.frame;
      r.push(
        s,
        15,
        `${p.pid} does \`*p = *p + 1\` → ${p.value}. Only frame #${p.frame} changes; the other process's value is untouched.`,
        "user",
      );
      s.terminal.push({ text: `(${p.pid}) p: ${p.value}`, color: i });
      r.push(s, 16, `${p.pid} prints \`p: ${p.value}\`.`, "output");
      s.lastWrite = null;
    });
  }

  s.running = null;
  r.push(
    s,
    [],
    aslr
      ? "With address-space randomization on, the addresses differ, but the lesson holds: each process gets its own **private virtual address space**, and the OS maps it onto separate physical memory."
      : "Same address, different values. Each process has its own **private virtual address space**; the OS (with hardware help) maps it onto separate physical memory. That is **virtualizing memory**.",
    "success",
  );
  return r.steps;
}
