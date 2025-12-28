import { NextRequest, NextResponse } from "next/server";
import mongoose from "mongoose";
import { connectToDatabase } from "@/lib/db";
import { getConfig } from "@/lib/config";

export async function GET(_: NextRequest) {
  try {
    await connectToDatabase();
    const state = mongoose.connection.readyState; // 1 = connected
    const { mongodbDbName } = getConfig();
    return NextResponse.json({
      ok: true,
      state,
      dbName: mongodbDbName,
    });
  } catch {
    return NextResponse.json({ ok: false, error: "Database unavailable" }, { status: 500 });
  }
}
