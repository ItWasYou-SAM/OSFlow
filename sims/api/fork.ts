import { ApiRecorder, CHILD, PARENT, forkChild, newParent, run, setVar, type ApiState } from "./model";

export type ForkParams = { wait: boolean; childFirst: boolean };

const LINES = {
  p1: { hello: 6, fork: 7, child: 12, childPrint: 14, parent: 15, wait: -1, parentPrint: [17, 18], ret: 20 },
  p2: { hello: 7, fork: 8, child: 12, childPrint: 13, parent: 14, wait: 15, parentPrint: [16, 17], ret: 19 },
};

export function simulateFork({ wait, childFirst }: ForkParams) {
  const prog = wait ? "p2" : "p1";
  const L = LINES[prog];
  const r = new ApiRecorder(`${prog}.c`, prog);
  const parent = newParent(prog, L.hello);
  const s: ApiState = { procs: [parent], terminal: [{ text: `prompt> ./${prog}`, color: -1 }], file: null, event: null };
  const P = () => s.procs.find((p) => p.pid === PARENT)!;
  const C = () => s.procs.find((p) => p.pid === CHILD)!;

  r.step(s, L.hello, `The shell starts \`${prog}\` as process **${PARENT}**. It begins running \`main\`.`, "os");

  s.terminal.push({ text: `hello (pid:${PARENT})`, color: 0 });
  r.step(s, L.hello, `It prints a greeting with its PID. So far, nothing unusual.`, "output");

  P().line = L.fork;
  s.event = "fork()";
  r.step(s, L.fork, "Now it calls `fork()`, a system call that asks the OS to **create a new process**.", "os");

  s.procs.push(forkChild(P()));
  r.step(
    s,
    L.fork,
    `The OS creates process **${CHILD}**, an almost exact **copy** of the parent: same code, a private *copy* of its memory, the same registers and the same open files. The child doesn't start at \`main\`: it comes to life **inside \`fork()\`**, as if it had called it too.`,
    "os",
  );

  setVar(P(), "rc", String(CHILD));
  setVar(C(), "rc", "0");
  s.event = null;
  r.step(
    s,
    L.fork,
    `\`fork()\` **returns twice**, with different values: the parent gets the child's PID (\`rc = ${CHILD}\`), the child gets \`rc = 0\`. That one difference is how they tell who is who.`,
    "os",
  );

  // ---- the two possible paths ----
  const childRuns = (afterParentWaits: boolean) => {
    run(s, CHILD);
    C().line = L.child;
    r.step(s, L.child, `The scheduler runs the **child**. \`rc == 0\`, so it takes the child branch.`, "switch");
    C().line = L.childPrint;
    s.terminal.push({ text: `child (pid:${CHILD})`, color: 1 });
    r.step(s, L.childPrint, "The child prints its own PID.", "output");
    C().line = L.ret;
    C().state = "zombie";
    r.step(
      s,
      L.ret,
      afterParentWaits
        ? "The child returns from `main` and exits. It becomes a **zombie** for a moment: done, but its exit status is still kept for the parent…"
        : "The child exits. Its parent hasn't asked about it, so it lingers as a **zombie** (finished, exit status kept).",
      "os",
    );
    if (afterParentWaits) {
      C().state = "exited";
      P().state = "running";
      setVar(P(), "rc_wait", String(CHILD));
      r.step(s, L.wait, `…and since the parent is blocked in \`wait()\`, the OS wakes it, hands it the child's status and **reaps** the zombie. \`wait()\` returns ${CHILD}.`, "switch");
    }
  };

  const parentRuns = () => {
    run(s, PARENT);
    P().line = L.parent;
    r.step(s, L.parent, `The scheduler runs the **parent**. \`rc = ${CHILD}\` (positive), so it takes the \`else\` branch.`, "switch");
    if (wait) {
      P().line = L.wait;
      if (C().state === "zombie") {
        C().state = "exited";
        setVar(P(), "rc_wait", String(CHILD));
        r.step(s, L.wait, `\`wait()\`: the child has already exited, so it returns **immediately** with ${CHILD} and the zombie is reaped.`, "os");
      } else {
        P().state = "blocked";
        r.step(s, L.wait, "`wait()`: the child hasn't finished, so the parent **blocks** until it does. The OS must run someone else.", "os");
        childRuns(true);
      }
      P().line = L.parentPrint[0];
      s.terminal.push({ text: `parent of ${CHILD} (rc_wait:${CHILD}) (pid:${PARENT})`, color: 0 });
      r.step(s, L.parentPrint, "Only now does the parent print.", "output");
    } else {
      P().line = L.parentPrint[0];
      s.terminal.push({ text: `parent of ${CHILD} (pid:${PARENT})`, color: 0 });
      r.step(s, L.parentPrint, "The parent prints the child's PID.", "output");
    }
    P().line = L.ret;
    P().state = "exited";
    r.step(s, L.ret, "The parent returns from `main` and exits.", "os");
  };

  if (wait) {
    if (childFirst) {
      childRuns(false);
      parentRuns();
    } else {
      parentRuns();
    }
  } else if (childFirst) {
    childRuns(false);
    parentRuns();
  } else {
    parentRuns();
    childRuns(false);
  }

  if (!wait && C().state === "zombie") {
    C().state = "exited";
    r.step(s, [], "Nobody waited for the child, so when the parent died the child was **adopted by `init`**, which reaps orphans like this.", "os");
  }

  r.step(
    s,
    [],
    wait
      ? `Whichever process runs first, the output is the same: \`wait()\` forces the parent to print **after** the child. Flip "who runs first" to check.`
      : `The output order depends on which process the scheduler happened to run first. Flip "who runs first": the program is **not deterministic**.`,
    "success",
  );
  return r.steps;
}
