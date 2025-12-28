"use client";
import { useEffect, useState } from "react";
import styles from "./BookingCalculator.module.css";

type PlanPreview = {
  totalPrice: number;
  bookingAmount: number;
  downpaymentAmount: number;
  payableAfterDownpayment: number;
  installmentStartDate?: string;
  installmentAmount?: number;
  numberOfInstallments?: number;
  schedule?: { dueDate: string; amount: number }[];
};

export default function BookingCalculator({ unitId }: { unitId: string }) {
  const [ownershipType, setOwnershipType] = useState<"Full" | "TimeShare">("Full");
  const [paymentMode, setPaymentMode] = useState<"OneTime" | "Installment">("OneTime");
  const [installmentFrequency, setInstallmentFrequency] = useState<"Monthly" | "Quarterly">("Monthly");
  const [tenureYears, setTenureYears] = useState<number>(1);
  const [preview, setPreview] = useState<PlanPreview | null>(null);
  const [error, setError] = useState<string>("");
  const [loading, setLoading] = useState(false);

  const recalc = async () => {
    setError("");
    setLoading(true);
    try {
      const res = await fetch("/api/payment-plans/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          unitId,
          ownershipType,
          paymentMode,
          tenureYears: paymentMode === "Installment" ? tenureYears : undefined,
          installmentFrequency,
        }),
      });
      const json = await res.json();
      if (!json.ok) {
        setError(json.error || "Failed to calculate");
        setPreview(null);
      } else {
        setPreview(json);
      }
    } catch {
      setError("Failed to calculate");
      setPreview(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    recalc();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [ownershipType, paymentMode, installmentFrequency, tenureYears]);

  const proceed = async () => {
    if (!preview) return;
    setShowForm(true);
  };
  const [showForm, setShowForm] = useState(false);
  const [customer, setCustomer] = useState({ name: "", phone: "", email: "", nationalIdOrPassport: "", address: "", country: "" });
  const onCustomerChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setCustomer({ ...customer, [e.target.name]: e.target.value });
  };
  const submitBooking = async (e: React.FormEvent) => {
    e.preventDefault();
    const planRes = await fetch("/api/payment-plans", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        unitId,
        ownershipType,
        paymentMode,
        installmentFrequency,
        tenureYears,
        totalPrice: preview!.totalPrice,
        bookingAmount: preview!.bookingAmount,
        downpaymentAmount: preview!.downpaymentAmount,
        installmentAmount: preview!.installmentAmount,
        numberOfInstallments: preview!.numberOfInstallments,
        schedule: preview!.schedule,
      }),
    });
    if (!planRes.ok) return alert("Failed to save plan");
    const planJson = await planRes.json();
    const custRes = await fetch("/api/customers", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(customer),
    });
    if (!custRes.ok) return alert("Failed to save customer");
    const custJson = await custRes.json();
    const bookingRes = await fetch("/api/bookings", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        unitId,
        ownershipType,
        customerId: custJson.data._id,
        paymentPlanId: planJson.data._id,
      }),
    });
    if (!bookingRes.ok) return alert("Failed to create booking");
    const bookingJson = await bookingRes.json();
    await fetch(`/api/bookings/${bookingJson.data._id}/payments/generate`, { method: "POST" });
    setShowForm(false);
    setConfirmation({
      bookingCode: bookingJson.data.bookingCode,
      ownershipType,
      totalPrice: preview!.totalPrice,
      bookingAmount: preview!.bookingAmount,
      downpaymentAmount: preview!.downpaymentAmount,
      numberOfInstallments: preview!.numberOfInstallments || 0,
    });
  };
  const [confirmation, setConfirmation] = useState<any>(null);

  return (
    <div className={styles.card}>
      <h3 className="title">Booking & Payment Calculator</h3>
      <div className={styles.form}>
        <select value={ownershipType} onChange={(e) => setOwnershipType(e.target.value as any)}>
          <option value="Full">Full</option>
          <option value="TimeShare">Time-Share</option>
        </select>
        <select value={paymentMode} onChange={(e) => setPaymentMode(e.target.value as any)}>
          <option value="OneTime">One-time</option>
          <option value="Installment">Installments</option>
        </select>
        <select value={installmentFrequency} onChange={(e) => setInstallmentFrequency(e.target.value as any)} disabled={paymentMode !== "Installment"}>
          <option value="Monthly">Monthly</option>
          <option value="Quarterly">Quarterly</option>
        </select>
        <select value={tenureYears} onChange={(e) => setTenureYears(Number(e.target.value))} disabled={paymentMode !== "Installment"}>
          <option value={1}>1 year</option>
          <option value={2}>2 years</option>
          <option value={3}>3 years</option>
        </select>
      </div>
      {error && <div className={styles.warn}>{error}</div>}
      {loading && <div>Calculating…</div>}
      {preview && (
        <>
          <div style={{ marginTop: 8 }}>
            <div><strong>Unit/full-share price:</strong> {preview.totalPrice}</div>
            <div><strong>Booking money (10%):</strong> {preview.bookingAmount}</div>
            <div><strong>Downpayment (30%):</strong> {preview.downpaymentAmount}</div>
            <div><strong>Remaining payable:</strong> {preview.payableAfterDownpayment}</div>
            {paymentMode === "Installment" && (
              <>
                <div><strong>Installment amount:</strong> {preview.installmentAmount}</div>
                <div><strong>Number of installments:</strong> {preview.numberOfInstallments}</div>
                <div><strong>Installment start date:</strong> {preview.installmentStartDate}</div>
              </>
            )}
          </div>
          {paymentMode === "Installment" && (
            <table className={styles.table}>
              <thead>
                <tr>
                  <th>Due date</th>
                  <th>Amount</th>
                </tr>
              </thead>
              <tbody>
                {(preview.schedule || []).slice(0, 12).map((i, idx) => (
                  <tr key={idx}>
                    <td>{i.dueDate}</td>
                    <td>{i.amount}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
          <button className={styles.submit} onClick={proceed}>Proceed to Booking</button>
        </>
      )}
      {showForm && (
        <div style={{ marginTop: 12, border: "1px solid rgba(11,60,93,0.15)", borderRadius: 12, padding: 12 }}>
          <h4 className="title">Booking Details</h4>
          <form className={styles.form} onSubmit={submitBooking}>
            <input name="name" placeholder="Full name" value={customer.name} onChange={onCustomerChange} required />
            <input name="phone" placeholder="Phone" value={customer.phone} onChange={onCustomerChange} required />
            <input name="email" placeholder="Email" value={customer.email} onChange={onCustomerChange} />
            <input name="nationalIdOrPassport" placeholder="NID/Passport" value={customer.nationalIdOrPassport} onChange={onCustomerChange} />
            <input name="address" placeholder="Address" value={customer.address} onChange={onCustomerChange} />
            <input name="country" placeholder="Country" value={customer.country} onChange={onCustomerChange} />
            <button className={styles.submit} type="submit">Confirm Booking</button>
          </form>
        </div>
      )}
      {confirmation && (
        <div style={{ marginTop: 12, border: "1px solid rgba(11,60,93,0.15)", borderRadius: 12, padding: 12 }}>
          <h4 className="title">Booking Confirmation</h4>
          <div><strong>Booking Code:</strong> {confirmation.bookingCode}</div>
          <div><strong>Ownership:</strong> {confirmation.ownershipType}</div>
          <div><strong>Total Price:</strong> {confirmation.totalPrice}</div>
          <div><strong>Booking Money:</strong> {confirmation.bookingAmount}</div>
          <div><strong>Downpayment:</strong> {confirmation.downpaymentAmount}</div>
          <div><strong>Installments:</strong> {confirmation.numberOfInstallments}</div>
          <a href="#" style={{ color: "var(--blue)" }}>Download Provisional Allotment Letter</a>
        </div>
      )}
    </div>
  );
}
