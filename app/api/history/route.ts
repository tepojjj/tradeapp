import { NextRequest, NextResponse } from "next/server";
import { getHistory } from "@/lib/stockApi";

export async function GET(req: NextRequest) {
  const symbol = req.nextUrl.searchParams.get("symbol");
  const interval = (req.nextUrl.searchParams.get("interval") as "1day" | "1week") ?? "1day";

  if (!symbol) {
    return NextResponse.json({ error: "Missing symbol parameter" }, { status: 400 });
  }

  try {
    const history = await getHistory(symbol, interval);
    return NextResponse.json(history);
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 502 });
  }
}
