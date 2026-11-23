import { ApiRecorder, CHILD, PARENT, forkChild, newParent, run, setVar, type ApiState } from "./model";

export const WC_P4 = "      30     105     851 p4.c";

const L = { fork: 9, child: 14, close: 16, open: [17, 18], args: [20, 23], exec: 24, parent: 25, wait: 27, ret: 29 };

export function simulateRedirect() {
  const r = new ApiRecorder("p4.c", "p4");
  const s: ApiState = {
    procs: [newParent("p4", L.fork)],
    terminal: [{ text: "prompt> ./p4", color: -1 }],
    file: null,
    event: null,
  };
  const P = () => s.procs.find((p) => p.pid === PARENT)!;
  const C = () => s.procs.find((p) => p.pid === CHILD)!;

  r.step(
    s,
    [],
    "This program does what a shell does for `wc p4.c > p4.output`. Watch the **file descriptor tables**: fds 0, 1 and 2 all point at the terminal.",
    "user",
  );

  s.procs.push(forkChild(P()));
  setVar(P(), "rc", String(CHILD));
  setVar(C(), "rc", "0");
  s.event = "fork()";
  r.step(s, L.fork, "`fork()`: the child gets a **copy of the parent's open-file table**, so its fd 1 also points at the terminal.", "os");

  s.event = null;
  P().line = L.parent;
  r.step(s, L.parent, "The parent goes to the `else` branch…", "user");
  P().line = L.wait;
  P().state = "blocked";
  r.step(s, L.wait, "…and waits for the child.", "os");

  run(s, CHILD);
  C().line = L.child;
  r.step(s, L.child, "The child runs. Before running `wc`, it rewires its own output.", "switch");

  C().line = L.close;
  C().fds = C().fds.filter((f) => f.fd !== 1);
  s.event = "close(1)";
  r.step(s, L.close, "`close(STDOUT_FILENO)` closes **fd 1**. Slot 1 in the child's table is now free. (The parent's table is untouched.)", "os");

  C().line = L.open[0];
  C().fds.push({ fd: 1, target: "p4.output" });
  C().fds.sort((a, b) => a.fd - b.fd);
  s.file = { name: "p4.output", content: null };
  s.event = "open()";
  r.step(
    s,
    L.open,
    "`open()` creates `p4.output`. UNIX always hands out the **lowest free descriptor**, and that's **1**. So standard output now goes to the file.",
    "os",
  );

  s.event = null;
  C().line = L.args[0];
  setVar(C(), "myargs", '["wc", "p4.c", NULL]');
  r.step(s, L.args, "Build the arguments for `wc p4.c`.", "user");

  C().line = L.exec;
  s.event = "exec()";
  r.step(s, L.exec, "`execvp()` replaces the program…", "os");

  const c = C();
  c.image = "wc";
  c.line = null;
  c.vars = [{ k: "argv", v: '["wc", "p4.c"]' }];
  r.step(s, [], "…but **keeps the open-file table**. `wc` has no idea anything changed; it will just write to fd 1 as usual.", "os");

  s.event = null;
  s.file.content = WC_P4;
  r.step(s, [], "`wc` prints its result to fd 1, so it lands **in the file**, not on the screen. The terminal shows nothing.", "output");

  c.state = "exited";
  P().state = "running";
  P().line = L.wait;
  setVar(P(), "rc_wait", String(CHILD));
  r.step(s, L.wait, "`wc` exits; the parent's `wait()` returns.", "switch");

  P().line = L.ret;
  P().state = "exited";
  r.step(s, L.ret, "The parent exits too.", "os");

  s.terminal.push({ text: "prompt> cat p4.output", color: -1 });
  s.terminal.push({ text: WC_P4, color: 1 });
  r.step(
    s,
    [],
    "There's the output, in the file. Because `fork` and `exec` are **separate** calls, the shell gets a moment in between to change the child's environment. That's how `>`, `<` and `|` work.",
    "success",
  );
  return r.steps;
}
