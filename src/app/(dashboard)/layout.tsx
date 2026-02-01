import { ReactNode } from "react";
import Link from "next/link";
import { Logo } from "@/components/dashboard/Logo";
import { DashboardNav } from "@/components/dashboard/DashboardNav";
import { DashboardHeader } from "@/components/dashboard/DashboardHeader";

export default function DashboardLayout({ children }: { children: ReactNode }) {
  return (
    <div className="flex min-h-screen bg-[#000000] text-white">
      {/* Sidebar */}
      <aside className="fixed left-0 top-0 z-30 flex h-full w-64 flex-col border-r border-white/10 bg-[#1e3a5f]">
        {/* Logo */}
        <div className="flex h-16 items-center border-b border-white/10 px-6">
          <Link href="/dashboard" className="flex items-center gap-2">
            <Logo className="h-7 w-auto text-white" />
          </Link>
        </div>

        <DashboardNav />
      </aside>

      {/* Main area: header + content */}
      <div className="flex flex-1 flex-col pl-64">
        <DashboardHeader />

        {/* Content */}
        <main className="flex-1 p-8">{children}</main>
      </div>
    </div>
  );
}
