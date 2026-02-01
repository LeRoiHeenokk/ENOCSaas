"use client";

import { useState, useEffect } from "react";
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

const MARKETPLACE_CODES = ["FR", "DE", "IT", "ES"] as const;

const MARKETPLACES = [
  { code: "ALL", label: "Toutes" },
  { code: "FR", label: "France" },
  { code: "DE", label: "Allemagne" },
  { code: "IT", label: "Italie" },
  { code: "ES", label: "Espagne" },
] as const;

const FAKE_KPI = {
  sales: "24 850 €",
  productsSold: "1 247",
  stock: "3 892",
  avgReviews: "4.2",
};

function getDateRange(filter: string): { start: Date; end: Date; startStr: string; endStr: string } {
  const end = new Date();
  end.setHours(23, 59, 59, 999);
  const start = new Date();

  switch (filter) {
    case "Aujourd'hui":
      start.setHours(0, 0, 0, 0);
      break;
    case "Hier":
      start.setDate(start.getDate() - 1);
      start.setHours(0, 0, 0, 0);
      end.setDate(end.getDate() - 1);
      end.setHours(23, 59, 59, 999);
      break;
    case "7 jours":
      start.setDate(start.getDate() - 7);
      start.setHours(0, 0, 0, 0);
      break;
    case "30 jours":
      start.setDate(start.getDate() - 30);
      start.setHours(0, 0, 0, 0);
      break;
    case "90 jours":
      start.setDate(start.getDate() - 90);
      start.setHours(0, 0, 0, 0);
      break;
    case "Lifetime":
      start.setDate(start.getDate() - 365);
      start.setHours(0, 0, 0, 0);
      break;
    default:
      start.setDate(start.getDate() - 30);
      start.setHours(0, 0, 0, 0);
  }

  const toISO = (d: Date) => d.toISOString().slice(0, 19) + "Z";
  return { start, end, startStr: toISO(start), endStr: toISO(end) };
}

type Order = {
  PurchaseDate?: string;
  OrderStatus?: string;
  OrderTotal?: { Amount?: string; CurrencyCode?: string };
  NumberOfItemsShipped?: number;
  [key: string]: unknown;
};

function filterOrdersByPeriod(
  orders: Order[],
  periodStart: Date,
  periodEnd: Date
): Order[] {
  return orders.filter((order) => {
    const purchaseDate = order.PurchaseDate;
    if (!purchaseDate) return false;
    const date = new Date(purchaseDate);
    return date >= periodStart && date <= periodEnd;
  });
}

function aggregateKpisFromOrders(orders: Order[]): {
  salesFormatted: string;
  productsSold: string;
} {
  const shipped = orders.filter(
    (o) => o.OrderStatus === "Shipped" && o.OrderStatus !== "Canceled"
  );

  let totalAmount = 0;
  let totalItems = 0;
  for (const o of shipped) {
    const amount = o.OrderTotal?.Amount;
    if (amount != null) totalAmount += Number(String(amount).replace(",", "."));
    totalItems += Number(o.NumberOfItemsShipped ?? 0);
  }

  return {
    salesFormatted: totalAmount.toLocaleString("fr-FR", {
      style: "currency",
      currency: "EUR",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }),
    productsSold: totalItems.toLocaleString("fr-FR"),
  };
}

export default function DashboardPage() {
  const [timeFilter, setTimeFilter] = useState<string>("30 jours");
  const [marketplace, setMarketplace] = useState<string>("ALL");
  const [loading, setLoading] = useState(true);
  const [apiError, setApiError] = useState<string | null>(null);
  const [quotaExceeded, setQuotaExceeded] = useState(false);
  const [kpi, setKpi] = useState<{
    sales: string;
    productsSold: string;
    stock: string;
    avgReviews: string;
  }>(FAKE_KPI);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setApiError(null);
    setQuotaExceeded(false);

    const { start, end, startStr, endStr } = getDateRange(timeFilter);

    const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

    const fetchOrdersForMarketplace = async (mp: string) => {
      const url = `/api/amazon/orders?startDate=${encodeURIComponent(startStr)}&endDate=${encodeURIComponent(endStr)}&marketplace=${encodeURIComponent(mp)}`;
      const res = await fetch(url);
      return res.json() as Promise<{
        orders?: Order[];
        error?: string;
        fallback?: boolean;
        quotaExceeded?: boolean;
      }>;
    };

    const run = async () => {
      try {
        if (marketplace === "ALL") {
          const results: { orders?: Order[]; error?: string; fallback?: boolean; quotaExceeded?: boolean }[] = [];
          for (const mp of MARKETPLACE_CODES) {
            if (cancelled) return;
            const data = await fetchOrdersForMarketplace(mp);
            results.push(data);
            if (cancelled) return;
            await delay(500);
          }
          if (cancelled) return;
          const hasError = results.some((r) => r.error && r.fallback);
          const hasQuotaExceeded = results.some((r) => r.quotaExceeded);
          if (hasError) {
            const firstError = results.find((r) => r.error)?.error ?? "Erreur API";
            setApiError(firstError);
            setQuotaExceeded(hasQuotaExceeded);
            setKpi(FAKE_KPI);
            return;
          }
          const allOrders: Order[] = results.flatMap((r) => r.orders ?? []);
          const filtered = filterOrdersByPeriod(allOrders, start, end);
          const { salesFormatted, productsSold } = aggregateKpisFromOrders(filtered);
          setKpi((prev) => ({
            ...prev,
            sales: salesFormatted,
            productsSold,
            stock: FAKE_KPI.stock,
            avgReviews: FAKE_KPI.avgReviews,
          }));
        } else {
          const data = await fetchOrdersForMarketplace(marketplace);
          if (cancelled) return;
          if (data.error && data.fallback) {
            setApiError(data.error);
            setQuotaExceeded(data.quotaExceeded ?? false);
            setKpi(FAKE_KPI);
          } else if (Array.isArray(data.orders)) {
            const filtered = filterOrdersByPeriod(data.orders, start, end);
            const { salesFormatted, productsSold } = aggregateKpisFromOrders(filtered);
            setKpi((prev) => ({
              ...prev,
              sales: salesFormatted,
              productsSold,
              stock: FAKE_KPI.stock,
              avgReviews: FAKE_KPI.avgReviews,
            }));
          } else {
            setKpi(FAKE_KPI);
          }
        }
      } catch (err) {
        if (!cancelled) {
          console.error("[Dashboard] API orders error:", err);
          setApiError(err instanceof Error ? err.message : "Erreur réseau");
          setKpi(FAKE_KPI);
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    run();

    return () => {
      cancelled = true;
    };
  }, [timeFilter, marketplace]);

  return (
    <div className="space-y-8">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <h1 className="text-2xl font-bold text-white">
          Tableau de bord
        </h1>
        <div className="flex items-center gap-2">
          <span className="text-sm text-white/60">Marketplace :</span>
          <div className="flex flex-wrap gap-1 rounded-lg border border-[#1e3a5f]/60 bg-[#111111] p-1">
            {MARKETPLACES.map((mp) => (
              <button
                key={mp.code}
                type="button"
                onClick={() => setMarketplace(mp.code)}
                disabled={loading}
                className={`rounded-md px-3 py-1.5 text-sm font-medium transition-colors disabled:opacity-50 ${
                  marketplace === mp.code
                    ? "bg-[#1e3a5f] text-white"
                    : "text-white/70 hover:bg-white/5 hover:text-white"
                }`}
              >
                {mp.code === "ALL" ? "Toutes" : mp.code}
              </button>
            ))}
          </div>
        </div>
      </div>

      {loading && (
        <div className="flex items-center gap-2 rounded-lg border border-[#1e3a5f]/40 bg-[#111111] px-4 py-3 text-sm text-white/80">
          <span className="inline-block h-4 w-4 animate-spin rounded-full border-2 border-[#1e3a5f] border-t-transparent" />
          Chargement des données…
        </div>
      )}

      {apiError && !loading && (
        <div
          className={`rounded-lg border px-4 py-2 text-sm ${
            quotaExceeded
              ? "border-amber-500/50 bg-amber-500/15 text-amber-400"
              : "border-amber-500/40 bg-amber-500/10 text-amber-400"
          }`}
        >
          {quotaExceeded ? (
            <>
              <p className="font-medium">Trop de requêtes, veuillez patienter quelques secondes…</p>
              <p className="mt-1 text-amber-400/80">Affichage des données de démo.</p>
            </>
          ) : (
            <>
              Données Amazon indisponibles ({apiError.slice(0, 80)}
              …). Affichage des données de démo.
            </>
          )}
        </div>
      )}

      <div className="flex flex-wrap items-center gap-2">
        <span className="mr-2 text-sm text-white/60">Période :</span>
        {TIME_FILTERS.map((label) => (
          <button
            key={label}
            type="button"
            onClick={() => setTimeFilter(label)}
            disabled={loading}
            className={`rounded-lg border px-4 py-2 text-sm font-medium transition-colors disabled:opacity-50 ${
              timeFilter === label
                ? "border-[#1e3a5f] bg-[#1e3a5f]/20 text-white"
                : "border-[#1e3a5f]/50 bg-[#111111] text-white/80 hover:border-[#1e3a5f] hover:bg-[#1e3a5f]/10"
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
        <KpiCard
          title="Ventes totales"
          value={loading ? "…" : kpi.sales}
          icon={<IconSales />}
          subtitle="Période sélectionnée"
        />
        <KpiCard
          title="Produits vendus"
          value={loading ? "…" : kpi.productsSold}
          icon={<IconProducts />}
          subtitle="Unités"
        />
        <KpiCard
          title="Stock actuel"
          value={loading ? "…" : kpi.stock}
          icon={<IconStock />}
          subtitle="SKU en stock"
        />
        <KpiCard
          title="Reviews moyennes"
          value={loading ? "…" : kpi.avgReviews}
          icon={<IconReviews />}
          subtitle="sur 5 étoiles"
        />
      </div>

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
