import type { Metadata } from "next";
import DashboardTabs from "@/components/DashboardTabs";

export const metadata: Metadata = { title: "Dashboard", robots: { index: false } };

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="container">
      <div className="page-head no-print" />
      <DashboardTabs />
      {children}
    </div>
  );
}
