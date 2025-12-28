"use client";
import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import styles from "./AdminBookingPayments.module.css";

type Payment = {
  _id: string;
  paymentType: string;
  amount: number;
  dueDate: string;
  paidDate?: string;
  status: string;
  method?: string;
  referenceNo?: string;
};

export default function AdminBookingPaymentsPage() {
  const { id } = useParams<{ id: string }>();
  const [list, setList] = useState<Payment[]>([]);
  const [methods, setMethods] = useState<Record<string, string>>({});
  const [refs, setRefs] = useState<Record<string, string>>({});
  const load = async () => {
    const res = await fetch(`/api/bookings/${id}/payments`);
    const json = await res.json();
    setList(json.data || []);
  };
  useEffect(() => { load(); }, []);
  const markPaid = async (pid: string) => {
    await fetch(`/api/payments/${pid}/pay`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ method: methods[pid] || "Bank", referenceNo: refs[pid] || "" }),
    });
    await load();
  };
  return (
    <section className={styles.section}>
      <div className={styles.container}>
        <h1 className="title">Admin: Payments</h1>
        <div className={styles.card}>
          <table className={styles.table}>
            <thead>
              <tr>
                <th>Type</th>
                <th>Due date</th>
                <th>Amount</th>
                <th>Status</th>
                <th>Method</th>
                <th>Reference</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {list.map((p) => (
                <tr key={p._id}>
                  <td>{p.paymentType}</td>
                  <td>{p.dueDate}</td>
                  <td>{p.amount}</td>
                  <td>{p.status}</td>
                  <td>
                    <select value={methods[p._id] || "Bank"} onChange={(e) => setMethods({ ...methods, [p._id]: e.target.value })} disabled={p.status === "Paid"}>
                      <option value="Bank">Bank</option>
                      <option value="Card">Card</option>
                      <option value="MFS">MFS</option>
                      <option value="Cash">Cash</option>
                      <option value="Cheque">Cheque</option>
                    </select>
                  </td>
                  <td>
                    <input value={refs[p._id] || ""} onChange={(e) => setRefs({ ...refs, [p._id]: e.target.value })} disabled={p.status === "Paid"} />
                  </td>
                  <td>
                    {p.status !== "Paid" ? (
                      <button className={styles.submit} onClick={() => markPaid(p._id)}>Mark Paid</button>
                    ) : (
                      <span>Paid on {p.paidDate}</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </section>
  );
}
