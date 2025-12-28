"use client";
import { useUnits } from "@/context/UnitsContext";

export default function UnitDetailFallback({ id }: { id: string }) {
  const { units } = useUnits();
  const unit = units.find((u) => String(u._id) === String(id));
  if (!unit) {
    return (
      <section className="section">
        <div className="container">
          <h1 className="title">Unit details</h1>
          <div style={{ marginTop: 8 }}>
            Unable to load from database and no local unit found.
            Please return to Admin Units and try again when the connection is available.
          </div>
        </div>
      </section>
    );
  }
  return (
    <section className="section">
      <div className="container">
        <h1 className="title">Unit {unit.unitCode}</h1>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginTop: 12 }}>
          <div style={{ border: "1px solid rgba(11,60,93,0.15)", borderRadius: 12, padding: 12 }}>
            <div>Total size: {unit.totalAreaSqft} sqft</div>
            <div>Floor: {unit.floor}</div>
            <div>Quality: {unit.quality}</div>
            <div>View: {unit.viewType}</div>
            <div>Status: {unit.status}</div>
            <div>Size category: {unit.sizeCategory}</div>
            <div>Ownership: {unit.ownershipAllowed}</div>
          </div>
        </div>
      </div>
    </section>
  );
}
