// Rule-based military-to-civilian translation. Used directly when no AI key is
// configured, and as a pre-pass that the AI output can be compared against.

export interface JargonRule {
  pattern: RegExp;
  replacement: string;
  isAcronym: boolean;
}

// Order matters: longer / more specific phrases first.
const RULES: Array<[string, string]> = [
  ["non-commissioned officer in charge", "supervisor"],
  ["noncommissioned officer in charge", "supervisor"],
  ["officer in charge", "manager"],
  ["NCOIC", "supervisor"],
  ["OIC", "manager"],
  ["platoon sergeant", "operations supervisor"],
  ["first sergeant", "senior operations manager"],
  ["command sergeant major", "senior executive advisor"],
  ["sergeant major", "senior operations advisor"],
  ["squad leader", "team leader"],
  ["section chief", "department supervisor"],
  ["company commander", "general manager"],
  ["battalion commander", "director"],
  ["executive officer", "deputy director"],
  ["platoon", "team"],
  ["battalion", "organization"],
  ["brigade", "large organization"],
  ["regiment", "large organization"],
  ["squadron", "unit"],
  ["detachment", "team"],
  ["soldiers", "employees"],
  ["sailors", "employees"],
  ["airmen", "employees"],
  ["marines", "employees"],
  ["guardians", "employees"],
  ["troops", "personnel"],
  ["subordinates", "direct reports"],
  ["service members", "staff"],
  ["mission-essential", "business-critical"],
  ["mission critical", "business-critical"],
  ["mission-critical", "business-critical"],
  ["missions", "projects"],
  ["mission", "objective"],
  ["deployment", "assignment"],
  ["deployed", "assigned"],
  ["downrange", "in the field"],
  ["in theater", "on assignment"],
  ["hostile environment", "high-risk environment"],
  ["TDY", "business travel"],
  ["PCS", "relocation"],
  ["SOP", "standard operating procedure"],
  ["SOPs", "standard operating procedures"],
  ["OPORD", "operations plan"],
  ["FRAGO", "plan update"],
  ["AAR", "after-action review"],
  ["counseled", "coached"],
  ["counseling", "coaching"],
  ["NCOER", "performance evaluation"],
  ["OER", "performance evaluation"],
  ["EPR", "performance evaluation"],
  ["OPR", "performance evaluation"],
  ["FITREP", "performance evaluation"],
  ["PT", "physical fitness"],
  ["PMCS", "preventive maintenance"],
  ["CONUS", "domestic"],
  ["OCONUS", "international"],
  ["MOS", "occupational specialty"],
  ["AFSC", "occupational specialty"],
  ["chain of command", "leadership"],
  ["commanding officer", "senior leader"],
  ["S1", "human resources department"],
  ["S2", "intelligence department"],
  ["S3", "operations department"],
  ["S4", "logistics department"],
  ["S6", "IT department"],
  ["G3", "operations division"],
  ["J6", "IT directorate"],
  ["MWR", "employee morale and recreation"],
  ["DFAC", "dining facility"],
  ["motor pool", "vehicle maintenance facility"],
  ["arms room", "secure equipment storage"],
  ["sensitive items", "high-value assets"],
  ["hand receipt", "property accountability record"],
  ["property book", "asset inventory"],
  ["field exercise", "large-scale training exercise"],
  ["FTX", "field training exercise"],
  ["NTC", "national-level training exercise"],
  ["JRTC", "national-level training exercise"],
  ["warfighter", "client"],
  ["warfighters", "clients"],
  ["lethality", "effectiveness"],
  ["readiness", "operational readiness"],
  ["ordnance", "munitions"],
];

function escapeRegExp(s: string): string {
  return s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

export const JARGON_RULES: JargonRule[] = RULES.map(([term, replacement]) => {
  // Acronyms (all caps, short) are matched case-sensitively so "CO" doesn't hit "co-worker".
  const isAcronym = /^[A-Z0-9]{2,6}s?$/.test(term);
  return {
    pattern: new RegExp(`\\b${escapeRegExp(term)}\\b`, isAcronym ? "g" : "gi"),
    replacement,
    isAcronym,
  };
});

export interface TranslationChange {
  from: string;
  to: string;
}

function capitalize(s: string): string {
  return s.charAt(0).toUpperCase() + s.slice(1);
}

function atSentenceStart(text: string, offset: number): boolean {
  return /(^|[.!?:•\n]\s*|^\s*[-*]\s*)$/.test(text.slice(0, offset));
}

/** Short text where most words are capitalized, e.g. a job title. */
function looksLikeTitle(text: string): boolean {
  const words = text.trim().split(/\s+/).filter((w) => /^[a-z]/i.test(w));
  if (/[.!?]/.test(text) || words.length === 0 || words.length > 8) return false;
  return words.filter((w) => /^[A-Z]/.test(w)).length / words.length >= 0.6;
}

/**
 * Capitalize at the start of a sentence. Elsewhere, military writing
 * capitalizes nouns like "Soldiers" that civilian prose doesn't, so only keep a
 * capital when the text is a short title (e.g. "Platoon Sergeant").
 */
function matchCase(source: string, replacement: string, isAcronym: boolean, text: string, offset: number): string {
  if (atSentenceStart(text, offset)) return capitalize(replacement);
  const capitalized = source[0] !== source[0].toLowerCase() && source[0] === source[0].toUpperCase();
  if (!isAcronym && capitalized && looksLikeTitle(text)) return capitalize(replacement);
  return replacement;
}

export function translateJargon(text: string): { text: string; changes: TranslationChange[] } {
  const changes: TranslationChange[] = [];
  let out = text;
  for (const rule of JARGON_RULES) {
    out = out.replace(rule.pattern, (match: string, offset: number, whole: string) => {
      const to = matchCase(match, rule.replacement, rule.isAcronym, whole, offset);
      if (match !== to) changes.push({ from: match, to });
      return to;
    });
  }
  return { text: out, changes };
}

/** Words that tend to signal military jargon remains in a bullet. */
export function findRemainingJargon(text: string): string[] {
  const hits = new Set<string>();
  for (const [term] of RULES) {
    const isAcronym = /^[A-Z0-9]{2,6}s?$/.test(term);
    const re = new RegExp(`\\b${escapeRegExp(term)}\\b`, isAcronym ? "" : "i");
    const m = text.match(re);
    if (m) hits.add(m[0]);
  }
  return [...hits];
}
