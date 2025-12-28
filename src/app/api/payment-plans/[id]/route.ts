import { NextRequest, NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/db";
import PaymentPlan from "@/models/PaymentPlan";

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const body = await req.json();
    await connectToDatabase();
    const updated = await PaymentPlan.findByIdAndUpdate(id, body, { new: true });
    return NextResponse.json({ ok: true, data: updated });
  } catch {
    return NextResponse.json({ ok: false, error: "Server error" }, { status: 500 });
  }
}

export async function DELETE(_: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    await connectToDatabase();
    await PaymentPlan.findByIdAndDelete(id);
    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ ok: false, error: "Server error" }, { status: 500 });
  }
}
