import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { MODULE_IDS, type ModuleResult } from "./modules";

const InputSchema = z.object({
  moduleId: z.enum(MODULE_IDS),
  project: z.object({
    title: z.string().min(1).max(300),
    domain: z.string().min(1).max(120),
    idea: z.string().min(1).max(5000),
    constraints: z.string().max(2000).default(""),
  }),
});

export const generateModule = createServerFn({ method: "POST" })
  .inputValidator((input: unknown) => InputSchema.parse(input))
  .handler(async ({ data }): Promise<ModuleResult> => {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      throw new Error("GEMINI_API_KEY is not configured in environment variables.");
    }

    const { GoogleGenAI } = await import("@google/genai");
    const { MODULE_PROMPTS, buildUserPrompt, parseFeasibility } = await import("./prompts.server");

    const ai = new GoogleGenAI({
      apiKey,
    });

    const timeoutMs = 60000;
    const timeoutPromise = new Promise<never>((_, reject) => {
      setTimeout(
        () => reject(new Error("AI request timed out after 30 seconds. Please try again.")),
        timeoutMs,
      );
    });
    console.log("========== GENERATE ==========");
    console.log("Using model:", "gemini-flash-latest");
    const generatePromise = ai.models.generateContent({
      model: "gemini-flash-latest",
      contents: buildUserPrompt(data.project),
      config: {
        systemInstruction: MODULE_PROMPTS[data.moduleId],
        temperature: data.moduleId === "feasibility" ? 0.2 : 0.5,
        ...(data.moduleId === "feasibility" ? { responseMimeType: "application/json" } : {}),
      },
    });

    const response = await Promise.race([generatePromise, timeoutPromise]);
    const text = response.text ?? "";

    if (data.moduleId === "feasibility") {
      return { kind: "feasibility", feasibility: parseFeasibility(text) };
    }
    return { kind: "markdown", markdown: text.trim() };
  });
