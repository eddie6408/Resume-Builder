export type TemplateId = "modern" | "classic" | "federal";

export interface ContactInfo {
  fullName: string;
  title: string;
  email: string;
  phone: string;
  location: string;
  linkedin: string;
  website: string;
}

export interface Experience {
  id: string;
  title: string;
  organization: string;
  location: string;
  startDate: string;
  endDate: string;
  current: boolean;
  /** Federal-format fields (USAJOBS). */
  hoursPerWeek: string;
  supervisor: string;
  grade: string;
  bullets: string[];
}

export interface Education {
  id: string;
  degree: string;
  school: string;
  location: string;
  graduationDate: string;
  details: string;
}

export interface Certification {
  id: string;
  name: string;
  issuer: string;
  date: string;
}

export interface Award {
  id: string;
  name: string;
  date: string;
  description: string;
}

export interface MilitaryProfile {
  branch: string;
  rank: string;
  /** MOS / AFSC / Rating / NEC code. */
  occupationCode: string;
  yearsOfService: string;
  clearance: string;
  veteranPreference: string;
  separationDate: string;
}

export interface TailoringInfo {
  jobTitle: string;
  company: string;
  jobDescription: string;
  matchScoreBefore: number;
  matchScoreAfter: number;
  tailoredAt: string;
  /** Gap suggestions returned by the tailoring step. */
  notes: string[];
  source: "ai" | "rules";
}

export interface Resume {
  id: string;
  name: string;
  template: TemplateId;
  createdAt: string;
  updatedAt: string;
  contact: ContactInfo;
  military: MilitaryProfile;
  summary: string;
  experience: Experience[];
  education: Education[];
  skills: string[];
  certifications: Certification[];
  awards: Award[];
  /** Set when this resume was produced by the tailoring flow. */
  tailoring?: TailoringInfo;
  /** Resume this one was tailored from. */
  parentId?: string;
}

export interface CoverLetter {
  id: string;
  resumeId: string;
  jobTitle: string;
  company: string;
  body: string;
  createdAt: string;
  updatedAt: string;
}
