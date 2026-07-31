import { NextRequest, NextResponse } from "next/server";
import { getQuote, getQuotes } from "@/lib/stockApi";

export async function GET(req: NextRequest) {
  const symbol = req.nextUrl.searchParams.get("symbol");
  const symbolsParam = req.nextUrl.searchParams.get("symbols"); // comma-separated batch

  try {
    if (symbolsParam) {
      const symbols = symbolsParam.split(",").map((s) => s.trim()).filter(Boolean);
      const quotes = await getQuotes(symbols);
      return NextResponse.json(quotes);
    }

    if (!symbol) {
      return NextResponse.json({ error: "Missing symbol parameter" }, { status: 400 });
    }

    const quote = await getQuote(symbol);
    return NextResponse.json(quote);
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 502 });
  }
}
