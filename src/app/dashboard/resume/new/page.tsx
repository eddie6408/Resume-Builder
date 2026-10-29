"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense, useState } from "react";
import { emptyResume, sampleResume } from "@/lib/factory";
import { findOccupation, searchOccupations } from "@/lib/military-codes";
import { saveResume } from "@/lib/storage";
import type { TemplateId } from "@/lib/types";

const BRANCHES = ["Army", "Navy", "Air Force", "Marine Corps", "Coast Guard", "Space Force", "National Guard", "Reserve"];

function NewResume() {
  const router = useRouter();
  const params = useSearchParams();
  const initialTemplate = (params.get("template") as TemplateId) || "modern";
  const [template, setTemplate] = useState<TemplateId>(
    ["modern", "classic", "federal"].includes(initialTemplate) ? initialTemplate : "modern",
  );
  const [name, setName] = useState("");
  const [fullName, setFullName] = useState("");
  const [branch, setBranch] = useState("");
  const [rank, setRank] = useState("");
  const [code, setCode] = useState("");
  const [years, setYears] = useState("");
  const [target, setTarget] = useState("");

  const occ = findOccupation(code);
  const suggestions = code && !occ ? searchOccupations(code, 4) : [];

  function create() {
    const r = emptyResume(name || (target ? `${target} Resume` : "My Resume"), template);
    r.contact.fullName = fullName;
    r.contact.title = target || occ?.civilianTitles[0] || "";
    r.military = { ...r.military, branch, rank, occupationCode: code.toUpperCase(), yearsOfService: years };
    if (occ) r.skills = [...occ.skills];
    r.experience[0] = {
      ...r.experience[0],
      title: occ ? `${occ.civilianTitles[0]} (${occ.title})` : "",
      organization: branch ? `U.S. ${branch}` : "",
      grade: rank,
    };
    saveResume(r);
    router.push(`/dashboard/resume/edit/${r.id}`);
  }

  function createSample() {
    const r = sampleResume();
    r.template = template;
    saveResume(r);
    router.push(`/dashboard/resume/edit/${r.id}`);
  }

  return (
    <div className="narrow" style={{ margin: "0 auto" }}>
      <h1>Create a resume</h1>
      <div className="card">
        <h2>Template</h2>
        <div className="row">
          {(["modern", "classic", "federal"] as const).map((t) => (
            <button key={t} className={`btn ${template === t ? "btn-primary" : ""}`} onClick={() => setTemplate(t)}>
              {t === "modern" ? "Modern (private sector)" : t === "classic" ? "Classic" : "Federal (USAJOBS)"}
            </button>
          ))}
        </div>
      </div>

      <div className="card">
        <h2>About your service</h2>
        <div className="grid-2">
          <div className="field">
            <label htmlFor="fn">Full name</label>
            <input id="fn" type="text" value={fullName} onChange={(e) => setFullName(e.target.value)} />
          </div>
          <div className="field">
            <label htmlFor="target">Target civilian role</label>
            <input id="target" type="text" placeholder="e.g. Logistics Manager" value={target} onChange={(e) => setTarget(e.target.value)} />
          </div>
          <div className="field">
            <label htmlFor="branch">Branch</label>
            <select id="branch" value={branch} onChange={(e) => setBranch(e.target.value)}>
              <option value="">Select…</option>
              {BRANCHES.map((b) => <option key={b}>{b}</option>)}
            </select>
          </div>
          <div className="field">
            <label htmlFor="rank">Rank / pay grade</label>
            <input id="rank" type="text" placeholder="e.g. SSG (E-6)" value={rank} onChange={(e) => setRank(e.target.value)} />
          </div>
          <div className="field">
            <label htmlFor="code">MOS / AFSC / Rating</label>
            <input id="code" type="text" placeholder="e.g. 92A" value={code} onChange={(e) => setCode(e.target.value)} />
            {occ && <div className="small" style={{ marginTop: 4, color: "var(--success)" }}>{occ.title}: we&apos;ll prefill titles and skills.</div>}
            {suggestions.length > 0 && (
              <div className="small muted" style={{ marginTop: 4 }}>
                Did you mean:{" "}
                {suggestions.map((s) => (
                  <button key={s.code} className="btn btn-sm btn-ghost" onClick={() => setCode(s.code)}>{s.code} ({s.title})</button>
                ))}
              </div>
            )}
          </div>
          <div className="field">
            <label htmlFor="years">Years of service</label>
            <input id="years" type="text" value={years} onChange={(e) => setYears(e.target.value)} />
          </div>
        </div>
        <div className="field">
          <label htmlFor="name">Resume name (only you see this)</label>
          <input id="name" type="text" placeholder="e.g. Logistics – private sector" value={name} onChange={(e) => setName(e.target.value)} />
        </div>
        <div className="row">
          <button className="btn btn-primary" onClick={create}>Create resume</button>
          <button className="btn" onClick={createSample}>Start from a sample instead</button>
          <Link href="/dashboard/evaluations" className="btn btn-ghost">Start from an evaluation →</Link>
        </div>
      </div>
    </div>
  );
}

export default function NewResumePage() {
  return (
    <Suspense>
      <NewResume />
    </Suspense>
  );
}
