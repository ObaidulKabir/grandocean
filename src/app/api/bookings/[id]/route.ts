import { NextRequest, NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/db";
import Booking from "@/models/Booking";
import Unit from "@/models/Unit";
import Customer from "@/models/Customer";
import PaymentPlan from "@/models/PaymentPlan";

export async function GET(_: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    await connectToDatabase();
    const booking = await Booking.findById(id).lean();
    if (!booking) return NextResponse.json({ ok: false, error: "Not found" }, { status: 404 });
    const unit = await Unit.findById(booking.unitId).lean();
    const customer = await Customer.findById(booking.customerId).lean();
    const plan = await PaymentPlan.findById(booking.paymentPlanId).lean();
    return NextResponse.json({ ok: true, data: booking, unit, customer, plan });
  } catch {
    return NextResponse.json({ ok: false, error: "Server error" }, { status: 500 });
  }
}
