"use client";
import { useEffect, useState } from "react";
import styles from "./AdminBookings.module.css";

type Booking = {
  _id: string;
  bookingCode: string;
  bookingStatus: string;
  ownershipType: string;
  unitId: string;
  customerId: string;
};

export default function AdminBookingsPage() {
  const [status, setStatus] = useState<string>("");
  const [list, setList] = useState<Booking[]>([]);
  const load = async () => {
    const qs = status ? `?status=${status}` : "";
    const res = await fetch(`/api/bookings${qs}`);
    const json = await res.json();
    setList(json.data || []);
  };
  useEffect(() => {
    load();
  }, [status]);
  return (
    <section className={styles.section}>
      <div className={styles.container}>
        <h1 className="title">Admin: Bookings</h1>
        <div className={styles.card}>
          <div className={styles.filters}>
            <select value={status} onChange={(e) => setStatus(e.target.value)}>
              <option value="">All</option>
              <option value="Initiated">Initiated</option>
              <option value="Booked">Booked</option>
              <option value="Allotted">Allotted</option>
              <option value="Completed">Completed</option>
              <option value="Cancelled">Cancelled</option>
            </select>
            <button className={styles.submit} onClick={load}>Apply</button>
          </div>
          <table className={styles.table}>
            <thead>
              <tr>
                <th>Code</th>
                <th>Status</th>
                <th>Ownership</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {list.map((b) => (
                <tr key={b._id}>
                  <td>{b.bookingCode}</td>
                  <td>{b.bookingStatus}</td>
                  <td>{b.ownershipType}</td>
                  <td><a href={`/admin/bookings/${b._id}`} className={styles.link}>View</a></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </section>
  );
}
