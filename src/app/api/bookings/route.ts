import { NextRequest, NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/db";
import Booking from "@/models/Booking";
import Unit from "@/models/Unit";
import PaymentPlan from "@/models/PaymentPlan";
import Customer from "@/models/Customer";
import TimeShare from "@/models/TimeShare";

async function generateBookingCode() {
  const n = Math.floor(1 + Math.random() * 9999);
  const code = `BK-${String(n).padStart(4, "0")}`;
  const exists = await Booking.findOne({ bookingCode: code }).lean();
  if (exists) return generateBookingCode();
  return code;
}

export async function GET(req: NextRequest) {
  try {
    const url = new URL(req.url);
    const status = url.searchParams.get("status");
    await connectToDatabase();
    const q: any = {};
    if (status) q.bookingStatus = status;
    const items = await Booking.find(q).sort({ createdAt: -1 }).lean();
    return NextResponse.json({ ok: true, data: items });
  } catch {
    return NextResponse.json({ ok: false, error: "Server error" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { unitId, ownershipType, customerId, paymentPlanId, remarks } = body || {};
    if (!unitId || !ownershipType || !customerId || !paymentPlanId) {
      return NextResponse.json({ ok: false, error: "Missing required fields" }, { status: 400 });
    }
    await connectToDatabase();
    const unit = await Unit.findById(unitId);
    const plan = await PaymentPlan.findById(paymentPlanId);
    const customer = await Customer.findById(customerId);
    if (!unit || !plan || !customer) return NextResponse.json({ ok: false, error: "Invalid references" }, { status: 400 });
    if (ownershipType === "Full" && unit.status === "Sold") {
      return NextResponse.json({ ok: false, error: "Unit already sold" }, { status: 409 });
    }
    if (ownershipType === "TimeShare") {
      const max = unit.maxShares || 0;
      const sold = unit.sharesSold || 0;
      if (max && sold + 1 > max) {
        return NextResponse.json({ ok: false, error: "No shares remaining" }, { status: 409 });
      }
    }
    const bookingCode = await generateBookingCode();
    const created = await Booking.create({
      bookingCode,
      unitId,
      ownershipType,
      customerId,
      paymentPlanId,
      bookingStatus: "Initiated",
      bookingDate: new Date(),
      remarks,
    });
    return NextResponse.json({ ok: true, data: created }, { status: 201 });
  } catch {
    return NextResponse.json({ ok: false, error: "Server error" }, { status: 500 });
  }
}
