import { createFileRoute, Link } from "@tanstack/react-router";
import { Button } from "@/components/ui/button";
import { Sparkles, Github, ArrowRight, PencilLine, Wand2, Download } from "lucide-react";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "ThesisForge AI — Turn your project idea into a full plan" },
      {
        name: "description",
        content:
          "ThesisForge AI is an AI-powered assistant that turns a final-year project idea into a complete, structured project plan.",
      },
      { property: "og:title", content: "ThesisForge AI" },
      {
        property: "og:description",
        content:
          "Turn a raw final-year project idea into a full, structured plan — objectives, requirements, stack, timeline, and more.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Landing,
});

function Navbar() {
  return (
    <header className="border-b border-border bg-card/80 backdrop-blur">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6">
        <Link to="/" className="flex items-center gap-2">
          <div className="grid h-8 w-8 place-items-center rounded-lg bg-primary text-primary-foreground">
            <Sparkles className="h-4 w-4" />
          </div>
          <span className="text-lg font-semibold tracking-tight">ThesisForge AI</span>
        </Link>
        <nav className="flex items-center gap-2 sm:gap-4">
          <a
            href="#how-it-works"
            className="hidden text-sm font-medium text-muted-foreground hover:text-foreground sm:inline"
          >
            How it Works
          </a>
          <a
            href="https://github.com"
            target="_blank"
            rel="noreferrer"
            aria-label="GitHub"
            className="grid h-9 w-9 place-items-center rounded-md text-muted-foreground hover:bg-muted hover:text-foreground"
          >
            <Github className="h-4 w-4" />
          </a>
          <Button asChild className="bg-primary hover:bg-primary-hover">
            <Link to="/new-project">Start New Project</Link>
          </Button>
        </nav>
      </div>
    </header>
  );
}

function Landing() {
  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main>
        <section className="mx-auto max-w-7xl px-4 pb-16 pt-16 sm:px-6 sm:pt-24">
          <div className="mx-auto max-w-3xl text-center">
            <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-border bg-card px-3 py-1 text-xs font-medium text-muted-foreground">
              <span className="h-1.5 w-1.5 rounded-full bg-accent" />
              Your virtual project supervisor
            </div>
            <h1 className="text-4xl font-bold tracking-tight text-foreground sm:text-5xl md:text-6xl">
              Turn a project idea into a <span className="text-primary">complete plan</span>.
            </h1>
            <p className="mx-auto mt-6 max-w-2xl text-base text-muted-foreground sm:text-lg">
              ThesisForge AI takes your rough final-year project idea and generates a coherent,
              structured plan — objectives, requirements, tech stack, database, timeline, and
              supervisor feedback.
            </p>
            <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
              <Button
                asChild
                size="lg"
                className="w-full bg-primary hover:bg-primary-hover sm:w-auto"
              >
                <Link to="/new-project">
                  Start New Project <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
              <a
                href="#how-it-works"
                className="text-sm font-medium text-muted-foreground hover:text-foreground"
              >
                See how it works →
              </a>
            </div>
          </div>
        </section>

        <section id="how-it-works" className="mx-auto max-w-7xl px-4 pb-24 sm:px-6">
          <div className="mx-auto max-w-2xl text-center">
            <h2 className="text-2xl font-semibold tracking-tight sm:text-3xl">How it works</h2>
            <p className="mt-2 text-muted-foreground">
              Three steps from idea to a supervisor-ready plan.
            </p>
          </div>
          <div className="mt-10 grid gap-4 sm:grid-cols-3">
            {[
              {
                icon: PencilLine,
                title: "1. Enter your idea",
                desc: "Share your project title, domain, and a few sentences describing your idea.",
              },
              {
                icon: Wand2,
                title: "2. AI builds your plan",
                desc: "Nine specialized modules generate each piece of your project plan.",
              },
              {
                icon: Download,
                title: "3. Review & export",
                desc: "Copy sections or export the full plan to share with your supervisor.",
              },
            ].map((s) => (
              <div
                key={s.title}
                className="rounded-lg border border-border bg-card p-6 shadow-sm transition-shadow hover:shadow-md"
              >
                <div className="grid h-10 w-10 place-items-center rounded-lg bg-primary/10 text-primary">
                  <s.icon className="h-5 w-5" />
                </div>
                <h3 className="mt-4 text-lg font-semibold">{s.title}</h3>
                <p className="mt-1 text-sm text-muted-foreground">{s.desc}</p>
              </div>
            ))}
          </div>
        </section>
      </main>

      <footer className="border-t border-border bg-card">
        <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-3 px-4 py-6 sm:flex-row sm:px-6">
          <p className="text-sm text-muted-foreground">
            © {new Date().getFullYear()} ThesisForge AI
          </p>
          <a
            href="https://github.com"
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground"
          >
            <Github className="h-4 w-4" /> GitHub
          </a>
        </div>
      </footer>
    </div>
  );
}
