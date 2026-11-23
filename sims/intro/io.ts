import { Recorder } from "@/lib/sim";

export const IO_FILE = "io.c";
export const MESSAGE = "hello world\n";

export type Layer = "app" | "kernel" | "cache" | "disk";

export type IoState = {
  mode: "user" | "kernel";
  active: Layer | null;
  call: string | null;
  fd: number | null;
  buffer: string | null;
  cache: { inode: boolean; data: string | null; dirty: boolean };
  disk: { inode: boolean; data: string | null };
  crashed: boolean;
  rebooted: boolean;
};

export type IoParams = { crash: boolean };

export function simulateIo({ crash }: IoParams) {
  const s: IoState = {
    mode: "user",
    active: "app",
    call: null,
    fd: null,
    buffer: null,
    cache: { inode: false, data: null, dirty: false },
    disk: { inode: false, data: null },
    crashed: false,
    rebooted: false,
  };
  const r = new Recorder<IoState>(IO_FILE);

  r.push(s, [], "The program wants to save `hello world` to `/tmp/file` so it survives after the program (or the computer) stops.", "user");

  s.mode = "kernel";
  s.active = "kernel";
  s.call = "open";
  r.push(s, [9, 10], "`open()` is a **system call**: the CPU traps into the kernel and switches to *kernel mode*, where the OS may touch devices directly.", "os");

  s.active = "cache";
  s.cache.inode = true;
  s.fd = 3;
  r.push(s, [9, 10], "The file system finds `/tmp`, creates a new file (an *inode*) in memory, and records it in the process's file table as **fd 3**.", "os");

  s.mode = "user";
  s.active = "app";
  s.call = null;
  r.push(s, 11, "`open()` returns `fd = 3` and the CPU drops back to *user mode*.", "user");

  s.buffer = MESSAGE;
  r.push(s, 13, "`sprintf` fills a buffer in the program's own memory. Plain user code; the OS isn't involved.", "user");

  s.mode = "kernel";
  s.active = "kernel";
  s.call = "write";
  r.push(s, 14, "`write()` traps into the kernel again, handing over a pointer to the buffer and its length (12 bytes).", "os");

  s.active = "cache";
  s.cache.data = MESSAGE;
  s.cache.dirty = true;
  r.push(s, 14, "The kernel copies the bytes into the **page cache** in RAM and marks them *dirty*. It returns right away. **The disk hasn't been touched yet!**", "os");

  s.mode = "user";
  s.active = "app";
  s.call = null;
  r.push(s, 15, "`write()` returns 12. The program thinks the data is saved, but it only lives in memory.", "user");

  if (crash) {
    s.crashed = true;
    s.active = null;
    s.cache = { inode: false, data: null, dirty: false };
    s.fd = null;
    s.buffer = null;
    r.push(s, 16, "💥 **Power failure** just before `fsync()`! Everything in RAM, including the page cache, vanishes instantly.", "danger");
    s.rebooted = true;
    r.push(s, [], "After reboot the disk has no trace of `/tmp/file`. Data in memory is not *persistent*. Only the disk survives.", "danger");
    return r.steps;
  }

  s.mode = "kernel";
  s.active = "kernel";
  s.call = "fsync";
  r.push(s, 16, "`fsync()` asks the OS: *push everything for this file to the disk now, and don't return until it's done.*", "os");

  s.active = "disk";
  s.disk.data = MESSAGE;
  r.push(s, 16, "The file system issues a disk write for the **data block**…", "os");

  s.disk.inode = true;
  s.cache.dirty = false;
  r.push(s, 16, "…and for the **inode** (size, owner, where the blocks are). Real file systems order these writes carefully (e.g. *journaling*) so a crash halfway can't corrupt the disk.", "os");

  s.mode = "user";
  s.active = "app";
  s.call = null;
  r.push(s, 16, "`fsync()` returns. Now the data is **durable**: it would survive a power cut.", "user");

  s.mode = "kernel";
  s.active = "kernel";
  s.call = "close";
  s.fd = null;
  r.push(s, 17, "`close()` releases fd 3. The file stays on disk.", "os");

  s.mode = "user";
  s.active = "app";
  s.call = null;
  r.push(s, 18, "Done. The OS turned \"put bytes on a spinning platter or flash chip\" into a simple `open`/`write`/`close` API. That is **persistence**.", "success");
  return r.steps;
}
