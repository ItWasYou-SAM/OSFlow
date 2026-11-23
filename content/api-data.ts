import type { QuizQuestion } from "./intro-data";
import type { InfoCard } from "./process-data";

export const SIGNAL_CARDS: InfoCard[] = [
  { title: "kill()", icon: "Send", color: 1, body: "Sends a signal to a process: stop, continue, terminate, or a custom event. Despite the name it doesn't always kill.", code: "kill(pid, SIGTERM)" },
  { title: "Ctrl-C", icon: "OctagonX", color: 0, body: "The terminal sends SIGINT (interrupt) to the foreground process, which normally terminates it.", code: "SIGINT" },
  { title: "Ctrl-Z", icon: "Pause", color: 3, body: "Sends SIGTSTP, which pauses the process. Resume it later with the shell's fg command.", code: "SIGTSTP → fg" },
  { title: "signal()", icon: "Radio", color: 2, body: "A process can catch a signal: when it arrives, normal execution pauses and a handler function runs.", code: "signal(SIGINT, handler)" },
];

export const API_QUIZ: QuizQuestion[] = [
  {
    q: "What does fork() return in the child process?",
    options: ["The parent's PID", "The child's own PID", "0", "-1"],
    answer: 2,
    why: "fork() returns 0 in the child and the child's PID in the parent (or -1 in the parent if it failed). That's how the two copies tell themselves apart.",
    section: "fork",
  },
  {
    q: "Where does the newly created child start executing?",
    options: ["At the top of main()", "Right after the fork() call returns", "At the end of the program", "At a function you pass to fork()"],
    answer: 1,
    why: "The child is a copy of the parent mid-execution, so it continues as if it had just returned from fork() itself.",
    section: "fork",
  },
  {
    q: "Without wait(), p1.c sometimes prints the parent line first and sometimes the child line. Why?",
    options: ["A bug in printf()", "The CPU scheduler decides which process runs first, and that can vary", "fork() is broken", "The child is always slower"],
    answer: 1,
    why: "After fork() there are two runnable processes. Which runs first is the scheduler's decision, so the output is not deterministic.",
    section: "fork",
  },
  {
    q: "What happens to the code after a successful exec() call?",
    options: [
      "It runs after the new program finishes",
      "It runs in a new child process",
      "It never runs: the process's code is replaced by the new program",
      "It runs before the new program starts",
    ],
    answer: 2,
    why: "exec() overwrites the process's code, data, heap and stack with the new program. A successful exec() never returns.",
    section: "exec",
  },
  {
    q: "How does the shell make `wc p4.c > out.txt` write into out.txt?",
    options: [
      "wc has a special flag for files",
      "After fork, the child closes stdout and opens out.txt (getting fd 1), then calls exec",
      "The shell reads wc's output from the screen and saves it",
      "The kernel guesses from the > character",
    ],
    answer: 1,
    why: "open() returns the lowest free descriptor, so it becomes fd 1. exec() keeps open files, and wc writes to fd 1 as always.",
    section: "shell",
  },
  {
    q: "Which call does NOT create a new process?",
    options: ["fork()", "exec()", "Both create a process", "Neither creates a process"],
    answer: 1,
    why: "exec() transforms the calling process into a different program. Only fork() (and relatives like clone/posix_spawn) creates a new one.",
    section: "exec",
  },
];
