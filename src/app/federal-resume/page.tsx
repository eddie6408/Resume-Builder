import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Federal Resume Builder (USAJOBS)",
  description: "Build a USAJOBS-ready federal resume with the hours, dates, grades, and supervisor details federal HR specialists look for.",
};

const REQUIRED = [
  ["Exact dates", "Month and year for the start and end of every position."],
  ["Hours per week", "Federal HR uses this to credit your experience. Active duty is usually 40+."],
  ["Grade / rank", "Your pay grade for each position (e.g. E-6, O-3, GS-11)."],
  ["Supervisor", "Name and phone number, plus whether they may be contacted."],
  ["Detailed duties", "Federal resumes are often 3–5 pages. Describe each duty and accomplishment in full."],
  ["Veterans' preference", "State your preference (5-point, 10-point, etc.) and keep your DD-214 ready."],
  ["Citizenship & clearance", "List U.S. citizenship and any active security clearance."],
  ["Specialized experience", "Mirror the vacancy announcement's 'specialized experience' wording where it truthfully applies."],
];

export default function FederalResumePage() {
  return (
    <section className="section">
      <div className="container narrow">
        <h1>Federal resumes for USAJOBS</h1>
        <p className="muted">
          Federal hiring is different. HR specialists screen your resume against the qualifications in the vacancy
          announcement. If a required detail is missing, you can be rated ineligible even when you're qualified.
        </p>
        <div className="card">
          <h2>What a federal resume must include</h2>
          <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <tbody>
              {REQUIRED.map(([k, v]) => (
                <tr key={k} style={{ borderTop: "1px solid var(--border)" }}>
                  <td style={{ padding: "10px 12px 10px 0", fontWeight: 600, verticalAlign: "top", width: "34%" }}>{k}</td>
                  <td style={{ padding: "10px 0" }} className="muted">{v}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="card">
          <h2>How to build one here</h2>
          <ol>
            <li>Create a resume and choose the <strong>Federal</strong> template.</li>
            <li>Fill in hours per week, grade, and supervisor for each position.</li>
            <li>Paste the vacancy announcement into <strong>Tailor</strong> to match its specialized-experience language.</li>
            <li>Export as PDF, or copy the federal plain-text version into the USAJOBS resume builder.</li>
          </ol>
          <Link href="/dashboard/resume/new?template=federal" className="btn btn-primary">Start a federal resume</Link>
        </div>
      </div>
    </section>
  );
}
