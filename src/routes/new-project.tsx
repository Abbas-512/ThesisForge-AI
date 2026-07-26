import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ArrowLeft, Sparkles } from "lucide-react";
import { projectStore } from "@/lib/project-store";

export const Route = createFileRoute("/new-project")({
  head: () => ({
    meta: [
      { title: "New Project — ThesisForge AI" },
      {
        name: "description",
        content: "Describe your final-year project idea and let ThesisForge AI build your plan.",
      },
      { property: "og:title", content: "Start a new project — ThesisForge AI" },
      {
        property: "og:description",
        content: "Enter your project title, domain, and idea to generate a full plan.",
      },
    ],
  }),
  component: NewProject,
});

const DOMAINS = [
  "Web App",
  "Mobile App",
  "AI / Machine Learning",
  "Data Science",
  "IoT / Embedded",
  "Cybersecurity",
  "Blockchain",
  "AR / VR",
  "Game Development",
  "Other",
];

type Errors = Partial<Record<"title" | "domain" | "idea", string>>;

function NewProject() {
  const navigate = useNavigate();
  const [title, setTitle] = useState("");
  const [domain, setDomain] = useState("");
  const [idea, setIdea] = useState("");
  const [constraints, setConstraints] = useState("");
  const [errors, setErrors] = useState<Errors>({});

  function validate(): boolean {
    const e: Errors = {};
    if (!title.trim()) e.title = "Please enter a project title.";
    if (!domain) e.domain = "Please pick a domain.";
    if (!idea.trim()) e.idea = "Please describe your project idea.";
    else if (idea.trim().length < 40) e.idea = "Add a little more detail (at least 40 characters).";
    setErrors(e);
    return Object.keys(e).length === 0;
  }

  function onSubmit(ev: React.FormEvent) {
    ev.preventDefault();
    if (!validate()) return;
    projectStore.set({
      title: title.trim(),
      domain,
      idea: idea.trim(),
      constraints: constraints.trim(),
    });
    navigate({ to: "/workspace" });
  }

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border bg-card">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6">
          <Link to="/" className="flex items-center gap-2">
            <div className="grid h-8 w-8 place-items-center rounded-lg bg-primary text-primary-foreground">
              <Sparkles className="h-4 w-4" />
            </div>
            <span className="text-lg font-semibold tracking-tight">ThesisForge AI</span>
          </Link>
          <Link
            to="/"
            className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"
          >
            <ArrowLeft className="h-4 w-4" /> Back
          </Link>
        </div>
      </header>

      <main className="mx-auto max-w-2xl px-4 py-10 sm:px-6 sm:py-16">
        <div className="mb-6 text-center">
          <h1 className="text-3xl font-bold tracking-tight">Start a new project</h1>
          <p className="mt-2 text-sm text-muted-foreground">
            Tell us about your idea. We'll turn it into a full structured plan.
          </p>
        </div>

        <form
          onSubmit={onSubmit}
          className="rounded-lg border border-border bg-card p-6 shadow-sm sm:p-8"
          noValidate
        >
          <div className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="title">
                Project Title <span className="text-destructive">*</span>
              </Label>
              <Input
                id="title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g. Smart Attendance System with Face Recognition"
                aria-invalid={!!errors.title}
              />
              {errors.title && <p className="text-sm text-destructive">{errors.title}</p>}
            </div>

            <div className="space-y-2">
              <Label htmlFor="domain">
                Domain / Field <span className="text-destructive">*</span>
              </Label>
              <Select value={domain} onValueChange={setDomain}>
                <SelectTrigger id="domain" aria-invalid={!!errors.domain}>
                  <SelectValue placeholder="Pick a domain" />
                </SelectTrigger>
                <SelectContent>
                  {DOMAINS.map((d) => (
                    <SelectItem key={d} value={d}>
                      {d}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.domain && <p className="text-sm text-destructive">{errors.domain}</p>}
            </div>

            <div className="space-y-2">
              <Label htmlFor="idea">
                Brief Project Idea <span className="text-destructive">*</span>
              </Label>
              <Textarea
                id="idea"
                value={idea}
                onChange={(e) => setIdea(e.target.value)}
                placeholder="A few sentences about what your project does, who it's for, and the main problem it solves."
                rows={5}
                aria-invalid={!!errors.idea}
              />
              <div className="flex items-center justify-between">
                <p className="text-xs text-muted-foreground">
                  A few sentences is perfect — the more context, the better the plan.
                </p>
                <span className="text-xs text-muted-foreground">{idea.trim().length} chars</span>
              </div>
              {errors.idea && <p className="text-sm text-destructive">{errors.idea}</p>}
            </div>

            <div className="space-y-2">
              <Label htmlFor="constraints">
                Known Constraints{" "}
                <span className="text-xs font-normal text-muted-foreground">(optional)</span>
              </Label>
              <Textarea
                id="constraints"
                value={constraints}
                onChange={(e) => setConstraints(e.target.value)}
                placeholder="e.g. must use Python, 3-month timeline, mobile-first, offline support…"
                rows={3}
              />
            </div>

            <Button type="submit" size="lg" className="w-full bg-primary hover:bg-primary-hover">
              Create Project
            </Button>
          </div>
        </form>
      </main>
    </div>
  );
}
