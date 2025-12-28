import { NextRequest, NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/db";
import SuiteComponent from "@/models/SuiteComponent";
import Unit from "@/models/Unit";
import { Types } from "mongoose";

async function recalc(unitId: string) {
  const total = await SuiteComponent.aggregate([
    { $match: { unitId: new Types.ObjectId(unitId) } },
    { $group: { _id: null, sum: { $sum: "$areaSqft" } } },
  ]);
  const sum = total[0]?.sum || 0;
  await Unit.findByIdAndUpdate(unitId, { totalComponentArea: sum });
  return sum;
}

export async function PUT(
  req: NextRequest,
  context: { params: Promise<{ componentId: string }> }
) {
  try {
    const { componentId } = await context.params;
    const body = await req.json();
    const { componentName, areaSqft, remarks } = body || {};
    if (!componentName || !areaSqft || Number(areaSqft) <= 0) {
      return NextResponse.json({ ok: false, error: "Invalid data" }, { status: 400 });
    }
    await connectToDatabase();
    const existing = await SuiteComponent.findById(componentId);
    if (!existing) return NextResponse.json({ ok: false, error: "Not found" }, { status: 404 });
    existing.componentName = componentName;
    existing.areaSqft = Number(areaSqft);
    existing.remarks = remarks;
    await existing.save();
    const total = await recalc(String(existing.unitId));
    const unit = await Unit.findById(existing.unitId).lean();
    const warn = unit ? total > unit.totalAreaSqft : false;
    return NextResponse.json({ ok: true, data: existing.toObject(), total, unitArea: unit?.totalAreaSqft, warn });
  } catch (e: any) {
    if (e?.code === 11000) {
      return NextResponse.json({ ok: false, error: "Duplicate component found" }, { status: 409 });
    }
    return NextResponse.json({ ok: false, error: "Server error" }, { status: 500 });
  }
}

export async function DELETE(
  _: NextRequest,
  context: { params: Promise<{ componentId: string }> }
) {
  try {
    const { componentId } = await context.params;
    await connectToDatabase();
    const existing = await SuiteComponent.findById(componentId);
    if (!existing) return NextResponse.json({ ok: false, error: "Not found" }, { status: 404 });
    const unitId = String(existing.unitId);
    await SuiteComponent.findByIdAndDelete(componentId);
    const total = await recalc(unitId);
    const unit = await Unit.findById(unitId).lean();
    const warn = unit ? total > unit.totalAreaSqft : false;
    return NextResponse.json({ ok: true, total, unitArea: unit?.totalAreaSqft, warn });
  } catch {
    return NextResponse.json({ ok: false, error: "Server error" }, { status: 500 });
  }
}

