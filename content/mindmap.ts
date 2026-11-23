/**
 * Concept-level mind map of operating systems. `topic` points at a roadmap
 * topic (which may be a ready chapter); `section` deep-links into the lesson.
 */
export type MindNode = {
  id: string;
  label: string;
  desc: string;
  topic?: string;
  section?: string;
  children?: MindNode[];
};

const n = (id: string, label: string, desc: string, topic?: string, section?: string): MindNode => ({ id, label, desc, topic, section });

export const MINDMAP: MindNode = {
  id: "os",
  label: "Operating Systems",
  desc: "Software that makes the machine easy to use, shares it among programs, and keeps them safe from one another. Its big ideas fall into a few connected groups, explored below.",
  children: [
    {
      id: "foundations",
      label: "Foundations",
      desc: "The ideas every other topic rests on: what the OS is for, how programs ask it for help, and how the hardware keeps it in charge.",
      topic: "introduction",
      children: [
        n("what-os-does", "What an OS does", "Virtualizes resources, manages concurrency and stores data persistently, all while making the machine easy to use.", "introduction", "program"),
        n("fde", "Fetch–decode–execute", "The CPU's basic loop. Everything the OS does happens on top of it.", "introduction", "program"),
        n("syscalls", "System calls", "The OS's API: open, read, fork… A trap instruction jumps into the kernel and back.", "introduction", "persistence"),
        n("modes", "User & kernel mode", "Hardware privilege levels. Only the kernel may touch devices and critical state.", "lde"),
        n("interrupts", "Interrupts & traps", "How control returns to the OS: hardware interrupts (like the timer) and software traps.", "lde"),
        n("goals", "Design goals", "Abstraction, performance, protection, reliability, energy and security.", "introduction", "goals"),
      ],
    },
    {
      id: "processes",
      label: "Processes",
      desc: "The process is a running program, the OS's most fundamental abstraction.",
      topic: "processes",
      children: [
        n("program-vs-process", "Program vs process", "A program is bytes on disk; a process is a running instance with its own state.", "processes", "what"),
        n("address-layout", "Code · heap · stack", "How a process's memory is laid out, and what lives where.", "processes", "creation"),
        n("states", "Process states", "Running, ready and blocked, and the transitions between them.", "processes", "states"),
        n("pcb", "PCB & process list", "The OS's per-process record: PID, state, saved registers, open files.", "processes", "data"),
        n("fork-exec", "fork · exec · wait", "UNIX's way to create processes and run programs.", "process-api", "fork"),
        n("signals", "Signals", "Asynchronous notifications: Ctrl-C, kill, SIGCHLD.", "process-api", "control"),
      ],
    },
    {
      id: "cpu",
      label: "CPU Virtualization",
      desc: "Time-sharing one CPU among many processes: mechanisms to switch, policies to choose.",
      topic: "lde",
      children: [
        n("context-switch", "Context switch", "Save one process's registers, restore another's.", "processes", "data"),
        n("lde", "Limited direct execution", "Run programs directly on the CPU, but keep the OS in control.", "lde"),
        n("metrics", "Turnaround & response", "The metrics used to compare schedulers.", "scheduling"),
        n("fifo-sjf", "FIFO · SJF · STCF", "Simple policies, and why short jobs should go first.", "scheduling"),
        n("rr", "Round robin", "Time slices for good response time.", "scheduling"),
        n("mlfq", "MLFQ", "Priority queues that learn from a job's behavior.", "mlfq"),
        n("lottery", "Lottery & stride", "Proportional-share scheduling.", "lottery"),
      ],
    },
    {
      id: "memory",
      label: "Memory Virtualization",
      desc: "Giving every process a private address space, translated to physical memory by hardware the OS controls.",
      topic: "address-spaces",
      children: [
        n("address-spaces", "Address spaces", "Each process sees its own memory starting at zero.", "introduction", "memory"),
        n("malloc", "malloc & free", "Asking for and returning heap memory, and the bugs that follow.", "memory-api"),
        n("base-bounds", "Base & bounds", "The simplest hardware translation scheme.", "address-translation"),
        n("segmentation", "Segmentation", "Translate code, heap and stack separately.", "segmentation"),
        n("paging", "Paging", "Fixed-size pages mapped by a page table.", "paging"),
        n("tlb", "TLB", "A cache of recent translations.", "tlb"),
        n("mlpt", "Multi-level page tables", "Making page tables small.", "advanced-page-tables"),
        n("swapping", "Swapping", "Use the disk to extend memory; page replacement policies.", "swapping"),
      ],
    },
    {
      id: "concurrency",
      label: "Concurrency",
      desc: "Correctly coordinating many threads that share memory.",
      topic: "threads",
      children: [
        n("threads", "Threads", "Multiple execution streams in one address space.", "threads"),
        n("races", "Race conditions", "When the result depends on timing, like a lost update.", "introduction", "concurrency"),
        n("locks", "Locks", "Mutual exclusion for critical sections.", "locks"),
        n("cv", "Condition variables", "Waiting until something becomes true.", "condition-variables"),
        n("semaphores", "Semaphores", "A counter-based primitive for locking and signaling.", "semaphores"),
        n("deadlock", "Deadlock", "When threads wait on each other forever.", "concurrency-bugs"),
        n("events", "Event loops", "Concurrency without threads.", "event-based"),
      ],
    },
    {
      id: "persistence",
      label: "Persistence",
      desc: "Storing data so it survives power loss and crashes.",
      topic: "io-devices",
      children: [
        n("devices", "Devices & drivers", "Polling, interrupts, DMA and drivers.", "io-devices"),
        n("hdd", "Hard disks", "Seek, rotation, transfer, and disk scheduling.", "disks"),
        n("raid", "RAID", "Many disks acting as one.", "raid"),
        n("files", "Files & directories", "The file system API.", "files"),
        n("inodes", "Inodes & FS layout", "How files are laid out on disk.", "fs-implementation"),
        n("crash", "Crash consistency", "fsync, journaling, and surviving power cuts.", "introduction", "persistence"),
        n("ssd", "SSDs", "Flash storage and its translation layer.", "ssd"),
      ],
    },
  ],
};
