import { NextRequest, NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/db";
import Booking from "@/models/Booking";
import PaymentPlan from "@/models/PaymentPlan";
import Payment from "@/models/Payment";

export async function POST(
  _: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params;
    await connectToDatabase();
    const booking = await Booking.findById(id).lean();
    if (!booking) return NextResponse.json({ ok: false, error: "Not found" }, { status: 404 });
    const plan = await PaymentPlan.findById(booking.paymentPlanId).lean();
    if (!plan) return NextResponse.json({ ok: false, error: "Plan not found" }, { status: 404 });
    const make = async (paymentType: "Booking" | "Downpayment" | "Installment", amount: number, dueDate: string) => {
      const today = new Date();
      const dd = new Date(dueDate + "T00:00:00.000Z");
      const status = today > dd ? "Overdue" : "Due";
      return Payment.create({
        bookingId: booking._id,
        paymentType,
        amount,
        dueDate,
        status,
        method: "Bank",
      });
    };
    await make("Booking", plan.bookingAmount, plan.schedule?.[0]?.dueDate || plan.createdAt?.toISOString()?.slice(0, 10) || new Date().toISOString().slice(0, 10));
    await make("Downpayment", plan.downpaymentAmount, plan.schedule?.[0]?.dueDate || new Date().toISOString().slice(0, 10));
    for (const s of plan.schedule || []) {
      await make("Installment", s.amount, s.dueDate);
    }
    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ ok: false, error: "Server error" }, { status: 500 });
  }
}
