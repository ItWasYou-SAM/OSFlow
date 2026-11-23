import Link from "next/link";
import { ThemeToggle } from "./ThemeToggle";
import { Logo } from "./Logo";

const LINK = "focus-ring rounded-xl px-2 py-2 text-xs font-medium text-muted transition-colors hover:text-ink sm:px-3 sm:text-sm";

export function Nav() {
  return (
    <header className="sticky top-0 z-40 px-3 pt-3 sm:px-6">
      <nav className="glass-strong mx-auto flex max-w-6xl items-center justify-between gap-2 rounded-2xl px-2 py-2 sm:px-4" aria-label="Main">
        <Link href="/" className="focus-ring flex shrink-0 items-center gap-2 rounded-xl px-1 py-1">
          <Logo className="h-8 w-8" />
          <span className="hidden text-lg font-extrabold tracking-tight min-[400px]:inline">
            OS<span className="text-gradient">FLOW</span>
          </span>
        </Link>
        <div className="flex items-center gap-0.5 sm:gap-1">
          <Link href="/roadmap/" className={LINK}>
            Roadmap
          </Link>
          <Link href="/mindmap/" className={LINK}>
            Mind map
          </Link>
          <Link href="/#path" className={`${LINK} hidden md:block`}>
            Chapters
          </Link>
          <Link href="/learn/introduction/" className="solid focus-ring ml-1 hidden rounded-xl px-3 py-2 text-sm font-semibold lg:block">
            Start learning
          </Link>
          <span className="ml-1">
            <ThemeToggle />
          </span>
        </div>
      </nav>
    </header>
  );
}
