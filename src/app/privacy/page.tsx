import type { Metadata } from "next";
import { BRAND } from "@/lib/brand";

export const metadata: Metadata = { title: "Privacy" };

export default function PrivacyPage() {
  return (
    <section className="section">
      <div className="container narrow">
        <h1>Privacy</h1>
        <p className="muted small">Template policy. Have it reviewed before launch.</p>
        <p>
          {BRAND.product} stores your resumes and cover letters in your own browser (local storage). We do not keep a
          copy of them on our servers.
        </p>
        <p>
          When you use an AI feature (translation, evaluation extraction, tailoring, summaries, or cover letters), the
          content you submit is sent to our server and to our AI provider to produce the result. It isn&apos;t kept after the
          response is returned, except for the limited logs needed to operate the service.
        </p>
        <p>Do not enter classified, controlled unclassified (CUI), or operationally sensitive information.</p>
        <p>Questions: {BRAND.supportEmail}</p>
      </div>
    </section>
  );
}
