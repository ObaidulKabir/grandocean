"use client";
import { useCallback, useEffect, useState } from "react";
import styles from "./AdminBookingDetail.module.css";
import { useParams } from "next/navigation";

export default function AdminBookingDetailPage() {
  const { id } = useParams<{ id: string }>();
  type BookingDetail = {
    data?: { bookingCode?: string; bookingStatus?: string; ownershipType?: string };
    customer?: { name?: string; phone?: string; email?: string; nationalIdOrPassport?: string };
    unit?: { unitCode?: string; finalPrice?: number; timeSharePrice?: number };
  } | null;
  const [data, setData] = useState<BookingDetail>(null);
  const [status, setStatus] = useState<string>("");
  const load = useCallback(async () => {
    const res = await fetch(`/api/bookings/${id}`);
    const json = await res.json();
    setData(json);
    setStatus(json.data?.bookingStatus || "");
  }, [id]);
  useEffect(() => { load(); }, [load]);
  const saveStatus = async () => {
    await fetch(`/api/bookings/${id}/status`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ bookingStatus: status }),
    });
    await load();
  };
  return (
    <section className={styles.section}>
      <div className={styles.container}>
        <h1 className="title">Admin: Booking {data?.data?.bookingCode}</h1>
        <div className={styles.grid}>
          <div className={styles.card}>
            <h3 className="title">Customer</h3>
            <div className={styles.row}>
              <div>Name: {data?.customer?.name}</div>
              <div>Phone: {data?.customer?.phone}</div>
              <div>Email: {data?.customer?.email}</div>
              <div>NID/Passport: {data?.customer?.nationalIdOrPassport}</div>
            </div>
          </div>
          <div className={styles.card}>
            <h3 className="title">Unit & Plan</h3>
            <div className={styles.row}>
              <div>Unit: {data?.unit?.unitCode}</div>
              <div>Ownership: {data?.data?.ownershipType}</div>
              <div>Final Price: {data?.unit?.finalPrice}</div>
              <div>Per Share Price: {data?.unit?.timeSharePrice}</div>
            </div>
            <div style={{ marginTop: 8 }}>
              <a href={`/admin/bookings/${id}/payments`} className={styles.link}>Manage Payments</a>
            </div>
          </div>
          <div className={styles.card}>
            <h3 className="title">Status</h3>
            <select value={status} onChange={(e) => setStatus(e.target.value)}>
              <option value="Initiated">Initiated</option>
              <option value="Booked">Booked</option>
              <option value="Allotted">Allotted</option>
              <option value="Completed">Completed</option>
              <option value="Cancelled">Cancelled</option>
            </select>
            <button className={styles.submit} onClick={saveStatus}>Save</button>
          </div>
        </div>
      </div>
    </section>
  );
}
