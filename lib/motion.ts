/**
 * One motion language for the whole site: short, eased, no overshoot.
 * Prefer these over ad-hoc springs so every animation feels consistent.
 */
export const EASE = [0.22, 1, 0.36, 1] as const; // ease-out-quint

export const fast = { duration: 0.2, ease: EASE } as const;
export const base = { duration: 0.35, ease: EASE } as const;
export const slow = { duration: 0.6, ease: EASE } as const;

/** Fade + small rise, used for content that enters or swaps. */
export const fadeUp = {
  initial: { opacity: 0, y: 6 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -6 },
  transition: base,
} as const;
