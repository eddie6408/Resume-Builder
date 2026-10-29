"use client";

import Link from "next/link";
import { useRef, useState } from "react";
import { emptyResume, uid } from "@/lib/factory";
import { deleteResume, exportAll, importAll, saveResume } from "@/lib/storage";
import { downloadFile } from "@/lib/export";
import { useStore } from "@/lib/use-store";
import type { Resume } from "@/lib/types";

const TEMPLATE_LABEL = { modern: "Modern", classic: "Classic", federal: "Federal" } as const;

export default function DashboardPage() {
  const { resumes, coverLetters, loaded } = useStore();
  const fileRef = useRef<HTMLInputElement>(null);
  const [message, setMessage] = useState("");

  function duplicate(r: Resume) {
    const now = new Date().toISOString();
    saveResume({ ...structuredClone(r), id: uid(), name: `${r.name} (copy)`, createdAt: now, tailoring: undefined, parentId: undefined });
  }

  function remove(r: Resume) {
    if (confirm(`Delete "${r.name}"? Its cover letters will be deleted too. This can't be undone.`)) deleteResume(r.id);
  }

  async function onImport(file: File) {
    try {
      const n = importAll(await file.text());
      setMessage(`Imported ${n.resumes} resume(s) and ${n.coverLetters} cover letter(s).`);
    } catch {
      setMessage("That file couldn't be imported. Choose a backup exported from this site.");
    }
  }

  if (!loaded) return <p className="muted">Loading…</p>;

  return (
    <div>
      <div className="spread" style={{ marginBottom: 16 }}>
        <div>
          <h1 style={{ marginBottom: 4 }}>My resumes</h1>
          <p className="muted" style={{ margin: 0 }}>
            {resumes.length} resume{resumes.length === 1 ? "" : "s"} · {coverLetters.length} cover letter{coverLetters.length === 1 ? "" : "s"}
          </p>
        </div>
        <div className="row">
          <button className="btn btn-sm" onClick={() => downloadFile("resume-backup.json", exportAll(), "application/json")}>
            Back up
          </button>
          <button className="btn btn-sm" onClick={() => fileRef.current?.click()}>Restore</button>
          <input
            ref={fileRef}
            type="file"
            accept="application/json"
            hidden
            onChange={(e) => {
              const f = e.target.files?.[0];
              if (f) onImport(f);
              e.target.value = "";
            }}
          />
          <Link href="/dashboard/resume/new" className="btn btn-primary">+ New resume</Link>
        </div>
      </div>
      {message && <div className="alert" style={{ marginBottom: 16 }}>{message}</div>}

      {resumes.length === 0 ? (
        <div className="card empty">
          <h2>No resumes yet</h2>
          <p className="muted">Start from scratch, from a sample, or from one of your evaluations.</p>
          <div className="row" style={{ justifyContent: "center" }}>
            <Link href="/dashboard/resume/new" className="btn btn-primary">Create a resume</Link>
            <button
              className="btn"
              onClick={() => {
                const r = saveResume(emptyResume());
                location.href = `/dashboard/resume/edit/${r.id}`;
              }}
            >
              Blank resume
            </button>
          </div>
        </div>
      ) : (
        <div className="resume-grid">
          {resumes.map((r) => (
            <div key={r.id} className="card resume-card">
              <div className="spread">
                <h3>{r.name}</h3>
                <span className="badge">{TEMPLATE_LABEL[r.template]}</span>
              </div>
              {r.tailoring && (
                <div className="small">
                  <span className="badge badge-success">Tailored</span>{" "}
                  {r.tailoring.jobTitle}
                  {r.tailoring.company && ` · ${r.tailoring.company}`}
                </div>
              )}
              <div className="small muted">Updated {new Date(r.updatedAt).toLocaleString()}</div>
              <div className="row" style={{ marginTop: 6 }}>
                <Link href={`/dashboard/resume/edit/${r.id}`} className="btn btn-sm btn-primary">Edit</Link>
                <Link href={`/dashboard/tailor?resume=${r.id}`} className="btn btn-sm">Tailor</Link>
                <Link href={`/dashboard/cover-letters/new?resume=${r.id}`} className="btn btn-sm">Cover letter</Link>
                <button className="btn btn-sm btn-ghost" onClick={() => duplicate(r)}>Duplicate</button>
                <button className="btn btn-sm btn-ghost btn-danger" onClick={() => remove(r)}>Delete</button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
