import { describe, expect, it } from "vitest";
import { ALL_CHAPTERS } from "./curriculum";
import { MINDMAP, type MindNode } from "./mindmap";
import { ALL_TOPICS, topicStatus } from "./roadmap";

const walk = (n: MindNode): MindNode[] => [n, ...(n.children ?? []).flatMap(walk)];

describe("content integrity", () => {
  it("roadmap topic ids are unique", () => {
    const ids = ALL_TOPICS.map((t) => t.id);
    expect(new Set(ids).size).toBe(ids.length);
  });

  it("every curriculum chapter appears on the roadmap", () => {
    for (const ch of ALL_CHAPTERS) expect(ALL_TOPICS.map((t) => t.id), ch.slug).toContain(ch.slug);
  });

  it("ready chapters show as ready on the roadmap", () => {
    for (const ch of ALL_CHAPTERS.filter((c) => c.status === "ready")) expect(topicStatus(ch.slug)).toBe("ready");
  });

  it("mind map ids are unique and every link points at a roadmap topic", () => {
    const nodes = walk(MINDMAP);
    expect(new Set(nodes.map((n) => n.id)).size).toBe(nodes.length);
    for (const n of nodes) if (n.topic) expect(ALL_TOPICS.map((t) => t.id), n.id).toContain(n.topic);
  });

  it("mind map deep links point at real chapter sections", () => {
    for (const n of walk(MINDMAP).filter((x) => x.section)) {
      const ch = ALL_CHAPTERS.find((c) => c.slug === n.topic);
      expect(ch?.sections?.map((s) => s.id), `${n.id} → ${n.topic}#${n.section}`).toContain(n.section);
    }
  });
});
