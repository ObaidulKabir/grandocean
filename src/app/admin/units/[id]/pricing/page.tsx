"use client";
import { useCallback, useEffect, useState } from "react";
import { useParams } from "next/navigation";
import styles from "./AdminPricing.module.css";

type Unit = {
  _id: string;
  unitCode: string;
  basePrice?: number;
  pricePerSqft?: number;
  viewMarkupPercent?: number;
  qualityMarkupPercent?: number;
  floorMarkupPercent?: number;
  finalPrice?: number;
  timeSharePrice?: number;
  maxShares?: number;
  ownershipAllowed: string;
};

export default function AdminPricingPage() {
  const { id: unitId } = useParams<{ id: string }>();
  const [unit, setUnit] = useState<Unit | null>(null);
  type UnitPricing = Partial<Unit> & {
    basePrice?: number;
    pricePerSqft?: number;
    viewMarkupPercent?: number;
    qualityMarkupPercent?: number;
    floorMarkupPercent?: number;
  };
  const [form, setForm] = useState<UnitPricing>({});
  const [promoOn, setPromoOn] = useState(false);
  const [promoPercent, setPromoPercent] = useState(0);
  const load = useCallback(async () => {
    const res = await fetch(`/api/units/${unitId}`);
    const json = await res.json();
    setUnit(json.data);
    setForm(json.data || {});
  }, [unitId]);
  useEffect(() => {
    load();
  }, [load]);
  const onChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const name = e.target.name;
    const val = e.target.type === "number" ? Number(e.target.value) : e.target.value;
    setForm({ ...form, [name]: val });
  };
  const save = async (e: React.FormEvent) => {
    e.preventDefault();
    if ((form.basePrice || 0) < 0) return alert("Base price cannot be negative");
    const mk = ["viewMarkupPercent", "qualityMarkupPercent", "floorMarkupPercent"];
    for (const k of mk) {
      const v = Number(form[k] || 0);
      if (v < 0 || v > 100) return alert("Markups must be between 0 and 100");
    }
    await fetch(`/api/units/${unitId}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });
    await load();
  };
  const discounted = promoOn ? Math.round(((unit?.finalPrice || 0) * (1 - (promoPercent || 0) / 100)) * 100) / 100 : unit?.finalPrice || 0;
  const tsPrice = unit?.maxShares ? Math.round(((unit?.finalPrice || 0) / (unit?.maxShares || 1)) * 100) / 100 : (unit?.timeSharePrice || 0);
  return (
    <section className={styles.section}>
      <div className={styles.container}>
        <h1 className="title">Admin: Pricing for Unit {unit?.unitCode}</h1>
        <div className={styles.card}>
          <form className={styles.form} onSubmit={save}>
            <input name="basePrice" type="number" placeholder="Base Price" value={form.basePrice || ""} onChange={onChange} />
            <input name="pricePerSqft" type="number" placeholder="Price per sqft" value={form.pricePerSqft || ""} onChange={onChange} />
            <input name="viewMarkupPercent" type="number" placeholder="View markup (%)" value={form.viewMarkupPercent || 0} onChange={onChange} />
            <input name="qualityMarkupPercent" type="number" placeholder="Quality markup (%)" value={form.qualityMarkupPercent || 0} onChange={onChange} />
            <input name="floorMarkupPercent" type="number" placeholder="Floor markup (%)" value={form.floorMarkupPercent || 0} onChange={onChange} />
            <button className={styles.submit} type="submit">Save</button>
          </form>
        </div>
        <div className={styles.card}>
          <div className={styles.row}>
            <div>
              <div><strong>Final Price:</strong> {unit?.finalPrice || 0}</div>
              <div><strong>Per Time-Share Price:</strong> {tsPrice}</div>
            </div>
            <div>
              <label style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <input type="checkbox" checked={promoOn} onChange={(e) => setPromoOn(e.target.checked)} />
                Promo discount (%)
              </label>
              <input type="number" value={promoPercent} onChange={(e) => setPromoPercent(Number(e.target.value))} placeholder="Discount %" />
              <div><strong>Discounted Final Price:</strong> {discounted}</div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
