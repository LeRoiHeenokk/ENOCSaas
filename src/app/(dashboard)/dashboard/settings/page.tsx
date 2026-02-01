"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/lib/hooks/useAuth";

const MARKETPLACES = [
  { code: "FR", label: "France" },
  { code: "DE", label: "Allemagne" },
  { code: "IT", label: "Italie" },
  { code: "ES", label: "Espagne" },
] as const;

export default function SettingsPage() {
  const { user } = useAuth();
  const [name, setName] = useState("Jean Dupont");
  const [email, setEmail] = useState("");
  const [company, setCompany] = useState("ENOC Agency");

  useEffect(() => {
    if (user?.email) setEmail(user.email);
  }, [user?.email]);
  const [marketplaces, setMarketplaces] = useState<Record<string, boolean>>({
    FR: true,
    DE: true,
    IT: false,
    ES: false,
  });
  const [notifStock, setNotifStock] = useState(true);
  const [notifWeeklyReport, setNotifWeeklyReport] = useState(true);
  const [notifReviews, setNotifReviews] = useState(false);
  const [amazonConnected, setAmazonConnected] = useState(true);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [saved, setSaved] = useState(false);

  function toggleMarketplace(code: string) {
    setMarketplaces((prev) => ({ ...prev, [code]: !prev[code] }));
  }

  function handleSave() {
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  }

  function handleDeleteAccount() {
    setShowDeleteConfirm(false);
    // TODO: appel API suppression compte
  }

  return (
    <div className="space-y-8">
      <h1 className="text-2xl font-bold text-white">Paramètres</h1>

      <section className="rounded-xl border border-[#1e3a5f]/60 bg-[#111111] p-6">
        <h2 className="mb-4 text-lg font-semibold text-white">Profil</h2>
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className="mb-1.5 block text-sm text-white/80">Nom</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full rounded-lg border border-[#1e3a5f]/60 bg-black/50 px-4 py-2 text-white focus:border-[#1e3a5f] focus:outline-none focus:ring-1 focus:ring-[#1e3a5f]"
            />
          </div>
          <div>
            <label className="mb-1.5 block text-sm text-white/80">Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full rounded-lg border border-[#1e3a5f]/60 bg-black/50 px-4 py-2 text-white focus:border-[#1e3a5f] focus:outline-none focus:ring-1 focus:ring-[#1e3a5f]"
            />
          </div>
          <div className="sm:col-span-2">
            <label className="mb-1.5 block text-sm text-white/80">Entreprise</label>
            <input
              type="text"
              value={company}
              onChange={(e) => setCompany(e.target.value)}
              className="w-full rounded-lg border border-[#1e3a5f]/60 bg-black/50 px-4 py-2 text-white focus:border-[#1e3a5f] focus:outline-none focus:ring-1 focus:ring-[#1e3a5f]"
            />
          </div>
        </div>
      </section>

      <section className="rounded-xl border border-[#1e3a5f]/60 bg-[#111111] p-6">
        <h2 className="mb-4 text-lg font-semibold text-white">Marketplaces</h2>
        <p className="mb-4 text-sm text-white/60">
          Activer ou désactiver les marketplaces pour vos rapports et inventaire.
        </p>
        <div className="flex flex-wrap gap-6">
          {MARKETPLACES.map((mp) => (
            <div key={mp.code} className="flex items-center gap-3">
              <button
                type="button"
                role="switch"
                aria-checked={marketplaces[mp.code]}
                onClick={() => toggleMarketplace(mp.code)}
                className={`relative h-6 w-11 rounded-full transition-colors ${
                  marketplaces[mp.code] ? "bg-[#1e3a5f]" : "bg-white/20"
                }`}
              >
                <span
                  className={`absolute top-1 left-1 h-4 w-4 rounded-full bg-white transition-transform ${
                    marketplaces[mp.code] ? "translate-x-5" : "translate-x-0"
                  }`}
                />
              </button>
              <span className="text-white/90">
                {mp.code} — {mp.label}
              </span>
            </div>
          ))}
        </div>
      </section>

      <section className="rounded-xl border border-[#1e3a5f]/60 bg-[#111111] p-6">
        <h2 className="mb-4 text-lg font-semibold text-white">Notifications</h2>
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium text-white">Alertes stock</p>
              <p className="text-sm text-white/60">Recevoir une alerte quand le stock est faible</p>
            </div>
            <button
              type="button"
              role="switch"
              aria-checked={notifStock}
              onClick={() => setNotifStock((v) => !v)}
              className={`relative h-6 w-11 shrink-0 rounded-full transition-colors ${
                notifStock ? "bg-[#1e3a5f]" : "bg-white/20"
              }`}
            >
              <span
                className={`absolute top-1 left-1 h-4 w-4 rounded-full bg-white transition-transform ${
                  notifStock ? "translate-x-5" : "translate-x-0"
                }`}
              />
            </button>
          </div>
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium text-white">Rapport hebdo auto</p>
              <p className="text-sm text-white/60">Rapport des ventes envoyé chaque lundi</p>
            </div>
            <button
              type="button"
              role="switch"
              aria-checked={notifWeeklyReport}
              onClick={() => setNotifWeeklyReport((v) => !v)}
              className={`relative h-6 w-11 shrink-0 rounded-full transition-colors ${
                notifWeeklyReport ? "bg-[#1e3a5f]" : "bg-white/20"
              }`}
            >
              <span
                className={`absolute top-1 left-1 h-4 w-4 rounded-full bg-white transition-transform ${
                  notifWeeklyReport ? "translate-x-5" : "translate-x-0"
                }`}
              />
            </button>
          </div>
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium text-white">Alertes reviews</p>
              <p className="text-sm text-white/60">Notification pour nouveaux avis ou notes basses</p>
            </div>
            <button
              type="button"
              role="switch"
              aria-checked={notifReviews}
              onClick={() => setNotifReviews((v) => !v)}
              className={`relative h-6 w-11 shrink-0 rounded-full transition-colors ${
                notifReviews ? "bg-[#1e3a5f]" : "bg-white/20"
              }`}
            >
              <span
                className={`absolute top-1 left-1 h-4 w-4 rounded-full bg-white transition-transform ${
                  notifReviews ? "translate-x-5" : "translate-x-0"
                }`}
              />
            </button>
          </div>
        </div>
      </section>

      <section className="rounded-xl border border-[#1e3a5f]/60 bg-[#111111] p-6">
        <h2 className="mb-4 text-lg font-semibold text-white">Connexion Amazon</h2>
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <p className="font-medium text-white">SP-API</p>
            <p className="text-sm text-white/60">
              {amazonConnected
                ? "Connecté — vos données sont synchronisées"
                : "Non connecté — reconnectez pour importer les ventes et le stock"}
            </p>
          </div>
          <button
            type="button"
            onClick={() => setAmazonConnected(true)}
            className="rounded-lg border border-[#1e3a5f] bg-[#1e3a5f]/20 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-[#1e3a5f]"
          >
            Reconnecter
          </button>
        </div>
      </section>

      <section className="rounded-xl border border-red-500/30 bg-[#111111] p-6">
        <h2 className="mb-4 text-lg font-semibold text-red-400">Zone de danger</h2>
        <p className="mb-4 text-sm text-white/60">
          La suppression du compte est irréversible. Toutes vos données seront perdues.
        </p>
        <button
          type="button"
          onClick={() => setShowDeleteConfirm(true)}
          className="rounded-lg border border-red-500/50 bg-red-500/10 px-4 py-2 text-sm font-medium text-red-400 transition-colors hover:bg-red-500/20"
        >
          Supprimer le compte
        </button>
      </section>

      <div className="flex items-center gap-4">
        <button
          type="button"
          onClick={handleSave}
          className="rounded-lg bg-[#1e3a5f] px-6 py-2 font-medium text-white transition-colors hover:bg-[#2a4a6f]"
        >
          Sauvegarder les modifications
        </button>
        {saved && (
          <span className="text-sm text-green-400">Modifications enregistrées.</span>
        )}
      </div>

      {showDeleteConfirm && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4"
          role="dialog"
          aria-modal="true"
          aria-labelledby="delete-title"
        >
          <div className="w-full max-w-md rounded-xl border border-[#1e3a5f]/60 bg-[#111111] p-6">
            <h3 id="delete-title" className="text-lg font-semibold text-white">
              Supprimer le compte ?
            </h3>
            <p className="mt-2 text-sm text-white/60">
              Cette action est irréversible. Toutes vos données (ventes, produits, rapports) seront
              définitivement supprimées.
            </p>
            <div className="mt-6 flex justify-end gap-3">
              <button
                type="button"
                onClick={() => setShowDeleteConfirm(false)}
                className="rounded-lg border border-[#1e3a5f]/60 px-4 py-2 text-sm text-white/90 hover:bg-white/5"
              >
                Annuler
              </button>
              <button
                type="button"
                onClick={handleDeleteAccount}
                className="rounded-lg bg-red-500/20 px-4 py-2 text-sm font-medium text-red-400 hover:bg-red-500/30"
              >
                Supprimer définitivement
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
