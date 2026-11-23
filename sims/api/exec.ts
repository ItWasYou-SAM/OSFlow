import { ApiRecorder, CHILD, PARENT, forkChild, newParent, run, setVar, type ApiState } from "./model";

export const WC_P3 = "      27     111     930 p3.c";

const L = { hello: 8, fork: 9, child: 13, childPrint: 14, args: [15, 18], exec: 19, never: 20, parent: 21, wait: 22, parentPrint: [23, 24], ret: 26 };

export function simulateExec() {
  const r = new ApiRecorder("p3.c", "p3");
  const s: ApiState = { procs: [newParent("p3", L.hello)], terminal: [{ text: "prompt> ./p3", color: -1 }], file: null, event: null };
  const P = () => s.procs.find((p) => p.pid === PARENT)!;
  const C = () => s.procs.find((p) => p.pid === CHILD)!;

  s.terminal.push({ text: `hello (pid:${PARENT})`, color: 0 });
  r.step(s, L.hello, `Process ${PARENT} starts and prints hello.`, "output");

  P().line = L.fork;
  s.procs.push(forkChild(P()));
  setVar(P(), "rc", String(CHILD));
  setVar(C(), "rc", "0");
  r.step(s, L.fork, `\`fork()\` creates child **${CHILD}**, a copy still running \`p3\`. Parent gets \`rc = ${CHILD}\`, child gets \`0\`.`, "os");

  P().line = L.parent;
  r.step(s, L.parent, "The parent takes the `else` branch…", "user");
  P().line = L.wait;
  P().state = "blocked";
  r.step(s, L.wait, "…and blocks in `wait()` until the child is done.", "os");

  run(s, CHILD);
  C().line = L.child;
  r.step(s, L.child, "The child runs and takes the `rc == 0` branch.", "switch");

  C().line = L.childPrint;
  s.terminal.push({ text: `child (pid:${CHILD})`, color: 1 });
  r.step(s, L.childPrint, "It prints its PID.", "output");

  C().line = L.args[0];
  setVar(C(), "myargs", '["wc", "p3.c", NULL]');
  r.step(s, L.args, "It builds an argument array, just like the `argv` a program receives: run **`wc`** (word count) on the file **`p3.c`**.", "user");

  C().line = L.exec;
  s.event = "exec()";
  r.step(s, L.exec, "Now `execvp()`. Unlike `fork`, `exec` does **not** create a process. It *transforms* the current one into a different program.", "os");

  const c = C();
  c.image = "wc";
  c.line = null;
  c.vars = [{ k: "argv", v: '["wc", "p3.c"]' }];
  r.step(
    s,
    [],
    `The OS loads \`wc\`'s code and static data **over** the child's memory, gives it a fresh heap and stack, and starts it at \`wc\`'s \`main\`. Same process (still PID **${CHILD}**), new program. Open files are kept.`,
    "os",
  );

  s.event = null;
  s.terminal.push({ text: WC_P3, color: 1 });
  r.step(s, [], "`wc` counts lines, words and bytes in `p3.c` and prints them.", "output");

  r.step(
    s,
    L.never,
    "Notice this `printf` **never runs**: a successful `exec()` never returns, because the code that called it no longer exists in this process.",
    "danger",
  );

  c.state = "exited";
  P().state = "running";
  P().line = L.wait;
  setVar(P(), "rc_wait", String(CHILD));
  r.step(s, L.wait, `\`wc\` exits. The parent wakes up and \`wait()\` returns ${CHILD}.`, "switch");

  P().line = L.parentPrint[0];
  s.terminal.push({ text: `parent of ${CHILD} (rc_wait:${CHILD}) (pid:${PARENT})`, color: 0 });
  r.step(s, L.parentPrint, "The parent prints and finishes.", "output");

  P().line = L.ret;
  P().state = "exited";
  r.step(s, L.ret, "**fork** made a new process, **exec** made it run a new program, **wait** let the parent know when it was done. That's how every command in your shell runs.", "success");
  return r.steps;
}
