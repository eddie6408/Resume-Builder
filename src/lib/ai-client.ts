"use client";

// Calls /api/ai and falls back to the built-in rule engine when the server has
// no AI key configured (503) so every feature still works offline.
import type {
  CoverLetterResult,
  EvaluationResult,
  SummaryResult,
  TailorResult,
  TranslateResult,
} from "./ai-schemas";
import { translateJargon } from "./jargon";
import { extractKeywords, matchResume } from "./keywords";
import { findOccupation } from "./military-codes";
import type { Resume } from "./types";

export type Source = "ai" | "rules";
export interface Result<T> {
  data: T;
  source: Source;
}

let statusPromise: Promise<boolean> | null = null;
export function aiAvailable(): Promise<boolean> {
  statusPromise ??= fetch("/api/ai")
    .then((r) => r.json())
    .then((j: { enabled: boolean }) => j.enabled)
    .catch(() => false);
  return statusPromise;
}

class Unavailable extends Error {}

async function callAi<T>(payload: Record<string, unknown>): Promise<T> {
  const res = await fetch("/api/ai", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  if (res.status === 503) throw new Unavailable();
  const json = await res.json().catch(() => ({ error: "Bad response from server." }));
  if (!res.ok) throw new Error((json as { error?: string }).error ?? `Request failed (${res.status})`);
  return json as T;
}

async function withFallback<T>(payload: Record<string, unknown>, fallback: () => T): Promise<Result<T>> {
  if (!(await aiAvailable())) return { data: fallback(), source: "rules" };
  try {
    return { data: await callAi<T>(payload), source: "ai" };
  } catch (err) {
    if (err instanceof Unavailable) return { data: fallback(), source: "rules" };
    throw err;
  }
}

function aiResume(resume: Resume) {
  // Send only what the model needs.
  return {
    contact: { fullName: resume.contact.fullName, title: resume.contact.title },
    military: resume.military,
    summary: resume.summary,
    skills: resume.skills,
    experience: resume.experience.map((e) => ({
      id: e.id,
      title: e.title,
      organization: e.organization,
      startDate: e.startDate,
      endDate: e.current ? "Present" : e.endDate,
      bullets: e.bullets.filter((b) => b.trim()),
    })),
    education: resume.education.map((e) => ({ degree: e.degree, school: e.school })),
    certifications: resume.certifications.map((c) => c.name),
    awards: resume.awards.map((a) => a.name),
  };
}

function splitIntoStatements(text: string): string[] {
  return text
    .split(/\n+|(?<=[.!?])\s+(?=[A-Z])/)
    .map((s) => s.replace(/^[\s\-•*–—]+/, "").replace(/^[A-Z]{1,4}\s*[:)]\s*/, "").trim())
    .filter((s) => s.length > 12);
}

function tidyBullet(s: string): string {
  const t = s.trim().replace(/\s+/g, " ").replace(/[.;]+$/, "");
  return t.charAt(0).toUpperCase() + t.slice(1);
}

export function translate(text: string, occupationCode?: string, targetRole?: string) {
  return withFallback<TranslateResult>({ action: "translate", text, occupationCode, targetRole }, () => {
    const occ = occupationCode ? findOccupation(occupationCode) : undefined;
    return {
      bullets: splitIntoStatements(text).map((s) => tidyBullet(translateJargon(s).text)),
      suggestedSkills: occ?.skills ?? [],
    };
  });
}

const AWARD_RE =
  /\b((?:Meritorious Service|Army Commendation|Army Achievement|Navy and Marine Corps Commendation|Navy and Marine Corps Achievement|Air Force Commendation|Air Force Achievement|Joint Service Commendation|Joint Service Achievement|Bronze Star|Defense Meritorious Service|Coast Guard Commendation|Coast Guard Achievement)(?: Medal)?)\b/g;

export function extractEvaluation(text: string, targetRole?: string) {
  return withFallback<EvaluationResult>({ action: "extract-evaluation", text, targetRole }, () => {
    const statements = splitIntoStatements(text).filter(
      (s) => /\d|led|manag|direct|train|supervis|develop|improv|reduc|increas|creat|implement|coordinat/i.test(s),
    );
    const awards = [...new Set([...text.matchAll(AWARD_RE)].map((m) => m[1]))];
    const bullets = statements.map((s) => tidyBullet(translateJargon(s).text));
    return {
      summary: "",
      bullets,
      skills: extractKeywords(bullets.join(" "), 10).map((k) => k.term),
      awards,
    };
  });
}

export function tailor(resume: Resume, jobTitle: string, company: string, jobDescription: string) {
  return withFallback<TailorResult>(
    { action: "tailor", resume: aiResume(resume), jobTitle, company, jobDescription },
    () => {
      const report = matchResume(resume, jobDescription);
      const terms = extractKeywords(jobDescription, 40).map((k) => k.term);
      const relevance = (b: string) => terms.filter((t) => b.toLowerCase().includes(t)).length;
      const skillOrder = [...resume.skills].sort((a, b) => relevance(b) - relevance(a));
      return {
        summary: translateJargon(resume.summary).text,
        title: jobTitle || resume.contact.title,
        skills: skillOrder,
        experience: resume.experience.map((e) => ({
          id: e.id,
          bullets: [...e.bullets]
            .map((b) => translateJargon(b).text)
            .sort((a, b) => relevance(b) - relevance(a)),
        })),
        notes: report.missing.length
          ? [
              `Keywords in the posting that your resume doesn't mention yet: ${report.missing
                .slice(0, 12)
                .map((k) => k.term)
                .join(", ")}. Add the ones that truthfully describe your experience.`,
            ]
          : [],
      };
    },
  );
}

export function coverLetter(
  resume: Resume,
  jobTitle: string,
  company: string,
  jobDescription: string,
  tone: "professional" | "warm" | "direct" = "professional",
) {
  return withFallback<CoverLetterResult>(
    { action: "cover-letter", resume: aiResume(resume), jobTitle, company, jobDescription, tone },
    () => {
      const top = resume.experience.flatMap((e) => e.bullets).filter((b) => b.trim()).slice(0, 3);
      const years = resume.military.yearsOfService;
      const role = jobTitle || "this position";
      const org = company || "your organization";
      const body = [
        "Dear Hiring Manager,",
        `I am excited to apply for the ${role} role at ${org}. ${years ? `Over ${years} years of service in the ${resume.military.branch || "military"}` : "During my military career"}, I built a track record of leading teams, solving problems under pressure, and delivering results that others could rely on.`,
        top.length
          ? `A few highlights that relate directly to this role:\n${top.map((b) => `• ${translateJargon(b).text}`).join("\n")}`
          : "",
        `I would bring the same discipline, ownership, and focus on the mission to ${org}. I would welcome the chance to discuss how my experience can support your team.`,
        `Sincerely,\n${resume.contact.fullName || "[Your Name]"}`,
      ]
        .filter(Boolean)
        .join("\n\n");
      return { body };
    },
  );
}

export function generateSummary(resume: Resume, targetRole?: string) {
  return withFallback<SummaryResult>({ action: "summary", resume: aiResume(resume), targetRole }, () => {
    const m = resume.military;
    const occ = findOccupation(m.occupationCode);
    const role = targetRole || resume.contact.title || occ?.civilianTitles[0] || "operations professional";
    const strengths = (resume.skills.length ? resume.skills : occ?.skills ?? []).slice(0, 3).join(", ");
    const summary = [
      `${m.yearsOfService ? `${m.yearsOfService}-year` : "Experienced"} ${m.branch ? `${m.branch} veteran and ` : ""}${role.toLowerCase()} with a record of leading teams and delivering results in demanding environments.`,
      strengths ? `Strengths include ${strengths}.` : "",
      m.clearance ? `Holds an active ${m.clearance} security clearance.` : "",
    ]
      .filter(Boolean)
      .join(" ");
    return { summary };
  });
}
