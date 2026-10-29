"use client";

import { useEffect, useState } from "react";
import { listCoverLetters, listResumes } from "./storage";
import type { CoverLetter, Resume } from "./types";

/** Subscribe to the local store; `loaded` is false until the first client read. */
export function useStore(): { resumes: Resume[]; coverLetters: CoverLetter[]; loaded: boolean } {
  const [state, setState] = useState<{ resumes: Resume[]; coverLetters: CoverLetter[]; loaded: boolean }>({
    resumes: [],
    coverLetters: [],
    loaded: false,
  });
  useEffect(() => {
    const refresh = () => setState({ resumes: listResumes(), coverLetters: listCoverLetters(), loaded: true });
    refresh();
    window.addEventListener("rb-storage", refresh);
    window.addEventListener("storage", refresh);
    return () => {
      window.removeEventListener("rb-storage", refresh);
      window.removeEventListener("storage", refresh);
    };
  }, []);
  return state;
}
