<!-- ───────────────────────── Header ───────────────────────── -->
<p align="center">
  <img src="https://capsule-render.vercel.app/api?type=waving&color=0:9b8cff,50:ff7ab8,100:f6a94b&height=210&section=header&text=OSFLOW&fontSize=78&fontColor=ffffff&fontAlignY=36&desc=See%20the%20operating%20system%20think&descSize=20&descAlignY=58&animation=fadeIn" alt="OSFLOW: see the operating system think" width="100%" />
</p>

<p align="center">
  <img src="docs/assets/logo.svg" width="64" alt="OSFLOW logo" />
</p>

<p align="center">
  <a href="#-see-it-in-action">
    <img src="https://readme-typing-svg.demolab.com?font=JetBrains+Mono&weight=600&size=19&duration=2600&pause=900&color=9B8CFF&center=true&vCenter=true&width=640&lines=Real+code+%E2%86%94+step-synced+animation;Watch+fork()+return+twice;Watch+two+threads+lose+an+update;Follow+OSTEP%2C+one+concept+at+a+time" alt="Typing animation: Real code ↔ step-synced animation" />
  </a>
</p>

<p align="center">
  <img src="https://img.shields.io/badge/Next.js-15-000000?style=for-the-badge&logo=nextdotjs&logoColor=white" alt="Next.js 15" />
  <img src="https://img.shields.io/badge/TypeScript-strict-3178C6?style=for-the-badge&logo=typescript&logoColor=white" alt="TypeScript" />
  <img src="https://img.shields.io/badge/Tailwind-v4-06B6D4?style=for-the-badge&logo=tailwindcss&logoColor=white" alt="Tailwind CSS v4" />
  <img src="https://img.shields.io/badge/Framer_Motion-11-0055FF?style=for-the-badge&logo=framer&logoColor=white" alt="Framer Motion" />
  <br/>
  <img src="https://img.shields.io/badge/MDX-lessons-F9AC00?style=for-the-badge&logo=mdx&logoColor=black" alt="MDX lessons" />
  <img src="https://img.shields.io/badge/tests-31_passing-3ddbc6?style=for-the-badge&logo=vitest&logoColor=white" alt="31 tests passing" />
  <img src="https://img.shields.io/badge/follows-OSTEP-9b8cff?style=for-the-badge&logo=bookstack&logoColor=white" alt="Follows OSTEP" />
</p>

<p align="center">
  <b>OSFLOW</b> makes operating systems easy for newcomers.<br/>
  Every concept gets <b>real code</b> on one side and an <b>animation of what the machine is doing</b> on the other,<br/>
  moving together <b>line by line</b>, with a plain-English explanation of every step.
</p>

<p align="center">
  <img src="docs/assets/home.png" alt="OSFLOW home page" width="92%" />
</p>

---

## <img src="https://raw.githubusercontent.com/Tarikul-Islam-Anik/Animated-Fluent-Emojis/master/Emojis/Objects/Card%20Index%20Dividers.png" width="30" /> Table of contents

1. [Why OSFLOW?](#-why-osflow)
2. [See it in action](#-see-it-in-action)
3. [What you can learn today](#-what-you-can-learn-today)
4. [Roadmap & mind map](#-roadmap--mind-map)
5. [How a lesson works](#-how-a-lesson-works)
6. [Design](#-design)
7. [Getting started](#-getting-started)
8. [Project structure](#-project-structure)
9. [Adding a chapter](#-adding-a-chapter)
10. [Credits](#-credits)

---

## <img src="https://raw.githubusercontent.com/Tarikul-Islam-Anik/Animated-Fluent-Emojis/master/Emojis/Objects/Light%20Bulb.png" width="30" /> Why OSFLOW?

Operating-system books show you code and describe what happens, but **you have to picture the machine in your head**. That's the hard part for beginners.

OSFLOW draws that picture for you:

| | |
|---|---|
| 🧾 **Real code** | The classic example programs from *Operating Systems: Three Easy Pieces* (OSTEP), with the running line highlighted |
| 🎞️ **Step-synced animation** | CPU, memory, processes, files and disks react to every line. Play, pause, rewind, scrub, change speed |
| 💬 **Plain-language narration** | Each step says *what* just happened and *why* the OS did it |
| 🎛️ **Things to try** | Switches like *"who runs first?"*, *"unlucky timing"* or *"crash before fsync()"* change the outcome |
| ✅ **Quizzes & progress** | Every chapter ends with a quiz; your score shows on the home page and the roadmap |

---

## <img src="https://raw.githubusercontent.com/Tarikul-Islam-Anik/Animated-Fluent-Emojis/master/Emojis/Objects/Film%20Frames.png" width="30" /> See it in action

### 1. Play with a CPU on the home page

Click a process to schedule it, add one with <kbd>+</kbd>, and watch the timer interrupt hand out time slices.

<p align="center">
  <img src="docs/assets/playground.gif" alt="Interactive CPU scheduler playground" width="420" />
</p>

### 2. One CPU, many programs

Four copies of `cpu.c` share one core. The highlighted line follows whichever process is running, and the terminal shows their output interleaving.

<p align="center">
  <img src="docs/assets/demo-cpu.gif" alt="CPU virtualization demo" width="88%" />
</p>

### 3. A race condition, caught in the act

`counter++` is really **load → add → store**. With *unlucky* timing, two threads overwrite each other: 3 + 3 should be 6, but the result is **4**.

<p align="center">
  <img src="docs/assets/demo-race.gif" alt="Two threads losing an update" width="88%" />
</p>

### 4. `fork()` + `wait()`, with both processes on screen

The <kbd>P</kbd> and <kbd>C</kbd> markers in the gutter show where the **parent** and the **child** are. `fork()` returns twice, the parent blocks in `wait()`, and the child becomes a zombie and gets reaped.

<p align="center">
  <img src="docs/assets/demo-fork.gif" alt="fork and wait demo" width="88%" />
</p>

<details>
<summary><b>📸 More lessons (click to expand)</b></summary>
<br/>

| Same address, different memory | xv6's `struct proc` & a context switch |
|:---:|:---:|
| <img src="docs/assets/demo-memory.png" alt="Virtual memory demo" /> | <img src="docs/assets/demo-pcb.png" alt="PCB demo" /> |

<p align="center"><b>How the shell does <code>&gt;</code> redirection</b>: <code>close(1)</code>, <code>open()</code> reuses fd 1, and <code>exec</code> keeps it.</p>
<p align="center"><img src="docs/assets/demo-redirect.png" alt="Redirection demo" width="70%" /></p>

</details>

---

## <img src="https://raw.githubusercontent.com/Tarikul-Islam-Anik/Animated-Fluent-Emojis/master/Emojis/Objects/Books.png" width="30" /> What you can learn today

| # | Chapter | OSTEP | Interactive demos |
|:-:|---|:-:|---|
| 1 | **Introduction to Operating Systems** | ch. 2 | fetch → decode → execute · CPU virtualization · virtual memory · thread race · `write` / `fsync` / crash |
| 2 | **The Process** | ch. 4 | program → process loading · Ready / Running / Blocked with trace table · xv6 PCB & context switch |
| 3 | **Process API** | ch. 5 | `fork()` · `wait()` · `exec()` · shell redirection |

Each chapter also covers the theory around the demos: design goals, history, process states, pipes, signals, users. It ends with a **6-question quiz**.

> [!TIP]
> Click a demo, then press <kbd>Space</kbd> to play or pause, <kbd>←</kbd> <kbd>→</kbd> to step, and <kbd>R</kbd> to restart.

---

## <img src="https://raw.githubusercontent.com/Tarikul-Islam-Anik/Animated-Fluent-Emojis/master/Emojis/Travel%20and%20places/World%20Map.png" width="30" /> Roadmap & mind map

Two maps of the whole subject, linked to the lessons.

### 🛣️ Learning roadmap (`/roadmap`)

**36 topics in 6 stages**, in OSTEP order, drawn like a roadmap.sh spine. Each topic shows whether its lesson is live, coming soon or planned, and whether it's core or optional. Click a topic to see what you'll learn and jump into its lesson. Below the map, a written guide explains every stage.

<p align="center">
  <img src="docs/assets/roadmap.gif" alt="Roadmap page" width="88%" />
</p>

### 🧠 Concept mind map (`/mindmap`)

**41 concepts around 6 big ideas.** Expand and collapse branches, zoom, drag, and click any concept to read what it means and open the exact lesson section. There's also an outline view for phones and screen readers.

<p align="center">
  <img src="docs/assets/mindmap.gif" alt="Interactive mind map" width="88%" />
</p>

---

## <img src="https://raw.githubusercontent.com/Tarikul-Islam-Anik/Animated-Fluent-Emojis/master/Emojis/Objects/Gear.png" width="30" /> How a lesson works

Every demo is a **pure simulator** that returns a list of snapshots. The player just moves through that list, which is why rewind and scrubbing come free and every demo can be unit-tested.

```mermaid
flowchart LR
    A["simulate(params)<br/><i>pure TypeScript</i>"] --> B["Step[]<br/>state · lines · narration"]
    B --> C{{"SimulationPlayer<br/>play · step · scrub"}}
    C --> D["📄 Code panel<br/>highlights lines"]
    C --> E["🎞️ Animation<br/>draws state"]
    C --> F["💬 Narration<br/>explains why"]
```

```ts
type Step<S> = {
  file: string;        // which source file
  lines: number[];     // lines to highlight
  state: S;            // full snapshot of the simulated machine
  narration: string;   // plain-language explanation
  cursors?: Cursor[];  // per-process markers (parent / child)
};
```

Source code is syntax-highlighted **at build time** with Shiki, so no highlighter code reaches the browser.

---

## <img src="https://raw.githubusercontent.com/Tarikul-Islam-Anik/Animated-Fluent-Emojis/master/Emojis/Activities/Artist%20Palette.png" width="30" /> Design

- **Dark-first** with a pure-black background, plus a light theme
- **Glass** for containers, **clay** only for processes & threads, and flat **tinted** chips for everything else
- **Clean motion**: one ease-out curve, no springs or flashy loops, and respect for *reduce motion*
- **Accessible**: keyboard-driven players, live narration regions, AA contrast, outline views

<p align="center">
  <img src="docs/assets/themes.png" alt="Dark and light themes" width="92%" />
</p>

<p align="center">
  <b>Works on phones</b> 📱<br/><br/>
  <img src="docs/assets/mobile.png" alt="OSFLOW on mobile" width="80%" />
</p>

---

## <img src="https://raw.githubusercontent.com/Tarikul-Islam-Anik/Animated-Fluent-Emojis/master/Emojis/Travel%20and%20places/Rocket.png" width="30" /> Getting started

**Requirements:** Node.js 20+ and npm.

```bash
git clone https://github.com/ItWasYou-SAM/OSFlow.git
cd OSFlow
npm install
npm run dev          # → http://localhost:3000
```

| Command | What it does |
|---|---|
| `npm run dev` | Start the dev server with hot reload |
| `npm test` | Run the 31 unit tests (simulators, player, content links) |
| `npm run typecheck` | TypeScript check |
| `npm run build` | Static export to `./out`, ready for any static host |
| `npm run preview` | Serve the built `./out` folder |

---

## <img src="https://raw.githubusercontent.com/Tarikul-Islam-Anik/Animated-Fluent-Emojis/master/Emojis/Objects/Laptop.png" width="30" /> Project structure

```text
OSFlow/
├── app/                    # routes: /, /learn/[chapter], /roadmap, /mindmap
├── content/
│   ├── chapters/*.mdx      # lesson text + <Demo id="…" />
│   ├── code/**             # the C / assembly shown in code panels
│   ├── curriculum.ts       # chapters & sections
│   ├── roadmap.ts          # 36 roadmap topics in 6 stages
│   └── mindmap.ts          # concept mind map
├── sims/                   # pure simulators + tests (one folder per chapter)
├── components/
│   ├── player/             # SimulationPlayer (play, step, scrub, speed)
│   ├── code/               # CodePanel (highlighting, per-process cursors)
│   ├── demos/              # one component per demo + Demo registry
│   ├── viz/                # process blobs, terminal, registers, PCB cards
│   ├── roadmap/ mindmap/   # the two maps
│   └── home/ chapter/ ui/  # landing page, lesson widgets, shared UI
└── docs/assets/            # README screenshots & GIFs
```

---

## <img src="https://raw.githubusercontent.com/Tarikul-Islam-Anik/Animated-Fluent-Emojis/master/Emojis/Objects/Hammer%20and%20Wrench.png" width="30" /> Adding a chapter

1. **Code:** put the example program in `content/code/<chapter>/`.
2. **Simulator:** write `sims/<chapter>/<demo>.ts` with `Recorder` from `lib/sim.ts`, plus a test.
3. **Visual:** create a component in `components/demos/` that draws the state inside `<SimulationPlayer>`, and register it in `components/demos/Demo.tsx`.
4. **Lesson:** write `content/chapters/<slug>.mdx` with `<Section>`s and `<Demo id="…" />`.
5. **Publish:** in `content/curriculum.ts` set `status: "ready"`, `demos` and `sections`, then add the MDX import in `app/learn/[chapter]/page.tsx`.

The roadmap and mind map pick up the new chapter automatically, and `content/content.test.ts` checks that every link still resolves.

<img src="https://raw.githubusercontent.com/Tarikul-Islam-Anik/Animated-Fluent-Emojis/master/Emojis/Objects/Test%20Tube.png" width="22" /> **Tests:** `npm test` runs the simulators (for example, "a successful `exec()` never returns", "an unlucky schedule loses updates", "fsync makes data durable"), the player logic, and content integrity.

---

## <img src="https://raw.githubusercontent.com/Tarikul-Islam-Anik/Animated-Fluent-Emojis/master/Emojis/Hand%20gestures/Folded%20Hands.png" width="30" /> Credits

- **[Operating Systems: Three Easy Pieces](https://pages.cs.wisc.edu/~remzi/OSTEP/)** by Remzi H. Arpaci-Dusseau and Andrea C. Arpaci-Dusseau. The chapter order and example programs are modeled on this free book. All explanatory text in OSFLOW is original.
- **[xv6](https://github.com/mit-pdos/xv6-public)** (MIT) for the `struct proc` shown in *The Process*.
- Animated emoji stickers from [Animated Fluent Emojis](https://github.com/Tarikul-Islam-Anik/Animated-Fluent-Emojis). Banner by [capsule-render](https://github.com/kyechan99/capsule-render), typing line by [readme-typing-svg](https://github.com/DenverCoder1/readme-typing-svg).

<p align="center">
  <img src="https://raw.githubusercontent.com/Tarikul-Islam-Anik/Animated-Fluent-Emojis/master/Emojis/Hand%20gestures/Waving%20Hand.png" width="40" /><br/>
  <b>Happy learning! If OSFLOW helped you, give it a ⭐</b>
</p>

<p align="center">
  <img src="https://capsule-render.vercel.app/api?type=waving&color=0:f6a94b,50:ff7ab8,100:9b8cff&height=110&section=footer" alt="" width="100%" />
</p>
