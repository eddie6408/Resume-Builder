"use client";

import { useSearchParams } from "next/navigation";
import { Suspense } from "react";
import CoverLetterEditor from "@/components/CoverLetterEditor";

function NewLetter() {
  const params = useSearchParams();
  return <CoverLetterEditor defaultResumeId={params.get("resume") ?? undefined} />;
}

export default function NewCoverLetterPage() {
  return (
    <Suspense>
      <NewLetter />
    </Suspense>
  );
}
