"use client";

import { useState } from "react";
import { KpiCard } from "@/components/dashboard/KpiCard";
import {
  IconSales,
  IconProducts,
  IconStock,
  IconReviews,
} from "@/components/dashboard/icons";

const TIME_FILTERS = [
  "Aujourd'hui",
  "Hier",
  "7 jours",
  "30 jours",
  "90 jours",
  "Lifetime",
  "Date précise",
] as const;

const MARKETPLACES = [
  { code: "FR", label: "France" },
  { code: "DE", label: "Allemagne" },
  { code: "IT", label: "Italie" },
  { code: "ES", label: "Espagne" },
] as const;

// Données fictives
const FAKE_KPI = {
  sales: "24 850 €",
  productsSold: "1 247",
  stock: "3 892",
  avgReviews: "4.2",
};

export default function DashboardPage() {
  const [timeFilter, setTimeFilter] = useState<string>("30 jours");
  const [marketplace, setMarketplace] = useState<string>("FR");

  return (
    <div className="space-y-8">
      {/* En-tête : titre + sélecteur marketplace */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <h1 className="text-2xl font-bold text-white">
          Tableau de bord
        </h1>
        <div className="flex items-center gap-2">
          <span className="text-sm text-white/60">Marketplace :</span>
          <div className="flex gap-1 rounded-lg border border-[#1e3a5f]/60 bg-[#111111] p-1">
            {MARKETPLACES.map((mp) => (
              <button
                key={mp.code}
                type="button"
                onClick={() => setMarketplace(mp.code)}
                className={`rounded-md px-3 py-1.5 text-sm font-medium transition-colors ${
                  marketplace === mp.code
                    ? "bg-[#1e3a5f] text-white"
                    : "text-white/70 hover:bg-white/5 hover:text-white"
                }`}
              >
                {mp.code}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Filtres temporels */}
      <div className="flex flex-wrap items-center gap-2">
        <span className="mr-2 text-sm text-white/60">Période :</span>
        {TIME_FILTERS.map((label) => (
          <button
            key={label}
            type="button"
            onClick={() => setTimeFilter(label)}
            className={`rounded-lg border px-4 py-2 text-sm font-medium transition-colors ${
              timeFilter === label
                ? "border-[#1e3a5f] bg-[#1e3a5f]/20 text-white"
                : "border-[#1e3a5f]/50 bg-[#111111] text-white/80 hover:border-[#1e3a5f] hover:bg-[#1e3a5f]/10"
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      {/* Cartes KPI */}
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
        <KpiCard
          title="Ventes totales"
          value={FAKE_KPI.sales}
          icon={<IconSales />}
          subtitle="Période sélectionnée"
        />
        <KpiCard
          title="Produits vendus"
          value={FAKE_KPI.productsSold}
          icon={<IconProducts />}
          subtitle="Unités"
        />
        <KpiCard
          title="Stock actuel"
          value={FAKE_KPI.stock}
          icon={<IconStock />}
          subtitle="SKU en stock"
        />
        <KpiCard
          title="Reviews moyennes"
          value={FAKE_KPI.avgReviews}
          icon={<IconReviews />}
          subtitle="sur 5 étoiles"
        />
      </div>

      {/* Graphique de ventes (placeholder) */}
      <div className="rounded-xl border border-[#1e3a5f]/60 bg-[#111111] p-6">
        <h2 className="mb-4 text-lg font-semibold text-white">
          Évolution des ventes
        </h2>
        <div className="flex h-64 items-center justify-center rounded-lg border border-dashed border-[#1e3a5f]/40 bg-[#0a0a0a]/50">
          <div className="text-center">
            <p className="text-white/50">Graphique de ventes</p>
            <p className="mt-1 text-sm text-white/40">
              Intégration à venir (Chart.js, Recharts, etc.)
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
