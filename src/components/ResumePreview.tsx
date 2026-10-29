import { dateRange } from "@/lib/export";
import type { Resume } from "@/lib/types";

export default function ResumePreview({ resume }: { resume: Resume }) {
  const c = resume.contact;
  const m = resume.military;
  const federal = resume.template === "federal";
  const contactLine = [c.location, c.phone, c.email, c.linkedin, c.website].filter(Boolean);
  const experience = resume.experience.filter((e) => e.title || e.organization || e.bullets.some((b) => b.trim()));

  return (
    <article className={`paper t-${resume.template}`}>
      <header>
        <h1>{c.fullName || "Your Name"}</h1>
        {c.title && <div className="r-title">{c.title}</div>}
        {contactLine.length > 0 && <div className="r-contact">{contactLine.join("  •  ")}</div>}
        {federal && (
          <div className="r-contact">
            Citizenship: U.S. Citizen
            {m.veteranPreference && `  •  Veterans' Preference: ${m.veteranPreference}`}
            {m.clearance && `  •  Clearance: ${m.clearance}`}
          </div>
        )}
      </header>

      {resume.summary && (
        <section className="r-section">
          <h2>Professional Summary</h2>
          <p style={{ margin: 0 }}>{resume.summary}</p>
        </section>
      )}

      {!federal && resume.skills.length > 0 && (
        <section className="r-section">
          <h2>Core Skills</h2>
          <div className="r-skills">{resume.skills.map((s) => <span key={s}>{s}</span>)}</div>
        </section>
      )}

      {experience.length > 0 && (
        <section className="r-section">
          <h2>{federal ? "Work Experience" : "Professional Experience"}</h2>
          {experience.map((e) => (
            <div className="r-job" key={e.id}>
              <div className="r-job-head">
                <div>
                  <span className="r-job-title">{e.title}</span>
                  {e.organization && (
                    <>
                      {" "}
                      <span className="r-job-org">
                        {federal ? <br /> : "| "}
                        {e.organization}
                        {e.location && `, ${e.location}`}
                      </span>
                    </>
                  )}
                </div>
                <div className="r-dates">{dateRange(e.startDate, e.endDate, e.current)}</div>
              </div>
              {federal && (
                <div className="r-meta">
                  Hours per week: {e.hoursPerWeek || "40"}
                  {e.grade && `  •  Grade/Rank: ${e.grade}`}
                  {e.supervisor && `  •  Supervisor: ${e.supervisor} (may contact)`}
                </div>
              )}
              <ul>
                {e.bullets.filter((b) => b.trim()).map((b, i) => <li key={i}>{b}</li>)}
              </ul>
            </div>
          ))}
        </section>
      )}

      {resume.education.length > 0 && (
        <section className="r-section">
          <h2>Education</h2>
          {resume.education.map((e) => (
            <div key={e.id} className="r-job">
              <div className="r-job-head">
                <div>
                  <span className="r-job-title">{e.degree}</span>
                  {e.school && <span className="r-job-org"> | {e.school}{e.location && `, ${e.location}`}</span>}
                </div>
                <div className="r-dates">{e.graduationDate}</div>
              </div>
              {e.details && <div className="r-meta">{e.details}</div>}
            </div>
          ))}
        </section>
      )}

      {resume.certifications.length > 0 && (
        <section className="r-section">
          <h2>Certifications</h2>
          <ul>
            {resume.certifications.map((cert) => (
              <li key={cert.id}>{[cert.name, cert.issuer, cert.date].filter(Boolean).join(", ")}</li>
            ))}
          </ul>
        </section>
      )}

      {resume.awards.length > 0 && (
        <section className="r-section">
          <h2>Awards & Honors</h2>
          <ul>
            {resume.awards.map((a) => (
              <li key={a.id}>
                {[a.name, a.date].filter(Boolean).join(", ")}
                {a.description && ` – ${a.description}`}
              </li>
            ))}
          </ul>
        </section>
      )}

      {federal && resume.skills.length > 0 && (
        <section className="r-section">
          <h2>Skills</h2>
          <p style={{ margin: 0 }}>{resume.skills.join(", ")}</p>
        </section>
      )}

      {!federal && m.clearance && (
        <section className="r-section">
          <h2>Security Clearance</h2>
          <p style={{ margin: 0 }}>{m.clearance}</p>
        </section>
      )}
    </article>
  );
}
