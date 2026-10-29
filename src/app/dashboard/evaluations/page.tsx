"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { extractEvaluation, type Source } from "@/lib/ai-client";
import type { EvaluationResult } from "@/lib/ai-schemas";
import { emptyAward, emptyExperience, emptyResume } from "@/lib/factory";
import { saveResume } from "@/lib/storage";
import { useStore } from "@/lib/use-store";

const EVAL_TYPES = ["NCOER (Army NCO)", "OER (Army Officer)", "EPR / EPB (Air Force/Space Force Enlisted)", "OPR / OPB (Air Force/Space Force Officer)", "FITREP (Navy/Marine Officer)", "Navy EVAL (Enlisted)", "Marine Corps PROMS / JEPES", "Coast Guard EER / OER", "Award citation"];

export default function EvaluationsPage() {
  const router = useRouter();
  const { resumes } = useStore();
  const [type, setType] = useState(EVAL_TYPES[0]);
  const [text, setText] = useState("");
  const [targetRole, setTargetRole] = useState("");
  const [result, setResult] = useState<EvaluationResult | null>(null);
  const [selected, setSelected] = useState<boolean[]>([]);
  const [source, setSource] = useState<Source | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [target, setTarget] = useState("new");

  async function readFile(file: File) {
    if (file.type === "application/pdf") {
      setError("PDF import isn't supported yet. Open the PDF, select all of the text, and paste it here.");
      return;
    }
    setText(await file.text());
  }

  async function run() {
    setBusy(true);
    setError("");
    try {
      const r = await extractEvaluation(`[${type}]\n${text}`, targetRole);
      setResult(r.data);
      setSelected(r.data.bullets.map(() => true));
      setSource(r.source);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Extraction failed.");
    } finally {
      setBusy(false);
    }
  }

  function addToResume() {
    if (!result) return;
    const bullets = result.bullets.filter((_, i) => selected[i]);
    const existing = resumes.find((r) => r.id === target);
    const r = existing ? structuredClone(existing) : emptyResume(targetRole ? `${targetRole} Resume` : "Resume from evaluation");
    if (!existing) {
      r.contact.title = targetRole;
      r.experience = [];
    }
    const exp = { ...emptyExperience(), title: targetRole ? `${targetRole}` : "", organization: "", bullets };
    r.experience = [exp, ...r.experience];
    if (!r.summary && result.summary) r.summary = result.summary;
    r.skills = [...new Set([...r.skills, ...result.skills])];
    for (const name of result.awards) {
      if (!r.awards.some((a) => a.name === name)) r.awards.push({ ...emptyAward(), name });
    }
    saveResume(r);
    router.push(`/dashboard/resume/edit/${r.id}`);
  }

  return (
    <div className="translator-grid">
      <div className="card">
        <h1 style={{ fontSize: "1.4rem" }}>Import an evaluation</h1>
        <p className="muted small">
          Paste the text of a performance evaluation or award citation. We&apos;ll pull out your accomplishments as
          civilian resume bullets. Remove names, SSNs/DoD IDs, and anything classified before pasting.
        </p>
        <div className="grid-2">
          <div className="field">
            <label htmlFor="type">Evaluation type</label>
            <select id="type" value={type} onChange={(e) => setType(e.target.value)}>
              {EVAL_TYPES.map((t) => <option key={t}>{t}</option>)}
            </select>
          </div>
          <div className="field">
            <label htmlFor="role">Target civilian role (optional)</label>
            <input id="role" type="text" value={targetRole} onChange={(e) => setTargetRole(e.target.value)} />
          </div>
        </div>
        <div className="field">
          <label htmlFor="eval">Evaluation text</label>
          <textarea id="eval" rows={12} value={text} onChange={(e) => setText(e.target.value)} />
        </div>
        <div className="row">
          <button className="btn btn-primary" disabled={!text.trim() || busy} onClick={run}>
            {busy ? "Extracting…" : "Extract accomplishments"}
          </button>
          <label className="btn" style={{ margin: 0, color: "var(--text)" }}>
            Upload .txt
            <input type="file" accept=".txt,text/plain,application/pdf" hidden onChange={(e) => e.target.files?.[0] && readFile(e.target.files[0])} />
          </label>
        </div>
        {error && <div className="alert alert-error" style={{ marginTop: 12 }}>{error}</div>}
      </div>

      <div className="card">
        <div className="spread">
          <h2>Results</h2>
          {source && <span className="badge">{source === "ai" ? "AI-extracted" : "Rule-based extraction"}</span>}
        </div>
        {!result ? (
          <p className="muted">Your extracted bullets will appear here.</p>
        ) : result.bullets.length === 0 ? (
          <p className="muted">No accomplishments found. Try pasting the full bullet section of the evaluation.</p>
        ) : (
          <>
            {result.summary && <p><em>{result.summary}</em></p>}
            {result.bullets.map((b, i) => (
              <label key={i} className="checkbox" style={{ alignItems: "flex-start", marginBottom: 8 }}>
                <input type="checkbox" checked={selected[i] ?? false} onChange={(e) => setSelected((s) => s.map((v, j) => (j === i ? e.target.checked : v)))} style={{ marginTop: 4 }} />
                <span>{b}</span>
              </label>
            ))}
            {result.skills.length > 0 && <p className="small"><strong>Skills:</strong> {result.skills.join(", ")}</p>}
            {result.awards.length > 0 && <p className="small"><strong>Awards:</strong> {result.awards.join(", ")}</p>}
            <div className="field">
              <label htmlFor="target">Add to</label>
              <select id="target" value={target} onChange={(e) => setTarget(e.target.value)}>
                <option value="new">A new resume</option>
                {resumes.map((r) => <option key={r.id} value={r.id}>{r.name}</option>)}
              </select>
            </div>
            <button className="btn btn-primary" disabled={!selected.some(Boolean)} onClick={addToResume}>
              Add {selected.filter(Boolean).length} bullet(s) to resume
            </button>
          </>
        )}
      </div>
    </div>
  );
}
