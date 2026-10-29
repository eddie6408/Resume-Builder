import Anthropic from "@anthropic-ai/sdk";
import { betaZodOutputFormat } from "@anthropic-ai/sdk/helpers/beta/zod";
import type { z } from "zod";
import {
  AiRequestSchema,
  CoverLetterOutput,
  EvaluationOutput,
  SummaryOutput,
  TailorOutput,
  TranslateOutput,
  type AiRequest,
} from "@/lib/ai-schemas";

export const runtime = "nodejs";
export const maxDuration = 120;

const MODEL = process.env.ANTHROPIC_MODEL ?? "claude-opus-5-5";

const SYSTEM = `You are an expert resume writer who specializes in helping U.S. military service members and veterans move into civilian and federal careers.

Principles you always follow:
- Replace military jargon, acronyms, ranks, and unit names with plain civilian equivalents a hiring manager outside the military would understand (e.g. "NCOIC" -> "supervisor", "platoon" -> "team of 30").
- Write achievement bullets in the form: strong action verb + what was done + measurable result. One sentence each, no first person, no trailing period inconsistency.
- Never invent facts, numbers, employers, certifications, or dates. If a bullet would be stronger with a number the source does not give, keep it qualitative or insert a bracketed placeholder such as [X%] for the user to fill in.
- Keep classified or operationally sensitive details out; describe work at an unclassified level.
- Return only the requested structured output.`;

let client: Anthropic | null = null;
function getClient(): Anthropic {
  client ??= new Anthropic();
  return client;
}

function aiEnabled(): boolean {
  return Boolean(process.env.ANTHROPIC_API_KEY || process.env.ANTHROPIC_AUTH_TOKEN);
}

async function run<T extends z.ZodType>(schema: T, prompt: string, effort: "low" | "medium" | "high") {
  const response = await getClient().beta.messages.parse({
    model: MODEL,
    max_tokens: 16000,
    betas: ["server-side-fallback-2026-07-01"],
    fallbacks: "default",
    system: SYSTEM,
    output_config: { effort, format: betaZodOutputFormat(schema) },
    messages: [{ role: "user", content: prompt }],
  });
  if (response.stop_reason === "refusal") {
    throw new AiError(422, "The AI declined this request. Try rephrasing the content.");
  }
  if (response.stop_reason === "max_tokens") {
    throw new AiError(502, "The AI response was cut off. Try a shorter input.");
  }
  if (!response.parsed_output) {
    throw new AiError(502, "The AI returned an unexpected response. Please try again.");
  }
  return response.parsed_output as z.infer<T>;
}

class AiError extends Error {
  constructor(
    public status: number,
    message: string,
  ) {
    super(message);
  }
}

function block(label: string, body: string): string {
  return `<${label}>\n${body}\n</${label}>`;
}

async function handle(req: AiRequest) {
  switch (req.action) {
    case "translate":
      return run(
        TranslateOutput,
        [
          "Rewrite the following military duties/accomplishments as civilian resume bullets.",
          req.occupationCode ? `The service member's occupation code is ${req.occupationCode}.` : "",
          req.targetRole ? `They are targeting roles like: ${req.targetRole}.` : "",
          "Return one bullet per distinct accomplishment, plus up to 10 civilian skill keywords the content supports.",
          block("military_text", req.text),
        ]
          .filter(Boolean)
          .join("\n\n"),
        "low",
      );
    case "extract-evaluation":
      return run(
        EvaluationOutput,
        [
          "The text below is a military performance evaluation (e.g. NCOER, OER, EPR, OPR, FITREP, or Navy EVAL).",
          "Extract the concrete accomplishments and rewrite them as civilian resume bullets. Also give a 2-3 sentence professional summary, civilian skill keywords, and any awards or decorations mentioned (name only).",
          "Ignore rater boilerplate like \"promote ahead of peers\" unless it states a specific ranking, which you may keep as e.g. \"Ranked #1 of 12 supervisors\".",
          req.targetRole ? `Target role: ${req.targetRole}.` : "",
          block("evaluation", req.text),
        ]
          .filter(Boolean)
          .join("\n\n"),
        "medium",
      );
    case "tailor":
      return run(
        TailorOutput,
        [
          `Tailor this resume to the job below${req.jobTitle ? ` (${req.jobTitle}${req.company ? ` at ${req.company}` : ""})` : ""}.`,
          "Rewrite the summary, professional title, skills list, and each experience entry's bullets so they mirror the posting's language and priorities, using only facts present in the resume. Reorder bullets so the most relevant come first; you may merge or drop weak bullets. Keep each experience's `id` unchanged and return every experience entry.",
          "In `notes`, list up to 5 short, specific suggestions for gaps the candidate could address (e.g. a missing certification the posting asks for).",
          block("resume_json", JSON.stringify(req.resume)),
          block("job_posting", req.jobDescription),
        ].join("\n\n"),
        "medium",
      );
    case "cover-letter":
      return run(
        CoverLetterOutput,
        [
          `Write a one-page cover letter (250-350 words) for ${req.jobTitle || "the role"}${req.company ? ` at ${req.company}` : ""}, in a ${req.tone ?? "professional"} tone.`,
          "Open with why the candidate fits, connect two or three specific accomplishments from the resume to the posting's needs, and close with a clear call to action. Use plain civilian language. Do not include placeholder address blocks; start at the salutation (\"Dear Hiring Manager,\" if no name is known) and end with the candidate's name.",
          block("resume_json", JSON.stringify(req.resume)),
          req.jobDescription ? block("job_posting", req.jobDescription) : "",
        ]
          .filter(Boolean)
          .join("\n\n"),
        "medium",
      );
    case "summary":
      return run(
        SummaryOutput,
        [
          "Write a 2-4 sentence professional summary for the top of this resume, in civilian language, leading with years of experience and core strengths.",
          req.targetRole ? `Target role: ${req.targetRole}.` : "",
          block("resume_json", JSON.stringify(req.resume)),
        ]
          .filter(Boolean)
          .join("\n\n"),
        "low",
      );
  }
}

export async function GET() {
  return Response.json({ enabled: aiEnabled(), model: aiEnabled() ? MODEL : null });
}

export async function POST(request: Request) {
  if (!aiEnabled()) {
    return Response.json(
      { error: "AI features are not configured on this server. Set ANTHROPIC_API_KEY to enable them." },
      { status: 503 },
    );
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return Response.json({ error: "Invalid JSON body." }, { status: 400 });
  }
  const parsed = AiRequestSchema.safeParse(body);
  if (!parsed.success) {
    return Response.json({ error: "Invalid request.", issues: parsed.error.issues.slice(0, 5) }, { status: 400 });
  }

  try {
    const result = await handle(parsed.data);
    return Response.json(result);
  } catch (err) {
    if (err instanceof AiError) {
      return Response.json({ error: err.message }, { status: err.status });
    }
    if (err instanceof Anthropic.RateLimitError) {
      return Response.json({ error: "The AI service is busy. Please try again in a minute." }, { status: 429 });
    }
    if (err instanceof Anthropic.AuthenticationError) {
      console.error("Anthropic authentication failed; check ANTHROPIC_API_KEY.");
      return Response.json({ error: "AI service is misconfigured." }, { status: 500 });
    }
    if (err instanceof Anthropic.APIError) {
      console.error("Anthropic API error", err.status, err.message);
      return Response.json({ error: "The AI service returned an error. Please try again." }, { status: 502 });
    }
    console.error("Unexpected AI route error", err);
    return Response.json({ error: "Something went wrong." }, { status: 500 });
  }
}
