"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { coverLetter } from "@/lib/ai-client";
import { downloadFile, slugify } from "@/lib/export";
import { uid } from "@/lib/factory";
import { saveCoverLetter } from "@/lib/storage";
import { useStore } from "@/lib/use-store";
import type { CoverLetter } from "@/lib/types";

export default function CoverLetterEditor({ initial, defaultResumeId }: { initial?: CoverLetter; defaultResumeId?: string }) {
  const { resumes, loaded } = useStore();
  const [letter, setLetter] = useState<CoverLetter>(
    () =>
      initial ?? {
        id: uid(),
        resumeId: defaultResumeId ?? "",
        jobTitle: "",
        company: "",
        body: "",
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
  );
  const [jd, setJd] = useState("");
  const [tone, setTone] = useState<"professional" | "warm" | "direct">("professional");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [saved, setSaved] = useState("");
  const persisted = useRef(Boolean(initial));

  const resume = resumes.find((r) => r.id === letter.resumeId);

  useEffect(() => {
    if (loaded && !letter.resumeId && resumes.length) {
      const r = resumes[0];
      setLetter((l) => ({ ...l, resumeId: r.id }));
    }
  }, [loaded, letter.resumeId, resumes]);

  // Prefill job details from a tailored resume.
  useEffect(() => {
    if (resume?.tailoring && !letter.jobTitle && !letter.company && !jd) {
      setLetter((l) => ({ ...l, jobTitle: resume.tailoring!.jobTitle, company: resume.tailoring!.company }));
      setJd(resume.tailoring.jobDescription);
    }
  }, [resume?.id]);

  // Autosave once the letter has content.
  useEffect(() => {
    if (!letter.body.trim()) return;
    const t = setTimeout(() => {
      saveCoverLetter(letter);
      setSaved(new Date().toLocaleTimeString());
      if (!persisted.current) {
        persisted.current = true;
        // Update the URL without remounting so unsaved fields (job description) survive.
        window.history.replaceState(null, "", `/dashboard/cover-letters/${letter.id}`);
      }
    }, 500);
    return () => clearTimeout(t);
  }, [letter]);

  async function generate() {
    if (!resume) return;
    setBusy(true);
    setError("");
    try {
      const r = await coverLetter(resume, letter.jobTitle, letter.company, jd, tone);
      setLetter((l) => ({ ...l, body: r.data.body }));
    } catch (e) {
      setError(e instanceof Error ? e.message : "Couldn't write the letter.");
    } finally {
      setBusy(false);
    }
  }

  if (!loaded) return <p className="muted">Loading…</p>;
  if (!resumes.length) {
    return (
      <div className="card empty">
        <h2>Create a resume first</h2>
        <p className="muted">Cover letters are written from one of your resumes.</p>
        <Link href="/dashboard/resume/new" className="btn btn-primary">Create a resume</Link>
      </div>
    );
  }

  return (
    <div className="editor">
      <div className="editor-pane card">
        <h1 style={{ fontSize: "1.4rem" }}>Cover letter</h1>
        <div className="field">
          <label htmlFor="cl-resume">Based on resume</label>
          <select id="cl-resume" value={letter.resumeId} onChange={(e) => setLetter((l) => ({ ...l, resumeId: e.target.value }))}>
            {resumes.map((r) => <option key={r.id} value={r.id}>{r.name}</option>)}
          </select>
        </div>
        <div className="grid-2">
          <div className="field">
            <label htmlFor="cl-title">Job title</label>
            <input id="cl-title" type="text" value={letter.jobTitle} onChange={(e) => setLetter((l) => ({ ...l, jobTitle: e.target.value }))} />
          </div>
          <div className="field">
            <label htmlFor="cl-co">Company / agency</label>
            <input id="cl-co" type="text" value={letter.company} onChange={(e) => setLetter((l) => ({ ...l, company: e.target.value }))} />
          </div>
        </div>
        <div className="field">
          <label htmlFor="cl-jd">Job description (optional, improves the letter)</label>
          <textarea id="cl-jd" rows={8} value={jd} onChange={(e) => setJd(e.target.value)} />
        </div>
        <div className="row">
          <select value={tone} onChange={(e) => setTone(e.target.value as typeof tone)} style={{ maxWidth: 180 }} aria-label="Tone">
            <option value="professional">Professional</option>
            <option value="warm">Warm</option>
            <option value="direct">Direct</option>
          </select>
          <button className="btn btn-primary" onClick={generate} disabled={busy || !resume}>
            {busy ? "Writing…" : letter.body ? "Rewrite letter" : "Write my letter"}
          </button>
        </div>
        {error && <div className="alert alert-error" style={{ marginTop: 12 }}>{error}</div>}
      </div>

      <div className="preview-pane">
        <div className="toolbar no-print" style={{ marginBottom: 10 }}>
          <button className="btn btn-sm btn-primary" onClick={() => window.print()} disabled={!letter.body}>Download PDF</button>
          <button className="btn btn-sm" disabled={!letter.body} onClick={() => downloadFile(`cover-letter-${slugify(letter.company || letter.jobTitle)}.txt`, letter.body)}>
            Plain text
          </button>
          <span className="saved">{saved && `Saved ${saved}`}</span>
        </div>
        <div className="paper t-modern">
          {resume && (
            <header style={{ marginBottom: 18 }}>
              <h1 style={{ fontSize: "16pt" }}>{resume.contact.fullName || "Your Name"}</h1>
              <div className="r-contact">{[resume.contact.location, resume.contact.phone, resume.contact.email].filter(Boolean).join("  •  ")}</div>
            </header>
          )}
          <textarea
            className="no-print"
            aria-label="Letter text"
            value={letter.body}
            onChange={(e) => setLetter((l) => ({ ...l, body: e.target.value }))}
            placeholder="Click “Write my letter”, or start typing."
            style={{ minHeight: 640, border: 0, padding: 0, fontSize: "10.5pt", lineHeight: 1.5, outline: "none" }}
          />
          <div className="print-only" style={{ whiteSpace: "pre-wrap" }}>{letter.body}</div>
        </div>
      </div>
    </div>
  );
}
