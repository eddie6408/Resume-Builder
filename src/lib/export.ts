import type { Resume } from "./types";

function formatDate(value: string): string {
  if (!value) return "";
  const [y, m] = value.split("-");
  if (!m) return y;
  const month = new Date(Number(y), Number(m) - 1, 1).toLocaleString("en-US", { month: "short" });
  return `${month} ${y}`;
}

export function dateRange(start: string, end: string, current: boolean): string {
  const s = formatDate(start);
  const e = current ? "Present" : formatDate(end);
  if (!s && !e) return "";
  return [s, e].filter(Boolean).join(" – ");
}

/** Plain-text version suitable for pasting into online application forms. */
export function toPlainText(resume: Resume): string {
  const c = resume.contact;
  const lines: string[] = [];
  lines.push(c.fullName.toUpperCase());
  if (c.title) lines.push(c.title);
  lines.push([c.location, c.phone, c.email, c.linkedin, c.website].filter(Boolean).join(" | "));
  lines.push("");
  if (resume.summary) {
    lines.push("PROFESSIONAL SUMMARY", resume.summary, "");
  }
  if (resume.skills.length) {
    lines.push("CORE SKILLS", resume.skills.join(", "), "");
  }
  if (resume.experience.length) {
    lines.push("PROFESSIONAL EXPERIENCE");
    for (const e of resume.experience) {
      lines.push(`${e.title} | ${e.organization}${e.location ? `, ${e.location}` : ""}`);
      const range = dateRange(e.startDate, e.endDate, e.current);
      if (range) lines.push(range);
      for (const b of e.bullets.filter((x) => x.trim())) lines.push(`• ${b}`);
      lines.push("");
    }
  }
  if (resume.education.length) {
    lines.push("EDUCATION");
    for (const e of resume.education) {
      lines.push([e.degree, e.school, e.graduationDate].filter(Boolean).join(" | "));
      if (e.details) lines.push(e.details);
    }
    lines.push("");
  }
  if (resume.certifications.length) {
    lines.push("CERTIFICATIONS");
    for (const cert of resume.certifications) {
      lines.push([cert.name, cert.issuer, cert.date].filter(Boolean).join(" | "));
    }
    lines.push("");
  }
  if (resume.awards.length) {
    lines.push("AWARDS");
    for (const a of resume.awards) lines.push([a.name, a.date].filter(Boolean).join(" | "));
    lines.push("");
  }
  const m = resume.military;
  if (m.clearance) lines.push(`Security Clearance: ${m.clearance}`);
  return lines.join("\n").trim() + "\n";
}

/**
 * Federal (USAJOBS / OPM) style text. Federal resumes need hours per week,
 * exact dates, and supervisor info for each position, plus citizenship and
 * veterans' preference.
 */
export function toFederalText(resume: Resume): string {
  const c = resume.contact;
  const m = resume.military;
  const lines: string[] = [];
  lines.push(c.fullName.toUpperCase());
  lines.push([c.location, c.phone, c.email].filter(Boolean).join(" | "));
  lines.push("Citizenship: U.S. Citizen");
  if (m.veteranPreference) lines.push(`Veterans' Preference: ${m.veteranPreference}`);
  if (m.clearance) lines.push(`Security Clearance: ${m.clearance}`);
  lines.push("");
  if (resume.summary) lines.push("PROFESSIONAL SUMMARY", resume.summary, "");
  lines.push("WORK EXPERIENCE");
  for (const e of resume.experience) {
    lines.push(e.title.toUpperCase());
    lines.push(`${e.organization}${e.location ? `, ${e.location}` : ""}`);
    lines.push(`Dates: ${dateRange(e.startDate, e.endDate, e.current)}`);
    lines.push(`Hours per week: ${e.hoursPerWeek || "40"}`);
    if (e.grade) lines.push(`Grade/Rank: ${e.grade}`);
    if (e.supervisor) lines.push(`Supervisor: ${e.supervisor} (may contact)`);
    lines.push("Duties, Accomplishments and Related Skills:");
    for (const b of e.bullets.filter((x) => x.trim())) lines.push(`- ${b}`);
    lines.push("");
  }
  if (resume.education.length) {
    lines.push("EDUCATION");
    for (const e of resume.education) {
      lines.push([e.school, e.location].filter(Boolean).join(", "));
      lines.push([e.degree, e.graduationDate].filter(Boolean).join(" – "));
      if (e.details) lines.push(e.details);
      lines.push("");
    }
  }
  if (resume.certifications.length) {
    lines.push("CERTIFICATIONS AND LICENSES");
    for (const cert of resume.certifications) {
      lines.push([cert.name, cert.issuer, cert.date].filter(Boolean).join(", "));
    }
    lines.push("");
  }
  if (resume.awards.length) {
    lines.push("AWARDS AND HONORS");
    for (const a of resume.awards) {
      lines.push([a.name, a.date].filter(Boolean).join(", ") + (a.description ? ` – ${a.description}` : ""));
    }
    lines.push("");
  }
  if (resume.skills.length) lines.push("SKILLS", resume.skills.join(", "), "");
  return lines.join("\n").trim() + "\n";
}

export function downloadFile(filename: string, contents: string, mime = "text/plain"): void {
  const blob = new Blob([contents], { type: `${mime};charset=utf-8` });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
}

export function slugify(s: string): string {
  return s.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "") || "resume";
}
