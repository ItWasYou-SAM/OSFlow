/** A tiny clay "chip" with a flowing wave: the OSFLOW mark. */
export function Logo({ className }: { className?: string }) {
  return (
    <span className={`solid relative grid place-items-center rounded-[10px] ${className ?? ""}`} style={{ ["--c" as string]: "var(--p0)" }} aria-hidden>
      <svg viewBox="0 0 24 24" className="h-[60%] w-[60%]" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round">
        <path d="M3 14c3-6 6-6 9 0s6 6 9 0" />
      </svg>
    </span>
  );
}
