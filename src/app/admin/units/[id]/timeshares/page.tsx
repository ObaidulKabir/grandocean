"use client";
import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import styles from "./AdminTimeShares.module.css";

type Unit = {
  _id: string;
  unitCode: string;
  ownershipAllowed: string;
  maxShares?: number;
  sharesSold?: number;
};
type TimeShare = {
  _id: string;
  unitId: string;
  ownerName?: string;
  ownerContact?: string;
  shareCode: string;
  daysPerMonth: number;
  daysPerYear: number;
  status: "Available" | "Reserved" | "Sold";
  bookingCalendar: string[];
};

export default function AdminUnitTimeSharesPage() {
  const { id: unitId } = useParams<{ id: string }>();
  const [unit, setUnit] = useState<Unit | null>(null);
  const [list, setList] = useState<TimeShare[]>([]);
  const [newItem, setNewItem] = useState({ ownerName: "", ownerContact: "", status: "Available" });
  const [bookDates, setBookDates] = useState<Record<string, string>>({});
  const load = async () => {
    const res = await fetch(`/api/units/${unitId}/timeshares`);
    const json = await res.json();
    setUnit(json.unit);
    setList(json.data || []);
  };
  useEffect(() => {
    load();
  }, []);
  const addShare = async (e: React.FormEvent) => {
    e.preventDefault();
    const res = await fetch(`/api/units/${unitId}/timeshares`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(newItem),
    });
    if (res.ok) {
      setNewItem({ ownerName: "", ownerContact: "", status: "Available" });
      await load();
    }
  };
  const updateShare = async (ts: TimeShare) => {
    await fetch(`/api/timeshares/${ts._id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ownerName: ts.ownerName, ownerContact: ts.ownerContact, status: ts.status }),
    });
    await load();
  };
  const deleteShare = async (id: string) => {
    await fetch(`/api/timeshares/${id}`, { method: "DELETE" });
    await load();
  };
  const bookDays = async (id: string) => {
    const input = bookDates[id] || "";
    const dates = input.split(",").map((x) => x.trim()).filter(Boolean);
    if (!dates.length) return;
    const res = await fetch(`/api/timeshares/${id}/book-days`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ dates }),
    });
    await load();
  };
  const sold = unit?.sharesSold || 0;
  const max = unit?.maxShares || 0;
  const remaining = max ? Math.max(0, max - sold) : 0;
  return (
    <section className={styles.section}>
      <div className={styles.container}>
        <h1 className="title">Admin: Time-Shares for Unit {unit?.unitCode}</h1>
        <div className={styles.card}>
          <div>Ownership allowed: {unit?.ownershipAllowed}</div>
          <div style={{ display: "flex", alignItems: "center", gap: 8, marginTop: 8 }}>
            <div className={styles.progressWrap}>
              <div className={styles.progressBar} style={{ width: `${max ? Math.round(((sold) / max) * 100) : 0}%` }} />
            </div>
            <div style={{ fontWeight: 600 }}>{sold} of {max || 0} shares sold</div>
          </div>
          {max && remaining === 0 && (
            <div className={styles.warn}>No shares remaining</div>
          )}
        </div>
        <div className={styles.grid}>
          <div className={styles.card}>
            <h3 className="title">Add Time-Share</h3>
            <form className={styles.form} onSubmit={addShare}>
              <input placeholder="Owner name" value={newItem.ownerName} onChange={(e) => setNewItem({ ...newItem, ownerName: e.target.value })} />
              <input placeholder="Owner contact" value={newItem.ownerContact} onChange={(e) => setNewItem({ ...newItem, ownerContact: e.target.value })} />
              <select value={newItem.status} onChange={(e) => setNewItem({ ...newItem, status: e.target.value })}>
                <option value="Available">Available</option>
                <option value="Reserved">Reserved</option>
                <option value="Sold">Sold</option>
              </select>
              <button className={styles.submit} type="submit">Create</button>
            </form>
          </div>
          <div className={styles.card}>
            <h3 className="title">Time-Shares</h3>
            <table className={styles.table}>
              <thead>
                <tr>
                  <th>Code</th>
                  <th>Owner</th>
                  <th>Contact</th>
                  <th>Status</th>
                  <th>Booked</th>
                  <th>Remaining</th>
                  <th>Assign Days</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {list.map((t) => {
                  const booked = t.bookingCalendar?.length || 0;
                  const remainingYear = (t.daysPerYear || 36) - booked;
                  return (
                    <tr key={t._id}>
                      <td>{t.shareCode}</td>
                      <td>
                        <input className={styles.cellInput} defaultValue={t.ownerName || ""} onBlur={(e) => updateShare({ ...t, ownerName: e.target.value })} />
                      </td>
                      <td>
                        <input className={styles.cellInput} defaultValue={t.ownerContact || ""} onBlur={(e) => updateShare({ ...t, ownerContact: e.target.value })} />
                      </td>
                      <td>
                        <select defaultValue={t.status} onChange={(e) => updateShare({ ...t, status: e.target.value as any })}>
                          <option value="Available">Available</option>
                          <option value="Reserved">Reserved</option>
                          <option value="Sold">Sold</option>
                        </select>
                      </td>
                      <td>{booked}</td>
                      <td>{remainingYear}</td>
                      <td>
                        <input
                          className={styles.cellInput}
                          placeholder="YYYY-MM-DD,YYYY-MM-DD"
                          value={bookDates[t._id] || ""}
                          onChange={(e) => setBookDates({ ...bookDates, [t._id]: e.target.value })}
                        />
                        <button className={styles.submit} onClick={() => bookDays(t._id)}>Book</button>
                      </td>
                      <td>
                        <button className={styles.delete} onClick={() => deleteShare(t._id)}>Delete</button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </section>
  );
}
