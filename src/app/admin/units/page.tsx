"use client";
import { useMemo, useState } from "react";
import styles from "./AdminUnits.module.css";
import { useUnits } from "@/context/UnitsContext";
import type { Unit } from "@/context/UnitsContext";

const sizeOptions = ["Studio", "1BR", "2BR", "3BR"];
const qualityOptions = ["Premium", "Regular"];
const viewOptions = ["Sea View", "Hill View", "Other"];
const ownershipOptions = ["Full", "TimeShare", "Both"];
const statusOptions = ["Available", "Hold", "Booked", "Sold"];

function AdminUnitsContent() {
  const { units, dbStatus, loadUnits, createUnit, updateStatus, saveEdit } = useUnits();
  const [unitsState] = useState<Unit[]>(units);
  const [editing, setEditing] = useState<Unit | null>(null);
  const [editError, setEditError] = useState<string>("");
  const [filters, setFilters] = useState({
    floor: "",
    viewType: "",
    sizeCategory: "",
    quality: "",
    status: "",
  });
  const [form, setForm] = useState<Unit>({
    unitCode: "",
    floor: 1,
    totalAreaSqft: 400,
    maxShares: undefined,
    sharesSold: 0,
    sizeCategory: "Studio",
    quality: "Premium",
    viewType: "Sea View",
    ownershipAllowed: "Full",
    status: "Available",
  });
  const onChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setForm({ ...form, [e.target.name]: e.target.type === "number" ? Number(e.target.value) : e.target.value });
  };
  const onCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    await createUnit(form);
    setForm({
      unitCode: "",
      floor: 1,
      totalAreaSqft: 400,
      sizeCategory: "Studio",
      quality: "Premium",
      viewType: "Sea View",
      ownershipAllowed: "Full",
      status: "Available",
    });
  };
  const filtered = useMemo(() => {
    return units;
  }, [units]);
  const openEdit = async (u: Unit) => {
    setEditing(u);
    try {
      const res = await fetch(`/api/units/${u._id}`);
      const json = await res.json();
      if (res.ok && json.data) setEditing(json.data);
    } catch {}
  };
  const onEditChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    if (!editing) return;
    const val = e.target.type === "number" ? Number(e.target.value) : e.target.value;
    setEditing({ ...editing, [e.target.name]: val } as Unit);
  };
  const onSaveEditing = async () => {
    if (!editing) return;
    setEditError("");
    const ok = await saveEdit(editing as any);
    if (ok) {
      setEditing(null);
      await loadUnits(filters);
    } else {
      setEditError("Save failed. Please check required fields or try again.");
    }
  };
  return (
    <section className={styles.section}>
      <div className={styles.container}>
        <h1 className="title">Admin: Units Management</h1>
        <div className={styles.grid}>
          <div className={styles.card}>
            <h3 className="title">Create Unit</h3>
            {!dbStatus.ok && <div className={styles.warn}>{dbStatus.message}</div>}
            <form className={styles.form} onSubmit={onCreate}>
              <input name="unitCode" placeholder="Unit Code" value={form.unitCode} onChange={onChange} required />
              <input name="floor" type="number" placeholder="Floor" value={form.floor} onChange={onChange} required />
              <input name="totalAreaSqft" type="number" placeholder="Total Area (sqft)" value={form.totalAreaSqft} onChange={onChange} required />
              <input name="maxShares" type="number" placeholder="Max Shares (optional)" value={form.maxShares as any || ""} onChange={onChange} />
              <input name="basePrice" type="number" placeholder="Base Price (optional)" onChange={onChange} />
              <input name="pricePerSqft" type="number" placeholder="Price Per Sqft (optional)" onChange={onChange} />
              <input name="viewMarkupPercent" type="number" placeholder="View Markup %" onChange={onChange} />
              <input name="qualityMarkupPercent" type="number" placeholder="Quality Markup %" onChange={onChange} />
              <input name="floorMarkupPercent" type="number" placeholder="Floor Markup %" onChange={onChange} />
              <select name="sizeCategory" value={form.sizeCategory} onChange={onChange}>
                {sizeOptions.map((o) => <option key={o} value={o}>{o}</option>)}
              </select>
              <select name="quality" value={form.quality} onChange={onChange}>
                {qualityOptions.map((o) => <option key={o} value={o}>{o}</option>)}
              </select>
              <select name="viewType" value={form.viewType} onChange={onChange}>
                {viewOptions.map((o) => <option key={o} value={o}>{o}</option>)}
              </select>
              <select name="ownershipAllowed" value={form.ownershipAllowed} onChange={onChange}>
                {ownershipOptions.map((o) => <option key={o} value={o}>{o}</option>)}
              </select>
              <select name="status" value={form.status} onChange={onChange}>
                {statusOptions.map((o) => <option key={o} value={o}>{o}</option>)}
              </select>
              <button className={styles.submit} type="submit">Create</button>
            </form>
          </div>
          <div className={styles.card}>
            <h3 className="title">Filter Units</h3>
            <div className={styles.filters}>
              <input placeholder="Floor" value={filters.floor} onChange={(e) => setFilters({ ...filters, floor: e.target.value })} />
              <select value={filters.viewType} onChange={(e) => setFilters({ ...filters, viewType: e.target.value })}>
                <option value="">All Views</option>
                {viewOptions.map((o) => <option key={o} value={o}>{o}</option>)}
              </select>
              <select value={filters.sizeCategory} onChange={(e) => setFilters({ ...filters, sizeCategory: e.target.value })}>
                <option value="">All Sizes</option>
                {sizeOptions.map((o) => <option key={o} value={o}>{o}</option>)}
              </select>
              <select value={filters.quality} onChange={(e) => setFilters({ ...filters, quality: e.target.value })}>
                <option value="">All Quality</option>
                {qualityOptions.map((o) => <option key={o} value={o}>{o}</option>)}
              </select>
              <select value={filters.status} onChange={(e) => setFilters({ ...filters, status: e.target.value })}>
                <option value="">All Status</option>
                {statusOptions.map((o) => <option key={o} value={o}>{o}</option>)}
              </select>
              <button className={styles.submit} onClick={() => loadUnits(filters)}>Apply Filters</button>
            </div>
            <table className={styles.table}>
              <thead>
                <tr>
                  <th>Code</th>
                  <th>Floor</th>
                  <th>Size (sqft)</th>
                  <th>Category</th>
                  <th>Quality</th>
                  <th>View</th>
                  <th>Ownership</th>
                  <th>Shares Sold</th>
                  <th>Max Shares</th>
                  <th>Status</th>
                  <th>Notes</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((u) => (
                  <tr key={u._id}>
                    <td>{u.unitCode}</td>
                    <td>
                      <input className={styles.cellInput} type="number" defaultValue={u.floor} onBlur={(e) => saveEdit({ ...u, floor: Number(e.target.value) })} />
                    </td>
                    <td>
                      <input className={styles.cellInput} type="number" defaultValue={u.totalAreaSqft} onBlur={(e) => saveEdit({ ...u, totalAreaSqft: Number(e.target.value) })} />
                    </td>
                    <td>
                      <select defaultValue={u.sizeCategory} onChange={(e) => saveEdit({ ...u, sizeCategory: e.target.value })}>
                        {sizeOptions.map((o) => <option key={o} value={o}>{o}</option>)}
                      </select>
                    </td>
                    <td>
                      <select defaultValue={u.quality} onChange={(e) => saveEdit({ ...u, quality: e.target.value })}>
                        {qualityOptions.map((o) => <option key={o} value={o}>{o}</option>)}
                      </select>
                    </td>
                    <td>
                      <select defaultValue={u.viewType} onChange={(e) => saveEdit({ ...u, viewType: e.target.value })}>
                        {viewOptions.map((o) => <option key={o} value={o}>{o}</option>)}
                      </select>
                    </td>
                    <td>
                      <select defaultValue={u.ownershipAllowed} onChange={(e) => saveEdit({ ...u, ownershipAllowed: e.target.value })}>
                        {ownershipOptions.map((o) => <option key={o} value={o}>{o}</option>)}
                      </select>
                    </td>
                    <td>{(u as any).sharesSold || 0}</td>
                    <td>
                      <input className={styles.cellInput} type="number" defaultValue={(u as any).maxShares || ""} onBlur={(e) => saveEdit({ ...u, maxShares: Number(e.target.value) })} />
                    </td>
                    <td>
                      <select defaultValue={u.status} onChange={(e) => updateStatus(u._id!, e.target.value)}>
                        {statusOptions.map((o) => <option key={o} value={o}>{o}</option>)}
                      </select>
                    </td>
                    <td>{(u as any)._error ? String((u as any)._error) : (u as any)._pending ? "Pending" : ""}</td>
                  <td>
                      <a href={`/suites/${u._id}`} className={styles.link}>User View</a>
                      {" | "}
                      <a href={`/admin/units/${u._id}`} className={styles.link}>Manage</a>
                      {" | "}
                      <button className={styles.link} type="button" onClick={() => openEdit(u)}>Edit</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {editing && (
              <div className={styles.modalBackdrop} onClick={() => setEditing(null)}>
                <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
                  <div className={styles.modalHeader}>
                    <div>Edit Unit</div>
                    <button className={styles.link} onClick={() => setEditing(null)}>Close</button>
                  </div>
                  <div className={styles.modalBody}>
                    {editError && <div className={styles.warn}>{editError}</div>}
                    <form className={styles.form} onSubmit={(e) => { e.preventDefault(); onSaveEditing(); }}>
                      <input name="unitCode" placeholder="Unit Code" value={editing.unitCode} onChange={onEditChange} required />
                      <input name="floor" type="number" placeholder="Floor" value={editing.floor} onChange={onEditChange} required />
                      <input name="totalAreaSqft" type="number" placeholder="Total Area (sqft)" value={editing.totalAreaSqft} onChange={onEditChange} required />
                      <input name="maxShares" type="number" placeholder="Max Shares" value={(editing as any).maxShares || 0} onChange={onEditChange} />
                      <select name="sizeCategory" value={editing.sizeCategory} onChange={onEditChange}>
                        {sizeOptions.map((o) => <option key={o} value={o}>{o}</option>)}
                      </select>
                      <select name="quality" value={editing.quality} onChange={onEditChange}>
                        {qualityOptions.map((o) => <option key={o} value={o}>{o}</option>)}
                      </select>
                      <select name="viewType" value={editing.viewType} onChange={onEditChange}>
                        {viewOptions.map((o) => <option key={o} value={o}>{o}</option>)}
                      </select>
                      <select name="ownershipAllowed" value={editing.ownershipAllowed} onChange={onEditChange}>
                        {ownershipOptions.map((o) => <option key={o} value={o}>{o}</option>)}
                      </select>
                      <select name="status" value={editing.status} onChange={onEditChange}>
                        {statusOptions.map((o) => <option key={o} value={o}>{o}</option>)}
                      </select>
                      <input name="basePrice" type="number" placeholder="Base Price" value={(editing as any).basePrice || 0} onChange={onEditChange} />
                      <input name="pricePerSqft" type="number" placeholder="Price per sqft" value={(editing as any).pricePerSqft || 0} onChange={onEditChange} />
                      <input name="viewMarkupPercent" type="number" placeholder="View Markup %" value={(editing as any).viewMarkupPercent || 0} onChange={onEditChange} />
                      <input name="qualityMarkupPercent" type="number" placeholder="Quality Markup %" value={(editing as any).qualityMarkupPercent || 0} onChange={onEditChange} />
                      <input name="floorMarkupPercent" type="number" placeholder="Floor Markup %" value={(editing as any).floorMarkupPercent || 0} onChange={onEditChange} />
                    </form>
                  </div>
                  <div className={styles.modalActions}>
                    <button className={styles.submit} onClick={onSaveEditing}>Save</button>
                    <button className={styles.submit} onClick={() => setEditing(null)}>Cancel</button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}

export default function AdminUnitsPage() {
  return <AdminUnitsContent />;
}
