import { NextRequest, NextResponse } from "next/server";
import { getInventory } from "@/lib/amazon/api";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const marketplace = searchParams.get("marketplace") ?? "FR";

  try {
    const result = await getInventory(marketplace);

    if (result.error) {
      return NextResponse.json(
        { error: result.error, fallback: true },
        { status: 502 }
      );
    }

    return NextResponse.json({
      payload: result.payload ?? null,
    });
  } catch (e) {
    const msg = e instanceof Error ? e.message : String(e);
    console.error("[API /api/amazon/inventory]", msg);
    return NextResponse.json(
      { error: msg, fallback: true },
      { status: 502 }
    );
  }
}
