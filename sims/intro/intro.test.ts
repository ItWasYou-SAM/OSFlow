import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import type { Step } from "@/lib/sim";
import { simulateFetch } from "./fetch";
import { simulateCpu } from "./cpu";
import { simulateMem } from "./mem";
import { buildSchedule, simulateThreads } from "./threads";
import { simulateIo, MESSAGE } from "./io";

const lineCount = (file: string) =>
  readFileSync(join(__dirname, "../../content/code/intro", file), "utf8").trimEnd().split("\n").length;

function expectValidLines(steps: Step<unknown>[]) {
  expect(steps.length).toBeGreaterThan(2);
  for (const st of steps) {
    const n = lineCount(st.file);
    for (const l of st.lines) {
      expect(l).toBeGreaterThanOrEqual(1);
      expect(l).toBeLessThanOrEqual(n);
    }
    expect(st.narration.length).toBeGreaterThan(0);
  }
}

describe("fetch-decode-execute", () => {
  it("computes x = x + 2 and goes through each phase", () => {
    const steps = simulateFetch(5);
    expectValidLines(steps);
    expect(steps.at(-1)!.state.x).toBe(7);
    expect(steps.filter((s) => s.state.phase === "fetch")).toHaveLength(3);
  });
});

describe("cpu virtualization", () => {
  it("prints every letter `rounds` times and context switches", () => {
    const steps = simulateCpu({ n: 4, rounds: 2 });
    expectValidLines(steps);
    const end = steps.at(-1)!.state;
    expect(end.terminal.slice(1).map((t) => t.text).sort().join("")).toBe("AABBCCDD");
    expect(end.switches).toBeGreaterThan(4);
    // never more than one process running
    for (const st of steps) expect(st.state.procs.filter((p) => p.status === "running").length).toBeLessThanOrEqual(1);
  });

  it("a single process never context switches", () => {
    const end = simulateCpu({ n: 1, rounds: 3 }).at(-1)!.state;
    expect(end.switches).toBe(0);
    expect(end.terminal).toHaveLength(4);
  });

  it("snapshots are independent (immutable history)", () => {
    const steps = simulateCpu({ n: 2, rounds: 1 });
    expect(steps[0].state.procs).toHaveLength(0);
  });
});

describe("memory virtualization", () => {
  it("same virtual address, different physical frames and values evolve independently", () => {
    const steps = simulateMem({ aslr: false, iterations: 3 });
    expectValidLines(steps);
    const end = steps.at(-1)!.state;
    const [a, b] = end.procs;
    expect(a.vaddr).toBe(b.vaddr);
    expect(a.frame).not.toBe(b.frame);
    expect(end.frames[a.frame!].value).toBe(3);
    expect(end.frames[b.frame!].value).toBe(3);
  });

  it("ASLR gives different virtual addresses", () => {
    const [a, b] = simulateMem({ aslr: true, iterations: 1 }).at(-1)!.state.procs;
    expect(a.vaddr).not.toBe(b.vaddr);
  });
});

describe("concurrency", () => {
  it("safe schedule yields 2 * loops", () => {
    const steps = simulateThreads({ loops: 5, mode: "safe" });
    expectValidLines(steps);
    expect(steps.at(-1)!.state.counter).toBe(10);
    expect(steps.at(-1)!.state.lost).toBe(0);
  });

  it("race schedule loses updates and accounts for every one", () => {
    const end = simulateThreads({ loops: 5, mode: "race" }).at(-1)!.state;
    expect(end.counter).toBeLessThan(10);
    expect(end.counter + end.lost).toBe(10);
  });

  it("random schedule is deterministic per seed and complete", () => {
    for (const seed of [1, 7, 42, 99]) {
      const sched = buildSchedule(4, "random", seed);
      expect(sched.filter((t) => t === "T1")).toHaveLength(12);
      expect(sched.filter((t) => t === "T2")).toHaveLength(12);
      expect(buildSchedule(4, "random", seed)).toEqual(sched);
      const end = simulateThreads({ loops: 4, mode: "random", seed }).at(-1)!.state;
      expect(end.counter + end.lost).toBe(8);
    }
  });
});

describe("persistence", () => {
  it("fsync makes the data durable", () => {
    const steps = simulateIo({ crash: false });
    expectValidLines(steps);
    const end = steps.at(-1)!.state;
    expect(end.disk).toEqual({ inode: true, data: MESSAGE });
    expect(end.cache.dirty).toBe(false);
  });

  it("crash before fsync loses the file", () => {
    const end = simulateIo({ crash: true }).at(-1)!.state;
    expect(end.crashed).toBe(true);
    expect(end.disk).toEqual({ inode: false, data: null });
  });
});
