import { NextRequest, NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/db";
import Unit from "@/models/Unit";

function addMonths(date: Date, months: number) {
  const d = new Date(date.getTime());
  d.setMonth(d.getMonth() + months);
  d.setHours(0, 0, 0, 0);
  return d;
}
function iso(d: Date) {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { unitId, ownershipType, paymentMode, tenureYears, installmentFrequency, bookingPercent = 10, downpaymentPercent = 30 } = body || {};
    await connectToDatabase();
    const unit = await Unit.findById(unitId).lean();
    if (!unit) return NextResponse.json({ ok: false, error: "Not found" }, { status: 404 });
    const totalPrice = ownershipType === "TimeShare" ? ((unit.timeSharePrice || 0)) : ((unit.finalPrice || 0));
    if (totalPrice <= 0) return NextResponse.json({ ok: false, error: "Invalid total price" }, { status: 400 });
    const bookingAmount = Math.round((totalPrice * (Number(bookingPercent) || 10) / 100) * 100) / 100;
    const downpaymentAmount = Math.round((totalPrice * (Number(downpaymentPercent) || 30) / 100) * 100) / 100;
    const payableAfterDownpayment = Math.round((totalPrice - downpaymentAmount) * 100) / 100;
    const start = new Date();
    start.setDate(1);
    const installmentStart = addMonths(start, 1);
    let numberOfInstallments = 0;
    let installmentAmount = 0;
    const schedule: Array<{ dueDate: string; amount: number }> = [];
    if (paymentMode === "Installment") {
      if (!tenureYears) return NextResponse.json({ ok: false, error: "Tenure required for installments" }, { status: 400 });
      const years = Number(tenureYears);
      const freq = installmentFrequency === "Quarterly" ? "Quarterly" : "Monthly";
      numberOfInstallments = years * (freq === "Monthly" ? 12 : 4);
      if (numberOfInstallments <= 0) return NextResponse.json({ ok: false, error: "Invalid tenure" }, { status: 400 });
      if (downpaymentAmount <= 0) return NextResponse.json({ ok: false, error: "Downpayment required for installments" }, { status: 400 });
      const baseAmount = payableAfterDownpayment / numberOfInstallments;
      installmentAmount = Math.round(baseAmount * 100) / 100;
      let accumulated = 0;
      for (let i = 0; i < numberOfInstallments; i++) {
        const dueDate = iso(addMonths(installmentStart, i * (freq === "Monthly" ? 1 : 3)));
        let amount = installmentAmount;
        if (i === numberOfInstallments - 1) {
          amount = Math.round((payableAfterDownpayment - accumulated) * 100) / 100;
        }
        accumulated = Math.round((accumulated + amount) * 100) / 100;
        schedule.push({ dueDate, amount });
      }
    } else {
      numberOfInstallments = 0;
      installmentAmount = 0;
    }
    return NextResponse.json({
      ok: true,
      totalPrice,
      bookingAmount,
      downpaymentAmount,
      payableAfterDownpayment,
      installmentStartDate: iso(installmentStart),
      installmentAmount,
      numberOfInstallments,
      schedule,
    });
  } catch {
    return NextResponse.json({ ok: false, error: "Server error" }, { status: 500 });
  }
}
