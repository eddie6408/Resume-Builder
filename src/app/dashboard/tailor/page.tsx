"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense, useEffect, useMemo, useState } from "react";
import { tailor } from "@/lib/ai-client";
import { uid } from "@/lib/factory";
import { matchResume } from "@/lib/keywords";
import { saveResume } from "@/lib/storage";
import { useStore } from "@/lib/use-store";

function Tailor() {
  const router = useRouter();
  const params = useSearchParams();
  const { resumes, loaded } = useStore();
  const [resumeId, setResumeId] = useState(params.get("resume") ?? "");
  const [jobTitle, setJobTitle] = useState("");
  const [company, setCompany] = useState("");
  const [jd, setJd] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  // Default to the most recent non-tailored resume.
  useEffect(() => {
    if (loaded && !resumeId && resumes.length) setResumeId((resumes.find((r) => !r.tailoring) ?? resumes[0]).id);
  }, [loaded, resumeId, resumes]);

  const resume = resumes.find((r) => r.id === resumeId);
  const report = useMemo(() => (resume && jd.trim() ? matchResume(resume, jd) : null), [resume, jd]);

  async function run() {
    if (!resume) return;
    setBusy(true);
    setError("");
    try {
      const r = await tailor(resume, jobTitle, company, jd);
      const copy = structuredClone(resume);
      copy.id = uid();
      copy.parentId = resume.id;
      copy.createdAt = new Date().toISOString();
      copy.name = `${resume.name.replace(/ – tailored.*$/, "")} – tailored${jobTitle ? ` for ${jobTitle}` : ""}${company ? ` (${company})` : ""}`;
      copy.summary = r.data.summary || copy.summary;
      copy.contact.title = r.data.title || copy.contact.title;
      if (r.data.skills.length) copy.skills = r.data.skills;
      for (const e of copy.experience) {
        const t = r.data.experience.find((x) => x.id === e.id);
        if (t && t.bullets.length) e.bullets = t.bullets;
      }
      copy.tailoring = {
        jobTitle,
        company,
        jobDescription: jd,
        matchScoreBefore: matchResume(resume, jd).score,
        matchScoreAfter: matchResume(copy, jd).score,
        tailoredAt: new Date().toISOString(),
        notes: r.data.notes,
        source: r.source,
      };
      saveResume(copy);
      router.push(`/dashboard/resume/edit/${copy.id}?fromTailoring=true`);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Tailoring failed.");
      setBusy(false);
    }
  }

  if (!loaded) return <p className="muted">Loading…</p>;
  if (!resumes.length) {
    return (
      <div className="card empty">
        <h2>Create a resume first</h2>
        <p className="muted">Tailoring makes a copy of an existing resume rewritten for a specific job posting.</p>
        <Link href="/dashboard/resume/new" className="btn btn-primary">Create a resume</Link>
      </div>
    );
  }

  return (
    <div className="translator-grid">
      <div className="card">
        <h1 style={{ fontSize: "1.4rem" }}>Tailor to a job</h1>
        <p className="muted small">
          Paste a job posting. We&apos;ll score your keyword match and create a tailored copy; your original stays as it is.
        </p>
        <div className="field">
          <label htmlFor="resume">Resume to tailor</label>
          <select id="resume" value={resumeId} onChange={(e) => setResumeId(e.target.value)}>
            {resumes.map((r) => <option key={r.id} value={r.id}>{r.name}</option>)}
          </select>
        </div>
        <div className="grid-2">
          <div className="field">
            <label htmlFor="jt">Job title</label>
            <input id="jt" type="text" value={jobTitle} onChange={(e) => setJobTitle(e.target.value)} />
          </div>
          <div className="field">
            <label htmlFor="co">Company / agency</label>
            <input id="co" type="text" value={company} onChange={(e) => setCompany(e.target.value)} />
          </div>
        </div>
        <div className="field">
          <label htmlFor="jd">Job description</label>
          <textarea id="jd" rows={14} value={jd} onChange={(e) => setJd(e.target.value)} placeholder="Paste the full posting, including responsibilities and qualifications." />
        </div>
        <button className="btn btn-primary" disabled={!resume || !jd.trim() || busy} onClick={run}>
          {busy ? "Tailoring…" : "Create tailored resume"}
        </button>
        {error && <div className="alert alert-error" style={{ marginTop: 12 }}>{error}</div>}
      </div>

      <div className="card">
        <h2>Keyword match</h2>
        {!report ? (
          <p className="muted">Paste a job description to see how well this resume matches it.</p>
        ) : (
          <>
            <div className="spread">
              <strong style={{ fontSize: "2rem" }}>{report.score}%</strong>
              <span className="muted small">{report.matched.length} of {report.matched.length + report.missing.length} key terms found</span>
            </div>
            <div className="match-meter" style={{ margin: "8px 0 16px" }}>
              <span style={{ width: `${report.score}%` }} />
            </div>
            <p><strong>Missing</strong></p>
            <div className="chip-list">{report.missing.map((k) => <span key={k.term} className="chip chip-missing">{k.term}</span>)}</div>
            <p style={{ marginTop: 14 }}><strong>Already on your resume</strong></p>
            <div className="chip-list">{report.matched.map((k) => <span key={k.term} className="chip chip-matched">{k.term}</span>)}</div>
            <p className="small muted" style={{ marginTop: 14 }}>
              Applicant tracking systems rank resumes partly on how closely their wording matches the posting.
              Only add keywords that truthfully describe your experience.
            </p>
          </>
        )}
      </div>
    </div>
  );
}

export default function TailorPage() {
  return (
    <Suspense>
      <Tailor />
    </Suspense>
  );
}
