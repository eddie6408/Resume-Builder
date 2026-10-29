// Lightweight ATS-style keyword analysis: pull the important terms out of a job
// posting and check which ones a resume already covers.
import type { Resume } from "./types";

const STOPWORDS = new Set(
  `a about above after again against all also am an and any are as at be because been before being below between both but by can could did do does doing down during each few for from further had has have having he her here hers herself him himself his how i if in into is it its itself just me more most my myself no nor not now of off on once only or other our ours ourselves out over own same she should so some such than that the their theirs them themselves then there these they this those through to too under until up very was we were what when where which while who whom why will with would you your yours yourself yourselves
  able ability abilities across activities additional apply applicant applicants based benefits candidate candidates company competitive including include includes job jobs looking may must new opportunity opportunities other our position preferred plus required requirements requirement responsibilities responsible role roles strong team teams us using well within work working year years etc equal employer employment status related relevant ensure ensuring provide providing support supporting various experience experienced knowledge skills skill qualifications qualified duties perform performs performing minimum day days time per level highly excellent ideal great join make help 'll e.g i.e`
    .split(/\s+/)
    .filter(Boolean),
);

// Leading verbs make poor phrase keywords ("lead warehouse", "improve processes").
const VERBS = new Set(
  "lead leads manage manages improve improves drive drives build builds develop develops maintain maintains oversee oversees coordinate coordinates create creates conduct conducts assist assists prepare prepares review reviews deliver delivers identify identifies implement implements serve serves handle handles".split(" "),
);

function normalize(word: string): string {
  return word.toLowerCase().replace(/[^a-z0-9+#./-]/g, "").replace(/^[./-]+|[./-]+$/g, "");
}

function tokenize(text: string): string[] {
  return text
    .split(/[\s,;:()"“”!?]+/)
    .map(normalize)
    .filter((w) => w.length > 1 && !STOPWORDS.has(w) && !/^\d+$/.test(w));
}

export interface Keyword {
  term: string;
  weight: number;
}

/**
 * Extract the most significant single words and two-word phrases from a job
 * description, ranked by frequency (phrases weighted higher).
 */
export function extractKeywords(jobDescription: string, limit = 30): Keyword[] {
  const tokens = tokenize(jobDescription);
  const counts = new Map<string, number>();
  for (const t of tokens) counts.set(t, (counts.get(t) ?? 0) + 1);

  // Phrases never span punctuation: "inventory control, forklift safety" must
  // not yield "control forklift".
  for (const segment of jobDescription.split(/[,;:.!?()\n•|/]+/)) {
    const words = segment.split(/\s+/).map(normalize);
    for (let i = 0; i < words.length - 1; i++) {
      const a = words[i];
      const b = words[i + 1];
      if (!a || !b || STOPWORDS.has(a) || STOPWORDS.has(b) || VERBS.has(a) || a.length < 3 || b.length < 3) continue;
      const phrase = `${a} ${b}`;
      counts.set(phrase, (counts.get(phrase) ?? 0) + 1.5);
    }
  }

  const ranked = [...counts.entries()]
    .filter(([term, n]) => (n >= 1.5 || term.length > 4) && !VERBS.has(term))
    .sort((x, y) => y[1] - x[1] || y[0].length - x[0].length);

  // Drop single words already covered by a stronger phrase to reduce noise.
  const result: Keyword[] = [];
  for (const [term, weight] of ranked) {
    if (result.length >= limit) break;
    if (!term.includes(" ") && result.some((k) => k.term.includes(" ") && k.term.split(" ").includes(term) && k.weight >= weight)) {
      continue;
    }
    result.push({ term, weight });
  }
  return result;
}

export function resumeToText(resume: Resume): string {
  return [
    resume.contact.title,
    resume.summary,
    ...resume.experience.flatMap((e) => [e.title, e.organization, ...e.bullets]),
    ...resume.education.flatMap((e) => [e.degree, e.school, e.details]),
    ...resume.skills,
    ...resume.certifications.map((c) => `${c.name} ${c.issuer}`),
    ...resume.awards.map((a) => `${a.name} ${a.description}`),
  ]
    .filter(Boolean)
    .join("\n");
}

export interface MatchReport {
  score: number;
  matched: Keyword[];
  missing: Keyword[];
}

export function matchResume(resume: Resume, jobDescription: string, limit = 30): MatchReport {
  const keywords = extractKeywords(jobDescription, limit);
  if (keywords.length === 0) return { score: 0, matched: [], missing: [] };
  const haystack = ` ${tokenize(resumeToText(resume)).join(" ")} `;
  const matched: Keyword[] = [];
  const missing: Keyword[] = [];
  for (const k of keywords) {
    (haystack.includes(` ${k.term} `) ? matched : missing).push(k);
  }
  const total = keywords.reduce((s, k) => s + k.weight, 0);
  const got = matched.reduce((s, k) => s + k.weight, 0);
  return { score: Math.round((got / total) * 100), matched, missing };
}
