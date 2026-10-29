"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { useEffect, useState } from "react";
import CoverLetterEditor from "@/components/CoverLetterEditor";
import { listCoverLetters } from "@/lib/storage";
import type { CoverLetter } from "@/lib/types";

export default function CoverLetterPage() {
  const { id } = useParams<{ id: string }>();
  const [letter, setLetter] = useState<CoverLetter | null | undefined>(undefined);

  useEffect(() => {
    setLetter(listCoverLetters().find((l) => l.id === id) ?? null);
  }, [id]);

  if (letter === undefined) return <p className="muted">Loading…</p>;
  if (letter === null) {
    return (
      <div className="card empty">
        <h2>Cover letter not found</h2>
        <Link href="/dashboard/cover-letters" className="btn btn-primary">Back to cover letters</Link>
      </div>
    );
  }
  return <CoverLetterEditor key={letter.id} initial={letter} />;
}
