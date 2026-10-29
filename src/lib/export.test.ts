import { describe, expect, it } from "vitest";
import { dateRange, toFederalText, toPlainText } from "./export";
import { sampleResume } from "./factory";

describe("dateRange", () => {
  it("formats month ranges and current roles", () => {
    expect(dateRange("2021-03", "2026-06", false)).toBe("Mar 2021 – Jun 2026");
    expect(dateRange("2021-03", "", true)).toBe("Mar 2021 – Present");
    expect(dateRange("", "", false)).toBe("");
  });
});

describe("exports", () => {
  it("plain text includes name and bullets", () => {
    const text = toPlainText(sampleResume());
    expect(text).toContain("JORDAN RIVERA");
    expect(text).toContain("• Directed a 35-person");
  });

  it("federal text includes the fields USAJOBS requires", () => {
    const text = toFederalText(sampleResume());
    expect(text).toContain("Hours per week: 40");
    expect(text).toContain("Grade/Rank: E-7");
    expect(text).toContain("Veterans' Preference: 10-point");
    expect(text).toContain("Citizenship: U.S. Citizen");
  });
});
