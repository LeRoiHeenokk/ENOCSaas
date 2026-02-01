import { NextRequest, NextResponse } from "next/server";
import { getSalesData } from "@/lib/amazon/api";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const startDate = searchParams.get("startDate");
  const endDate = searchParams.get("endDate");
  const marketplace = searchParams.get("marketplace") ?? "FR";

  if (!startDate || !endDate) {
    return NextResponse.json(
      { error: "startDate et endDate sont requis (ISO 8601)" },
      { status: 400 }
    );
  }

  try {
    const result = await getSalesData(startDate, endDate, marketplace);

    if (result.error) {
      return NextResponse.json(
        { error: result.error, fallback: true },
        { status: 502 }
      );
    }

    return NextResponse.json({
      orderMetrics: result.orderMetrics ?? [],
    });
  } catch (e) {
    const msg = e instanceof Error ? e.message : String(e);
    console.error("[API /api/amazon/sales]", msg);
    return NextResponse.json(
      { error: msg, fallback: true },
      { status: 502 }
    );
  }
}
