import { NextRequest, NextResponse } from "next/server";
import { getOrdersWithRetry } from "@/lib/amazon/api";

const QUOTA_EXCEEDED_MESSAGE =
  "Trop de requêtes, veuillez patienter quelques secondes...";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const startDate = searchParams.get("startDate");
  const endDate = searchParams.get("endDate");
  const marketplace = searchParams.get("marketplace") ?? "FR";

  if (!startDate) {
    return NextResponse.json(
      { error: "startDate est requis (ISO 8601)" },
      { status: 400 }
    );
  }

  try {
    const result = await getOrdersWithRetry(
      startDate,
      endDate ?? new Date().toISOString().slice(0, 19) + "Z",
      marketplace
    );

    if (result.error) {
      const isQuotaExceeded = result.statusCode === 429;
      return NextResponse.json(
        {
          error: isQuotaExceeded ? QUOTA_EXCEEDED_MESSAGE : result.error,
          fallback: true,
          quotaExceeded: isQuotaExceeded,
        },
        { status: 502 }
      );
    }

    return NextResponse.json({
      orders: result.orders ?? [],
    });
  } catch (e) {
    const msg = e instanceof Error ? e.message : String(e);
    console.error("[API /api/amazon/orders]", msg);
    return NextResponse.json(
      { error: msg, fallback: true },
      { status: 502 }
    );
  }
}
