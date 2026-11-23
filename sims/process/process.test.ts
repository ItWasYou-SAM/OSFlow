import { describe, expect, it } from "vitest";
import { expectValidLines } from "../testUtil";
import { simulateLoad } from "./load";
import { simulateStates } from "./states";
import { simulatePcb } from "./pcb";

describe("process creation", () => {
  it("builds code, data, stack, heap and fds before running main", () => {
    const steps = simulateLoad();
    expectValidLines(steps, "process");
    const firstRunning = steps.findIndex((s) => s.state.status === "running");
    const st = steps[firstRunning].state;
    expect(st.code).toBe(true);
    expect(st.data.total).toBe(0);
    expect(st.fds.map((f) => f.fd)).toEqual([0, 1, 2]);
    expect(st.stack.map((v) => v.name)).toEqual(["argc", "argv"]);
    const end = steps.at(-1)!.state;
    expect(end.status).toBe("exited");
    expect(end.terminal.at(-1)!.text).toBe("total = 30");
  });
});

describe("process states", () => {
  it("CPU-only: both finish, never blocked, 100% busy", () => {
    const steps = simulateStates({ io: false, overlap: true });
    expectValidLines(steps, "process");
    const end = steps.at(-1)!.state;
    expect(end.procs.every((p) => p.state === "done")).toBe(true);
    expect(end.idle).toBe(0);
    expect(steps.some((s) => s.state.procs.some((p) => p.state === "blocked"))).toBe(false);
  });

  it("overlapping I/O keeps the CPU busy and finishes sooner", () => {
    const over = simulateStates({ io: true, overlap: true }).at(-1)!.state;
    const serial = simulateStates({ io: true, overlap: false }).at(-1)!.state;
    expect(over.idle).toBe(0);
    expect(serial.idle).toBeGreaterThan(0);
    expect(over.t).toBeLessThan(serial.t);
    expect(over.busy).toBe(serial.busy); // same work either way
  });

  it("at most one process is running at any time", () => {
    for (const st of simulateStates({ io: true, overlap: true })) {
      expect(st.state.procs.filter((p) => p.state === "running").length).toBeLessThanOrEqual(1);
    }
  });
});

describe("PCB & context switch", () => {
  it("saves and restores registers through struct context", () => {
    const steps = simulatePcb();
    expectValidLines(steps, "process");
    const restoreB = steps.find((s) => s.state.transfer === "restore" && s.state.owner === 3)!;
    const b = restoreB.state.procs.find((p) => p.pid === 3)!;
    expect(restoreB.state.cpu).toEqual(b.context);
    const end = steps.at(-1)!.state;
    expect(end.procs.find((p) => p.pid === 2)!.state).toBe("UNUSED");
  });
});
