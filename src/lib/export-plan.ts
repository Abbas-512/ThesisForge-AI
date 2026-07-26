import type { ProjectInput } from "./project-store";
import { MODULE_IDS, MODULE_LABELS, type ModuleId, type ModuleResult } from "./modules";

function escapeHtml(value: string) {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function inline(text: string) {
  return escapeHtml(text)
    .replace(/\*\*([^*]+)\*\*/g, "<strong>$1</strong>")
    .replace(/\*([^*]+)\*/g, "<em>$1</em>")
    .replace(/`([^`]+)`/g, "<code>$1</code>");
}

function markdownToHtml(markdown: string) {
  const lines = markdown.replace(/```[a-z]*\n?/gi, "").split("\n");
  const out: string[] = [];
  let inList = false;
  const closeList = () => {
    if (inList) {
      out.push("</ul>");
      inList = false;
    }
  };
  for (const raw of lines) {
    const line = raw.trim();
    if (!line) {
      closeList();
      continue;
    }
    const heading = /^(#{1,6})\s+(.*)$/.exec(line);
    if (heading) {
      closeList();
      out.push(`<h3>${inline(heading[2])}</h3>`);
      continue;
    }
    const bullet = /^(?:[-*•]|\d+[.)])\s+(.*)$/.exec(line);
    if (bullet) {
      if (!inList) {
        out.push("<ul>");
        inList = true;
      }
      out.push(`<li>${inline(bullet[1])}</li>`);
      continue;
    }
    closeList();
    out.push(`<p>${inline(line)}</p>`);
  }
  closeList();
  return out.join("\n");
}

/** Builds a clean, print-ready document from every generated module and opens the print dialog. */
export function exportPlanToPrint(
  project: ProjectInput,
  results: Partial<Record<ModuleId, ModuleResult>>,
) {
  const generated = MODULE_IDS.filter((id) => results[id]);
  if (generated.length === 0) return false;

  const sections = generated
    .map((id) => {
      const result = results[id]!;
      const body =
        result.kind === "feasibility"
          ? `<p class="score">${result.feasibility.score}/100 — ${escapeHtml(
              result.feasibility.label,
            )}</p><p>${escapeHtml(result.feasibility.justification)}</p>`
          : markdownToHtml(result.markdown);
      return `<section><h2>${escapeHtml(MODULE_LABELS[id])}</h2>${body}</section>`;
    })
    .join("\n");

  const html = `<!doctype html>
<html lang="en"><head><meta charset="utf-8" />
<title>${escapeHtml(project.title)} — Project Plan</title>
<style>
  @page { margin: 18mm; }
  * { box-sizing: border-box; }
  body { font-family: Inter, "Helvetica Neue", Arial, sans-serif; color: #1e2334; line-height: 1.55; font-size: 11.5pt; margin: 0; padding: 24px; }
  header { border-bottom: 2px solid #4f46e5; padding-bottom: 12px; margin-bottom: 24px; }
  h1 { font-size: 20pt; margin: 0 0 6px; }
  .meta { font-size: 9.5pt; color: #5b6178; margin: 2px 0; }
  section { margin-bottom: 22px; page-break-inside: avoid; }
  h2 { font-size: 13pt; margin: 0 0 8px; color: #4f46e5; border-bottom: 1px solid #e3e5ee; padding-bottom: 4px; }
  h3 { font-size: 11pt; margin: 14px 0 4px; }
  p { margin: 0 0 8px; }
  ul { margin: 0 0 10px; padding-left: 20px; }
  li { margin-bottom: 4px; }
  code { font-family: ui-monospace, Menlo, monospace; font-size: 0.9em; }
  .score { font-size: 15pt; font-weight: 700; }
  footer { margin-top: 28px; border-top: 1px solid #e3e5ee; padding-top: 8px; font-size: 8.5pt; color: #8b90a3; }
  @media print { body { padding: 0; } .no-print { display: none !important; } }
</style></head>
<body>
<header>
  <h1>${escapeHtml(project.title)}</h1>
  <p class="meta"><strong>Domain:</strong> ${escapeHtml(project.domain)}</p>
  <p class="meta"><strong>Idea:</strong> ${escapeHtml(project.idea)}</p>
  ${project.constraints ? `<p class="meta"><strong>Constraints:</strong> ${escapeHtml(project.constraints)}</p>` : ""}
  <p class="meta">Generated with ThesisForge AI · ${new Date().toLocaleDateString()}</p>
</header>
${sections}
<footer>${generated.length} of ${MODULE_IDS.length} modules included · ThesisForge AI</footer>
<script>window.addEventListener("load", function () { window.focus(); window.print(); });</script>
</body></html>`;

  const win = window.open("", "_blank", "width=900,height=1000");
  if (!win) return false;
  win.document.open();
  win.document.write(html);
  win.document.close();
  return true;
}
