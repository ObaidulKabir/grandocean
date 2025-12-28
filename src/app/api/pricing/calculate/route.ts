import { NextRequest, NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/db";
import Unit from "@/models/Unit";
import { computeFinalPrice, computeTimeSharePrice } from "@/lib/pricing";


export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { unitId } = body || {};
    await connectToDatabase();
    const unit = await Unit.findById(unitId).lean();
    if (!unit) return NextResponse.json({ ok: false, error: "Not found" }, { status: 404 });
    const finalPrice = computeFinalPrice(unit);
    const timeSharePrice = computeTimeSharePrice(finalPrice, Number(unit?.maxShares) || 0);
    return NextResponse.json({ ok: true, finalPrice, timeSharePrice });
  } catch {
    return NextResponse.json({ ok: false, error: "Server error" }, { status: 500 });
  }
}
