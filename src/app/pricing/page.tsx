import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = { title: "Pricing" };

// Placeholder tiers. Billing isn't wired up yet; see README "Roadmap".
const PLANS = [
  {
    name: "Free",
    price: "$0",
    period: "",
    blurb: "Everything you need to build your first resume.",
    features: ["Unlimited resumes stored in your browser", "MOS / AFSC / rating translator", "All three templates", "PDF and plain-text export", "Keyword match score"],
    cta: "Start free",
    featured: false,
  },
  {
    name: "Pro",
    price: "$12",
    period: "/month",
    blurb: "For an active job search with many applications.",
    features: ["Everything in Free", "AI tailoring for every posting", "AI evaluation (NCOER/OER/EPR/FITREP) extraction", "AI cover letters", "Priority support"],
    cta: "Start Pro",
    featured: true,
  },
  {
    name: "Veteran Service Orgs",
    price: "Custom",
    period: "",
    blurb: "For transition programs, SFL-TAP counselors, and nonprofits.",
    features: ["Seats for your clients", "Counselor review workflows", "Bulk onboarding", "Usage reporting"],
    cta: "Contact us",
    featured: false,
  },
];

export default function PricingPage() {
  return (
    <section className="section">
      <div className="container">
        <h1>Simple pricing</h1>
        <p className="muted">Free for every service member and veteran. Upgrade when you need AI help at scale.</p>
        <div className="pricing">
          {PLANS.map((p) => (
            <div key={p.name} className={`plan${p.featured ? " featured" : ""}`}>
              {p.featured && <span className="badge badge-accent" style={{ alignSelf: "flex-start" }}>Most popular</span>}
              <h2 style={{ marginTop: 8 }}>{p.name}</h2>
              <div className="price">
                {p.price}
                <span className="small muted">{p.period}</span>
              </div>
              <p className="muted">{p.blurb}</p>
              <ul>
                {p.features.map((f) => <li key={f}>{f}</li>)}
              </ul>
              <Link href="/dashboard/resume/new" className={`btn ${p.featured ? "btn-primary" : ""}`}>{p.cta}</Link>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
