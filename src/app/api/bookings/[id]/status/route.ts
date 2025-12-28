import { NextRequest, NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/db";
import Booking from "@/models/Booking";
import Unit from "@/models/Unit";

export async function PATCH(
  req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params;
    const body = await req.json();
    const { bookingStatus } = body || {};
    await connectToDatabase();
    const booking = await Booking.findById(id);
    if (!booking) return NextResponse.json({ ok: false, error: "Not found" }, { status: 404 });
    const unit = await Unit.findById(booking.unitId);
    if (!unit) return NextResponse.json({ ok: false, error: "Unit not found" }, { status: 404 });
    const prev = booking.bookingStatus;
    booking.bookingStatus = bookingStatus || prev;
    await booking.save();
    if (booking.ownershipType === "Full") {
      if (bookingStatus === "Booked") unit.status = "Booked";
      if (bookingStatus === "Completed") unit.status = "Sold";
      await unit.save();
    } else if (booking.ownershipType === "TimeShare") {
      if (bookingStatus === "Booked") {
        const max = unit.maxShares || 0;
        const sold = unit.sharesSold || 0;
        if (max && sold + 1 > max) {
          return NextResponse.json({ ok: false, error: "No shares remaining" }, { status: 409 });
        }
        unit.sharesSold = sold + 1;
        await unit.save();
      }
    }
    return NextResponse.json({ ok: true, data: booking.toObject() });
  } catch {
    return NextResponse.json({ ok: false, error: "Server error" }, { status: 500 });
  }
}
