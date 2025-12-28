import { NextRequest, NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/db";
import Unit from "@/models/Unit";
import SuiteComponent from "@/models/SuiteComponent";
import TimeShare from "@/models/TimeShare";
import { computeFinalPrice, computeTimeSharePrice } from "@/lib/pricing";


export async function GET(
  _: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params;
    await connectToDatabase();
    const unit = await Unit.findById(id).lean();
    if (!unit) return NextResponse.json({ ok: false, error: "Not found" }, { status: 404 });
    return NextResponse.json({ ok: true, data: unit });
  } catch {
    return NextResponse.json({ ok: false, error: "Server error" }, { status: 500 });
  }
}

export async function PUT(
  req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params;
    const body = await req.json();
    await connectToDatabase();
    const finalPrice = computeFinalPrice(body);
    const timeSharePrice = computeTimeSharePrice(finalPrice, Number(body?.maxShares) || 0);
    const updated = await Unit.findByIdAndUpdate(id, { ...body, finalPrice, timeSharePrice }, { new: true, runValidators: true });
    if (!updated) {
      return NextResponse.json({ ok: false, error: "Not found" }, { status: 404 });
    }
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

export async function PATCH(
  req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params;
    const body = await req.json();
    await connectToDatabase();
    const finalPrice = computeFinalPrice(body);
    const timeSharePrice = computeTimeSharePrice(finalPrice, Number(body?.maxShares) || 0);
    const updated = await Unit.findByIdAndUpdate(id, { ...body, finalPrice, timeSharePrice }, { new: true, runValidators: true });
    if (!updated) {
      return NextResponse.json({ ok: false, error: "Not found" }, { status: 404 });
    }
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

export async function DELETE(
  _: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params;
    await connectToDatabase();
    const tsCount = await TimeShare.countDocuments({ unitId: id });
    if (tsCount > 0) {
      return NextResponse.json({ ok: false, error: "Cannot delete unit with existing timeshares" }, { status: 409 });
    }
    await Unit.findByIdAndDelete(id);
    await SuiteComponent.deleteMany({ unitId: id });
    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ ok: false, error: "Server error" }, { status: 500 });
  }
}
