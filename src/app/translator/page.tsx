"use client";

import Link from "next/link";
import { useState } from "react";
import { translate, type Source } from "@/lib/ai-client";
import { OCCUPATION_CODES, searchOccupations, type OccupationCode } from "@/lib/military-codes";
import { translateJargon } from "@/lib/jargon";

export default function TranslatorPage() {
  const [query, setQuery] = useState("");
  const [selected, setSelected] = useState<OccupationCode | null>(null);
  const [text, setText] = useState("");
  const [bullets, setBullets] = useState<string[]>([]);
  const [skills, setSkills] = useState<string[]>([]);
  const [source, setSource] = useState<Source | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [copied, setCopied] = useState(false);

  const results = query ? searchOccupations(query) : [];
  const preview = text ? translateJargon(text) : null;

  async function run() {
    setBusy(true);
    setError("");
    try {
      const r = await translate(text, selected?.code);
      setBullets(r.data.bullets);
      setSkills(r.data.suggestedSkills);
      setSource(r.source);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Translation failed.");
    } finally {
      setBusy(false);
    }
  }

  async function copy() {
    await navigator.clipboard.writeText(bullets.map((b) => `• ${b}`).join("\n"));
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  }

  return (
    <section className="section">
      <div className="container">
        <h1>Military-to-civilian translator</h1>
        <p className="muted">Look up your occupation code, then translate your duties into civilian resume bullets.</p>

        <div className="translator-grid" style={{ marginTop: 20 }}>
          <div className="card">
            <h2>1. Find your MOS, AFSC, or rating</h2>
            <div className="field">
              <input
                type="search"
                placeholder={`Try "92A", "25B", "Corpsman", "3P0X1"... (${OCCUPATION_CODES.length} codes)`}
                value={query}
                onChange={(e) => setQuery(e.target.value)}
              />
            </div>
            {results.map((o) => (
              <button
                key={`${o.branch}-${o.code}`}
                className="occ-result"
                style={{ display: "block", width: "100%", textAlign: "left", cursor: "pointer", font: "inherit" }}
                onClick={() => {
                  setSelected(o);
                  setQuery("");
                }}
              >
                <strong>{o.code}</strong> · {o.title} <span className="badge">{o.branch}</span>
              </button>
            ))}
            {selected && (
              <div className="alert" style={{ marginTop: 12 }}>
                <div className="spread">
                  <strong>
                    {selected.code}: {selected.title} ({selected.branch})
                  </strong>
                  <button className="btn btn-sm btn-ghost" onClick={() => setSelected(null)}>Clear</button>
                </div>
                <p style={{ margin: "8px 0 4px" }}><strong>Civilian job titles:</strong></p>
                <div className="chip-list">{selected.civilianTitles.map((t) => <span key={t} className="chip">{t}</span>)}</div>
                <p style={{ margin: "10px 0 4px" }}><strong>Transferable skills:</strong></p>
                <div className="chip-list">{selected.skills.map((t) => <span key={t} className="chip chip-matched">{t}</span>)}</div>
              </div>
            )}
          </div>

          <div className="card">
            <h2>2. Translate your duties</h2>
            <div className="field">
              <label htmlFor="duties">Paste duties, accomplishments, or evaluation bullets</label>
              <textarea
                id="duties"
                rows={8}
                value={text}
                onChange={(e) => setText(e.target.value)}
                placeholder="e.g. NCOIC of 12 Soldiers responsible for PMCS on 30 vehicles in the motor pool. Led platoon through NTC rotation with zero safety incidents."
              />
            </div>
            {preview && preview.changes.length > 0 && (
              <p className="small muted">
                Jargon found: {[...new Set(preview.changes.map((c) => `${c.from} → ${c.to}`))].slice(0, 8).join(", ")}
              </p>
            )}
            <button className="btn btn-primary" disabled={!text.trim() || busy} onClick={run}>
              {busy ? "Translating…" : "Translate"}
            </button>
            {error && <div className="alert alert-error" style={{ marginTop: 12 }}>{error}</div>}
          </div>
        </div>

        {bullets.length > 0 && (
          <div className="card" style={{ marginTop: 16 }}>
            <div className="spread">
              <h2>Civilian bullets</h2>
              <div className="row">
                <span className="badge">{source === "ai" ? "AI-written" : "Rule-based translation"}</span>
                <button className="btn btn-sm" onClick={copy}>{copied ? "Copied" : "Copy"}</button>
              </div>
            </div>
            <ul>{bullets.map((b, i) => <li key={i}>{b}</li>)}</ul>
            {skills.length > 0 && (
              <>
                <p><strong>Suggested skills</strong></p>
                <div className="chip-list">{skills.map((s) => <span key={s} className="chip">{s}</span>)}</div>
              </>
            )}
            <p className="small muted" style={{ marginTop: 14 }}>
              Review every bullet for accuracy before you use it. <Link href="/dashboard/resume/new">Start a resume</Link> to
              add these to your experience.
            </p>
          </div>
        )}
      </div>
    </section>
  );
}
