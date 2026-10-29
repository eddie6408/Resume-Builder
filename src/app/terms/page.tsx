import type { Metadata } from "next";
import { BRAND } from "@/lib/brand";

export const metadata: Metadata = { title: "Terms" };

export default function TermsPage() {
  return (
    <section className="section">
      <div className="container narrow">
        <h1>Terms of use</h1>
        <p className="muted small">Template terms. Have them reviewed before launch.</p>
        <p>
          {BRAND.product} helps you write resumes and cover letters. You are responsible for checking that everything
          in documents you send to employers is accurate. AI suggestions can be wrong, so review every one before you use it.
        </p>
        <p>
          The service is provided as-is, without warranty. {BRAND.name} is not affiliated with or endorsed by the U.S.
          Department of Defense, the Department of Veterans Affairs, OPM, or any branch of the U.S. military.
        </p>
      </div>
    </section>
  );
}
