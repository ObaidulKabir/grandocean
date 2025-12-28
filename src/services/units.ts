export type UnitCreateInput = {
  unitCode: string;
  floor: number;
  totalAreaSqft: number;
  sizeCategory: string;
  quality: string;
  viewType: string;
  ownershipAllowed: string;
  status: string;
  maxShares?: number;
  sharesSold?: number;
  basePrice?: number;
  pricePerSqft?: number;
  viewMarkupPercent?: number;
  qualityMarkupPercent?: number;
  floorMarkupPercent?: number;
};

export async function createUnit(input: UnitCreateInput) {
  const res = await fetch("/api/units", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(input),
  });
  const json = await res.json().catch(() => ({}));
  if (!res.ok) {
    throw new Error(json.error || "Failed to create unit");
  }
  return json.data;
}

export type UnitUpdateInput = Partial<UnitCreateInput> & { _id: string };

export async function updateUnit(id: string, input: UnitUpdateInput) {
  const res = await fetch(`/api/units/update`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ ...input, _id: id }),
  });
  const json = await res.json().catch(() => ({}));
  if (!res.ok) {
    throw new Error(json.error || "Failed to update unit");
  }
  return json.data;
}

export async function patchUnitStatus(id: string, status: string) {
  const res = await fetch(`/api/units/${id}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ status }),
  });
  const json = await res.json().catch(() => ({}));
  if (!res.ok) {
    throw new Error(json.error || "Failed to update status");
  }
  return json.data;
}
