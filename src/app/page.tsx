import Link from "next/link";
import { BRAND } from "@/lib/brand";

const FEATURES = [
  { icon: "Aa", title: "Military-to-civilian translation", body: "Turn MOS, AFSC, and rating codes, ranks, and unit jargon into language hiring managers understand." },
  { icon: "EV", title: "Upload your evaluations", body: "Paste in an NCOER, OER, EPR, OPR, or FITREP and get resume-ready accomplishment bullets back." },
  { icon: "JD", title: "Tailor to any job", body: "Paste a job posting to see your keyword match score, then generate a tailored copy built for that role." },
  { icon: "US", title: "Federal and private formats", body: "Switch between an ATS-friendly private-sector layout and a USAJOBS-style federal resume." },
  { icon: "CL", title: "Cover letters", body: "Write a cover letter for each application, matched to the posting and your resume." },
  { icon: "PDF", title: "Export anywhere", body: "Download a print-ready PDF, plain text for online forms, or a backup file of all your work." },
];

const FAQ = [
  { q: "Does it work for every branch?", a: "Yes. Army, Navy, Air Force, Marine Corps, Coast Guard, and Space Force. The translator ships with common MOS, AFSC, and rating codes, and the jargon engine works with any text." },
  { q: "What's the difference between a federal and a private-sector resume?", a: "Federal resumes (USAJOBS) are longer and need hours per week, exact dates, supervisor contact info, grade, and veterans' preference for every position. Private-sector resumes are usually 1–2 pages and focused on keywords and results. You can switch templates at any time." },
  { q: "Is my information private?", a: "Your resumes are stored in your own browser. Content is only sent to the server when you use an AI feature, and it isn't kept after the response comes back." },
  { q: "Should I include classified details?", a: "No. Describe your work at an unclassified level. The AI is told to leave operational details out." },
];

export default function Home() {
  return (
    <>
      <section className="hero">
        <div className="container">
          <span className="badge badge-accent">Built for transitioning service members & veterans</span>
          <h1 style={{ marginTop: 16 }}>Your service, written in the language civilian employers hire for.</h1>
          <p className="lead">
            {BRAND.product} translates your military experience into a polished civilian or federal resume,
            then tailors it to every job you apply for.
          </p>
          <div className="row" style={{ marginTop: 24 }}>
            <Link href="/dashboard/resume/new" className="btn btn-primary btn-lg">Build my resume, free</Link>
            <Link href="/translator" className="btn btn-lg">Try the MOS translator</Link>
          </div>
          <p className="small muted" style={{ marginTop: 12 }}>No account required. Your work saves in this browser.</p>
        </div>
      </section>

      <section className="section">
        <div className="container">
          <h2>From military jargon to hire-ready</h2>
          <p className="muted">The same accomplishment, before and after translation.</p>
          <div className="compare" style={{ marginTop: 20 }}>
            <div className="card before">
              <div className="badge">Before</div>
              <p style={{ marginTop: 10 }}>
                NCOIC of a 35-Soldier platoon responsible for PMCS and accountability of $18M in sensitive items
                during a 9-month deployment to the CENTCOM AOR.
              </p>
            </div>
            <div className="card after">
              <div className="badge badge-success">After</div>
              <p style={{ marginTop: 10 }}>
                Supervised a 35-person team responsible for preventive maintenance and accountability of $18M in
                high-value equipment during a 9-month international assignment, with zero losses.
              </p>
            </div>
          </div>
        </div>
      </section>

      <section className="section" style={{ background: "var(--surface)" }}>
        <div className="container">
          <h2>Everything you need for the transition</h2>
          <div className="features">
            {FEATURES.map((f) => (
              <div className="feature" key={f.title}>
                <div className="icon">{f.icon}</div>
                <h3>{f.title}</h3>
                <p className="muted">{f.body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="section">
        <div className="container">
          <h2>How it works</h2>
          <div className="steps">
            <div className="step"><h3>Enter your service</h3><p className="muted">Branch, rank, occupation code, and your duties, or paste in an evaluation.</p></div>
            <div className="step"><h3>Translate</h3><p className="muted">Get civilian job titles, skills, and achievement bullets that make sense outside the military.</p></div>
            <div className="step"><h3>Tailor</h3><p className="muted">Paste a job posting. See which keywords you're missing and generate a tailored version.</p></div>
            <div className="step"><h3>Apply</h3><p className="muted">Download your PDF, add a cover letter, and send it.</p></div>
          </div>
        </div>
      </section>

      <section className="section">
        <div className="container narrow faq">
          <h2>Frequently asked questions</h2>
          {FAQ.map((f) => (
            <details key={f.q}>
              <summary>{f.q}</summary>
              <p className="muted" style={{ marginTop: 10, marginBottom: 0 }}>{f.a}</p>
            </details>
          ))}
        </div>
      </section>

      <section className="section">
        <div className="container">
          <div className="cta-band">
            <h2>Ready for your second mission?</h2>
            <p>Start with a sample resume or a blank one. It takes about 15 minutes.</p>
            <Link href="/dashboard/resume/new" className="btn btn-accent btn-lg">Get started</Link>
          </div>
        </div>
      </section>
    </>
  );
}
