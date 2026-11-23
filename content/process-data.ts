import type { QuizQuestion } from "./intro-data";

export type InfoCard = { title: string; icon: string; color: number; body: string; code?: string };

export const PROCESS_API_CARDS: InfoCard[] = [
  { title: "Create", icon: "Plus", color: 0, body: "Start a new process, e.g. when you type a command or double-click an app.", code: "fork(), exec()" },
  { title: "Destroy", icon: "X", color: 1, body: "Stop a process forcefully, for example one that's stuck or misbehaving.", code: "kill()" },
  { title: "Wait", icon: "Hourglass", color: 2, body: "Wait for a process to finish, and collect its exit status.", code: "wait()" },
  { title: "Miscellaneous control", icon: "Pause", color: 3, body: "Suspend a process for a while and resume it later.", code: "SIGSTOP / SIGCONT" },
  { title: "Status", icon: "Activity", color: 0, body: "Ask how long it has run, what state it's in, how much memory it uses.", code: "ps, top" },
];

export const PROCESS_QUIZ: QuizQuestion[] = [
  {
    q: "What is the difference between a program and a process?",
    options: [
      "There is none; they're two words for the same thing",
      "A program is code on disk; a process is a running instance of it, with its own memory and registers",
      "A process is a program written in C",
      "A program can only run once; a process can run many times",
    ],
    answer: 1,
    why: "A program is lifeless bytes on disk. The OS turns it into a process by loading it, giving it memory, registers and open files, and running it. You can have many processes running the same program.",
    section: "what",
  },
  {
    q: "In hello.c, where does the local variable `n` live?",
    options: ["In the code segment", "In the data segment", "On the stack", "On the heap"],
    answer: 2,
    why: "Local variables live in the function's stack frame. Globals live in the data segment, and memory from malloc() lives on the heap.",
    section: "creation",
  },
  {
    q: "A running process calls read() and must wait for the disk. Which state does it move to?",
    options: ["Ready", "Blocked", "Running", "Zombie"],
    answer: 1,
    why: "It can't make progress until the I/O completes, so it is Blocked. When the disk finishes, it moves to Ready, not straight back to Running.",
    section: "states",
  },
  {
    q: "Why does the OS run another process while one is blocked on I/O?",
    options: [
      "To keep the CPU busy instead of idle, improving utilization",
      "Because the blocked process is using too much memory",
      "It's required for the I/O to finish",
      "To punish the blocked process",
    ],
    answer: 0,
    why: "I/O is slow. Overlapping it with another process's computation keeps the CPU busy. In the demo, utilization went from 82% to 100%.",
    section: "states",
  },
  {
    q: "During a context switch, where are the stopped process's registers saved?",
    options: ["On the disk", "In its PCB (struct proc → context)", "They are thrown away", "In the next process's registers"],
    answer: 1,
    why: "The OS copies the CPU registers into the process's saved context in its PCB, and later restores them to resume it exactly where it left off.",
    section: "data",
  },
  {
    q: "What is a zombie process?",
    options: [
      "A process stuck in an infinite loop",
      "A process that has exited but whose parent hasn't called wait() yet",
      "A process that was killed by a signal",
      "A process with no open files",
    ],
    answer: 1,
    why: "After exit, the OS keeps a small entry with the exit status until the parent collects it with wait(). Then the slot is freed.",
    section: "data",
  },
];
