"use client";

import { MotionConfig } from "framer-motion";

/** reducedMotion="user" turns transform animations into instant changes for people who ask for less motion. */
export function Providers({ children }: { children: React.ReactNode }) {
  return <MotionConfig reducedMotion="user">{children}</MotionConfig>;
}
