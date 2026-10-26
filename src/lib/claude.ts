import "server-only";
import Anthropic from "@anthropic-ai/sdk";
import { betaZodOutputFormat } from "@anthropic-ai/sdk/helpers/beta/zod";
import type { z } from "zod";

const anthropic = new Anthropic();

export const MODEL = process.env.CLAUDE_MODEL ?? "claude-opus-5-5";

type Effort = "low" | "medium" | "high";
type Turn = Anthropic.Beta.BetaMessageParam;

export class ClaudeRefusalError extends Error {
  constructor() {
    super("Claude hat diese Anfrage abgelehnt.");
  }
}

// Bei einer Ablehnung durch die Sicherheitsfilter versucht die API automatisch ein Ersatzmodell.
const FALLBACK: { betas: Anthropic.Beta.AnthropicBeta[]; fallbacks: "default" } = {
  betas: ["server-side-fallback-2026-07-01"],
  fallbacks: "default",
};

/** Freitext-Antwort, z. B. der nächste Einwand von Sokrates. */
export async function askText(system: string, messages: Turn[], effort: Effort = "low") {
  const response = await anthropic.beta.messages.create({
    model: MODEL,
    max_tokens: 16000,
    system,
    messages,
    thinking: { type: "adaptive" },
    output_config: { effort },
    ...FALLBACK,
  });

  if (response.stop_reason === "refusal") throw new ClaudeRefusalError();

  return response.content
    .filter((block) => block.type === "text")
    .map((block) => block.text)
    .join("")
    .trim();
}

/** Strukturierte Antwort, die gegen ein Zod-Schema geprüft wird. */
export async function askStructured<S extends z.ZodType>(
  system: string,
  messages: Turn[],
  schema: S,
  effort: Effort = "medium",
): Promise<z.infer<S>> {
  const response = await anthropic.beta.messages.parse({
    model: MODEL,
    max_tokens: 16000,
    system,
    messages,
    thinking: { type: "adaptive" },
    output_config: { effort, format: betaZodOutputFormat(schema) },
    ...FALLBACK,
  });

  if (response.stop_reason === "refusal") throw new ClaudeRefusalError();
  if (response.parsed_output == null) {
    throw new Error("Claude hat keine gültige strukturierte Antwort geliefert.");
  }
  return response.parsed_output as z.infer<S>;
}
