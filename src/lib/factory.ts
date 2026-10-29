import type {
  Award,
  Certification,
  Education,
  Experience,
  Resume,
  TemplateId,
} from "./types";

export function uid(): string {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
    return crypto.randomUUID();
  }
  return Math.random().toString(36).slice(2) + Date.now().toString(36);
}

export function emptyExperience(): Experience {
  return {
    id: uid(),
    title: "",
    organization: "",
    location: "",
    startDate: "",
    endDate: "",
    current: false,
    hoursPerWeek: "40",
    supervisor: "",
    grade: "",
    bullets: [""],
  };
}

export function emptyEducation(): Education {
  return { id: uid(), degree: "", school: "", location: "", graduationDate: "", details: "" };
}

export function emptyCertification(): Certification {
  return { id: uid(), name: "", issuer: "", date: "" };
}

export function emptyAward(): Award {
  return { id: uid(), name: "", date: "", description: "" };
}

export function emptyResume(name = "Untitled Resume", template: TemplateId = "modern"): Resume {
  const now = new Date().toISOString();
  return {
    id: uid(),
    name,
    template,
    createdAt: now,
    updatedAt: now,
    contact: {
      fullName: "",
      title: "",
      email: "",
      phone: "",
      location: "",
      linkedin: "",
      website: "",
    },
    military: {
      branch: "",
      rank: "",
      occupationCode: "",
      yearsOfService: "",
      clearance: "",
      veteranPreference: "",
      separationDate: "",
    },
    summary: "",
    experience: [emptyExperience()],
    education: [],
    skills: [],
    certifications: [],
    awards: [],
  };
}

/** A filled-in example so new users can see what a finished resume looks like. */
export function sampleResume(): Resume {
  const r = emptyResume("Sample – Logistics Manager");
  r.contact = {
    fullName: "Jordan Rivera",
    title: "Logistics & Operations Manager",
    email: "jordan.rivera@example.com",
    phone: "(555) 010-2030",
    location: "San Antonio, TX",
    linkedin: "linkedin.com/in/jordanrivera",
    website: "",
  };
  r.military = {
    branch: "Army",
    rank: "SFC (E-7)",
    occupationCode: "92A",
    yearsOfService: "12",
    clearance: "Secret",
    veteranPreference: "10-point",
    separationDate: "2026-06",
  };
  r.summary =
    "Operations and supply chain leader with 12 years of experience managing inventory, distribution, and teams of up to 35 people. Accountable for $18M in equipment with zero losses across three audits. Skilled at building processes that hold up under pressure and at training teams to run them.";
  r.experience = [
    {
      ...emptyExperience(),
      title: "Logistics Operations Manager (Senior Supply Supervisor)",
      organization: "U.S. Army, 1st Cavalry Division",
      location: "Fort Hood, TX",
      startDate: "2021-03",
      endDate: "2026-06",
      grade: "E-7",
      supervisor: "MAJ A. Smith",
      bullets: [
        "Directed a 35-person supply and distribution team supporting 4,200 personnel, achieving a 98% order fulfillment rate.",
        "Managed $18M in equipment and inventory with zero losses across three consecutive command inspections.",
        "Redesigned the warehouse receiving process, cutting average processing time from 5 days to 2.",
        "Trained and mentored 12 junior supervisors; 9 were promoted ahead of their peers.",
      ],
    },
    {
      ...emptyExperience(),
      title: "Supply Chain Supervisor",
      organization: "U.S. Army, 82nd Airborne Division",
      location: "Fort Bragg, NC",
      startDate: "2016-01",
      endDate: "2021-02",
      grade: "E-6",
      bullets: [
        "Coordinated procurement and delivery of mission-critical parts for a 600-person organization.",
        "Implemented an inventory tracking system that cut excess stock by 22% ($1.4M) in the first year.",
      ],
    },
  ];
  r.education = [
    {
      ...emptyEducation(),
      degree: "B.S. Business Administration, Supply Chain Management",
      school: "University of Maryland Global Campus",
      graduationDate: "2024",
    },
  ];
  r.skills = [
    "Supply Chain Management",
    "Inventory Control",
    "Team Leadership",
    "Process Improvement",
    "Budget Management",
    "Vendor Coordination",
    "ERP Systems (GCSS-Army / SAP)",
    "Risk Management",
  ];
  r.certifications = [
    { ...emptyCertification(), name: "Certified Supply Chain Professional (CSCP)", issuer: "ASCM", date: "2025" },
    { ...emptyCertification(), name: "Lean Six Sigma Green Belt", issuer: "ASQ", date: "2023" },
  ];
  r.awards = [
    { ...emptyAward(), name: "Meritorious Service Medal", date: "2026", description: "For leading logistics support during a division-wide deployment." },
  ];
  return r;
}
