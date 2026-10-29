import type { Metadata } from "next";
import Link from "next/link";
import SiteHeader from "@/components/SiteHeader";
import { BRAND } from "@/lib/brand";
import "./globals.css";

export const metadata: Metadata = {
  metadataBase: new URL(BRAND.siteUrl),
  title: { default: `${BRAND.product} – Military to Civilian Resume Builder`, template: `%s | ${BRAND.name}` },
  description:
    "Turn your military experience into a civilian or federal resume. Translate your MOS, AFSC, or rating, pull accomplishments from your evaluations, and tailor to any job posting.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <SiteHeader />
        <main>{children}</main>
        <footer className="site-footer">
          <div className="container">
            <div>
              <strong>{BRAND.product}</strong>
              <div>{BRAND.tagline}</div>
            </div>
            <nav>
              <Link href="/translator">MOS Translator</Link>
              <Link href="/federal-resume">Federal Resumes</Link>
              <Link href="/pricing">Pricing</Link>
              <Link href="/privacy">Privacy</Link>
              <Link href="/terms">Terms</Link>
            </nav>
            <div className="small">Not affiliated with the U.S. Department of Defense or any branch of the military.</div>
          </div>
        </footer>
      </body>
    </html>
  );
}
