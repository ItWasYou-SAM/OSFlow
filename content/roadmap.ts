import { getChapter } from "./curriculum";

/**
 * The full OS learning roadmap. Topics whose `id` matches a curriculum chapter
 * slug link to that lesson; the rest are planned topics shown on the map.
 */

export type TopicKind = "core" | "optional";
export type TopicStatus = "ready" | "soon" | "planned";

export type Topic = {
  id: string;
  title: string;
  ostep: string;
  kind: TopicKind;
  desc: string;
  learn: string[];
};

export type Stage = {
  id: string;
  title: string;
  color: string;
  blurb: string;
  /** Long-form explanation shown in the "reading the map" section. */
  explain: string[];
  left: Topic[];
  right: Topic[];
};

const t = (id: string, title: string, ostep: string, desc: string, learn: string[], kind: TopicKind = "core"): Topic => ({ id, title, ostep, kind, desc, learn });

export const STAGES: Stage[] = [
  {
    id: "foundations",
    title: "Foundations",
    color: "var(--p0)",
    blurb: "What an OS is, and the process: the unit everything else is built on.",
    explain: [
      "Start here. Before any mechanism makes sense you need the big picture: an OS virtualizes hardware, handles concurrency, and stores data persistently. The introduction shows each of those ideas with a tiny program.",
      "Then meet the process, the OS's most important abstraction. You'll see how a program on disk becomes a running process, which states it moves through, and how UNIX creates and controls processes with fork(), exec() and wait(). Everything later assumes you're comfortable here.",
    ],
    left: [t("introduction", "Introduction to OS", "ch. 2", "The tour: virtualization, concurrency and persistence, each shown with a small program.", ["What the OS does for programs", "System calls and the OS as a resource manager", "Design goals: abstraction, performance, protection"])],
    right: [
      t("processes", "The Process", "ch. 4", "A running program: its address space, registers and open files, and the states it moves through.", ["Program vs process", "Ready, running and blocked", "PCBs and the process list"]),
      t("process-api", "Process API", "ch. 5", "How UNIX creates and controls processes, and how the shell is built on top.", ["fork(), wait(), exec()", "Redirection and pipes", "Signals and users"]),
    ],
  },
  {
    id: "cpu",
    title: "CPU Virtualization",
    color: "var(--p1)",
    blurb: "Sharing one CPU safely and fairly among many processes.",
    explain: [
      "Virtualizing the CPU needs two things: a mechanism and a policy. The mechanism is limited direct execution: run the program directly on the CPU for speed, but use user/kernel mode, traps and a timer interrupt so the OS always gets control back.",
      "The policy is scheduling: given several ready processes, who runs next? You'll start with simple schedulers measured by turnaround and response time, then build up to the multi-level feedback queue used by real systems, and proportional-share schedulers like lottery scheduling.",
    ],
    left: [
      t("lde", "Limited Direct Execution", "ch. 6", "Run user code at full speed while keeping the OS in control.", ["User vs kernel mode", "Traps and the trap table", "Timer interrupts and context switches"]),
      t("scheduling", "Scheduling Basics", "ch. 7", "The first scheduling policies and how to measure them.", ["Turnaround and response time", "FIFO, SJF and STCF", "Round robin"]),
    ],
    right: [
      t("mlfq", "Multi-Level Feedback Queue", "ch. 8", "A scheduler that learns which jobs are interactive without being told.", ["Priority levels and rules", "Priority boost", "Gaming and its fixes"]),
      t("lottery", "Proportional Share", "ch. 9", "Give each process a fair share of the CPU using tickets or strides.", ["Lottery scheduling", "Stride scheduling", "Linux CFS"]),
      t("multiprocessor", "Multiprocessor Scheduling", "ch. 10", "Scheduling when there are many CPUs and caches.", ["Cache affinity", "Single vs multi-queue", "Load balancing"], "optional"),
    ],
  },
  {
    id: "memory",
    title: "Memory Virtualization",
    color: "var(--p2)",
    blurb: "Giving every process its own private, huge-looking memory.",
    explain: [
      "Each process believes it has a large, private memory starting at address zero. Making that true is the job of address translation: hardware converts every virtual address to a physical one, under rules the OS sets.",
      "You'll progress from the simplest scheme (base and bounds) through segmentation to paging, then make paging fast with TLBs and small with multi-level page tables. Finally, swapping lets processes use more memory than physically exists by moving pages to disk.",
    ],
    left: [
      t("address-spaces", "Address Spaces", "ch. 13", "The illusion of private memory: code, heap and stack.", ["Virtual address spaces", "Goals: transparency, efficiency, protection"]),
      t("memory-api", "Memory API", "ch. 14", "malloc(), free() and the common bugs around them.", ["Stack vs heap memory", "Common memory errors"]),
      t("address-translation", "Address Translation", "ch. 15", "Hardware-based translation with base and bounds registers.", ["Base and bounds", "What the OS must manage"]),
      t("segmentation", "Segmentation", "ch. 16", "Separate base and bounds for code, heap and stack.", ["Segments and sharing", "External fragmentation"]),
    ],
    right: [
      t("free-space", "Free-Space Management", "ch. 17", "How allocators track and hand out variable-size chunks.", ["Splitting and coalescing", "Best, worst and first fit"]),
      t("paging", "Paging", "ch. 18", "Fixed-size pages and page tables: the core of modern memory.", ["VPNs, PFNs and page tables", "Page-table entries"]),
      t("tlb", "TLBs", "ch. 19", "A hardware cache that makes translation fast.", ["Hits, misses and locality", "Context switches and ASIDs"]),
      t("advanced-page-tables", "Smaller Page Tables", "ch. 20", "Multi-level and inverted page tables.", ["Multi-level page tables", "Time vs space trade-offs"]),
      t("swapping", "Swapping", "ch. 21–22", "Using the disk to pretend memory is bigger than it is.", ["Page faults", "Replacement policies: LRU, clock"]),
    ],
  },
  {
    id: "concurrency",
    title: "Concurrency",
    color: "var(--p3)",
    blurb: "Many threads, shared memory, and how to keep them correct.",
    explain: [
      "Threads share an address space, which makes them powerful and dangerous. You saw the lost-update race in the introduction; this stage gives you the tools to prevent it.",
      "Locks provide mutual exclusion, built on atomic hardware instructions. Condition variables let threads wait for something to become true. Semaphores generalize both. Then you'll study the bugs that still slip through, like deadlock, and an alternative style, event-based concurrency.",
    ],
    left: [
      t("threads", "Threads", "ch. 26", "Shared memory, race conditions and critical sections.", ["Why threads?", "Race conditions", "Atomicity"]),
      t("thread-api", "Thread API", "ch. 27", "pthread_create, join, mutexes and condition variables.", ["Creating and joining threads", "Locks and condition variables in POSIX"]),
      t("locks", "Locks", "ch. 28", "Building mutual exclusion from hardware primitives.", ["Test-and-set and spin locks", "Ticket locks", "Avoiding spinning"]),
      t("locked-ds", "Locked Data Structures", "ch. 29", "Making counters, lists and hash tables thread-safe and fast.", ["Approximate counters", "Fine-grained locking"]),
    ],
    right: [
      t("condition-variables", "Condition Variables", "ch. 30", "Waiting for a condition, and the producer/consumer problem.", ["wait() and signal()", "Bounded buffers"]),
      t("semaphores", "Semaphores", "ch. 31", "One primitive that can act as a lock or a condition variable.", ["Binary and counting semaphores", "Reader-writer locks"]),
      t("concurrency-bugs", "Concurrency Bugs", "ch. 32", "Atomicity violations, order violations and deadlock.", ["Common non-deadlock bugs", "Deadlock conditions and prevention"]),
      t("event-based", "Event-based Concurrency", "ch. 33", "Concurrency without threads: event loops and async I/O.", ["select() and poll()", "Event loops"], "optional"),
    ],
  },
  {
    id: "persistence",
    title: "Persistence",
    color: "var(--p0)",
    blurb: "Devices, file systems, and surviving crashes.",
    explain: [
      "Persistence starts at the hardware: how the OS talks to devices (polling, interrupts, DMA) and how a hard disk's geometry affects performance. Then comes the file system API you use every day: files, directories, links.",
      "Underneath, a file system is just data structures on a disk: inodes, bitmaps, data blocks. The hard part is crashes. A power cut mid-update can leave those structures inconsistent, and journaling is how modern file systems recover. Optional topics cover RAID, log-structured file systems, SSDs and data integrity.",
    ],
    left: [
      t("io-devices", "I/O Devices", "ch. 36", "How the OS talks to hardware.", ["Polling vs interrupts", "DMA", "Device drivers"]),
      t("disks", "Hard Disk Drives", "ch. 37", "Seek, rotation and transfer, and disk scheduling.", ["Disk geometry and timing", "SSTF, SCAN and friends"]),
      t("raid", "RAID", "ch. 38", "Combining many disks for speed and reliability.", ["RAID 0, 1, 4, 5", "Capacity, reliability, performance"], "optional"),
      t("files", "Files and Directories", "ch. 39", "The file system API from open() to rename().", ["Files, directories, links", "fsync() and atomic rename"]),
    ],
    right: [
      t("fs-implementation", "File System Implementation", "ch. 40", "Inodes, bitmaps and data blocks on a tiny disk.", ["On-disk structures", "Reading and writing a file"]),
      t("ffs", "Fast File System", "ch. 41", "Making file systems disk-aware for performance.", ["Cylinder groups", "Locality"], "optional"),
      t("journaling", "Crash Consistency", "ch. 42", "Keeping the disk consistent through crashes.", ["fsck", "Journaling", "Metadata journaling"]),
      t("lfs", "Log-structured FS", "ch. 43", "Writing everything sequentially, as a log.", ["Segments and the inode map", "Garbage collection"], "optional"),
      t("ssd", "Flash-based SSDs", "ch. 44", "How SSDs work and why they need a translation layer.", ["Flash erase blocks", "FTL and wear leveling"], "optional"),
    ],
  },
  {
    id: "beyond",
    title: "Beyond the Basics",
    color: "var(--p1)",
    blurb: "Where to go after the three easy pieces.",
    explain: [
      "These topics build on everything above. Distributed systems ask what happens when the machines themselves can fail and the network drops messages. Security asks how the OS protects against deliberate attackers, not just buggy programs. Both are optional, and both make great next steps.",
    ],
    left: [t("distributed", "Distributed Systems", "ch. 48–50", "Communication, RPC, and distributed file systems like NFS and AFS.", ["Unreliable networks", "RPC", "NFS and AFS"], "optional")],
    right: [t("security", "Security", "ch. 53–57", "Authentication, access control and cryptography in the OS.", ["Threat models", "Access control", "Authentication"], "optional")],
  },
];

export const ALL_TOPICS = STAGES.flatMap((s) => [...s.left, ...s.right]);

export function topicStatus(id: string): TopicStatus {
  const ch = getChapter(id);
  if (!ch) return "planned";
  return ch.status === "ready" ? "ready" : "soon";
}

export function getTopic(id: string) {
  return ALL_TOPICS.find((x) => x.id === id);
}

/** Suggested learning order, numbered across the whole map. */
export const TOPIC_ORDER: Record<string, number> = Object.fromEntries(ALL_TOPICS.map((x, i) => [x.id, i + 1]));
