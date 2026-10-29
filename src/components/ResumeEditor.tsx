"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { generateSummary, translate } from "@/lib/ai-client";
import { downloadFile, slugify, toFederalText, toPlainText } from "@/lib/export";
import { emptyAward, emptyCertification, emptyEducation, emptyExperience } from "@/lib/factory";
import { findRemainingJargon, translateJargon } from "@/lib/jargon";
import { matchResume } from "@/lib/keywords";
import { findOccupation } from "@/lib/military-codes";
import { saveResume } from "@/lib/storage";
import type { Experience, Resume, TemplateId } from "@/lib/types";
import { ChipInput, TextArea, TextField } from "./fields";
import ResumePreview from "./ResumePreview";

const SECTIONS = ["Contact", "Service", "Summary", "Experience", "Education", "Skills", "Certifications", "Awards"] as const;
type Section = (typeof SECTIONS)[number];

export default function ResumeEditor({ initial, fromTailoring }: { initial: Resume; fromTailoring: boolean }) {
  const [resume, setResume] = useState(initial);
  const [section, setSection] = useState<Section>(fromTailoring ? "Experience" : "Contact");
  const [savedAt, setSavedAt] = useState<string>("");
  const [busy, setBusy] = useState<string>("");
  const [error, setError] = useState("");
  const first = useRef(true);

  // Debounced autosave.
  useEffect(() => {
    if (first.current) {
      first.current = false;
      return;
    }
    const t = setTimeout(() => {
      saveResume(resume);
      setSavedAt(new Date().toLocaleTimeString());
    }, 500);
    return () => clearTimeout(t);
  }, [resume]);

  function update(fn: (draft: Resume) => void) {
    setResume((prev) => {
      const next = structuredClone(prev);
      fn(next);
      return next;
    });
  }

  function updateExp(id: string, fn: (e: Experience) => void) {
    update((d) => {
      const e = d.experience.find((x) => x.id === id);
      if (e) fn(e);
    });
  }

  async function aiAction(key: string, fn: () => Promise<void>) {
    setBusy(key);
    setError("");
    try {
      await fn();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Something went wrong.");
    } finally {
      setBusy("");
    }
  }

  const tailoring = resume.tailoring;
  const liveScore = tailoring ? matchResume(resume, tailoring.jobDescription).score : null;
  const jargon = findRemainingJargon(
    [resume.summary, ...resume.experience.flatMap((e) => [e.title, ...e.bullets])].join("\n"),
  );
  const occ = findOccupation(resume.military.occupationCode);

  return (
    <div>
      <div className="toolbar no-print">
        <input
          type="text"
          value={resume.name}
          onChange={(e) => update((d) => void (d.name = e.target.value))}
          aria-label="Resume name"
          style={{ maxWidth: 280, fontWeight: 600 }}
        />
        <select
          value={resume.template}
          onChange={(e) => update((d) => void (d.template = e.target.value as TemplateId))}
          aria-label="Template"
          style={{ maxWidth: 200 }}
        >
          <option value="modern">Modern template</option>
          <option value="classic">Classic template</option>
          <option value="federal">Federal (USAJOBS)</option>
        </select>
        <button className="btn btn-primary" onClick={() => window.print()}>Download PDF</button>
        <button className="btn" onClick={() => downloadFile(`${slugify(resume.name)}.txt`, resume.template === "federal" ? toFederalText(resume) : toPlainText(resume))}>
          Plain text
        </button>
        <Link className="btn" href={`/dashboard/tailor?resume=${resume.id}`}>Tailor</Link>
        <Link className="btn" href={`/dashboard/cover-letters/new?resume=${resume.id}`}>Cover letter</Link>
        <span className="saved">{savedAt ? `Saved ${savedAt}` : "Changes save automatically"}</span>
      </div>

      {fromTailoring && tailoring && (
        <div className="alert alert-success no-print" style={{ marginBottom: 16 }}>
          <div className="spread">
            <strong>
              Tailored for {tailoring.jobTitle || "this job"}
              {tailoring.company && ` at ${tailoring.company}`}
            </strong>
            <span>
              Keyword match: {tailoring.matchScoreBefore}% → <strong>{liveScore}%</strong>
            </span>
          </div>
          <p className="small" style={{ margin: "6px 0 0" }}>
            {tailoring.source === "ai"
              ? "AI rewrote your summary, skills, and bullets for this posting. Check every change for accuracy."
              : "Bullets were reordered by relevance and jargon translated. Add the missing keywords that truthfully apply to you."}
          </p>
          {tailoring.notes.length > 0 && (
            <ul className="small" style={{ margin: "6px 0 0" }}>
              {tailoring.notes.map((n, i) => <li key={i}>{n}</li>)}
            </ul>
          )}
        </div>
      )}

      {error && <div className="alert alert-error no-print" style={{ marginBottom: 16 }}>{error}</div>}

      <div className="editor">
        <div className="editor-pane">
          <div className="section-nav">
            {SECTIONS.map((s) => (
              <button key={s} className={s === section ? "active" : undefined} onClick={() => setSection(s)}>
                {s}
              </button>
            ))}
          </div>

          {jargon.length > 0 && (
            <div className="alert" style={{ marginBottom: 12 }}>
              <strong>Military jargon detected:</strong> {jargon.slice(0, 10).join(", ")}.{" "}
              <button
                className="btn btn-sm"
                onClick={() =>
                  update((d) => {
                    d.summary = translateJargon(d.summary).text;
                    for (const e of d.experience) {
                      e.title = translateJargon(e.title).text;
                      e.bullets = e.bullets.map((b) => translateJargon(b).text);
                    }
                  })
                }
              >
                Translate all
              </button>
            </div>
          )}

          <div className="card">
            {section === "Contact" && (
              <>
                <h2>Contact</h2>
                <div className="grid-2">
                  <TextField label="Full name" value={resume.contact.fullName} onChange={(v) => update((d) => void (d.contact.fullName = v))} />
                  <TextField label="Professional title" value={resume.contact.title} placeholder={occ?.civilianTitles[0]} onChange={(v) => update((d) => void (d.contact.title = v))} />
                  <TextField label="Email" type="email" value={resume.contact.email} onChange={(v) => update((d) => void (d.contact.email = v))} />
                  <TextField label="Phone" type="tel" value={resume.contact.phone} onChange={(v) => update((d) => void (d.contact.phone = v))} />
                  <TextField label="City, State" value={resume.contact.location} onChange={(v) => update((d) => void (d.contact.location = v))} />
                  <TextField label="LinkedIn" value={resume.contact.linkedin} onChange={(v) => update((d) => void (d.contact.linkedin = v))} />
                  <TextField label="Website / portfolio" value={resume.contact.website} onChange={(v) => update((d) => void (d.contact.website = v))} />
                </div>
              </>
            )}

            {section === "Service" && (
              <>
                <h2>Military service</h2>
                <p className="small muted">Used for translations, summaries, and the federal template. Code and rank aren&apos;t printed on private-sector templates.</p>
                <div className="grid-2">
                  <TextField label="Branch" value={resume.military.branch} onChange={(v) => update((d) => void (d.military.branch = v))} />
                  <TextField label="Rank / pay grade" value={resume.military.rank} onChange={(v) => update((d) => void (d.military.rank = v))} />
                  <TextField label="MOS / AFSC / Rating" value={resume.military.occupationCode} onChange={(v) => update((d) => void (d.military.occupationCode = v.toUpperCase()))} />
                  <TextField label="Years of service" value={resume.military.yearsOfService} onChange={(v) => update((d) => void (d.military.yearsOfService = v))} />
                  <TextField label="Security clearance" value={resume.military.clearance} placeholder="e.g. Secret, TS/SCI" onChange={(v) => update((d) => void (d.military.clearance = v))} />
                  <TextField label="Veterans' preference" value={resume.military.veteranPreference} placeholder="e.g. 5-point, 10-point" onChange={(v) => update((d) => void (d.military.veteranPreference = v))} />
                  <TextField label="Separation date" type="month" value={resume.military.separationDate} onChange={(v) => update((d) => void (d.military.separationDate = v))} />
                </div>
                {occ && (
                  <div className="occ-result">
                    <strong>{occ.code}: {occ.title}</strong>
                    <p className="small" style={{ margin: "6px 0" }}>Civilian titles: {occ.civilianTitles.join(", ")}</p>
                    <button
                      className="btn btn-sm"
                      onClick={() => update((d) => void (d.skills = [...new Set([...d.skills, ...occ.skills])]))}
                    >
                      Add {occ.skills.length} related skills
                    </button>
                  </div>
                )}
              </>
            )}

            {section === "Summary" && (
              <>
                <h2>Professional summary</h2>
                <TextArea label="2–4 sentences at the top of your resume" rows={6} value={resume.summary} onChange={(v) => update((d) => void (d.summary = v))} />
                <button
                  className="btn"
                  disabled={busy === "summary"}
                  onClick={() =>
                    aiAction("summary", async () => {
                      const r = await generateSummary(resume, resume.contact.title);
                      update((d) => void (d.summary = r.data.summary));
                    })
                  }
                >
                  {busy === "summary" ? "Writing…" : resume.summary ? "Rewrite summary" : "Write my summary"}
                </button>
              </>
            )}

            {section === "Experience" && (
              <>
                <div className="spread">
                  <h2>Experience</h2>
                  <button className="btn btn-sm" onClick={() => update((d) => void d.experience.push(emptyExperience()))}>+ Add position</button>
                </div>
                {resume.experience.map((e, idx) => (
                  <div className="entry" key={e.id}>
                    <div className="grid-2">
                      <TextField label="Job title (civilian)" value={e.title} onChange={(v) => updateExp(e.id, (x) => void (x.title = v))} />
                      <TextField label="Organization" value={e.organization} onChange={(v) => updateExp(e.id, (x) => void (x.organization = v))} />
                      <TextField label="Location" value={e.location} onChange={(v) => updateExp(e.id, (x) => void (x.location = v))} />
                      <TextField label="Grade / rank" value={e.grade} onChange={(v) => updateExp(e.id, (x) => void (x.grade = v))} />
                      <TextField label="Start" type="month" value={e.startDate} onChange={(v) => updateExp(e.id, (x) => void (x.startDate = v))} />
                      {!e.current && <TextField label="End" type="month" value={e.endDate} onChange={(v) => updateExp(e.id, (x) => void (x.endDate = v))} />}
                    </div>
                    <label className="checkbox" style={{ marginBottom: 10 }}>
                      <input type="checkbox" checked={e.current} onChange={(ev) => updateExp(e.id, (x) => void (x.current = ev.target.checked))} />
                      I currently hold this position
                    </label>
                    {resume.template === "federal" && (
                      <div className="grid-2">
                        <TextField label="Hours / week" value={e.hoursPerWeek} onChange={(v) => updateExp(e.id, (x) => void (x.hoursPerWeek = v))} />
                        <TextField label="Supervisor (name, phone)" value={e.supervisor} onChange={(v) => updateExp(e.id, (x) => void (x.supervisor = v))} />
                      </div>
                    )}
                    <label>Accomplishments</label>
                    {e.bullets.map((b, bi) => (
                      <div className="bullet-row" key={bi}>
                        <textarea
                          value={b}
                          rows={2}
                          placeholder="Action verb + what you did + measurable result"
                          onChange={(ev) => updateExp(e.id, (x) => void (x.bullets[bi] = ev.target.value))}
                        />
                        <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
                          <button className="btn btn-sm" title="Move up" disabled={bi === 0} onClick={() => updateExp(e.id, (x) => void x.bullets.splice(bi - 1, 0, x.bullets.splice(bi, 1)[0]))}>↑</button>
                          <button className="btn btn-sm btn-danger" title="Remove" onClick={() => updateExp(e.id, (x) => void x.bullets.splice(bi, 1))}>×</button>
                        </div>
                      </div>
                    ))}
                    <div className="row" style={{ marginTop: 6 }}>
                      <button className="btn btn-sm" onClick={() => updateExp(e.id, (x) => void x.bullets.push(""))}>+ Bullet</button>
                      <button
                        className="btn btn-sm"
                        disabled={busy === e.id || !e.bullets.some((b) => b.trim())}
                        onClick={() =>
                          aiAction(e.id, async () => {
                            const r = await translate(e.bullets.filter((b) => b.trim()).join("\n"), resume.military.occupationCode, resume.contact.title);
                            if (r.data.bullets.length) updateExp(e.id, (x) => void (x.bullets = r.data.bullets));
                          })
                        }
                      >
                        {busy === e.id ? "Improving…" : "Translate & improve bullets"}
                      </button>
                      <span style={{ flex: 1 }} />
                      <button className="btn btn-sm" disabled={idx === 0} onClick={() => update((d) => void d.experience.splice(idx - 1, 0, d.experience.splice(idx, 1)[0]))}>Move up</button>
                      <button className="btn btn-sm btn-danger" onClick={() => update((d) => void d.experience.splice(idx, 1))}>Remove position</button>
                    </div>
                  </div>
                ))}
              </>
            )}

            {section === "Education" && (
              <>
                <div className="spread">
                  <h2>Education</h2>
                  <button className="btn btn-sm" onClick={() => update((d) => void d.education.push(emptyEducation()))}>+ Add education</button>
                </div>
                <p className="small muted">Include degrees and relevant military schools (e.g. Senior Leader Course → leadership and management training).</p>
                {resume.education.map((e, idx) => (
                  <div className="entry" key={e.id}>
                    <div className="grid-2">
                      <TextField label="Degree / program" value={e.degree} onChange={(v) => update((d) => void (d.education[idx].degree = v))} />
                      <TextField label="School" value={e.school} onChange={(v) => update((d) => void (d.education[idx].school = v))} />
                      <TextField label="Location" value={e.location} onChange={(v) => update((d) => void (d.education[idx].location = v))} />
                      <TextField label="Graduation (year)" value={e.graduationDate} onChange={(v) => update((d) => void (d.education[idx].graduationDate = v))} />
                    </div>
                    <TextField label="Details (honors, GPA, coursework)" value={e.details} onChange={(v) => update((d) => void (d.education[idx].details = v))} />
                    <button className="btn btn-sm btn-danger" onClick={() => update((d) => void d.education.splice(idx, 1))}>Remove</button>
                  </div>
                ))}
              </>
            )}

            {section === "Skills" && (
              <>
                <h2>Skills</h2>
                <ChipInput values={resume.skills} onChange={(v) => update((d) => void (d.skills = v))} />
                {occ && (
                  <p className="small muted" style={{ marginTop: 12 }}>
                    Suggested for {occ.code}:{" "}
                    {occ.skills.filter((s) => !resume.skills.includes(s)).map((s) => (
                      <button key={s} className="btn btn-sm btn-ghost" onClick={() => update((d) => void d.skills.push(s))}>+ {s}</button>
                    ))}
                  </p>
                )}
              </>
            )}

            {section === "Certifications" && (
              <>
                <div className="spread">
                  <h2>Certifications & licenses</h2>
                  <button className="btn btn-sm" onClick={() => update((d) => void d.certifications.push(emptyCertification()))}>+ Add</button>
                </div>
                {resume.certifications.map((c, idx) => (
                  <div className="entry" key={c.id}>
                    <div className="grid-3">
                      <TextField label="Name" value={c.name} onChange={(v) => update((d) => void (d.certifications[idx].name = v))} />
                      <TextField label="Issuer" value={c.issuer} onChange={(v) => update((d) => void (d.certifications[idx].issuer = v))} />
                      <TextField label="Year" value={c.date} onChange={(v) => update((d) => void (d.certifications[idx].date = v))} />
                    </div>
                    <button className="btn btn-sm btn-danger" onClick={() => update((d) => void d.certifications.splice(idx, 1))}>Remove</button>
                  </div>
                ))}
              </>
            )}

            {section === "Awards" && (
              <>
                <div className="spread">
                  <h2>Awards & honors</h2>
                  <button className="btn btn-sm" onClick={() => update((d) => void d.awards.push(emptyAward()))}>+ Add</button>
                </div>
                <p className="small muted">Spell out medal names, and say what each award recognized in civilian terms.</p>
                {resume.awards.map((a, idx) => (
                  <div className="entry" key={a.id}>
                    <div className="grid-2">
                      <TextField label="Award" value={a.name} onChange={(v) => update((d) => void (d.awards[idx].name = v))} />
                      <TextField label="Year" value={a.date} onChange={(v) => update((d) => void (d.awards[idx].date = v))} />
                    </div>
                    <TextField label="What it recognized" value={a.description} onChange={(v) => update((d) => void (d.awards[idx].description = v))} />
                    <button className="btn btn-sm btn-danger" onClick={() => update((d) => void d.awards.splice(idx, 1))}>Remove</button>
                  </div>
                ))}
              </>
            )}
          </div>
        </div>

        <div className="preview-pane">
          <ResumePreview resume={resume} />
        </div>
      </div>
    </div>
  );
}
