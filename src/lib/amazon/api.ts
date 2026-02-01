/**
 * Client Amazon SP-API (EU).
 * Base: https://sellingpartnerapi-eu.amazon.com
 * Headers: x-amz-access-token (LWA), x-amz-date, host.
 * Note: SP-API exige aussi une signature AWS SigV4 en production (IAM lié à l'app SP-API).
 * Sans SigV4, Amazon peut renvoyer 403 — le dashboard utilise alors les données fictives en fallback.
 */

import { getAccessToken } from "./auth";

const SP_API_EU = "https://sellingpartnerapi-eu.amazon.com";

/** Délai en millisecondes (pour éviter 429 QuotaExceeded). */
export function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

const MARKETPLACE_ENV: Record<string, string> = {
  FR: "AMAZON_MARKETPLACE_ID_FR",
  DE: "AMAZON_MARKETPLACE_ID_DE",
  IT: "AMAZON_MARKETPLACE_ID_IT",
  ES: "AMAZON_MARKETPLACE_ID_ES",
};

function getMarketplaceId(marketplace: string): string {
  const envKey = MARKETPLACE_ENV[marketplace.toUpperCase()];
  if (!envKey) throw new Error(`Marketplace non supporté: ${marketplace}`);
  const id = process.env[envKey];
  if (!id) throw new Error(`Variable manquante: ${envKey}`);
  return id;
}

/** ISO 8601 complet pour SP-API : YYYY-MM-DDTHH:mm:ssZ (UTC) */
function toIntervalStart(dateStr: string): string {
  const d = new Date(dateStr);
  d.setUTCHours(0, 0, 0, 0);
  return d.toISOString().slice(0, 19) + "Z";
}

function toIntervalEnd(dateStr: string): string {
  const d = new Date(dateStr);
  d.setUTCHours(23, 59, 59, 999);
  return d.toISOString().slice(0, 19) + "Z";
}

async function spApiFetch(
  path: string,
  searchParams: Record<string, string>
): Promise<Response> {
  const accessToken = await getAccessToken();
  const url = new URL(path, SP_API_EU);
  Object.entries(searchParams).forEach(([k, v]) => url.searchParams.set(k, v));

  const date = new Date();
  const headers: Record<string, string> = {
    "x-amz-access-token": accessToken,
    "x-amz-date": date.toISOString().replace(/\.\d{3}Z$/, "Z"),
    host: url.host,
    "Content-Type": "application/json",
  };

  const res = await fetch(url.toString(), { method: "GET", headers });
  return res;
}

/**
 * Données de ventes (order metrics) pour une période et une marketplace.
 * GET /sales/v1/orderMetrics
 */
export async function getSalesData(
  startDate: string,
  endDate: string,
  marketplace: string
): Promise<{ orderMetrics?: unknown[]; error?: string }> {
  const marketplaceId = getMarketplaceId(marketplace);
  const interval = `${toIntervalStart(startDate)}--${toIntervalEnd(endDate)}`;

  try {
    const res = await spApiFetch("/sales/v1/orderMetrics", {
      marketplaceIds: marketplaceId,
      interval,
      granularity: "Day",
    });

    if (!res.ok) {
      const text = await res.text();
      console.error("[SP-API getSalesData]", res.status, text);
      return { error: `SP-API ${res.status}: ${text.slice(0, 200)}` };
    }

    const data = (await res.json()) as { orderMetrics?: unknown[] };
    return { orderMetrics: data.orderMetrics ?? [] };
  } catch (e) {
    const msg = e instanceof Error ? e.message : String(e);
    console.error("[SP-API getSalesData]", msg);
    return { error: msg };
  }
}

/**
 * Résumés d’inventaire FBA pour une marketplace.
 * GET /fba/inventory/v1/summaries
 */
export async function getInventory(
  marketplace: string
): Promise<{ payload?: unknown; error?: string }> {
  const marketplaceId = getMarketplaceId(marketplace);

  try {
    const res = await spApiFetch("/fba/inventory/v1/summaries", {
      marketplaceIds: marketplaceId,
      granularityType: "Marketplace",
      granularityId: marketplaceId,
      details: "true",
    });

    if (!res.ok) {
      const text = await res.text();
      console.error("[SP-API getInventory]", res.status, text);
      return { error: `SP-API ${res.status}: ${text.slice(0, 200)}` };
    }

    const data = (await res.json()) as { payload?: unknown };
    return { payload: data.payload };
  } catch (e) {
    const msg = e instanceof Error ? e.message : String(e);
    console.error("[SP-API getInventory]", msg);
    return { error: msg };
  }
}

export type GetOrdersResult = {
  orders?: unknown[];
  error?: string;
  statusCode?: number;
};

/**
 * Commandes pour une période et une marketplace.
 * GET /orders/v0/orders
 */
export async function getOrders(
  startDate: string,
  endDate: string,
  marketplace: string
): Promise<GetOrdersResult> {
  const marketplaceId = getMarketplaceId(marketplace);

  try {
    const res = await spApiFetch("/orders/v0/orders", {
      CreatedAfter: startDate,
      MarketplaceIds: marketplaceId,
    });

    if (!res.ok) {
      const text = await res.text();
      console.error("[SP-API getOrders]", res.status, text);
      return {
        error: `SP-API ${res.status}: ${text.slice(0, 200)}`,
        statusCode: res.status,
      };
    }

    const data = (await res.json()) as { payload?: { Orders?: unknown[] } };
    const orders = data.payload?.Orders ?? [];
    return { orders };
  } catch (e) {
    const msg = e instanceof Error ? e.message : String(e);
    console.error("[SP-API getOrders]", msg);
    return { error: msg };
  }
}

const MAX_ORDERS_RETRIES = 3;
const RETRY_DELAY_MS = 2000;

/**
 * Appelle getOrders et réessaie en cas d'erreur 429 (QuotaExceeded), max 3 tentatives avec 2 s d'attente.
 */
export async function getOrdersWithRetry(
  startDate: string,
  endDate: string,
  marketplace: string
): Promise<GetOrdersResult> {
  let last: GetOrdersResult = {};
  for (let attempt = 1; attempt <= MAX_ORDERS_RETRIES; attempt++) {
    last = await getOrders(startDate, endDate, marketplace);
    if (!last.error) return last;
    if (last.statusCode === 429 && attempt < MAX_ORDERS_RETRIES) {
      console.warn("[SP-API getOrdersWithRetry] 429, tentative", attempt, "/", MAX_ORDERS_RETRIES);
      await sleep(RETRY_DELAY_MS);
    } else {
      return last;
    }
  }
  return last;
}

export { getMarketplaceId };
