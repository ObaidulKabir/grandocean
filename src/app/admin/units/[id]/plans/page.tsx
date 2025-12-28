"use client";
import { useCallback, useEffect, useState } from "react";
import { useParams } from "next/navigation";
import styles from "./AdminPlans.module.css";

type Unit = {
  _id: string;
  unitCode: string;
  finalPrice?: number;
  timeSharePrice?: number;
  ownershipAllowed: "Full" | "TimeShare" | "Both";
};
type Plan = {
  _id: string;
  ownershipType: "Full" | "TimeShare";
  totalPrice: number;
  bookingPercent: number;
  downpaymentPercent: number;
  paymentMode: "OneTime" | "Installment";
  installmentFrequency?: "Monthly" | "Quarterly";
  tenureYears?: number;
  bookingAmount?: number;
  downpaymentAmount?: number;
  installmentAmount?: number;
  numberOfInstallments?: number;
  schedule?: Array<{ dueDate: string; amount: number }>;
};

export default function AdminUnitPlansPage() {
  const { id: unitId } = useParams<{ id: string }>();
  const [unit, setUnit] = useState<Unit | null>(null);
  const [plans, setPlans] = useState<Plan[]>([]);
  const [form, setForm] = useState<{
    ownershipType: "Full" | "TimeShare";
    paymentMode: "OneTime" | "Installment";
    bookingPercent: number;
    downpaymentPercent: number;
    installmentFrequency: "Monthly" | "Quarterly";
    tenureYears: number;
  }>({
    ownershipType: "Full",
    paymentMode: "OneTime",
    bookingPercent: 10,
    downpaymentPercent: 30,
    installmentFrequency: "Monthly",
    tenureYears: 1,
  });
  const [preview, setPreview] = useState<{
    totalPrice: number;
    bookingAmount: number;
    downpaymentAmount: number;
    installmentAmount: number;
    numberOfInstallments: number;
    installmentStartDate?: string;
    schedule?: Array<{ dueDate: string; amount: number }>;
  } | null>(null);

  const load = useCallback(async () => {
    const ures = await fetch(`/api/units/${unitId}`);
    const ujson = await ures.json();
    setUnit(ujson.data);
    const pres = await fetch(`/api/payment-plans?unitId=${unitId}`);
    const pjson = await pres.json();
    setPlans(pjson.data || []);
  }, [unitId]);
  useEffect(() => {
    load();
  }, [load]);

  const onChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const val = e.target.type === "number" ? Number(e.target.value) : e.target.value;
    setForm({ ...form, [e.target.name]: val });
  };

  const generate = async (e: React.FormEvent) => {
    e.preventDefault();
    const body = {
      unitId,
      ownershipType: form.ownershipType,
      paymentMode: form.paymentMode,
      tenureYears: form.tenureYears,
      installmentFrequency: form.installmentFrequency,
      bookingPercent: form.bookingPercent,
      downpaymentPercent: form.downpaymentPercent,
    };
    const res = await fetch(`/api/payment-plans/generate`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
    const json = await res.json();
    if (res.ok) setPreview(json);
    else alert(json.error || "Failed to generate");
  };

  const save = async () => {
    if (!preview) return;
    const totalPrice = preview.totalPrice;
    const body = {
      unitId,
      ownershipType: form.ownershipType,
      totalPrice,
      bookingPercent: form.bookingPercent,
      downpaymentPercent: form.downpaymentPercent,
      paymentMode: form.paymentMode,
      installmentFrequency: form.installmentFrequency,
      tenureYears: form.tenureYears,
      bookingAmount: preview.bookingAmount,
      downpaymentAmount: preview.downpaymentAmount,
      installmentAmount: preview.installmentAmount,
      numberOfInstallments: preview.numberOfInstallments,
      schedule: preview.schedule,
    };
    const res = await fetch(`/api/payment-plans`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
    const json = await res.json();
    if (res.ok) {
      setPreview(null);
      await load();
    } else {
      alert(json.error || "Failed to save plan");
    }
  };

  const remove = async (id: string) => {
    await fetch(`/api/payment-plans/${id}`, { method: "DELETE" });
    await load();
  };

  const allowed = {
    full: unit?.ownershipAllowed === "Full" || unit?.ownershipAllowed === "Both",
    ts: unit?.ownershipAllowed === "TimeShare" || unit?.ownershipAllowed === "Both",
  };

  return (
    <section className={styles.section}>
      <div className={styles.container}>
        <h1 className="title">Admin: Plans for Unit {unit?.unitCode}</h1>
        <div className={styles.grid}>
          <div className={styles.card}>
            <h3 className="title">New Plan</h3>
            <form className={styles.form} onSubmit={generate}>
              <select name="ownershipType" value={form.ownershipType} onChange={onChange}>
                <option value="Full" disabled={!allowed.full}>Full</option>
                <option value="TimeShare" disabled={!allowed.ts}>TimeShare</option>
              </select>
              <select name="paymentMode" value={form.paymentMode} onChange={onChange}>
                <option value="OneTime">One-Time</option>
                <option value="Installment">Installment</option>
              </select>
              <select name="installmentFrequency" value={form.installmentFrequency} onChange={onChange}>
                <option value="Monthly">Monthly</option>
                <option value="Quarterly">Quarterly</option>
              </select>
              <input name="tenureYears" type="number" placeholder="Tenure (years)" value={form.tenureYears} onChange={onChange} />
              <input name="bookingPercent" type="number" placeholder="Booking %" value={form.bookingPercent} onChange={onChange} />
              <input name="downpaymentPercent" type="number" placeholder="Downpayment %" value={form.downpaymentPercent} onChange={onChange} />
              <button className={styles.submit} type="submit">Generate</button>
            </form>
            {preview && (
              <div style={{ marginTop: 12 }}>
                <div><strong>Total Price:</strong> {preview.totalPrice}</div>
                <div><strong>Booking Amount:</strong> {preview.bookingAmount}</div>
                <div><strong>Downpayment Amount:</strong> {preview.downpaymentAmount}</div>
                {preview.numberOfInstallments > 0 && (
                  <>
                    <div><strong>Installments:</strong> {preview.numberOfInstallments} × {preview.installmentAmount}</div>
                    <div><strong>First Due:</strong> {preview.installmentStartDate}</div>
                  </>
                )}
                <button className={styles.submit} onClick={save} style={{ marginTop: 8 }}>Save Plan</button>
              </div>
            )}
          </div>
          <div className={styles.card}>
            <h3 className="title">Existing Plans</h3>
            <table className={styles.table}>
              <thead>
                <tr>
                  <th>Ownership</th>
                  <th>Mode</th>
                  <th>Total</th>
                  <th>Booking%</th>
                  <th>Down%</th>
                  <th>Installments</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {plans.map((p) => (
                  <tr key={p._id}>
                    <td>{p.ownershipType}</td>
                    <td>{p.paymentMode}</td>
                    <td>{p.totalPrice}</td>
                    <td>{p.bookingPercent}</td>
                    <td>{p.downpaymentPercent}</td>
                    <td>{p.numberOfInstallments || 0}</td>
                    <td>
                      <button className={styles.submit} onClick={() => remove(p._id)}>Delete</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </section>
  );
}
