import { describe, expect, it } from "vitest";
import { sampleResume } from "./factory";
import { extractKeywords, matchResume } from "./keywords";

const JD = `We are hiring a Logistics Manager to lead warehouse operations and inventory control.
Requirements: supply chain management experience, inventory control, vendor management, SAP,
Lean Six Sigma certification preferred. You will manage a team and improve warehouse operations.`;

describe("extractKeywords", () => {
  it("ranks repeated phrases highly and drops stopwords", () => {
    const terms = extractKeywords(JD).map((k) => k.term);
    expect(terms).toContain("inventory control");
    expect(terms).toContain("warehouse operations");
    expect(terms).not.toContain("the");
    expect(terms).not.toContain("you");
    expect(terms).not.toContain("control vendor");
    expect(terms).not.toContain("improve warehouse");
  });
});

describe("matchResume", () => {
  it("scores the sample resume against a logistics posting", () => {
    const report = matchResume(sampleResume(), JD);
    expect(report.score).toBeGreaterThan(30);
    expect(report.matched.map((k) => k.term)).toContain("inventory control");
    expect(report.missing.length).toBeGreaterThan(0);
  });

  it("returns zero for an empty posting", () => {
    expect(matchResume(sampleResume(), "").score).toBe(0);
  });
});
