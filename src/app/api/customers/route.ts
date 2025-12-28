import { NextRequest, NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/db";
import Customer from "@/models/Customer";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { name, phone, email, nationalIdOrPassport, address, country, notes } = body || {};
    if (!name || !phone) {
      return NextResponse.json({ ok: false, error: "Missing required fields" }, { status: 400 });
    }
    await connectToDatabase();
    const created = await Customer.create({ name, phone, email, nationalIdOrPassport, address, country, notes });
    return NextResponse.json({ ok: true, data: created }, { status: 201 });
  } catch {
    return NextResponse.json({ ok: false, error: "Server error" }, { status: 500 });
  }
}
