import { describe, expect, it } from "vitest";
import { findRemainingJargon, translateJargon } from "./jargon";

describe("translateJargon", () => {
  it("translates common military terms", () => {
    const { text } = translateJargon("NCOIC of a 35-Soldier platoon responsible for PMCS during deployment.");
    expect(text).toBe("Supervisor of a 35-Soldier team responsible for preventive maintenance during assignment.");
  });

  it("matches acronyms case-sensitively", () => {
    expect(translateJargon("Worked with a co-worker on a cooperative project").text).toBe(
      "Worked with a co-worker on a cooperative project",
    );
  });

  it("lowercases capitalized military nouns mid-sentence", () => {
    expect(translateJargon("Led 8 Soldiers in maintaining equipment").text).toBe("Led 8 employees in maintaining equipment");
  });

  it("keeps title case in short titles", () => {
    expect(translateJargon("Platoon Sergeant, Alpha Company").text).toBe("Operations supervisor, Alpha Company");
    expect(translateJargon("Senior Platoon Leader").text).toBe("Senior Team Leader");
  });

  it("preserves leading capitalization", () => {
    expect(translateJargon("Platoon sergeant for 40 soldiers").text).toBe("Operations supervisor for 40 employees");
  });
});

describe("findRemainingJargon", () => {
  it("lists jargon still present", () => {
    expect(findRemainingJargon("Served as NCOIC in the S3 shop")).toEqual(expect.arrayContaining(["NCOIC", "S3"]));
    expect(findRemainingJargon("Managed a team of 12 analysts")).toEqual([]);
  });
});
