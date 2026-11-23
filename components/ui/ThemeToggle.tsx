"use client";

import { motion } from "framer-motion";
import { Moon, Sun } from "lucide-react";
import { useEffect, useState } from "react";

export function ThemeToggle() {
  const [dark, setDark] = useState(true);
  useEffect(() => setDark(document.documentElement.classList.contains("dark")), []);

  const toggle = () => {
    const next = !dark;
    setDark(next);
    document.documentElement.classList.toggle("dark", next);
    try {
      localStorage.setItem("osflow-theme", next ? "dark" : "light");
    } catch {
      /* storage unavailable: theme just won't persist */
    }
  };

  return (
    <button
      type="button"
      onClick={toggle}
      aria-label={dark ? "Switch to light theme" : "Switch to dark theme"}
      className="neu focus-ring relative flex h-9 w-16 items-center rounded-full px-1"
    >
      <motion.span
        layout
        transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
        className="solid grid h-7 w-7 place-items-center rounded-full"
        style={{ ["--c" as string]: dark ? "var(--p0)" : "var(--p3)", marginLeft: dark ? "auto" : 0 }}
      >
        {dark ? <Moon size={14} /> : <Sun size={14} />}
      </motion.span>
    </button>
  );
}
