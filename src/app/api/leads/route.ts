import { NextResponse } from "next/server";
import Lead from "@/models/Lead";
import { connectToDatabase } from "@/lib/db";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { name, mobile, email, city, message } = body || {};
    if (!name || !mobile) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }
    await connectToDatabase();
    const lead = await Lead.create({ name, mobile, email, city, message });
    return NextResponse.json({ ok: true, id: lead._id }, { status: 201 });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}

