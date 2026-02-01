"use client";

import { useAuth } from "@/lib/hooks/useAuth";

export function DashboardHeader() {
  const { user, loading, logout } = useAuth();

  if (loading) {
    return (
      <header className="sticky top-0 z-20 flex h-16 items-center justify-end border-b border-white/10 bg-[#000000]/95 px-8 backdrop-blur-sm">
        <span className="text-sm text-white/50">Chargement...</span>
      </header>
    );
  }

  return (
    <header className="sticky top-0 z-20 flex h-16 items-center justify-end gap-4 border-b border-white/10 bg-[#000000]/95 px-8 backdrop-blur-sm">
      <div className="flex items-center gap-3">
        <span className="text-sm text-white/70">Connecté en tant que</span>
        <span className="font-medium text-white">
          {user?.email ?? "—"}
        </span>
      </div>
      <button
        type="button"
        onClick={() => logout()}
        className="rounded-lg border border-white/20 px-3 py-1.5 text-sm text-white/80 transition-colors hover:bg-white/10 hover:text-white"
      >
        Déconnexion
      </button>
    </header>
  );
}
