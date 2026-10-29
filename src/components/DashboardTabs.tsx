"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const TABS = [
  { href: "/dashboard", label: "My resumes", exact: true },
  { href: "/dashboard/tailor", label: "Tailor to a job" },
  { href: "/dashboard/evaluations", label: "Import evaluation" },
  { href: "/dashboard/cover-letters", label: "Cover letters" },
];

export default function DashboardTabs() {
  const path = usePathname() ?? "";
  return (
    <nav className="tabs no-print">
      {TABS.map((t) => {
        const active = t.exact ? path === t.href : path.startsWith(t.href);
        return (
          <Link key={t.href} href={t.href} className={active ? "active" : undefined}>
            {t.label}
          </Link>
        );
      })}
    </nav>
  );
}
