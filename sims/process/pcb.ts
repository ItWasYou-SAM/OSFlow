import { Recorder } from "@/lib/sim";

export const PCB_FILE = "proc.h";

export type XvState = "UNUSED" | "EMBRYO" | "SLEEPING" | "RUNNABLE" | "RUNNING" | "ZOMBIE";
export type Regs = { eip: string; esp: string; ebx: string; ebp: string };
export type Field = "state" | "pid" | "parent" | "mem" | "ofile" | "context" | "chan" | "all" | null;

export type Pcb = {
  pid: number;
  name: string;
  color: number;
  state: XvState;
  parent: number | null;
  mem: string;
  ofile: string;
  chan: string | null;
  context: Regs;
};

export type PcbState = {
  cpu: Regs;
  owner: number | null; // pid whose registers are in the CPU
  procs: Pcb[];
  focus: { pid: number | null; field: Field };
  transfer: "save" | "restore" | null;
};

const zero: Regs = { eip: "0", esp: "0", ebx: "0", ebp: "0" };

export function simulatePcb() {
  const s: PcbState = {
    cpu: { eip: "0x1a40", esp: "0x7fe0", ebx: "5", ebp: "0x7ff8" },
    owner: 2,
    procs: [
      { pid: 1, name: "init", color: 2, state: "SLEEPING", parent: null, mem: "0x0000", ofile: "0,1,2", chan: "wait", context: { eip: "0x0f20", esp: "0x2fd0", ebx: "0", ebp: "0x2ff0" } },
      { pid: 2, name: "A", color: 0, state: "RUNNING", parent: 1, mem: "0x4000", ofile: "0,1,2", chan: null, context: { ...zero } },
      { pid: 3, name: "B", color: 1, state: "RUNNABLE", parent: 1, mem: "0x8000", ofile: "0,1,2,3", chan: null, context: { eip: "0x2c10", esp: "0x6fd8", ebx: "17", ebp: "0x6ff0" } },
    ],
    focus: { pid: null, field: "all" },
    transfer: null,
  };
  const r = new Recorder<PcbState>(PCB_FILE);
  const P = (pid: number) => s.procs.find((p) => p.pid === pid)!;
  const at = (pid: number | null, field: Field) => (s.focus = { pid, field });

  r.push(
    s,
    [20, 33],
    "The OS keeps a **process list**: one `struct proc` per process. This structure is often called a **Process Control Block (PCB)**. Here is xv6's.",
    "os",
  );

  at(null, "pid");
  r.push(s, 25, "Each process has a unique **process ID** (PID). That's how you name it in `kill`, `wait` and `ps`.", "os");

  at(null, "state");
  r.push(
    s,
    [15, 16, 24],
    "The **state** field records what it's doing. xv6 has six: `UNUSED` (free slot), `EMBRYO` (being created), `SLEEPING` (blocked), `RUNNABLE` (ready), `RUNNING` and `ZOMBIE` (exited, not yet collected).",
    "os",
  );

  at(null, "mem");
  r.push(s, [21, 22], "`mem` and `sz` describe where the process's memory lives and how big it is.", "os");

  at(null, "parent");
  r.push(s, 26, "`parent` points at the process that created it. Here `init` (PID 1) is everyone's parent.", "os");

  at(null, "ofile");
  r.push(s, 29, "`ofile` is the table of **open files**. File descriptors 0, 1, 2… are indexes into this array.", "os");

  at(2, "context");
  r.push(
    s,
    [3, 11, 31],
    "`context` is a spare copy of the registers. A *running* process keeps its real register values **in the CPU**, so A's saved context is stale right now.",
    "os",
  );

  // A runs a bit
  at(null, null);
  s.cpu = { eip: "0x1a58", esp: "0x7fd8", ebx: "6", ebp: "0x7ff8" };
  r.push(s, [], "Process **A** is running: the CPU's registers change as it executes instructions.", "user");

  // Timer interrupt: save A
  at(2, "context");
  s.transfer = "save";
  P(2).context = { ...s.cpu };
  r.push(
    s,
    [4, 11, 31],
    "⏱ **Timer interrupt.** To stop A, the OS **saves** the CPU registers into `A->context`, exactly the registers listed in `struct context`.",
    "switch",
  );

  at(2, "state");
  s.transfer = null;
  P(2).state = "RUNNABLE";
  s.owner = null;
  r.push(s, 24, "A's state becomes `RUNNABLE`: it's ready to run, just not running right now.", "os");

  at(3, "state");
  P(3).state = "RUNNING";
  r.push(s, 24, "The scheduler picks **B** and marks it `RUNNING`…", "os");

  at(3, "context");
  s.transfer = "restore";
  s.cpu = { ...P(3).context };
  s.owner = 3;
  r.push(s, [4, 11, 31], "…and **restores** `B->context` into the CPU. When the interrupt returns, B continues exactly where it left off. That is a **context switch**.", "switch");

  at(null, null);
  s.transfer = null;
  s.cpu = { eip: "0x2c34", esp: "0x6fd0", ebx: "18", ebp: "0x6ff0" };
  r.push(s, [], "B runs.", "user");

  at(3, "chan");
  s.transfer = "save";
  P(3).context = { ...s.cpu };
  P(3).state = "SLEEPING";
  P(3).chan = "disk";
  s.owner = null;
  r.push(
    s,
    [24, 27],
    "B calls `read()` on a file and must wait for the disk. The OS saves its registers, marks it `SLEEPING` (blocked) and records **what** it's waiting for in `chan`.",
    "os",
  );

  at(2, "context");
  s.transfer = "restore";
  P(2).state = "RUNNING";
  s.cpu = { ...P(2).context };
  s.owner = 2;
  r.push(s, [24, 31], "Nothing else to do but A, so the OS restores A's context and A resumes.", "switch");

  at(2, "state");
  s.transfer = null;
  P(2).state = "ZOMBIE";
  s.owner = null;
  s.cpu = { ...zero };
  r.push(
    s,
    [15, 16, 24],
    "A calls `exit()`. It becomes a **`ZOMBIE`**: its memory is freed, but the PCB stays so its parent can read the exit status.",
    "os",
  );

  at(2, "all");
  P(2).state = "UNUSED";
  P(1).state = "RUNNING";
  P(1).chan = null;
  s.owner = 1;
  s.cpu = { ...P(1).context };
  r.push(
    s,
    [15, 24],
    "The parent (`init`) calls `wait()`, collects A's status, and the slot goes back to `UNUSED`. A process is fully gone only after its parent has *waited* for it.",
    "success",
  );
  return r.steps;
}
