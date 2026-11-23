import type { MDXComponents } from "mdx/types";
import { Callout } from "@/components/chapter/Callout";
import { DesignGoals } from "@/components/chapter/DesignGoals";
import { HistoryTimeline } from "@/components/chapter/HistoryTimeline";
import { InfoCards } from "@/components/chapter/InfoCards";
import { Quiz } from "@/components/chapter/Quiz";
import { Section } from "@/components/chapter/Section";
import { Demo } from "@/components/demos/Demo";

/** Components available in every chapter .mdx file without importing. */
export function useMDXComponents(components: MDXComponents): MDXComponents {
  return {
    Section,
    Callout,
    Demo,
    DesignGoals,
    HistoryTimeline,
    InfoCards,
    Quiz,
    a: ({ href = "", ...props }) => (
      <a href={href} {...(href.startsWith("http") ? { target: "_blank", rel: "noreferrer" } : {})} {...props} />
    ),
    ...components,
  };
}
