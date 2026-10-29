"use client";

import Link from "next/link";
import { useParams, useSearchParams } from "next/navigation";
import { Suspense, useEffect, useState } from "react";
import ResumeEditor from "@/components/ResumeEditor";
import { getResume } from "@/lib/storage";
import type { Resume } from "@/lib/types";

function EditResume() {
  const { id } = useParams<{ id: string }>();
  const params = useSearchParams();
  const [resume, setResume] = useState<Resume | null | undefined>(undefined);

  useEffect(() => {
    setResume(getResume(id) ?? null);
  }, [id]);

  if (resume === undefined) return <p className="muted">Loading…</p>;
  if (resume === null) {
    return (
      <div className="card empty">
        <h2>Resume not found</h2>
        <p className="muted">It may have been deleted, or it was created in a different browser.</p>
        <Link href="/dashboard" className="btn btn-primary">Back to my resumes</Link>
      </div>
    );
  }
  return <ResumeEditor key={resume.id} initial={resume} fromTailoring={params.get("fromTailoring") === "true"} />;
}

export default function EditResumePage() {
  return (
    <Suspense>
      <EditResume />
    </Suspense>
  );
}
