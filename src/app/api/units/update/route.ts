import { NextRequest, NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/db";
import Unit from "@/models/Unit";
import { computeFinalPrice, computeTimeSharePrice } from "@/lib/pricing";

export async function PUT(req: NextRequest) {
  try {
    const body = await req.json();
    const id = body._id || body.id;
    if (!id) return NextResponse.json({ ok: false, error: "id required" }, { status: 400 });
    await connectToDatabase();
    const finalPrice = computeFinalPrice(body);
    const timeSharePrice = computeTimeSharePrice(finalPrice, Number(body?.maxShares) || 0);
    const updated = await Unit.findByIdAndUpdate(id, { ...body, finalPrice, timeSharePrice }, { new: true, runValidators: true });
    if (!updated) return NextResponse.json({ ok: false, error: "Not found" }, { status: 404 });
    if (updated?.maxShares && (updated.sharesSold || 0) > updated.maxShares) {
      return NextResponse.json({ ok: false, error: "sharesSold exceeds maxShares" }, { status: 400 });
    }
    return NextResponse.json({ ok: true, data: updated });
  } catch (e: any) {
    if (e?.code === 11000) {
      return NextResponse.json({ ok: false, error: "Duplicate fields" }, { status: 409 });
    }
    if (e?.name === "ValidationError") {
      return NextResponse.json({ ok: false, error: "Validation failed", details: e?.message }, { status: 400 });
    }
    return NextResponse.json({ ok: false, error: "Server error" }, { status: 500 });
  }
}
