"use client";

import Link from "next/link";
import { deleteCoverLetter } from "@/lib/storage";
import { useStore } from "@/lib/use-store";

export default function CoverLettersPage() {
  const { coverLetters, resumes, loaded } = useStore();
  if (!loaded) return <p className="muted">Loading…</p>;

  return (
    <div>
      <div className="spread" style={{ marginBottom: 16 }}>
        <h1 style={{ margin: 0 }}>Cover letters</h1>
        <Link href="/dashboard/cover-letters/new" className="btn btn-primary">+ New cover letter</Link>
      </div>
      {coverLetters.length === 0 ? (
        <div className="card empty">
          <h2>No cover letters yet</h2>
          <p className="muted">Write one from any resume, matched to the job you&apos;re applying for.</p>
          <Link href="/dashboard/cover-letters/new" className="btn btn-primary">Write a cover letter</Link>
        </div>
      ) : (
        <div className="resume-grid">
          {coverLetters.map((l) => (
            <div key={l.id} className="card resume-card">
              <h3>{l.jobTitle || "Cover letter"}{l.company && ` · ${l.company}`}</h3>
              <div className="small muted">From: {resumes.find((r) => r.id === l.resumeId)?.name ?? "deleted resume"}</div>
              <div className="small muted">Updated {new Date(l.updatedAt).toLocaleString()}</div>
              <div className="row">
                <Link href={`/dashboard/cover-letters/${l.id}`} className="btn btn-sm btn-primary">Open</Link>
                <button className="btn btn-sm btn-ghost btn-danger" onClick={() => confirm("Delete this cover letter?") && deleteCoverLetter(l.id)}>Delete</button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
