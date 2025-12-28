import { NextRequest, NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/db";
import Unit from "@/models/Unit";
import SuiteComponent from "@/models/SuiteComponent";

async function recalc(unitId: string) {
  const total = await SuiteComponent.aggregate([
    { $match: { unitId: new (await import("mongoose")).Types.ObjectId(unitId) } },
    { $group: { _id: null, sum: { $sum: "$areaSqft" } } },
  ]);
  const sum = total[0]?.sum || 0;
  await Unit.findByIdAndUpdate(unitId, { totalComponentArea: sum });
  return sum;
}

export async function GET(
  _: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params;
    await connectToDatabase();
    const list = await SuiteComponent.find({ unitId: id }).sort({ componentName: 1 }).lean();
    const unit = await Unit.findById(id).lean();
    const total = list.reduce((a, b) => a + (b.areaSqft || 0), 0);
    const warn = unit ? total > unit.totalAreaSqft : false;
    return NextResponse.json({ ok: true, data: list, total, unitArea: unit?.totalAreaSqft, warn });
  } catch (e) {
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
    const { componentName, areaSqft, remarks } = body || {};
    if (!componentName || !areaSqft || Number(areaSqft) <= 0) {
      return NextResponse.json({ ok: false, error: "Invalid data" }, { status: 400 });
    }
    await connectToDatabase();
    const created = await SuiteComponent.create({
      unitId: id,
      componentName,
      areaSqft: Number(areaSqft),
      remarks,
    });
    const total = await recalc(id);
    const unit = await Unit.findById(id).lean();
    const warn = unit ? total > unit.totalAreaSqft : false;
    return NextResponse.json({ ok: true, data: created, total, unitArea: unit?.totalAreaSqft, warn }, { status: 201 });
  } catch (e: any) {
    if (e?.code === 11000) {
      return NextResponse.json({ ok: false, error: "Duplicate component found" }, { status: 409 });
    }
    return NextResponse.json({ ok: false, error: "Server error" }, { status: 500 });
  }
}

