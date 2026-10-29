"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { BRAND } from "@/lib/brand";

const LINKS = [
  { href: "/translator", label: "MOS Translator" },
  { href: "/federal-resume", label: "Federal Resumes" },
  { href: "/pricing", label: "Pricing" },
  { href: "/dashboard", label: "Dashboard" },
];

export default function SiteHeader() {
  const path = usePathname();
  return (
    <header className="site-header">
      <div className="container">
        <Link href="/" className="logo">
          <span className="logo-mark">SM</span>
          {BRAND.name}
        </Link>
        <nav className="nav">
          {LINKS.map((l) => (
            <Link key={l.href} href={l.href} className={path?.startsWith(l.href) ? "active" : undefined}>
              {l.label}
            </Link>
          ))}
        </nav>
        <Link href="/dashboard/resume/new" className="btn btn-primary btn-sm">
          Build my resume
        </Link>
      </div>
    </header>
  );
}
