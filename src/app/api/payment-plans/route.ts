import { NextRequest, NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/db";
import PaymentPlan from "@/models/PaymentPlan";
import Unit from "@/models/Unit";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const unitId = searchParams.get("unitId");
    const ownershipType = searchParams.get("ownershipType") || undefined;
    const paymentMode = searchParams.get("paymentMode") || undefined;
    await connectToDatabase();
    const q: any = {};
    if (unitId) q.unitId = unitId;
    if (ownershipType) q.ownershipType = ownershipType;
    if (paymentMode) q.paymentMode = paymentMode;
    const plans = await PaymentPlan.find(q).sort({ createdAt: -1 }).lean();
    return NextResponse.json({ ok: true, data: plans });
  } catch {
    return NextResponse.json({ ok: false, error: "Server error" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { unitId, ownershipType, totalPrice, bookingPercent = 10, downpaymentPercent = 30, paymentMode, installmentFrequency = "Monthly", tenureYears = 1, schedule, numberOfInstallments, installmentAmount, bookingAmount, downpaymentAmount } = body || {};
    await connectToDatabase();
    const unit = await Unit.findById(unitId).lean();
    if (!unit) return NextResponse.json({ ok: false, error: "Not found" }, { status: 404 });
    if (paymentMode === "Installment") {
      if (!tenureYears) return NextResponse.json({ ok: false, error: "Tenure required for installments" }, { status: 400 });
      if ((downpaymentAmount || 0) <= 0) return NextResponse.json({ ok: false, error: "Downpayment required for installments" }, { status: 400 });
    }
    const created = await PaymentPlan.create({
      unitId,
      ownershipType,
      totalPrice,
      bookingPercent,
      downpaymentPercent,
      paymentMode,
      installmentFrequency,
      tenureYears,
      bookingAmount,
      downpaymentAmount,
      installmentAmount,
      numberOfInstallments,
      schedule: Array.isArray(schedule) ? schedule : [],
    });
    return NextResponse.json({ ok: true, data: created }, { status: 201 });
  } catch {
    return NextResponse.json({ ok: false, error: "Server error" }, { status: 500 });
  }
}
