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

function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export const generateModule = createServerFn({ method: "POST" })
  .inputValidator((input: unknown) => InputSchema.parse(input))
  .handler(async ({ data }): Promise<ModuleResult> => {
    const apiKey = process.env.GEMINI_API_KEY;

    if (!apiKey) {
      throw new Error("GEMINI_API_KEY is not configured in environment variables.");
    }

    const { GoogleGenAI } = await import("@google/genai");
    const {
      MODULE_PROMPTS,
      buildUserPrompt,
      parseFeasibility,
    } = await import("./prompts.server");

    const ai = new GoogleGenAI({
      apiKey,
    });

    const timeoutMs = 60000;

    console.log("================================");
    console.log("Module:", data.moduleId);
    console.log("Model :", "gemini-flash-latest");
    console.log("================================");

    const maxRetries = 5;

    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      try {
        const timeoutPromise = new Promise<never>((_, reject) => {
          setTimeout(() => {
            reject(
              new Error(
                "AI request timed out after 60 seconds. Please try again."
              )
            );
          }, timeoutMs);
        });

        const generatePromise = ai.models.generateContent({
          model: "gemini-flash-latest",
          contents: buildUserPrompt(data.project),
          config: {
            systemInstruction: MODULE_PROMPTS[data.moduleId],
            temperature: data.moduleId === "feasibility" ? 0.2 : 0.5,
            ...(data.moduleId === "feasibility"
              ? { responseMimeType: "application/json" }
              : {}),
          },
        });

        const response = await Promise.race([
          generatePromise,
          timeoutPromise,
        ]);

        const text = response.text ?? "";

        if (data.moduleId === "feasibility") {
          return {
            kind: "feasibility",
            feasibility: parseFeasibility(text),
          };
        }

        return {
          kind: "markdown",
          markdown: text.trim(),
        };
      } catch (error: any) {
        console.error(
          `Attempt ${attempt}/${maxRetries} failed for ${data.moduleId}`
        );

        console.error(error);

        const message =
          error?.message ??
          JSON.stringify(error);

        const is429 =
          message.includes("429") ||
          message.includes("RESOURCE_EXHAUSTED") ||
          message.includes("quota") ||
          message.includes("rate");

        if (is429 && attempt < maxRetries) {
          const wait = attempt * 5000;

          console.log(`429 detected. Waiting ${wait / 1000}s before retry...`);

          await sleep(wait);

          continue;
        }

        throw error;
      }
    }

    throw new Error("Generation failed after multiple retries.");
  });