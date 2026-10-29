import { z } from "zod";

// Request bodies accepted by /api/ai. Limits keep a single request bounded;
// requests over them are rejected rather than silently truncated.
const text = (max: number) => z.string().max(max);

export const ResumeInputSchema = z.object({
  contact: z.object({ fullName: text(200), title: text(200) }).passthrough(),
  military: z.object({ branch: text(100), rank: text(100), occupationCode: text(50) }).passthrough(),
  summary: text(4000),
  skills: z.array(text(200)).max(100),
  experience: z
    .array(
      z.object({
        id: text(100),
        title: text(300),
        organization: text(300),
        bullets: z.array(text(1500)).max(40),
      }).passthrough(),
    )
    .max(30),
}).passthrough();

export const AiRequestSchema = z.discriminatedUnion("action", [
  z.object({
    action: z.literal("translate"),
    text: text(12000).min(1),
    occupationCode: text(50).optional(),
    targetRole: text(200).optional(),
  }),
  z.object({
    action: z.literal("extract-evaluation"),
    text: text(30000).min(1),
    targetRole: text(200).optional(),
  }),
  z.object({
    action: z.literal("tailor"),
    resume: ResumeInputSchema,
    jobTitle: text(300),
    company: text(300),
    jobDescription: text(30000).min(1),
  }),
  z.object({
    action: z.literal("cover-letter"),
    resume: ResumeInputSchema,
    jobTitle: text(300),
    company: text(300),
    jobDescription: text(30000),
    tone: z.enum(["professional", "warm", "direct"]).optional(),
  }),
  z.object({
    action: z.literal("summary"),
    resume: ResumeInputSchema,
    targetRole: text(200).optional(),
  }),
]);

export type AiRequest = z.infer<typeof AiRequestSchema>;

// Structured outputs returned by the model.
export const TranslateOutput = z.object({
  bullets: z.array(z.string()),
  suggestedSkills: z.array(z.string()),
});

export const EvaluationOutput = z.object({
  summary: z.string(),
  bullets: z.array(z.string()),
  skills: z.array(z.string()),
  awards: z.array(z.string()),
});

export const TailorOutput = z.object({
  summary: z.string(),
  title: z.string(),
  skills: z.array(z.string()),
  experience: z.array(z.object({ id: z.string(), bullets: z.array(z.string()) })),
  notes: z.array(z.string()),
});

export const CoverLetterOutput = z.object({ body: z.string() });

export const SummaryOutput = z.object({ summary: z.string() });

export type TranslateResult = z.infer<typeof TranslateOutput>;
export type EvaluationResult = z.infer<typeof EvaluationOutput>;
export type TailorResult = z.infer<typeof TailorOutput>;
export type CoverLetterResult = z.infer<typeof CoverLetterOutput>;
export type SummaryResult = z.infer<typeof SummaryOutput>;
