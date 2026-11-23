import { Recorder } from "@/lib/sim";

export const LOAD_FILE = "hello.c";

export type Status = "on disk" | "loading" | "running" | "exited";

export type LoadState = {
  status: Status;
  pid: number | null;
  /** Which part of the setup is happening (drives highlights). */
  focus: "disk" | "code" | "data" | "stack" | "heap" | "fds" | "regs" | null;
  code: boolean;
  data: { total: number | null };
  heap: { addr: string; value: number | null }[];
  stack: { name: string; value: string }[];
  fds: { fd: number; name: string; target: string }[];
  regs: { pc: string; sp: string };
  terminal: { text: string; color: number }[];
};

export const ARGS = ["./hello", "os", "flow"];

export function simulateLoad() {
  const argc = ARGS.length;
  const s: LoadState = {
    status: "on disk",
    pid: null,
    focus: "disk",
    code: false,
    data: { total: null },
    heap: [],
    stack: [],
    fds: [],
    regs: { pc: "—", sp: "—" },
    terminal: [{ text: `prompt> ${ARGS.join(" ")}`, color: -1 }],
  };
  const r = new Recorder<LoadState>(LOAD_FILE);

  r.push(
    s,
    [],
    "A **program** is just a file on disk: machine instructions plus some static data, stored in an executable format (ELF on Linux). It does nothing until the OS turns it into a **process**.",
    "user",
  );

  s.status = "loading";
  s.pid = 4242;
  s.focus = "code";
  s.code = true;
  r.push(
    s,
    [6, 12],
    "The OS creates process **4242** and **loads the code** from disk into the process's memory. Modern OSes do this *lazily*, bringing in pieces only when they're needed (you'll see how in *Paging*).",
    "os",
  );

  s.focus = "data";
  s.data.total = 0;
  r.push(s, 4, "Initialized **static data** like the global `total = 0` is copied into memory too, in the *data* segment.", "os");

  s.focus = "stack";
  s.stack = [
    { name: "argc", value: String(argc) },
    { name: "argv", value: `[${ARGS.map((a) => `"${a}"`).join(", ")}]` },
  ];
  s.regs.sp = "0x7ffc";
  r.push(
    s,
    6,
    `The OS allocates the **stack** (for local variables, arguments and return addresses) and fills in \`main\`'s arguments: \`argc = ${argc}\` and \`argv\`.`,
    "os",
  );

  s.focus = "heap";
  r.push(s, [], "It also sets up a (still empty) **heap** for memory the program will ask for at run time with `malloc()`.", "os");

  s.focus = "fds";
  s.fds = [
    { fd: 0, name: "stdin", target: "terminal" },
    { fd: 1, name: "stdout", target: "terminal" },
    { fd: 2, name: "stderr", target: "terminal" },
  ];
  r.push(
    s,
    [],
    "On UNIX every process starts with three open **file descriptors**: 0 (standard input), 1 (standard output) and 2 (standard error), all wired to your terminal here.",
    "os",
  );

  s.focus = "regs";
  s.status = "running";
  s.regs.pc = "main";
  r.push(
    s,
    6,
    "Last step: the OS sets the **program counter** to `main()` and hands over the CPU. The process is now **running**.",
    "switch",
  );

  s.focus = "stack";
  s.stack.push({ name: "n", value: String(argc) });
  s.regs.pc = "main+4";
  r.push(s, 7, `\`n\` is a local variable, so it lives in \`main\`'s **stack** frame: \`n = ${argc}\`.`, "user");

  s.focus = "heap";
  s.heap.push({ addr: "0x5a10", value: null });
  s.stack.push({ name: "p", value: "0x5a10" });
  s.regs.pc = "main+9";
  r.push(
    s,
    8,
    "`malloc` grabs 4 bytes from the **heap** and returns their address. The pointer `p` itself sits on the stack; what it points to lives on the heap.",
    "user",
  );

  s.heap[0].value = argc * 10;
  s.regs.pc = "main+14";
  r.push(s, 9, `\`*p = n * 10\` writes ${argc * 10} into the heap block.`, "user");

  s.focus = "data";
  s.data.total = argc * 10;
  s.regs.pc = "main+19";
  r.push(s, 10, `\`total += *p\` updates the global in the **data** segment: \`total = ${argc * 10}\`.`, "user");

  s.focus = "fds";
  s.terminal.push({ text: `total = ${argc * 10}`, color: 0 });
  s.regs.pc = "main+25";
  r.push(s, 11, "`printf` ends up in a `write()` system call on **fd 1**, which is the terminal.", "output");

  s.focus = null;
  s.status = "exited";
  s.regs = { pc: "—", sp: "—" };
  r.push(
    s,
    12,
    "`return 0` ends the process. The OS reclaims its memory and other resources, and keeps just the exit status until the parent (the shell) collects it.",
    "success",
  );
  return r.steps;
}
