import { describe, expect, it } from "vitest";
import { initialPlayer, playerReducer as r } from "./playerReducer";

const total = 5;

describe("playerReducer", () => {
  it("steps and clamps", () => {
    let s = r(initialPlayer, { type: "prev", total });
    expect(s.index).toBe(0);
    for (let i = 0; i < 10; i++) s = r(s, { type: "next", total });
    expect(s.index).toBe(4);
  });

  it("ticks only while playing and stops at the end", () => {
    let s = r(initialPlayer, { type: "tick", total });
    expect(s.index).toBe(0);
    s = r(s, { type: "play", total });
    for (let i = 0; i < 10; i++) s = r(s, { type: "tick", total });
    expect(s).toMatchObject({ index: 4, playing: false });
  });

  it("play at the end restarts", () => {
    const s = r({ index: 4, playing: false, speed: 1 }, { type: "toggle", total });
    expect(s).toMatchObject({ index: 0, playing: true });
  });

  it("manual navigation pauses playback", () => {
    const s = r({ index: 2, playing: true, speed: 1 }, { type: "seek", index: 3, total });
    expect(s).toMatchObject({ index: 3, playing: false });
  });
});
