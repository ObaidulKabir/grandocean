import { NextRequest, NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/db";
import Payment from "@/models/Payment";
import Booking from "@/models/Booking";
import Unit from "@/models/Unit";

export async function POST(
  req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params;
    const body = await req.json();
    const { method = "Bank", referenceNo } = body || {};
    await connectToDatabase();
    const payment = await Payment.findById(id);
    if (!payment) return NextResponse.json({ ok: false, error: "Not found" }, { status: 404 });
    payment.method = method;
    if (referenceNo) payment.referenceNo = referenceNo;
    payment.paidDate = new Date().toISOString().slice(0, 10);
    payment.status = "Paid";
    await payment.save();
    const booking = await Booking.findById(payment.bookingId);
    if (!booking) return NextResponse.json({ ok: true });
    const unit = await Unit.findById(booking.unitId);
    if (payment.paymentType === "Booking") {
      booking.bookingStatus = "Booked";
      await booking.save();
      if (booking.ownershipType === "Full") {
        unit!.status = "Booked";
        await unit!.save();
      } else if (booking.ownershipType === "TimeShare") {
        const max = unit!.maxShares || 0;
        const sold = unit!.sharesSold || 0;
        if (!max || sold + 1 <= max) {
          unit!.sharesSold = sold + 1;
          await unit!.save();
        }
      }
    }
    if (payment.paymentType === "Downpayment") {
      booking.bookingStatus = "Allotted";
      await booking.save();
    }
    if (payment.paymentType === "Installment") {
      const remain = await Payment.countDocuments({ bookingId: booking._id, paymentType: "Installment", status: { $ne: "Paid" } });
      if (remain === 0) {
        booking.bookingStatus = "Completed";
        await booking.save();
        if (booking.ownershipType === "Full") {
          unit!.status = "Sold";
          await unit!.save();
        }
      }
    }
    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ ok: false, error: "Server error" }, { status: 500 });
  }
}
