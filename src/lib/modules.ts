// Client-safe module metadata shared by the workspace UI and the server prompts.

export const MODULE_IDS = [
  "analysis",
  "objectives",
  "functional",
  "nonfunctional",
  "stack",
  "database",
  "timeline",
  "feasibility",
  "supervisor",
] as const;

export type ModuleId = (typeof MODULE_IDS)[number];

export const MODULE_LABELS: Record<ModuleId, string> = {
  analysis: "AI Project Analysis",
  objectives: "Objectives Generator",
  functional: "Functional Requirements",
  nonfunctional: "Non-Functional Requirements",
  stack: "Technology Stack Recommendation",
  database: "Database Planning",
  timeline: "Development Timeline",
  feasibility: "Feasibility Score",
  supervisor: "Supervisor Feedback",
};

export type FeasibilityResult = {
  score: number;
  label: string;
  justification: string;
};

export type ModuleResult =
  { kind: "markdown"; markdown: string } | { kind: "feasibility"; feasibility: FeasibilityResult };
