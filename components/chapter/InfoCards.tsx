import { Activity, Hourglass, OctagonX, Pause, Plus, Radio, Send, X } from "lucide-react";
import { SIGNAL_CARDS } from "@/content/api-data";
import { PROCESS_API_CARDS, type InfoCard } from "@/content/process-data";

const ICONS = { Activity, Hourglass, OctagonX, Pause, Plus, Radio, Send, X };
const SETS: Record<string, InfoCard[]> = { "process-api": PROCESS_API_CARDS, signals: SIGNAL_CARDS };

/** A static grid of concept cards; `set` picks a list from the content files. */
export function InfoCards({ set }: { set: keyof typeof SETS }) {
  return (
    <div className="not-prose my-8 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
      {SETS[set].map((c) => {
        const Icon = ICONS[c.icon as keyof typeof ICONS] ?? Activity;
        return (
          <div key={c.title} className="glass rounded-3xl p-4">
            <div className="flex items-center gap-3">
              <span className="tint grid h-10 w-10 shrink-0 place-items-center rounded-xl" style={{ ["--c" as string]: `var(--p${c.color})` }}>
                <Icon size={18} />
              </span>
              <p className="font-bold text-ink">{c.title}</p>
            </div>
            <p className="mt-2 text-sm leading-relaxed text-muted">{c.body}</p>
            {c.code && <code className="inline-code mt-2 inline-block">{c.code}</code>}
          </div>
        );
      })}
    </div>
  );
}
