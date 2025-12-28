import { NextRequest, NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/db";
import Unit from "@/models/Unit";
import TimeShare from "@/models/TimeShare";

async function generateShareCode() {
  const n = Math.floor(1000 + Math.random() * 9000);
  const code = `TS-${n}`;
  const exists = await TimeShare.findOne({ shareCode: code }).lean();
  if (exists) return generateShareCode();
  return code;
}

export async function GET(
  _: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params;
    await connectToDatabase();
    const unit = await Unit.findById(id).lean();
    if (!unit) return NextResponse.json({ ok: false, error: "Not found" }, { status: 404 });
    const list = await TimeShare.find({ unitId: id }).sort({ createdAt: -1 }).lean();
    const soldCount = list.filter((t: any) => t.status === "Sold").length;
    const bookedDays = list.reduce((a: number, t: any) => a + (t.bookingCalendar?.length || 0), 0);
    return NextResponse.json({ ok: true, data: list, unit: unit, soldCount, bookedDays });
  } catch {
    return NextResponse.json({ ok: false, error: "Server error" }, { status: 500 });
  }
}

export async function POST(
  req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params;
    const body = await req.json();
    await connectToDatabase();
    const unit = await Unit.findById(id);
    if (!unit) return NextResponse.json({ ok: false, error: "Not found" }, { status: 404 });
    if (unit.ownershipAllowed !== "TimeShare" && unit.ownershipAllowed !== "Both") {
      return NextResponse.json({ ok: false, error: "TimeShare not allowed for this unit" }, { status: 400 });
    }
    const shareCode = await generateShareCode();
    const status = body?.status || "Available";
    if (status === "Sold") {
      const max = unit.maxShares || 0;
      const sold = unit.sharesSold || 0;
      if (max && sold + 1 > max) {
        return NextResponse.json({ ok: false, error: "Shares sold exceed maxShares" }, { status: 409 });
      }
      unit.sharesSold = sold + 1;
      await unit.save();
    }
    const created = await TimeShare.create({
      unitId: id,
      ownerName: body?.ownerName,
      ownerContact: body?.ownerContact,
      shareCode,
      daysPerMonth: body?.daysPerMonth || 3,
      daysPerYear: body?.daysPerYear || 36,
      status,
      bookingCalendar: [],
    });
    return NextResponse.json({ ok: true, data: created }, { status: 201 });
  } catch {
    return NextResponse.json({ ok: false, error: "Server error" }, { status: 500 });
  }
}
