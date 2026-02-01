"use client";

import { useState, useMemo } from "react";

const MARKETPLACES = [
  { code: "FR", label: "France" },
  { code: "DE", label: "Allemagne" },
  { code: "IT", label: "Italie" },
  { code: "ES", label: "Espagne" },
] as const;

const STATUS_FILTERS = [
  { value: "all", label: "Tous" },
  { value: "in_stock", label: "En stock" },
  { value: "low_stock", label: "Stock faible" },
  { value: "out_of_stock", label: "Rupture" },
] as const;

type Product = {
  id: string;
  image: string;
  asin: string;
  sku: string;
  title: string;
  stock: number;
  bsr: number;
};

function getStatus(stock: number): "in_stock" | "low_stock" | "out_of_stock" {
  if (stock >= 30) return "in_stock";
  if (stock >= 10) return "low_stock";
  return "out_of_stock";
}

function getStatusLabel(status: string): string {
  switch (status) {
    case "in_stock":
      return "En stock";
    case "low_stock":
      return "Stock faible";
    case "out_of_stock":
      return "Rupture";
    default:
      return status;
  }
}

const FAKE_PRODUCTS: Product[] = [
  {
    id: "1",
    image: "",
    asin: "B08N5WRWNW",
    sku: "SKU-001",
    title: "Produit Premium Example A",
    stock: 45,
    bsr: 1250,
  },
  {
    id: "2",
    image: "",
    asin: "B09V3KXJPB",
    sku: "SKU-002",
    title: "Gadget Électronique B",
    stock: 8,
    bsr: 3420,
  },
  {
    id: "3",
    image: "",
    asin: "B0BX4N8K2L",
    sku: "SKU-003",
    title: "Accessoire Style C",
    stock: 0,
    bsr: 8900,
  },
  {
    id: "4",
    image: "",
    asin: "B07ZPKBL9V",
    sku: "SKU-004",
    title: "Kit Complet D",
    stock: 22,
    bsr: 2100,
  },
  {
    id: "5",
    image: "",
    asin: "B0C1H6XK9M",
    sku: "SKU-005",
    title: "Produit Best Seller E",
    stock: 156,
    bsr: 420,
  },
];

export default function InventoryPage() {
  const [marketplace, setMarketplace] = useState("FR");
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  const filteredProducts = useMemo(() => {
    return FAKE_PRODUCTS.filter((p) => {
      const matchesSearch =
        !search ||
        p.asin.toLowerCase().includes(search.toLowerCase()) ||
        p.sku.toLowerCase().includes(search.toLowerCase());
      const status = getStatus(p.stock);
      const matchesStatus =
        statusFilter === "all" || status === statusFilter;
      return matchesSearch && matchesStatus;
    });
  }, [search, statusFilter]);

  function exportCsv() {
    const headers = ["ASIN", "SKU", "Titre", "Stock", "BSR", "Statut"];
    const rows = filteredProducts.map((p) => [
      p.asin,
      p.sku,
      p.title,
      p.stock,
      p.bsr,
      getStatusLabel(getStatus(p.stock)),
    ]);
    const csv = [headers.join(","), ...rows.map((r) => r.map((c) => `"${c}"`).join(","))].join("\n");
    const blob = new Blob(["\uFEFF" + csv], { type: "text/csv;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `inventaire-${marketplace}-${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <h1 className="text-2xl font-bold text-white">Inventaire</h1>
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

      <div className="rounded-xl border border-[#1e3a5f]/60 bg-[#111111] p-4">
        <div className="flex flex-wrap items-center gap-4">
          <input
            type="search"
            placeholder="Rechercher par ASIN ou SKU..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="rounded-lg border border-[#1e3a5f]/60 bg-black/50 px-4 py-2 text-sm text-white placeholder:text-white/40 focus:border-[#1e3a5f] focus:outline-none focus:ring-1 focus:ring-[#1e3a5f]"
          />
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="rounded-lg border border-[#1e3a5f]/60 bg-black/50 px-4 py-2 text-sm text-white focus:border-[#1e3a5f] focus:outline-none"
          >
            {STATUS_FILTERS.map((s) => (
              <option key={s.value} value={s.value} className="bg-[#111111]">
                {s.label}
              </option>
            ))}
          </select>
          <button
            type="button"
            onClick={exportCsv}
            className="rounded-lg bg-[#1e3a5f] px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-[#2a4a6f]"
          >
            Exporter CSV
          </button>
        </div>
      </div>

      <div className="overflow-hidden rounded-xl border border-[#1e3a5f]/60 bg-[#111111]">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[800px] text-left text-sm">
            <thead>
              <tr className="border-b border-[#1e3a5f]/40 bg-black/30">
                <th className="px-4 py-3 font-medium text-white/90">Image</th>
                <th className="px-4 py-3 font-medium text-white/90">ASIN</th>
                <th className="px-4 py-3 font-medium text-white/90">SKU</th>
                <th className="px-4 py-3 font-medium text-white/90">Titre</th>
                <th className="px-4 py-3 font-medium text-white/90">Stock</th>
                <th className="px-4 py-3 font-medium text-white/90">BSR</th>
                <th className="px-4 py-3 font-medium text-white/90">Statut</th>
              </tr>
            </thead>
            <tbody>
              {filteredProducts.map((p, i) => {
                const status = getStatus(p.stock);
                const stockClass =
                  p.stock < 10
                    ? "text-red-400 font-medium"
                    : p.stock < 30
                      ? "text-amber-400 font-medium"
                      : "text-white";
                return (
                  <tr
                    key={p.id}
                    className={`border-b border-white/5 ${
                      i % 2 === 0 ? "bg-black/20" : "bg-transparent"
                    }`}
                  >
                    <td className="px-4 py-3">
                      <div className="h-10 w-10 rounded border border-[#1e3a5f]/40 bg-black/50 flex items-center justify-center text-white/40 text-xs">
                        Img
                      </div>
                    </td>
                    <td className="px-4 py-3 font-mono text-white/90">{p.asin}</td>
                    <td className="px-4 py-3 text-white/90">{p.sku}</td>
                    <td className="max-w-[200px] truncate px-4 py-3 text-white/90" title={p.title}>
                      {p.title}
                    </td>
                    <td className={`px-4 py-3 ${stockClass}`}>{p.stock}</td>
                    <td className="px-4 py-3 text-white/80">{p.bsr.toLocaleString()}</td>
                    <td className="px-4 py-3">
                      <span
                        className={`inline-flex rounded-full px-2 py-0.5 text-xs font-medium ${
                          status === "out_of_stock"
                            ? "bg-red-500/20 text-red-400"
                            : status === "low_stock"
                              ? "bg-amber-500/20 text-amber-400"
                              : "bg-green-500/20 text-green-400"
                        }`}
                      >
                        {getStatusLabel(status)}
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
        {filteredProducts.length === 0 && (
          <p className="py-8 text-center text-white/50">Aucun produit trouvé.</p>
        )}
      </div>
    </div>
  );
}
