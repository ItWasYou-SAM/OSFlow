export type QuizQuestion = {
  q: string;
  options: string[];
  answer: number;
  why: string;
  section: string;
};

export const INTRO_QUIZ: QuizQuestion[] = [
  {
    q: "Four copies of cpu.c run on a machine with one CPU, and all four keep printing. How?",
    options: [
      "The CPU runs all four instruction streams at the same instant",
      "The OS switches the CPU between them many times per second",
      "Each process is given its own physical CPU core",
      "The processes take turns only when one finishes",
    ],
    answer: 1,
    why: "Timer interrupts let the OS pause one process and resume another (a context switch) quickly enough that each seems to have its own CPU.",
    section: "cpu",
  },
  {
    q: "Two copies of mem.c print the same pointer value, yet each sees its own counter. Why?",
    options: [
      "They share memory, but take turns writing",
      "The printed address is fake",
      "Each process has a private virtual address space, mapped to different physical memory",
      "malloc() returns a copy of the value, not an address",
    ],
    answer: 2,
    why: "Addresses a program sees are virtual. The OS and hardware translate them to different physical frames for each process.",
    section: "memory",
  },
  {
    q: "Two threads each run counter++ 1000 times. The final value is 1873. What went wrong?",
    options: [
      "counter++ is several instructions, and an interrupt in the middle let one thread overwrite the other's update",
      "One of the threads crashed",
      "The CPU's adder is unreliable under load",
      "Threads cannot share global variables",
    ],
    answer: 0,
    why: "load → add → store is not atomic. If a switch happens between a load and its store, an update is lost: a race condition.",
    section: "concurrency",
  },
  {
    q: "write() returned success, then the power failed before fsync(). What's on disk?",
    options: [
      "The full file: write() always reaches the disk",
      "Possibly nothing: the data may only have been in the page cache in RAM",
      "Half of the file",
      "A backup copy the OS made automatically",
    ],
    answer: 1,
    why: "For speed, the OS buffers writes in memory. fsync() forces them to the device; until then a crash can lose them.",
    section: "persistence",
  },
  {
    q: "What happens when a program calls open()?",
    options: [
      "It jumps straight into the disk driver's code",
      "It's an ordinary function call inside the program",
      "It traps into the kernel, which runs with higher privilege, then returns to user mode",
      "It asks the user for permission",
    ],
    answer: 2,
    why: "System calls transfer control to the OS through a special trap instruction that raises the privilege level, so only trusted OS code touches hardware.",
    section: "persistence",
  },
  {
    q: "Which is NOT one of the main design goals of an operating system?",
    options: ["Protection and isolation between programs", "Low overhead", "Making every program run as fast as if it were alone", "Reliability"],
    answer: 2,
    why: "Sharing always costs something. The OS aims to keep overhead low and fair, not to give each program the whole machine.",
    section: "goals",
  },
];

export const DESIGN_GOALS = [
  { title: "Abstraction", icon: "Layers", color: 0, short: "Make the machine easy to use.", long: "Programs say open(\"/tmp/file\") instead of driving disk controllers. Good abstractions hide messy hardware behind simple, stable interfaces." },
  { title: "Performance", icon: "Gauge", color: 2, short: "Keep the overhead small.", long: "Virtualization costs time (switches) and space (page tables). The OS works hard to make these costs nearly invisible." },
  { title: "Protection", icon: "Shield", color: 1, short: "Isolate programs from each other.", long: "A buggy or malicious program must not read or wreck another program's memory, or the OS itself. Isolation is the foundation." },
  { title: "Reliability", icon: "Activity", color: 3, short: "The OS must not fail.", long: "If the OS crashes, everything on top of it crashes too. OS code is held to a very high bar for correctness." },
  { title: "Energy", icon: "BatteryCharging", color: 2, short: "Save power where possible.", long: "On phones and data centers alike, idling cores, throttling and smart scheduling make a big difference." },
  { title: "Security", icon: "Lock", color: 0, short: "Withstand attackers.", long: "Beyond isolating bugs, the OS must defend against deliberate attacks, especially on networked machines." },
] as const;

export const HISTORY = [
  { era: "1950s", title: "Just libraries", body: "Early 'operating systems' were collections of common routines (like I/O). A human operator loaded one job at a time, in batches." },
  { era: "1960s", title: "Protection & system calls", body: "File systems held private data, so the OS needed to be special. The system call and hardware privilege levels (user vs kernel mode) were born (Atlas)." },
  { era: "1960s–70s", title: "Multiprogramming", body: "Minicomputers made it worth running several jobs at once to keep the CPU busy during slow I/O. Memory protection and concurrency became real problems." },
  { era: "1970s", title: "UNIX", body: "Thompson and Ritchie at Bell Labs built a small, elegant OS with simple tools that compose through pipes. Its ideas still shape every OS today." },
  { era: "1980s", title: "The personal computer", body: "Early PC systems like DOS dropped many lessons (no memory protection!). It took years for desktop OSes to catch back up." },
  { era: "1990s–now", title: "Linux & the modern era", body: "Linux brought a free UNIX-like kernel to everyone. Today it runs phones (Android), servers and the cloud, while macOS is built on UNIX roots too." },
];
