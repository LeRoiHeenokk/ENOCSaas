"use client";

import { useState } from "react";

type ReportType =
  | "sales_daily"
  | "sales_weekly"
  | "sales_monthly"
  | "stock"
  | "performance"
  | "reviews";

const REPORT_CARDS: { id: ReportType; label: string; description: string }[] = [
  { id: "sales_daily", label: "Rapport des ventes (journalier)", description: "Ventes par jour" },
  { id: "sales_weekly", label: "Rapport des ventes (hebdo)", description: "Ventes par semaine" },
  { id: "sales_monthly", label: "Rapport des ventes (mensuel)", description: "Ventes par mois" },
  { id: "stock", label: "Rapport de stock", description: "État des stocks par SKU" },
  { id: "performance", label: "Rapport de performance produits", description: "BSR, ventes, tendances" },
  { id: "reviews", label: "Rapport reviews", description: "Avis clients et notes" },
];

type ReportHistoryItem = {
  id: string;
  date: string;
  type: string;
};

const FAKE_HISTORY: ReportHistoryItem[] = [
  { id: "1", date: "2025-01-30 14:32", type: "Ventes mensuel" },
  { id: "2", date: "2025-01-29 09:15", type: "Stock" },
  { id: "3", date: "2025-01-28 16:45", type: "Performance produits" },
  { id: "4", date: "2025-01-27 11:00", type: "Reviews" },
];

function getReportLabel(id: ReportType): string {
  switch (id) {
    case "sales_daily":
      return "Ventes journalier";
    case "sales_weekly":
      return "Ventes hebdo";
    case "sales_monthly":
      return "Ventes mensuel";
    case "stock":
      return "Stock";
    case "performance":
      return "Performance produits";
    case "reviews":
      return "Reviews";
    default:
      return id;
  }
}

export default function ReportsPage() {
  const [selectedReport, setSelectedReport] = useState<ReportType | null>(null);
  const [dateFrom, setDateFrom] = useState("2025-01-01");
  const [dateTo, setDateTo] = useState("2025-01-31");
  const [isGenerating, setIsGenerating] = useState(false);
  const [history, setHistory] = useState(FAKE_HISTORY);

  function handleGenerate() {
    if (!selectedReport) return;
    setIsGenerating(true);
    setTimeout(() => {
      const newItem: ReportHistoryItem = {
        id: Date.now().toString(),
        date: new Date().toISOString().slice(0, 16).replace("T", " "),
        type: getReportLabel(selectedReport),
      };
      setHistory((prev) => [newItem, ...prev]);
      setIsGenerating(false);
      // Simuler téléchargement
      const blob = new Blob(["Rapport généré - " + getReportLabel(selectedReport)], {
        type: "text/plain",
      });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `rapport-${selectedReport}-${dateFrom}-${dateTo}.txt`;
      a.click();
      URL.revokeObjectURL(url);
    }, 800);
  }

  function handleDownloadHistoryItem(item: ReportHistoryItem) {
    const blob = new Blob([`Rapport: ${item.type} - ${item.date}`], {
      type: "text/plain",
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `rapport-${item.id}.txt`;
    a.click();
    URL.revokeObjectURL(url);
  }

  return (
    <div className="space-y-8">
      <h1 className="text-2xl font-bold text-white">Rapports</h1>

      <section className="rounded-xl border border-[#1e3a5f]/60 bg-[#111111] p-6">
        <h2 className="mb-4 text-lg font-semibold text-white">Rapports disponibles</h2>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {REPORT_CARDS.map((card) => (
            <button
              key={card.id}
              type="button"
              onClick={() => setSelectedReport(card.id)}
              className={`rounded-lg border p-4 text-left transition-colors ${
                selectedReport === card.id
                  ? "border-[#1e3a5f] bg-[#1e3a5f]/20"
                  : "border-[#1e3a5f]/50 bg-black/30 hover:border-[#1e3a5f] hover:bg-[#1e3a5f]/10"
              }`}
            >
              <p className="font-medium text-white">{card.label}</p>
              <p className="mt-1 text-sm text-white/60">{card.description}</p>
            </button>
          ))}
        </div>
      </section>

      <section className="rounded-xl border border-[#1e3a5f]/60 bg-[#111111] p-6">
        <h2 className="mb-4 text-lg font-semibold text-white">Période</h2>
        <div className="flex flex-wrap items-center gap-4">
          <div>
            <label className="mb-1 block text-xs text-white/60">Du</label>
            <input
              type="date"
              value={dateFrom}
              onChange={(e) => setDateFrom(e.target.value)}
              className="rounded-lg border border-[#1e3a5f]/60 bg-black/50 px-4 py-2 text-sm text-white focus:border-[#1e3a5f] focus:outline-none"
            />
          </div>
          <div>
            <label className="mb-1 block text-xs text-white/60">Au</label>
            <input
              type="date"
              value={dateTo}
              onChange={(e) => setDateTo(e.target.value)}
              className="rounded-lg border border-[#1e3a5f]/60 bg-black/50 px-4 py-2 text-sm text-white focus:border-[#1e3a5f] focus:outline-none"
            />
          </div>
          <div className="flex items-end">
            <button
              type="button"
              onClick={handleGenerate}
              disabled={!selectedReport || isGenerating}
              className="rounded-lg bg-[#1e3a5f] px-4 py-2 font-medium text-white transition-colors hover:bg-[#2a4a6f] disabled:opacity-50"
            >
              {isGenerating ? "Génération..." : "Générer le rapport"}
            </button>
          </div>
        </div>
      </section>

      <section className="rounded-xl border border-[#1e3a5f]/60 bg-[#111111] p-6">
        <h2 className="mb-4 text-lg font-semibold text-white">Historique des rapports</h2>
        <div className="overflow-x-auto">
          <table className="w-full min-w-[400px] text-left text-sm">
            <thead>
              <tr className="border-b border-[#1e3a5f]/40 bg-black/30">
                <th className="px-4 py-3 font-medium text-white/90">Date</th>
                <th className="px-4 py-3 font-medium text-white/90">Type</th>
                <th className="px-4 py-3 font-medium text-white/90">Action</th>
              </tr>
            </thead>
            <tbody>
              {history.map((item, i) => (
                <tr
                  key={item.id}
                  className={`border-b border-white/5 ${
                    i % 2 === 0 ? "bg-black/20" : "bg-transparent"
                  }`}
                >
                  <td className="px-4 py-3 text-white/90">{item.date}</td>
                  <td className="px-4 py-3 text-white/90">{item.type}</td>
                  <td className="px-4 py-3">
                    <button
                      type="button"
                      onClick={() => handleDownloadHistoryItem(item)}
                      className="text-[#1e3a5f] hover:text-white hover:underline"
                    >
                      Télécharger
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}
