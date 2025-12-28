import { NextRequest, NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/db";
import Unit from "@/models/Unit";
import SuiteComponent from "@/models/SuiteComponent";
import TimeShare from "@/models/TimeShare";

function computeFinalPrice(input: any) {
  const base = Number(input?.basePrice) || 0;
  const vm = Number(input?.viewMarkupPercent) || 0;
  const qm = Number(input?.qualityMarkupPercent) || 0;
  const fm = Number(input?.floorMarkupPercent) || 0;
  const final =
    base +
    base * (vm / 100) +
    base * (qm / 100) +
    base * (fm / 100);
  return Math.max(0, Math.round(final * 100) / 100);
}

export async function POST(_: NextRequest) {
  try {
    await connectToDatabase();
    const samples = [
      {
        unitCode: "A-1001",
        floor: 10,
        totalAreaSqft: 950,
        sizeCategory: "2BR",
        quality: "Premium",
        viewType: "Sea View",
        ownershipAllowed: "Full",
        status: "Available",
        basePrice: 200000,
        pricePerSqft: 210,
        viewMarkupPercent: 5,
        qualityMarkupPercent: 10,
        floorMarkupPercent: 2,
      },
      {
        unitCode: "B-802",
        floor: 8,
        totalAreaSqft: 720,
        sizeCategory: "1BR",
        quality: "Regular",
        viewType: "Sea View",
        ownershipAllowed: "Both",
        status: "Available",
        basePrice: 150000,
        pricePerSqft: 195,
        viewMarkupPercent: 5,
        qualityMarkupPercent: 0,
        floorMarkupPercent: 1,
        maxShares: 12,
      },
      {
        unitCode: "C-503",
        floor: 5,
        totalAreaSqft: 480,
        sizeCategory: "Studio",
        quality: "Regular",
        viewType: "Hill View",
        ownershipAllowed: "TimeShare",
        status: "Available",
        basePrice: 120000,
        pricePerSqft: 180,
        viewMarkupPercent: 0,
        qualityMarkupPercent: 0,
        floorMarkupPercent: 0,
        maxShares: 8,
      },
    ];
    const createdUnits: any[] = [];
    for (const s of samples) {
      const finalPrice = computeFinalPrice(s);
      const maxShares = Number(s?.maxShares) || 0;
      const timeSharePrice = maxShares > 0 ? Math.round((finalPrice / maxShares) * 100) / 100 : 0;
      const u = await Unit.findOneAndUpdate(
        { unitCode: s.unitCode },
        { $set: { ...s, finalPrice, timeSharePrice } },
        { upsert: true, new: true }
      );
      createdUnits.push(u);
      const compCount = await SuiteComponent.countDocuments({ unitId: u._id });
      if (compCount === 0) {
        const defaults = [
          { componentName: "Bedroom", areaSqft: Math.round(u.totalAreaSqft * 0.35) },
          { componentName: "Living", areaSqft: Math.round(u.totalAreaSqft * 0.30) },
          { componentName: "Bathroom", areaSqft: Math.round(u.totalAreaSqft * 0.12) },
          { componentName: "Balcony", areaSqft: Math.round(u.totalAreaSqft * 0.10) },
        ];
        for (const d of defaults) {
          await SuiteComponent.create({ unitId: u._id, componentName: d.componentName, areaSqft: d.areaSqft });
        }
      }
    }
    const tsUnit = createdUnits.find((x) => x.ownershipAllowed === "Both" && x.maxShares);
    if (tsUnit) {
      const existingTS = await TimeShare.countDocuments({ unitId: tsUnit._id });
      if (existingTS === 0) {
        const tsSamples = [
          { ownerName: "Alice", ownerContact: "+880100000001", status: "Sold" },
          { ownerName: "Bob", ownerContact: "+880100000002", status: "Sold" },
          { ownerName: "Carol", ownerContact: "+880100000003", status: "Available" },
        ];
        for (const t of tsSamples) {
          const code = `TS-${Math.floor(1000 + Math.random() * 9000)}`;
          await TimeShare.create({
            unitId: tsUnit._id,
            ownerName: t.ownerName,
            ownerContact: t.ownerContact,
            shareCode: code,
            status: t.status,
            daysPerMonth: 3,
            daysPerYear: 36,
            bookingCalendar: [],
          });
        }
        const soldCount = tsSamples.filter((x) => x.status === "Sold").length;
        await Unit.findByIdAndUpdate(tsUnit._id, { sharesSold: soldCount });
      }
    }
    return NextResponse.json({ ok: true, count: createdUnits.length, units: createdUnits.map((u) => u.unitCode) });
  } catch (e) {
    return NextResponse.json({ ok: false, error: "Server error" }, { status: 500 });
  }
}
