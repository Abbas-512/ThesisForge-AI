import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useCallback, useEffect, useMemo, useRef, useState, type ComponentType } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger, SheetTitle } from "@/components/ui/sheet";
import { Skeleton } from "@/components/ui/skeleton";
import { Progress } from "@/components/ui/progress";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { useProject } from "@/lib/project-store";
import { Markdown, markdownToPlainText } from "@/components/markdown";
import { generateModule } from "@/lib/generate.functions";
import { exportPlanToPrint } from "@/lib/export-plan";
import {
  MODULE_LABELS,
  type FeasibilityResult,
  type ModuleId,
  type ModuleResult,
} from "@/lib/modules";
import {
  Brain,
  Target,
  ListChecks,
  ShieldCheck,
  Layers,
  Database,
  CalendarClock,
  Gauge as GaugeIcon,
  MessageSquareText,
  Sparkles,
  Menu,
  ArrowLeft,
  Copy,
  RefreshCw,
  Download,
  AlertTriangle,
  Check,
  Loader2,
  Info,
  X,
} from "lucide-react";

type ModuleStatus = "idle" | "loading" | "success" | "error";

type ModuleDef = {
  id: ModuleId;
  label: string;
  icon: ComponentType<{ className?: string }>;
  description: string;
};

const MODULES: ModuleDef[] = [
  {
    id: "analysis",
    label: "AI Project Analysis",
    icon: Brain,
    description: "A high-level analysis of your project idea, its scope, and viability.",
  },
  {
    id: "objectives",
    label: "Objectives Generator",
    icon: Target,
    description: "Clear, measurable objectives for your final-year project.",
  },
  {
    id: "functional",
    label: "Functional Requirements",
    icon: ListChecks,
    description: "The core features and behaviors your system must support.",
  },
  {
    id: "nonfunctional",
    label: "Non-Functional Requirements",
    icon: ShieldCheck,
    description: "Performance, security, usability, and reliability requirements.",
  },
  {
    id: "stack",
    label: "Technology Stack Recommendation",
    icon: Layers,
    description: "A recommended tech stack tailored to your project's needs.",
  },
  {
    id: "database",
    label: "Database Planning",
    icon: Database,
    description: "Entities, relationships, and a database plan for your project.",
  },
  {
    id: "timeline",
    label: "Development Timeline",
    icon: CalendarClock,
    description: "A week-by-week development plan you can share with your supervisor.",
  },
  {
    id: "feasibility",
    label: "Feasibility Score",
    icon: GaugeIcon,
    description: "An AI-scored feasibility assessment across effort, novelty, and risk.",
  },
  {
    id: "supervisor",
    label: "Supervisor Feedback",
    icon: MessageSquareText,
    description: "Simulated feedback from a virtual project supervisor.",
  },
];

export const Route = createFileRoute("/workspace")({
  head: () => ({
    meta: [
      { title: "Workspace — ThesisForge AI" },
      { name: "description", content: "Your ThesisForge AI project workspace." },
      { name: "robots", content: "noindex" },
      { property: "og:title", content: "ThesisForge AI Workspace" },
      {
        property: "og:description",
        content: "Generate every part of your project plan in one place.",
      },
    ],
  }),
  component: Workspace,
});

/* ---------- Sidebar ---------- */

function StatusDot({ status }: { status: ModuleStatus }) {
  if (status === "loading") {
    return (
      <span aria-label="Generating" className="grid h-4 w-4 shrink-0 place-items-center">
        <Loader2 className="h-3.5 w-3.5 animate-spin text-accent" />
      </span>
    );
  }
  if (status === "success") {
    return (
      <span
        aria-label="Generated"
        className="grid h-4 w-4 shrink-0 place-items-center rounded-full bg-success text-white"
      >
        <Check className="h-2.5 w-2.5" strokeWidth={3} />
      </span>
    );
  }
  if (status === "error") {
    return <span aria-label="Error" className="h-2.5 w-2.5 shrink-0 rounded-full bg-destructive" />;
  }
  return (
    <span aria-label="Not generated" className="h-2.5 w-2.5 shrink-0 rounded-full bg-slate-300" />
  );
}

function SidebarNav({
  activeId,
  onSelect,
  statuses,
}: {
  activeId: ModuleId;
  onSelect: (id: ModuleId) => void;
  statuses: Record<ModuleId, ModuleStatus>;
}) {
  const completed = Object.values(statuses).filter((s) => s === "success").length;
  const pct = (completed / MODULES.length) * 100;

  return (
    <div className="flex h-full flex-col">
      <div className="flex h-16 items-center gap-2 border-b border-border px-5">
        <div className="grid h-8 w-8 place-items-center rounded-lg bg-primary text-primary-foreground">
          <Sparkles className="h-4 w-4" />
        </div>
        <span className="text-base font-semibold tracking-tight">ThesisForge AI</span>
      </div>
      <nav className="flex-1 overflow-y-auto p-3">
        <p className="px-2 pb-2 pt-1 text-xs font-medium uppercase tracking-wide text-muted-foreground">
          Modules
        </p>
        <ul className="space-y-1">
          {MODULES.map((m) => {
            const active = m.id === activeId;
            const Icon = m.icon;
            const status = statuses[m.id] ?? "idle";
            return (
              <li key={m.id}>
                <button
                  type="button"
                  onClick={() => onSelect(m.id)}
                  aria-current={active ? "page" : undefined}
                  className={`flex w-full items-center gap-3 rounded-md px-3 py-2 text-left text-sm outline-none transition-colors focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-sidebar ${
                    active ? "bg-primary/10 text-primary" : "text-foreground hover:bg-muted"
                  }`}
                >
                  <Icon className="h-4 w-4 shrink-0" />
                  <span className="min-w-0 flex-1 truncate">{m.label}</span>
                  <StatusDot status={status} />
                </button>
              </li>
            );
          })}
        </ul>
      </nav>
      <div className="space-y-2 border-t border-border p-4">
        <div className="flex items-center justify-between text-xs">
          <span className="font-medium text-foreground">Progress</span>
          <span className="text-muted-foreground">
            {completed} of {MODULES.length} completed
          </span>
        </div>
        <Progress value={pct} className="h-1.5" />
        <Link
          to="/"
          className="mt-2 inline-flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft className="h-3 w-3" /> Back to home
        </Link>
      </div>
    </div>
  );
}

/* ---------- Generated content rendering ---------- */

function FeasibilityGauge({ result }: { result: FeasibilityResult }) {
  const score = result.score;
  const tone =
    score >= 71
      ? { color: "text-success", ring: "stroke-[oklch(0.627_0.174_149.5)]" }
      : score >= 41
        ? { color: "text-warning", ring: "stroke-[oklch(0.7_0.17_50)]" }
        : { color: "text-destructive", ring: "stroke-[oklch(0.577_0.245_27.325)]" };

  const r = 70;
  const c = 2 * Math.PI * r;
  const offset = c - (Math.min(100, Math.max(0, score)) / 100) * c;

  return (
    <div className="flex flex-col items-center py-4">
      <div className="relative h-48 w-48">
        <svg
          viewBox="0 0 160 160"
          className="h-full w-full -rotate-90"
          role="img"
          aria-label={`Feasibility score ${score} out of 100`}
        >
          <circle cx="80" cy="80" r={r} strokeWidth="12" className="fill-none stroke-muted" />
          <circle
            cx="80"
            cy="80"
            r={r}
            strokeWidth="12"
            strokeLinecap="round"
            className={`fill-none transition-all duration-700 ${tone.ring}`}
            style={{ strokeDasharray: c, strokeDashoffset: offset }}
          />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="text-4xl font-bold tracking-tight text-foreground">{score}</span>
          <span className="text-xs text-muted-foreground">/ 100</span>
        </div>
      </div>
      <span className={`mt-4 rounded-full px-3 py-1 text-sm font-semibold ${tone.color}`}>
        {result.label}
      </span>
      <p className="mt-3 max-w-md text-center text-sm text-muted-foreground">
        {result.justification}
      </p>
    </div>
  );
}

function ResultView({ result }: { result: ModuleResult }) {
  if (result.kind === "feasibility") return <FeasibilityGauge result={result.feasibility} />;
  return <Markdown>{result.markdown}</Markdown>;
}

/* ---------- Module pane ---------- */

function ModulePane({
  module,
  status,
  onGenerate,
  onRegenerate,
  onCopy,
  onExport,
  onRetry,
  result,
  errorMessage,
}: {
  module: ModuleDef;
  status: ModuleStatus;
  onGenerate: () => void;
  onRegenerate: () => void;
  onCopy: () => void;
  onExport: () => void;
  onRetry: () => void;
  result?: ModuleResult;
  errorMessage?: string;
}) {
  const Icon = module.icon;

  return (
    <div className="rounded-lg border border-border bg-card shadow-sm">
      <div className="border-b border-border p-6">
        <div className="grid grid-cols-[minmax(0,1fr)_auto] items-start gap-3 sm:flex sm:items-center sm:justify-between">
          <div className="flex min-w-0 items-center gap-3">
            <div className="grid h-10 w-10 shrink-0 place-items-center rounded-lg bg-primary/10 text-primary">
              <Icon className="h-5 w-5" />
            </div>
            <div className="min-w-0">
              <h2 className="truncate text-lg font-semibold tracking-tight sm:text-xl">
                {module.label}
              </h2>
              <p className="mt-0.5 line-clamp-2 text-xs text-muted-foreground sm:text-sm">
                {module.description}
              </p>
            </div>
          </div>
          <StateBadge status={status} />
        </div>
      </div>

      <div className="p-6 sm:p-8">
        {status === "idle" && (
          <div className="flex flex-col items-center py-8 text-center">
            <div className="grid h-14 w-14 place-items-center rounded-2xl bg-muted text-muted-foreground">
              <Icon className="h-6 w-6" />
            </div>
            <p className="mt-4 max-w-sm text-sm text-muted-foreground">{module.description}</p>
            <Button onClick={onGenerate} className="mt-6 bg-primary hover:bg-primary-hover">
              Generate
            </Button>
          </div>
        )}

        {status === "loading" && (
          <div className="space-y-4">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Loader2 className="h-4 w-4 animate-spin text-accent" />
              Analyzing your project…
            </div>
            <Skeleton className="h-5 w-1/3" />
            <div className="space-y-2">
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-11/12" />
              <Skeleton className="h-4 w-10/12" />
            </div>
            <Skeleton className="h-5 w-1/4" />
            <div className="space-y-2">
              <Skeleton className="h-4 w-11/12" />
              <Skeleton className="h-4 w-9/12" />
              <Skeleton className="h-4 w-10/12" />
            </div>
          </div>
        )}

        {status === "success" && result && (
          <div className="space-y-6">
            <ResultView result={result} />
            <div className="flex flex-wrap gap-2 border-t border-border pt-4">
              <Button variant="outline" size="sm" onClick={onCopy}>
                <Copy className="h-4 w-4" /> Copy
              </Button>
              <Button variant="outline" size="sm" onClick={onRegenerate}>
                <RefreshCw className="h-4 w-4" /> Regenerate
              </Button>
              <Button variant="outline" size="sm" onClick={onExport}>
                <Download className="h-4 w-4" /> Export
              </Button>
            </div>
          </div>
        )}

        {status === "error" && (
          <div className="rounded-md border border-destructive/30 bg-destructive/5 p-4">
            <div className="flex items-start gap-3">
              <div className="mt-0.5 grid h-8 w-8 shrink-0 place-items-center rounded-full bg-destructive/10 text-destructive">
                <AlertTriangle className="h-4 w-4" />
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-sm font-semibold text-destructive">
                  We couldn't generate this section
                </p>
                <p className="mt-1 text-sm text-muted-foreground">
                  {errorMessage ??
                    "The AI service didn't respond in time. This can happen with heavy load or a brief network hiccup."}{" "}
                  Please try again.
                </p>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={onRetry}
                  className="mt-3 border-destructive/40 text-destructive hover:bg-destructive/10 hover:text-destructive"
                >
                  <RefreshCw className="h-4 w-4" /> Retry
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function StateBadge({ status }: { status: ModuleStatus }) {
  const map: Record<ModuleStatus, { label: string; cls: string }> = {
    idle: { label: "Not generated", cls: "bg-muted text-muted-foreground" },
    loading: { label: "Generating", cls: "bg-accent/15 text-[oklch(0.5_0.15_70)]" },
    success: { label: "Generated", cls: "bg-success/15 text-success" },
    error: { label: "Error", cls: "bg-destructive/10 text-destructive" },
  };
  const { label, cls } = map[status];
  return (
    <span className={`shrink-0 rounded-full px-2.5 py-1 text-xs font-medium ${cls}`}>{label}</span>
  );
}

/* ---------- Workspace ---------- */

function Workspace() {
  const project = useProject();
  const navigate = useNavigate();
  const [activeId, setActiveId] = useState(MODULES[0].id);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [statuses, setStatuses] = useState<Record<ModuleId, ModuleStatus>>(
    () => Object.fromEntries(MODULES.map((m) => [m.id, "idle"])) as Record<ModuleId, ModuleStatus>,
  );
  const [results, setResults] = useState<Partial<Record<ModuleId, ModuleResult>>>({});
  const [errors, setErrors] = useState<Partial<Record<ModuleId, string>>>({});
  const [generatingAll, setGeneratingAll] = useState(false);
  const inFlight = useRef(new Set<ModuleId>());
  const [bannerOpen, setBannerOpen] = useState(true);
  const [confirmOpen, setConfirmOpen] = useState(false);

  useEffect(() => {
    if (!project) navigate({ to: "/new-project" });
  }, [project, navigate]);

  const completed = useMemo(
    () => Object.values(statuses).filter((v) => v === "success").length,
    [statuses],
  );

  const active = useMemo(() => MODULES.find((m) => m.id === activeId) ?? MODULES[0], [activeId]);

  const runGenerate = useCallback(
    async (id: ModuleId) => {
      if (!project || inFlight.current.has(id)) return false;
      inFlight.current.add(id);
      setStatuses((prev) => ({ ...prev, [id]: "loading" }));
      setErrors((prev) => ({ ...prev, [id]: undefined }));
      try {
        const result = await generateModule({ data: { moduleId: id, project } });
        setResults((prev) => ({ ...prev, [id]: result }));
        setStatuses((prev) => ({ ...prev, [id]: "success" }));
        return true;
      } catch (err) {
        const raw = err instanceof Error ? err.message : String(err);
        const message = /429|rate limit/i.test(raw)
          ? "The AI service is rate limited right now — wait a moment before retrying."
          : /GEMINI_API_KEY|not configured/i.test(raw)
            ? "GEMINI_API_KEY is not configured in environment variables."
            : /timed out/i.test(raw)
              ? "AI generation timed out after 30 seconds. Please try again."
              : raw || "The AI service didn't respond. Please try again.";
        setErrors((prev) => ({ ...prev, [id]: message }));
        setStatuses((prev) => ({ ...prev, [id]: "error" }));
        return false;
      } finally {
        inFlight.current.delete(id);
      }
    },
    [project],
  );

  // Auto-generate the first module as soon as the workspace opens.
  const autoStarted = useRef(false);
  useEffect(() => {
    if (!project || autoStarted.current) return;
    autoStarted.current = true;
    void runGenerate("analysis");
  }, [project, runGenerate]);

  const handleGenerateAll = useCallback(async () => {
    setGeneratingAll(true);
    for (const m of MODULES) {
      if (statuses[m.id] === "success") continue;
      await runGenerate(m.id);
    }
    setGeneratingAll(false);
    toast.success("All modules generated");
  }, [runGenerate, statuses]);

  if (!project) return null;

  const handleCopy = async () => {
    const result = results[active.id];
    if (!result) return;
    const text =
      result.kind === "feasibility"
        ? `${MODULE_LABELS[active.id]}\n${result.feasibility.score}/100 — ${result.feasibility.label}\n\n${result.feasibility.justification}`
        : `${MODULE_LABELS[active.id]}\n\n${markdownToPlainText(result.markdown)}`;
    try {
      await navigator.clipboard.writeText(text);
      toast.success("Copied to clipboard");
    } catch {
      toast.error("Couldn't copy — try selecting the text manually.");
    }
  };

  const handleExport = () => {
    const ok = exportPlanToPrint(project, results);
    if (ok) toast.success("Opening your plan for export");
    else toast.error("Generate at least one module before exporting.");
  };

  const handleRegenerateRequest = () => setConfirmOpen(true);
  const handleRegenerateConfirm = () => {
    setConfirmOpen(false);
    void runGenerate(active.id);
  };

  const select = (id: ModuleId) => {
    setActiveId(id);
    setDrawerOpen(false);
  };

  return (
    <div className="flex min-h-dvh w-full bg-background">
      <aside className="hidden w-60 shrink-0 border-r border-border bg-sidebar md:block">
        <SidebarNav activeId={activeId} onSelect={select} statuses={statuses} />
      </aside>

      <div className="flex min-w-0 flex-1 flex-col">
        <header className="sticky top-0 z-10 flex h-16 items-center gap-3 border-b border-border bg-card/80 px-4 backdrop-blur sm:px-6">
          <Sheet open={drawerOpen} onOpenChange={setDrawerOpen}>
            <SheetTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="md:hidden"
                aria-label="Open modules menu"
              >
                <Menu className="h-5 w-5" />
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="w-72 p-0">
              <SheetTitle className="sr-only">Modules</SheetTitle>
              <SidebarNav activeId={activeId} onSelect={select} statuses={statuses} />
            </SheetContent>
          </Sheet>

          <div className="grid min-w-0 grid-cols-[minmax(0,1fr)_auto] items-center gap-3 sm:flex sm:flex-1 sm:justify-between">
            <div className="inline-flex min-w-0 items-center gap-2 rounded-full border border-border bg-background px-3 py-1.5">
              <span className="shrink-0 text-xs font-medium text-muted-foreground">
                Based on your project:
              </span>
              <span className="min-w-0 truncate text-xs font-semibold text-foreground">
                {project.title}
              </span>
            </div>
            <div className="flex shrink-0 items-center gap-2">
              <Button
                size="sm"
                onClick={() => void handleGenerateAll()}
                disabled={generatingAll || completed === MODULES.length}
                className="bg-primary hover:bg-primary-hover"
              >
                {generatingAll ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" /> Generating…
                  </>
                ) : (
                  <>
                    <Sparkles className="h-4 w-4" />
                    <span className="hidden sm:inline">Generate all remaining</span>
                    <span className="sm:hidden">Generate all</span>
                  </>
                )}
              </Button>
              <Button variant="outline" size="sm" onClick={handleExport}>
                <Download className="h-4 w-4" />
                <span className="hidden sm:inline">Export plan</span>
              </Button>
              <Button variant="ghost" size="sm" onClick={() => navigate({ to: "/new-project" })}>
                New
              </Button>
            </div>
          </div>
        </header>

        <main className="mx-auto w-full max-w-5xl flex-1 px-4 py-6 sm:px-6 sm:py-10">
          {bannerOpen && (
            <div
              role="status"
              className="mb-6 flex items-start gap-3 rounded-md border border-info/25 bg-info/5 p-3 text-sm text-foreground"
            >
              <Info className="mt-0.5 h-4 w-4 shrink-0 text-info" />
              <p className="flex-1">
                This session isn't saved — export your plan before closing this tab.
              </p>
              <button
                type="button"
                aria-label="Dismiss notice"
                onClick={() => setBannerOpen(false)}
                className="grid h-6 w-6 shrink-0 place-items-center rounded-md text-muted-foreground outline-none hover:bg-info/10 focus-visible:ring-2 focus-visible:ring-primary"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            </div>
          )}

          <div className="mb-4">
            <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
              Module
            </p>
            <h1 className="mt-1 text-2xl font-semibold tracking-tight sm:text-3xl">
              {active.label}
            </h1>
          </div>

          <ModulePane
            module={active}
            status={statuses[active.id] ?? "idle"}
            onGenerate={() => void runGenerate(active.id)}
            onRegenerate={handleRegenerateRequest}
            onCopy={handleCopy}
            onExport={handleExport}
            onRetry={() => void runGenerate(active.id)}
            result={results[active.id]}
            errorMessage={errors[active.id]}
          />
        </main>
      </div>

      <AlertDialog open={confirmOpen} onOpenChange={setConfirmOpen}>
        <AlertDialogContent className="max-w-md">
          <AlertDialogHeader>
            <AlertDialogTitle>Regenerate this section?</AlertDialogTitle>
            <AlertDialogDescription>
              Your current output will be replaced. This action can't be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleRegenerateConfirm}
              className="bg-primary hover:bg-primary-hover"
            >
              Regenerate
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
