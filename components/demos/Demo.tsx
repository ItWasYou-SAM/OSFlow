import { loadCode } from "@/lib/highlight";
import type { CodeFile } from "@/lib/sim";
import { CpuDemo } from "./CpuDemo";
import { FetchDemo } from "./FetchDemo";
import { IoDemo } from "./IoDemo";
import { MemDemo } from "./MemDemo";
import { ThreadsDemo } from "./ThreadsDemo";
import { LoadDemo } from "./process/LoadDemo";
import { PcbDemo } from "./process/PcbDemo";
import { StatesDemo } from "./process/StatesDemo";
import { ExecDemo, ForkDemo, RedirectDemo, WaitDemo } from "./api/ApiDemos";

/**
 * Registry of demos usable from MDX as <Demo id="cpu" />.
 * Code is read and syntax-highlighted at build time (server component), then
 * handed to the interactive client component as plain token data.
 */
const DEMOS = {
  fetch: { files: ["intro/add.s"], Component: FetchDemo },
  cpu: { files: ["intro/cpu.c"], Component: CpuDemo },
  mem: { files: ["intro/mem.c"], Component: MemDemo },
  threads: { files: ["intro/threads.c", "intro/counter.s"], Component: ThreadsDemo },
  io: { files: ["intro/io.c"], Component: IoDemo },
  // Chapter 2: The Process
  load: { files: ["process/hello.c"], Component: LoadDemo },
  states: { files: ["process/scheduler.c"], Component: StatesDemo },
  pcb: { files: ["process/proc.h"], Component: PcbDemo },
  // Chapter 3: Process API
  fork: { files: ["api/p1.c"], Component: ForkDemo },
  wait: { files: ["api/p2.c"], Component: WaitDemo },
  exec: { files: ["api/p3.c"], Component: ExecDemo },
  redirect: { files: ["api/p4.c"], Component: RedirectDemo },
} satisfies Record<string, { files: string[]; Component: React.ComponentType<{ files: CodeFile[] }> }>;

export type DemoId = keyof typeof DEMOS;

export async function Demo({ id }: { id: DemoId }) {
  const { files, Component } = DEMOS[id];
  const code = await Promise.all(files.map(loadCode));
  return <Component files={code} />;
}
