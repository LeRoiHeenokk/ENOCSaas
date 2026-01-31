import { ReactNode } from "react";

export default function DashboardLayout({ children }: { children: ReactNode }) {
  return (
    <div>
      <nav>Dashboard</nav>
      {children}
    </div>
  );
}
