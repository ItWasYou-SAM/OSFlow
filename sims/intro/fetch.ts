import { Recorder } from "@/lib/sim";

export const FETCH_FILE = "add.s";

export type Phase = "idle" | "fetch" | "decode" | "execute" | "halt";
export type Bus = "none" | "instr" | "data-in" | "data-out";

export type FetchState = {
  pc: number; // index of the next instruction
  phase: Phase;
  ir: string | null; // instruction register
  decoded: string | null;
  eax: number | null;
  x: number; // value of memory word 0x1000
  bus: Bus;
  cycles: number;
};

export const PROGRAM = [
  { text: "mov 0x1000, %eax", decoded: "LOAD [0x1000]→eax", line: 2 },
  { text: "add $2, %eax", decoded: "ADD eax+2→eax", line: 3 },
  { text: "mov %eax, 0x1000", decoded: "STORE eax→[0x1000]", line: 4 },
] as const;

export const addr = (i: number) => `0x${(0x400 + i * 4).toString(16)}`;

export function simulateFetch(initialX = 5) {
  const s: FetchState = {
    pc: 0,
    phase: "idle",
    ir: null,
    decoded: null,
    eax: null,
    x: initialX,
    bus: "none",
    cycles: 0,
  };
  const r = new Recorder<FetchState>(FETCH_FILE);

  r.push(
    s,
    1,
    `Memory holds both the program (3 instructions) and the data (\`x = ${initialX}\`). The program counter (PC) points at the first instruction.`,
    "user",
  );

  PROGRAM.forEach((ins, i) => {
    s.phase = "fetch";
    s.bus = "instr";
    s.ir = ins.text;
    s.decoded = null;
    r.push(
      s,
      ins.line,
      `**Fetch:** the CPU reads the instruction stored at PC = \`${addr(i)}\` from memory into its instruction register.`,
      "user",
    );

    s.phase = "decode";
    s.bus = "none";
    s.decoded = ins.decoded;
    r.push(s, ins.line, `**Decode:** the CPU figures out what \`${ins.text}\` means: ${ins.decoded}.`, "user");

    s.phase = "execute";
    if (i === 0) {
      s.eax = s.x;
      s.bus = "data-in";
      r.push(s, ins.line, `**Execute:** the value ${s.x} travels from memory into register \`eax\`.`, "user");
    } else if (i === 1) {
      s.eax = (s.eax ?? 0) + 2;
      s.bus = "none";
      r.push(s, ins.line, `**Execute:** the ALU adds 2. \`eax\` is now ${s.eax}. Memory is unchanged so far.`, "user");
    } else {
      s.x = s.eax ?? s.x;
      s.bus = "data-out";
      r.push(s, ins.line, `**Execute:** \`eax\` (${s.eax}) is written back to memory. \`x\` is now ${s.x}.`, "user");
    }
    s.pc = i + 1;
    s.cycles++;
  });

  s.phase = "halt";
  s.bus = "none";
  s.ir = null;
  s.decoded = null;
  r.push(
    s,
    [],
    "That's all a CPU does: fetch, decode, execute, billions of times a second. Nothing here shares the machine between programs or keeps them safe from each other. That's the operating system's job.",
    "success",
  );
  return r.steps;
}
