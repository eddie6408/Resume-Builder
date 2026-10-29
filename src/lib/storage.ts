"use client";

// Browser-local persistence. Swap this module for an API-backed store when
// accounts are added; the rest of the app only talks to these functions.
import type { CoverLetter, Resume } from "./types";

const RESUMES_KEY = "rb.resumes.v1";
const LETTERS_KEY = "rb.coverLetters.v1";

function read<T>(key: string): T[] {
  try {
    const raw = window.localStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T[]) : [];
  } catch {
    return [];
  }
}

function write<T>(key: string, items: T[]): void {
  try {
    window.localStorage.setItem(key, JSON.stringify(items));
    window.dispatchEvent(new Event("rb-storage"));
  } catch {
    // Storage full or blocked; the in-memory state still works for this visit.
  }
}

export function listResumes(): Resume[] {
  return read<Resume>(RESUMES_KEY).sort((a, b) => b.updatedAt.localeCompare(a.updatedAt));
}

export function getResume(id: string): Resume | undefined {
  return read<Resume>(RESUMES_KEY).find((r) => r.id === id);
}

export function saveResume(resume: Resume): Resume {
  const updated = { ...resume, updatedAt: new Date().toISOString() };
  const all = read<Resume>(RESUMES_KEY).filter((r) => r.id !== resume.id);
  write(RESUMES_KEY, [updated, ...all]);
  return updated;
}

export function deleteResume(id: string): void {
  write(RESUMES_KEY, read<Resume>(RESUMES_KEY).filter((r) => r.id !== id));
  write(LETTERS_KEY, read<CoverLetter>(LETTERS_KEY).filter((l) => l.resumeId !== id));
}

export function listCoverLetters(): CoverLetter[] {
  return read<CoverLetter>(LETTERS_KEY).sort((a, b) => b.updatedAt.localeCompare(a.updatedAt));
}

export function saveCoverLetter(letter: CoverLetter): CoverLetter {
  const updated = { ...letter, updatedAt: new Date().toISOString() };
  const all = read<CoverLetter>(LETTERS_KEY).filter((l) => l.id !== letter.id);
  write(LETTERS_KEY, [updated, ...all]);
  return updated;
}

export function deleteCoverLetter(id: string): void {
  write(LETTERS_KEY, read<CoverLetter>(LETTERS_KEY).filter((l) => l.id !== id));
}

export function exportAll(): string {
  return JSON.stringify(
    { version: 1, resumes: read<Resume>(RESUMES_KEY), coverLetters: read<CoverLetter>(LETTERS_KEY) },
    null,
    2,
  );
}

export function importAll(json: string): { resumes: number; coverLetters: number } {
  const data = JSON.parse(json) as { resumes?: Resume[]; coverLetters?: CoverLetter[] };
  const resumes = Array.isArray(data.resumes) ? data.resumes : [];
  const letters = Array.isArray(data.coverLetters) ? data.coverLetters : [];
  const existing = read<Resume>(RESUMES_KEY).filter((r) => !resumes.some((n) => n.id === r.id));
  const existingLetters = read<CoverLetter>(LETTERS_KEY).filter(
    (l) => !letters.some((n) => n.id === l.id),
  );
  write(RESUMES_KEY, [...resumes, ...existing]);
  write(LETTERS_KEY, [...letters, ...existingLetters]);
  return { resumes: resumes.length, coverLetters: letters.length };
}
