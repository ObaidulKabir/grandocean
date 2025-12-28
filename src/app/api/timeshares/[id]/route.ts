import { NextRequest, NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/db";
import TimeShare from "@/models/TimeShare";
import Unit from "@/models/Unit";

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const body = await req.json();
    await connectToDatabase();
    const existing = await TimeShare.findById(id);
    if (!existing) return NextResponse.json({ ok: false, error: "Not found" }, { status: 404 });
    const unit = await Unit.findById(existing.unitId);
    if (!unit) return NextResponse.json({ ok: false, error: "Unit not found" }, { status: 404 });
    const prevStatus = existing.status;
    if (typeof body.ownerName === "string") existing.ownerName = body.ownerName;
    if (typeof body.ownerContact === "string") existing.ownerContact = body.ownerContact;
    if (body.status) {
      const nextStatus = body.status;
      if (prevStatus !== "Sold" && nextStatus === "Sold") {
        const max = unit.maxShares || 0;
        const sold = unit.sharesSold || 0;
        if (max && sold + 1 > max) {
          return NextResponse.json({ ok: false, error: "Shares sold exceed maxShares" }, { status: 409 });
        }
        unit.sharesSold = sold + 1;
        await unit.save();
      }
      if (prevStatus === "Sold" && nextStatus !== "Sold") {
        const sold = unit.sharesSold || 0;
        unit.sharesSold = sold > 0 ? sold - 1 : 0;
        await unit.save();
      }
      existing.status = nextStatus;
    }
    await existing.save();
    return NextResponse.json({ ok: true, data: existing.toObject() });
  } catch {
    return NextResponse.json({ ok: false, error: "Server error" }, { status: 500 });
  }
}

export async function DELETE(_: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    await connectToDatabase();
    const existing = await TimeShare.findById(id);
    if (!existing) return NextResponse.json({ ok: false, error: "Not found" }, { status: 404 });
    const unit = await Unit.findById(existing.unitId);
    if (unit && existing.status === "Sold") {
      const sold = unit.sharesSold || 0;
      unit.sharesSold = sold > 0 ? sold - 1 : 0;
      await unit.save();
    }
    await TimeShare.findByIdAndDelete(id);
    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ ok: false, error: "Server error" }, { status: 500 });
  }
}
