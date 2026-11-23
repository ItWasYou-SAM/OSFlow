import { readFileSync } from "node:fs";
import { join } from "node:path";
import { expect } from "vitest";
import type { Step } from "@/lib/sim";

/** Every highlighted line and gutter cursor must exist in the source file it refers to. */
export function expectValidLines(steps: Step<unknown>[], codeDir: string) {
  expect(steps.length).toBeGreaterThan(2);
  const count = (file: string) => readFileSync(join(__dirname, "../content/code", codeDir, file), "utf8").trimEnd().split("\n").length;
  for (const st of steps) {
    const n = count(st.file);
    for (const l of [...st.lines, ...(st.cursors ?? []).map((c) => c.line)]) {
      expect(l, `${st.file}: "${st.narration.slice(0, 40)}"`).toBeGreaterThanOrEqual(1);
      expect(l, `${st.file}: "${st.narration.slice(0, 40)}"`).toBeLessThanOrEqual(n);
    }
    expect(st.narration.length).toBeGreaterThan(0);
  }
}
