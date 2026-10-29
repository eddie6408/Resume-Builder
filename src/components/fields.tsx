"use client";

import { useState } from "react";

export function TextField({
  label,
  value,
  onChange,
  placeholder,
  type = "text",
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  type?: "text" | "email" | "tel" | "url" | "month";
}) {
  return (
    <div className="field">
      <label>
        {label}
        <input type={type} value={value} placeholder={placeholder} onChange={(e) => onChange(e.target.value)} style={{ marginTop: 4 }} />
      </label>
    </div>
  );
}

export function TextArea({
  label,
  value,
  onChange,
  rows = 4,
  placeholder,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  rows?: number;
  placeholder?: string;
}) {
  return (
    <div className="field">
      <label>
        {label}
        <textarea rows={rows} value={value} placeholder={placeholder} onChange={(e) => onChange(e.target.value)} style={{ marginTop: 4 }} />
      </label>
    </div>
  );
}

export function ChipInput({
  values,
  onChange,
  placeholder,
}: {
  values: string[];
  onChange: (v: string[]) => void;
  placeholder?: string;
}) {
  const [draft, setDraft] = useState("");
  function add() {
    const items = draft
      .split(",")
      .map((s) => s.trim())
      .filter((s) => s && !values.some((v) => v.toLowerCase() === s.toLowerCase()));
    if (items.length) onChange([...values, ...items]);
    setDraft("");
  }
  return (
    <div>
      <div className="row" style={{ marginBottom: 8 }}>
        <input
          type="text"
          value={draft}
          placeholder={placeholder ?? "Type and press Enter (comma-separate several)"}
          onChange={(e) => setDraft(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              e.preventDefault();
              add();
            }
          }}
          style={{ flex: 1 }}
        />
        <button className="btn" onClick={add} type="button">Add</button>
      </div>
      <div className="chip-list">
        {values.map((v) => (
          <span key={v} className="chip">
            {v}
            <button type="button" aria-label={`Remove ${v}`} onClick={() => onChange(values.filter((x) => x !== v))}>×</button>
          </span>
        ))}
      </div>
    </div>
  );
}
