import { Fragment, type ReactNode } from "react";

/* Minimal, dependency-free Markdown renderer for the subset the AI is
   instructed to emit: ## / ### headings, - bullets, 1. lists, paragraphs,
   **bold**, *italic*, `code`. */

function renderInline(text: string, keyPrefix: string): ReactNode[] {
  const nodes: ReactNode[] = [];
  const pattern = /(\*\*[^*]+\*\*|\*[^*]+\*|`[^`]+`)/g;
  let last = 0;
  let match: RegExpExecArray | null;
  let i = 0;
  while ((match = pattern.exec(text)) !== null) {
    if (match.index > last) nodes.push(text.slice(last, match.index));
    const token = match[0];
    const key = `${keyPrefix}-${i++}`;
    if (token.startsWith("**")) {
      nodes.push(
        <strong key={key} className="font-semibold text-foreground">
          {token.slice(2, -2)}
        </strong>,
      );
    } else if (token.startsWith("`")) {
      nodes.push(
        <code key={key} className="rounded bg-muted px-1 py-0.5 text-[0.8em]">
          {token.slice(1, -1)}
        </code>,
      );
    } else {
      nodes.push(<em key={key}>{token.slice(1, -1)}</em>);
    }
    last = match.index + token.length;
  }
  if (last < text.length) nodes.push(text.slice(last));
  return nodes;
}

type Block =
  | { type: "h2"; text: string }
  | { type: "h3"; text: string }
  | { type: "p"; text: string }
  | { type: "ul"; items: string[] }
  | { type: "ol"; items: string[] };

function parse(markdown: string): Block[] {
  const lines = markdown.replace(/```[a-z]*\n?/gi, "").split("\n");
  const blocks: Block[] = [];
  let list: { type: "ul" | "ol"; items: string[] } | null = null;
  let para: string[] = [];

  const flushPara = () => {
    if (para.length) {
      blocks.push({ type: "p", text: para.join(" ") });
      para = [];
    }
  };
  const flushList = () => {
    if (list) {
      blocks.push(list);
      list = null;
    }
  };

  for (const raw of lines) {
    const line = raw.trimEnd();
    const trimmed = line.trim();
    if (!trimmed) {
      flushPara();
      flushList();
      continue;
    }
    const heading = /^(#{1,6})\s+(.*)$/.exec(trimmed);
    if (heading) {
      flushPara();
      flushList();
      blocks.push({
        type: heading[1].length <= 2 ? "h2" : "h3",
        text: heading[2].replace(/[*#]+$/g, "").trim(),
      });
      continue;
    }
    const bullet = /^[-*•]\s+(.*)$/.exec(trimmed);
    if (bullet) {
      flushPara();
      if (!list || list.type !== "ul") {
        flushList();
        list = { type: "ul", items: [] };
      }
      list.items.push(bullet[1]);
      continue;
    }
    const ordered = /^\d+[.)]\s+(.*)$/.exec(trimmed);
    if (ordered) {
      flushPara();
      if (!list || list.type !== "ol") {
        flushList();
        list = { type: "ol", items: [] };
      }
      list.items.push(ordered[1]);
      continue;
    }
    if (list) {
      // continuation of the previous list item
      list.items[list.items.length - 1] += ` ${trimmed}`;
      continue;
    }
    para.push(trimmed);
  }
  flushPara();
  flushList();
  return blocks;
}

export function Markdown({ children }: { children: string }) {
  const blocks = parse(children);
  return (
    <div className="space-y-4 text-sm leading-relaxed text-foreground">
      {blocks.map((block, i) => {
        if (block.type === "h2")
          return (
            <h3 key={i} className="pt-1 text-base font-semibold tracking-tight text-foreground">
              {renderInline(block.text, `h${i}`)}
            </h3>
          );
        if (block.type === "h3")
          return (
            <h4 key={i} className="text-sm font-semibold text-foreground">
              {renderInline(block.text, `h${i}`)}
            </h4>
          );
        if (block.type === "p")
          return (
            <p key={i} className="text-sm leading-relaxed text-foreground/90">
              {renderInline(block.text, `p${i}`)}
            </p>
          );
        const ListTag = block.type === "ul" ? "ul" : "ol";
        return (
          <ListTag
            key={i}
            className={`space-y-1.5 pl-5 text-sm text-foreground/90 ${
              block.type === "ul" ? "list-disc" : "list-decimal"
            }`}
          >
            {block.items.map((item, j) => (
              <li key={j}>{renderInline(item, `l${i}-${j}`)}</li>
            ))}
          </ListTag>
        );
      })}
    </div>
  );
}

/** Strips Markdown syntax so copied text reads cleanly as plain text. */
export function markdownToPlainText(markdown: string): string {
  const blocks = parse(markdown);
  const out: string[] = [];
  const clean = (s: string) =>
    s
      .replace(/\*\*([^*]+)\*\*/g, "$1")
      .replace(/\*([^*]+)\*/g, "$1")
      .replace(/`([^`]+)`/g, "$1");
  for (const block of blocks) {
    if (block.type === "h2" || block.type === "h3") out.push(`${clean(block.text)}\n`);
    else if (block.type === "p") out.push(`${clean(block.text)}\n`);
    else
      out.push(
        `${block.items
          .map((it, i) => (block.type === "ol" ? `${i + 1}. ${clean(it)}` : `• ${clean(it)}`))
          .join("\n")}\n`,
      );
  }
  return out.join("\n").trim();
}

export { renderInline as renderMarkdownInline };
export type { Block as MarkdownBlock };
