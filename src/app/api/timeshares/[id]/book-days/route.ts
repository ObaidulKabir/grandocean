import { NextRequest, NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/db";
import TimeShare from "@/models/TimeShare";

function normalize(d: string) {
  const m = d.match(/^(\d{4})-(\d{2})-(\d{2})$/);
  if (!m) return null;
  return `${m[1]}-${m[2]}-${m[3]}`;
}

export async function POST(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const body = await req.json();
    const dates: string[] = Array.isArray(body?.dates) ? body.dates : [];
    await connectToDatabase();
    const ts = await TimeShare.findById(params.id);
    if (!ts) return NextResponse.json({ ok: false, error: "Not found" }, { status: 404 });
    const incoming = dates.map(normalize).filter((x) => !!x) as string[];
    if (!incoming.length) return NextResponse.json({ ok: false, error: "No valid dates provided" }, { status: 400 });
    const existingSet = new Set(ts.bookingCalendar || []);
    for (const d of incoming) {
      if (existingSet.has(d)) {
        return NextResponse.json({ ok: false, error: "Duplicate date" }, { status: 409 });
      }
    }
    const byMonth: Record<string, number> = {};
    const byYear: Record<string, number> = {};
    const countExistingMonth: Record<string, number> = {};
    const countExistingYear: Record<string, number> = {};
    for (const d of ts.bookingCalendar || []) {
      const ym = d.slice(0, 7);
      const y = d.slice(0, 4);
      countExistingMonth[ym] = (countExistingMonth[ym] || 0) + 1;
      countExistingYear[y] = (countExistingYear[y] || 0) + 1;
    }
    for (const d of incoming) {
      const ym = d.slice(0, 7);
      const y = d.slice(0, 4);
      byMonth[ym] = (byMonth[ym] || 0) + 1;
      byYear[y] = (byYear[y] || 0) + 1;
    }
    for (const [ym, add] of Object.entries(byMonth)) {
      const total = (countExistingMonth[ym] || 0) + add;
      if (total > (ts.daysPerMonth || 3)) {
        return NextResponse.json({ ok: false, error: "Monthly booking limit exceeded" }, { status: 409 });
      }
    }
    for (const [y, add] of Object.entries(byYear)) {
      const total = (countExistingYear[y] || 0) + add;
      if (total > (ts.daysPerYear || 36)) {
        return NextResponse.json({ ok: false, error: "Yearly booking limit exceeded" }, { status: 409 });
      }
    }
    const siblings = await TimeShare.find({ unitId: ts.unitId, _id: { $ne: ts._id } }, { bookingCalendar: 1 }).lean();
    const otherSet = new Set<string>();
    for (const s of siblings) {
      for (const d of s.bookingCalendar || []) otherSet.add(d);
    }
    for (const d of incoming) {
      if (otherSet.has(d)) {
        return NextResponse.json({ ok: false, error: "Date overlaps with another owner" }, { status: 409 });
      }
    }
    ts.bookingCalendar = [...(ts.bookingCalendar || []), ...incoming];
    await ts.save();
    return NextResponse.json({ ok: true, data: ts.toObject() });
  } catch {
    return NextResponse.json({ ok: false, error: "Server error" }, { status: 500 });
  }
}
