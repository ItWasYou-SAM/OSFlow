export type Section = { id: string; title: string };

export type Chapter = {
  slug: string;
  title: string;
  /** Matching chapter in Operating Systems: Three Easy Pieces. */
  ostep: string;
  summary: string;
  status: "ready" | "soon";
  minutes?: number;
  /** Number of interactive demos in the lesson. */
  demos?: number;
  sections?: Section[];
};

export type Part = { id: string; title: string; blurb: string; color: string; chapters: Chapter[] };

const soon = (slug: string, title: string, ostep: string, summary: string): Chapter => ({ slug, title, ostep, summary, status: "soon" });

export const PARTS: Part[] = [
  {
    id: "start",
    title: "Getting started",
    blurb: "The big picture: what an operating system is and the three ideas it is built on.",
    color: "var(--p0)",
    chapters: [
      {
        slug: "introduction",
        title: "Introduction to Operating Systems",
        ostep: "OSTEP ch. 2",
        summary: "Watch one CPU pretend to be many, two programs share memory without seeing each other, two threads race on a counter, and a file survive (or not) a crash.",
        status: "ready",
        minutes: 35,
        demos: 5,
        sections: [
          { id: "program", title: "When a program runs" },
          { id: "cpu", title: "Virtualizing the CPU" },
          { id: "memory", title: "Virtualizing memory" },
          { id: "concurrency", title: "Concurrency" },
          { id: "persistence", title: "Persistence" },
          { id: "goals", title: "Design goals" },
          { id: "history", title: "A brief history" },
          { id: "recap", title: "Recap & quiz" },
        ],
      },
    ],
  },
  {
    id: "virtualization",
    title: "Virtualization",
    blurb: "How the OS turns one CPU and one memory into many private ones.",
    color: "var(--p1)",
    chapters: [
      {
        slug: "processes",
        title: "The Process",
        ostep: "OSTEP ch. 4",
        summary: "What a running program is to the OS: how it's created from a file on disk, the states it moves through, and the data structure that tracks it.",
        status: "ready",
        minutes: 30,
        demos: 3,
        sections: [
          { id: "what", title: "Program vs process" },
          { id: "machine-state", title: "Machine state" },
          { id: "api", title: "The process API" },
          { id: "creation", title: "Process creation" },
          { id: "states", title: "Process states" },
          { id: "data", title: "Data structures" },
          { id: "recap", title: "Recap & quiz" },
        ],
      },
      {
        slug: "process-api",
        title: "Process API",
        ostep: "OSTEP ch. 5",
        summary: "fork(), wait() and exec(), stepped through line by line with both processes on screen, plus how the shell builds redirection, pipes and signals on top.",
        status: "ready",
        minutes: 35,
        demos: 4,
        sections: [
          { id: "fork", title: "fork()" },
          { id: "wait", title: "wait()" },
          { id: "exec", title: "exec()" },
          { id: "shell", title: "Why? The shell" },
          { id: "pipes", title: "Pipes" },
          { id: "control", title: "Signals & control" },
          { id: "users", title: "Users & tools" },
          { id: "recap", title: "Recap & quiz" },
        ],
      },
      soon("lde", "Limited Direct Execution", "OSTEP ch. 6", "Running user code at full speed while keeping the OS in control: traps and timer interrupts."),
      soon("scheduling", "Scheduling", "OSTEP ch. 7", "FIFO, SJF, STCF and Round Robin, drawn as Gantt charts you can edit."),
      soon("mlfq", "Multi-Level Feedback Queue", "OSTEP ch. 8", "A scheduler that learns which jobs are interactive."),
      soon("address-spaces", "Address Spaces", "OSTEP ch. 13", "Code, heap and stack: the illusion of private memory."),
      soon("address-translation", "Address Translation", "OSTEP ch. 15", "Base and bounds registers, translated live."),
      soon("paging", "Paging", "OSTEP ch. 18", "Page tables, VPNs and PFNs, step by step."),
      soon("tlb", "TLBs", "OSTEP ch. 19", "Caching translations: hits, misses and why locality matters."),
    ],
  },
  {
    id: "concurrency",
    title: "Concurrency",
    blurb: "Many things at once, without stepping on each other.",
    color: "var(--p2)",
    chapters: [
      soon("threads", "Threads", "OSTEP ch. 26", "Shared memory, race conditions and critical sections."),
      soon("locks", "Locks", "OSTEP ch. 28", "Test-and-set, spin locks and ticket locks, visualized."),
      soon("condition-variables", "Condition Variables", "OSTEP ch. 30", "Waiting and signaling: the producer/consumer problem."),
      soon("semaphores", "Semaphores", "OSTEP ch. 31", "One primitive to build locks and condition variables."),
      soon("concurrency-bugs", "Concurrency Bugs", "OSTEP ch. 32", "Atomicity violations, order violations and deadlock."),
    ],
  },
  {
    id: "persistence",
    title: "Persistence",
    blurb: "Keeping data safe across crashes and power cuts.",
    color: "var(--p3)",
    chapters: [
      soon("io-devices", "I/O Devices", "OSTEP ch. 36", "Polling, interrupts and DMA."),
      soon("disks", "Hard Disk Drives", "OSTEP ch. 37", "Seek, rotation and transfer, with a spinning platter."),
      soon("files", "Files and Directories", "OSTEP ch. 39", "The file system API from open() to rename()."),
      soon("fs-implementation", "File System Implementation", "OSTEP ch. 40", "Inodes, bitmaps and data blocks on a tiny disk."),
      soon("journaling", "Crash Consistency & Journaling", "OSTEP ch. 42", "Crash the disk mid-write and watch the journal recover."),
    ],
  },
];

export const ALL_CHAPTERS = PARTS.flatMap((p) => p.chapters);
export const READY_CHAPTERS = ALL_CHAPTERS.filter((c) => c.status === "ready");

export function getChapter(slug: string) {
  return ALL_CHAPTERS.find((c) => c.slug === slug);
}

export function chapterNumber(slug: string) {
  return ALL_CHAPTERS.findIndex((c) => c.slug === slug) + 1;
}
