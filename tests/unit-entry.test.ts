import { describe, it, expect, beforeAll, afterAll } from "vitest";
import { MongoMemoryServer } from "mongodb-memory-server";
import mongoose from "mongoose";
import { connectToDatabase } from "@/lib/db";
import Unit from "@/models/Unit";
import { POST as UnitsPost } from "@/app/api/units/route";
import { GET as UnitGet } from "@/app/api/units/[id]/route";

describe("Unit Entry API", () => {
  let mongod: MongoMemoryServer;
  beforeAll(async () => {
    mongod = await MongoMemoryServer.create();
    process.env.MONGODB_URI = mongod.getUri("unitech_grand_ocean");
    await connectToDatabase();
  });
  afterAll(async () => {
    await mongoose.connection.close();
    await mongod.stop();
  });

  it("creates a unit and computes pricing fields", async () => {
    const payload = {
      unitCode: "TEST-UNIT-API-01",
      floor: 3,
      totalAreaSqft: 500,
      sizeCategory: "1BR",
      quality: "Premium",
      viewType: "Sea View",
      ownershipAllowed: "Both",
      status: "Available",
      maxShares: 10,
      basePrice: 100000,
      pricePerSqft: 200,
      viewMarkupPercent: 5,
      qualityMarkupPercent: 10,
      floorMarkupPercent: 2,
    };
    const req = new Request("http://localhost/api/units", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    const res = await UnitsPost(req as any);
    const json = await res.json();
    expect(json.ok).toBe(true);
    expect(json.data.finalPrice).toBeGreaterThan(0);
    expect(json.data.timeSharePrice).toBeGreaterThan(0);
    expect(json.data.unitCode).toBe(payload.unitCode);

    const id = json.data._id;
    const getRes = await UnitGet({} as any, { params: { id } });
    const getJson = await getRes.json();
    expect(getJson.ok).toBe(true);
    expect(getJson.data._id).toBe(id);
    expect(getJson.data.finalPrice).toBe(json.data.finalPrice);
  });

  it("enforces sharesSold <= maxShares on update", async () => {
    const u = await Unit.create({
      unitCode: "TEST-UNIT-API-02",
      floor: 4,
      totalAreaSqft: 600,
      sizeCategory: "1BR",
      quality: "Regular",
      viewType: "Hill View",
      ownershipAllowed: "TimeShare",
      status: "Available",
      maxShares: 2,
      sharesSold: 1,
      basePrice: 90000,
      viewMarkupPercent: 0,
      qualityMarkupPercent: 0,
      floorMarkupPercent: 0,
      finalPrice: 90000,
      timeSharePrice: 45000,
    });
    const badReq = new Request(`http://localhost/api/units/${u._id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ sharesSold: 3, maxShares: 2, basePrice: 90000 }),
    });
    const badRes = await (await import("@/app/api/units/[id]/route")).PATCH(badReq as any, { params: { id: String(u._id) } });
    const badJson = await badRes.json();
    expect(badJson.ok).toBe(false);
    expect(badRes.status).toBe(400);
  });
});
