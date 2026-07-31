import { NextRequest, NextResponse } from "next/server";
import { searchSymbols } from "@/lib/stockApi";

export async function GET(req: NextRequest) {
  const query = req.nextUrl.searchParams.get("q") ?? "";

  try {
    const results = await searchSymbols(query);
    return NextResponse.json(results);
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 502 });
  }
}
