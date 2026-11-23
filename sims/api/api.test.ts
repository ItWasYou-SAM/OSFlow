import { describe, expect, it } from "vitest";
import { expectValidLines } from "../testUtil";
import { simulateFork } from "./fork";
import { simulateExec, WC_P3 } from "./exec";
import { simulateRedirect, WC_P4 } from "./redirect";
import { CHILD, PARENT } from "./model";

const out = (steps: ReturnType<typeof simulateFork>) => steps.at(-1)!.state.terminal.slice(1).map((t) => t.text);

describe("fork()", () => {
  it("returns the child's PID to the parent and 0 to the child", () => {
    const steps = simulateFork({ wait: false, childFirst: false });
    expectValidLines(steps, "api");
    const after = steps.find((s) => s.state.procs.length === 2 && s.state.procs.every((p) => p.vars.length))!.state;
    expect(after.procs.find((p) => p.pid === PARENT)!.vars).toContainEqual({ k: "rc", v: String(CHILD) });
    expect(after.procs.find((p) => p.pid === CHILD)!.vars).toContainEqual({ k: "rc", v: "0" });
  });

  it("without wait(), output order depends on who runs first", () => {
    const a = out(simulateFork({ wait: false, childFirst: false }));
    const b = out(simulateFork({ wait: false, childFirst: true }));
    expect(a).not.toEqual(b);
    expect([...a].sort()).toEqual([...b].sort());
  });

  it("with wait(), output is the same either way and the parent prints last", () => {
    const a = simulateFork({ wait: true, childFirst: false });
    const b = simulateFork({ wait: true, childFirst: true });
    expectValidLines(a, "api");
    expectValidLines(b, "api");
    expect(out(a)).toEqual(out(b));
    expect(out(a).at(-1)).toMatch(/^parent of/);
    // the parent really blocked in the parent-first order
    expect(a.some((s) => s.state.procs.some((p) => p.pid === PARENT && p.state === "blocked"))).toBe(true);
  });

  it("shows a cursor for both processes after fork", () => {
    const steps = simulateFork({ wait: true, childFirst: false });
    expect(steps.some((s) => (s.cursors ?? []).length === 2)).toBe(true);
  });
});

describe("exec()", () => {
  it("keeps the PID, swaps the program, and never runs the line after exec", () => {
    const steps = simulateExec();
    expectValidLines(steps, "api");
    const child = steps.find((s) => s.state.procs.some((p) => p.image === "wc"))!.state.procs.find((p) => p.image === "wc")!;
    expect(child.pid).toBe(CHILD);
    const text = out(steps);
    expect(text).toContain(WC_P3);
    expect(text.some((t) => t.includes("shouldn't"))).toBe(false);
  });
});

describe("redirection", () => {
  it("open() reuses fd 1, exec keeps it, output lands in the file", () => {
    const steps = simulateRedirect();
    expectValidLines(steps, "api");
    const opened = steps.find((s) => s.state.event === "open()")!.state;
    expect(opened.procs.find((p) => p.pid === CHILD)!.fds.find((f) => f.fd === 1)!.target).toBe("p4.output");
    expect(opened.procs.find((p) => p.pid === PARENT)!.fds.find((f) => f.fd === 1)!.target).toBe("terminal");
    const wcStep = steps.find((s) => s.state.file?.content === WC_P4)!;
    expect(wcStep.state.terminal.some((t) => t.text === WC_P4)).toBe(false);
  });
});
