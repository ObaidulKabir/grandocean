import { NextRequest, NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/db";
import Payment from "@/models/Payment";

export async function GET(_: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    await connectToDatabase();
    const list = await Payment.find({ bookingId: id }).sort({ dueDate: 1 }).lean();
    const today = new Date();
    const updated = [];
    for (const p of list) {
      if (p.status !== "Paid") {
        const dd = new Date((p.dueDate || "") + "T00:00:00.000Z");
        const status = today > dd ? "Overdue" : "Due";
        if (status !== p.status) {
          await Payment.findByIdAndUpdate(p._id, { status });
          p.status = status;
        }
      }
      updated.push(p);
    }
    return NextResponse.json({ ok: true, data: updated });
  } catch {
    return NextResponse.json({ ok: false, error: "Server error" }, { status: 500 });
  }
}
