import { NextRequest, NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/db";
import Unit from "@/models/Unit";
import { computeFinalPrice, computeTimeSharePrice } from "@/lib/pricing";


export async function GET(req: NextRequest) {
  try {
    const url = new URL(req.url);
    const floor = url.searchParams.get("floor");
    const viewType = url.searchParams.get("viewType");
    const sizeCategory = url.searchParams.get("sizeCategory");
    const quality = url.searchParams.get("quality");
    const status = url.searchParams.get("status");
    await connectToDatabase();
    const q: any = {};
    if (floor) q.floor = Number(floor);
    if (viewType) q.viewType = viewType;
    if (sizeCategory) q.sizeCategory = sizeCategory;
    if (quality) q.quality = quality;
    if (status) q.status = status;
    const units = await Unit.find(q).sort({ floor: 1, unitCode: 1 }).lean();
    return NextResponse.json({ ok: true, data: units });
  } catch {
    return NextResponse.json({ ok: false, error: "Server error" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    await connectToDatabase();
    const finalPrice = computeFinalPrice(body);
    const timeSharePrice = computeTimeSharePrice(finalPrice, Number(body?.maxShares) || 0);
    const created = await Unit.create({ ...body, finalPrice, timeSharePrice });
    return NextResponse.json({ ok: true, data: created }, { status: 201 });
  } catch (e: any) {
    if (e?.code === 11000) {
      return NextResponse.json({ ok: false, error: "Unit code already exists" }, { status: 409 });
    }
    if (e?.name === "ValidationError") {
      return NextResponse.json({ ok: false, error: "Validation failed", details: e?.message }, { status: 400 });
    }
    return NextResponse.json({ ok: false, error: "Server error" }, { status: 500 });
  }
}
