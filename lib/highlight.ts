import { readFile } from "node:fs/promises";
import { join } from "node:path";
import { createHighlighter, type BundledLanguage, type Highlighter } from "shiki";
import type { CodeFile, CodeToken } from "./sim";

// Build-time only: tokens are computed once and shipped as plain data, so no
// highlighter code reaches the browser.

const THEMES = { light: "github-light", dark: "tokyo-night" } as const;
const LANG_BY_EXT: Record<string, BundledLanguage> = { c: "c", h: "c", s: "asm" };

let highlighter: Promise<Highlighter> | null = null;
function getHighlighter() {
  highlighter ??= createHighlighter({ themes: Object.values(THEMES), langs: ["c", "asm"] });
  return highlighter;
}

/** Load `content/code/<path>` and tokenize it for both themes. */
export async function loadCode(path: string): Promise<CodeFile> {
  const source = (await readFile(join(process.cwd(), "content/code", path), "utf8")).trimEnd();
  const name = path.split("/").pop()!;
  const lang = LANG_BY_EXT[name.split(".").pop() ?? ""] ?? "c";
  const hl = await getHighlighter();
  const rows = hl.codeToTokensWithThemes(source, { lang, themes: THEMES });
  const lines: CodeToken[][] = rows.map((row) =>
    row.map((t) => ({
      content: t.content,
      light: t.variants.light?.color,
      dark: t.variants.dark?.color,
      italic: ((t.variants.dark?.fontStyle ?? 0) & 1) === 1 || undefined,
    })),
  );
  return { name, lang, lines };
}
