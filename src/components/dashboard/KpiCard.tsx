import { ReactNode } from "react";

type KpiCardProps = {
  title: string;
  value: string;
  icon: ReactNode;
  subtitle?: string;
};

export function KpiCard({ title, value, icon, subtitle }: KpiCardProps) {
  return (
    <div className="rounded-xl border border-[#1e3a5f]/60 bg-[#111111] p-6">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm font-medium text-white/60">{title}</p>
          <p className="mt-2 text-3xl font-bold tracking-tight text-white">
            {value}
          </p>
          {subtitle && (
            <p className="mt-1 text-xs text-white/50">{subtitle}</p>
          )}
        </div>
        <div className="rounded-lg bg-[#1e3a5f]/30 p-3 text-[#1e3a5f]">
          {icon}
        </div>
      </div>
    </div>
  );
}
