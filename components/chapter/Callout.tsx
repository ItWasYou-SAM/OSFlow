import { AlertTriangle, Info, KeyRound, Lightbulb } from "lucide-react";
import type { ReactNode } from "react";

const KINDS = {
  note: { Icon: Info, color: "var(--p2)", label: "Note" },
  key: { Icon: KeyRound, color: "var(--p0)", label: "The crux" },
  tip: { Icon: Lightbulb, color: "var(--p3)", label: "Try it" },
  warn: { Icon: AlertTriangle, color: "var(--p1)", label: "Watch out" },
} as const;

export function Callout({ kind = "note", title, children }: { kind?: keyof typeof KINDS; title?: string; children: ReactNode }) {
  const { Icon, color, label } = KINDS[kind];
  return (
    <aside className="glass not-prose my-6 flex max-w-[68ch] gap-4 rounded-3xl p-4 sm:p-5">
      <span className="tint grid h-10 w-10 shrink-0 place-items-center rounded-2xl" style={{ ["--c" as string]: color }}>
        <Icon size={18} />
      </span>
      <div className="min-w-0 text-[15px] leading-relaxed">
        <p className="mb-1 text-xs font-bold uppercase tracking-[0.18em] text-muted">{title ?? label}</p>
        <div className="space-y-2 text-ink">{children}</div>
      </div>
    </aside>
  );
}
