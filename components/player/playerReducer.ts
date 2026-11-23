export type PlayerState = { index: number; playing: boolean; speed: number };

export type PlayerAction =
  | { type: "next" | "prev" | "play" | "pause" | "toggle" | "reset" | "tick"; total: number }
  | { type: "seek"; index: number; total: number }
  | { type: "speed"; speed: number; total: number };

export const SPEEDS = [0.5, 1, 1.5, 2] as const;
export const BASE_DELAY_MS = 1500;

export const initialPlayer: PlayerState = { index: 0, playing: false, speed: 1 };

const clamp = (i: number, total: number) => Math.max(0, Math.min(total - 1, i));

export function playerReducer(s: PlayerState, a: PlayerAction): PlayerState {
  const last = Math.max(0, a.total - 1);
  switch (a.type) {
    case "next":
      return { ...s, index: clamp(s.index + 1, a.total), playing: false };
    case "prev":
      return { ...s, index: clamp(s.index - 1, a.total), playing: false };
    case "seek":
      return { ...s, index: clamp(a.index, a.total), playing: false };
    case "play":
      // Pressing play at the end restarts from the beginning.
      return { ...s, index: s.index >= last ? 0 : s.index, playing: a.total > 1 };
    case "pause":
      return { ...s, playing: false };
    case "toggle":
      return playerReducer(s, { type: s.playing ? "pause" : "play", total: a.total });
    case "reset":
      return { ...s, index: 0, playing: false };
    case "tick":
      if (!s.playing) return s;
      if (s.index >= last) return { ...s, playing: false };
      return { ...s, index: s.index + 1, playing: s.index + 1 < last };
    case "speed":
      return { ...s, speed: a.speed };
  }
}
