"use client";
import { useEffect, useMemo, useState } from "react";
import { useParams } from "next/navigation";
import styles from "./AdminUnitDetail.module.css";

type Unit = {
  _id: string;
  unitCode: string;
  floor: number;
  totalAreaSqft: number;
  totalComponentArea?: number;
  maxShares?: number;
  sharesSold?: number;
  sizeCategory: "Studio" | "1BR" | "2BR" | "3BR";
  quality: "Premium" | "Regular";
  viewType: "Sea View" | "Hill View" | "Other";
  ownershipAllowed: "Full" | "TimeShare" | "Both";
  status: "Available" | "Hold" | "Booked" | "Sold";
  basePrice?: number;
  pricePerSqft?: number;
  viewMarkupPercent?: number;
  qualityMarkupPercent?: number;
  floorMarkupPercent?: number;
  finalPrice?: number;
  timeSharePrice?: number;
};
type Component = {
  _id: string;
  unitId: string;
  componentName: string;
  areaSqft: number;
  remarks?: string;
};

export default function AdminUnitDetailPage() {
  const { id: unitId } = useParams<{ id: string }>();
  const [unit, setUnit] = useState<Unit | null>(null);
  const [components, setComponents] = useState<Component[]>([]);
  const [newItem, setNewItem] = useState({ componentName: "", areaSqft: "" });
  const [warn, setWarn] = useState(false);
  const [total, setTotal] = useState(0);
  const [saveMsg, setSaveMsg] = useState<string>("");

  const loadUnit = async () => {
    const res = await fetch(`/api/units/${unitId}`);
    const json = await res.json();
    setUnit(json.data);
  };
  const loadComponents = async () => {
    const res = await fetch(`/api/units/${unitId}/components`);
    const json = await res.json();
    setComponents(json.data || []);
    setWarn(!!json.warn);
    setTotal(json.total || 0);
  };
  useEffect(() => {
    loadUnit();
    loadComponents();
  }, []);

  const onUnitChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    if (!unit) return;
    const val = e.target.type === "number" ? Number(e.target.value) : e.target.value;
    setUnit({ ...unit, [e.target.name]: val } as Unit);
  };
  const saveUnit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!unit) return;
    setSaveMsg("");
    const res = await fetch(`/api/units/${unit._id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(unit),
    });
    const json = await res.json().catch(() => ({}));
    if (res.ok) {
      setUnit(json.data);
      setSaveMsg("Saved");
    } else {
      setSaveMsg(json.error || "Save failed");
    }
  };

  const addComponent = async (e: React.FormEvent) => {
    e.preventDefault();
    const res = await fetch(`/api/units/${unitId}/components`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        componentName: newItem.componentName,
        areaSqft: Number(newItem.areaSqft),
      }),
    });
    setNewItem({ componentName: "", areaSqft: "" });
    await loadComponents();
    await loadUnit();
  };
  const updateComponent = async (c: Component) => {
    await fetch(`/api/components/${c._id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ componentName: c.componentName, areaSqft: c.areaSqft, remarks: c.remarks }),
    });
    await loadComponents();
    await loadUnit();
  };
  const deleteComponent = async (id: string) => {
    await fetch(`/api/components/${id}`, { method: "DELETE" });
    await loadComponents();
    await loadUnit();
  };

  const percent = (area: number) => unit && unit.totalAreaSqft ? Math.round((area / unit.totalAreaSqft) * 100) : 0;

  return (
    <section className="section">
      <div className="container">
        <h1 className="title">Admin: Unit {unit?.unitCode}</h1>
        <div style={{ marginTop: 8 }}>
          <a href={`/admin/units/${unitId}/timeshares`} className={styles.link}>Manage Time-Shares</a>
          {" | "}
          <a href={`/admin/units/${unitId}/pricing`} className={styles.link}>Manage Pricing</a>
        </div>

        {unit && (
          <>
            <h2 className="title" style={{ marginTop: 12 }}>Edit Unit</h2>
            {saveMsg && <div style={{ marginBottom: 8 }}>{saveMsg}</div>}
            <form className={styles.addRow} onSubmit={saveUnit}>
              <input name="unitCode" placeholder="Unit Code" value={unit.unitCode} onChange={onUnitChange} required />
              <input name="floor" type="number" placeholder="Floor" value={unit.floor} onChange={onUnitChange} required />
              <input name="totalAreaSqft" type="number" placeholder="Total Area (sqft)" value={unit.totalAreaSqft} onChange={onUnitChange} required />
              <input name="maxShares" type="number" placeholder="Max Shares" value={unit.maxShares || 0} onChange={onUnitChange} />
              <select name="sizeCategory" value={unit.sizeCategory} onChange={onUnitChange}>
                {["Studio","1BR","2BR","3BR"].map((o) => <option key={o} value={o}>{o}</option>)}
              </select>
              <select name="quality" value={unit.quality} onChange={onUnitChange}>
                {["Premium","Regular"].map((o) => <option key={o} value={o}>{o}</option>)}
              </select>
              <select name="viewType" value={unit.viewType} onChange={onUnitChange}>
                {["Sea View","Hill View","Other"].map((o) => <option key={o} value={o}>{o}</option>)}
              </select>
              <select name="ownershipAllowed" value={unit.ownershipAllowed} onChange={onUnitChange}>
                {["Full","TimeShare","Both"].map((o) => <option key={o} value={o}>{o}</option>)}
              </select>
              <select name="status" value={unit.status} onChange={onUnitChange}>
                {["Available","Hold","Booked","Sold"].map((o) => <option key={o} value={o}>{o}</option>)}
              </select>
              <input name="basePrice" type="number" placeholder="Base Price" value={unit.basePrice || 0} onChange={onUnitChange} />
              <input name="pricePerSqft" type="number" placeholder="Price per sqft" value={unit.pricePerSqft || 0} onChange={onUnitChange} />
              <input name="viewMarkupPercent" type="number" placeholder="View Markup %" value={unit.viewMarkupPercent || 0} onChange={onUnitChange} />
              <input name="qualityMarkupPercent" type="number" placeholder="Quality Markup %" value={unit.qualityMarkupPercent || 0} onChange={onUnitChange} />
              <input name="floorMarkupPercent" type="number" placeholder="Floor Markup %" value={unit.floorMarkupPercent || 0} onChange={onUnitChange} />
              <button className={styles.submit} type="submit">Save</button>
            </form>
            <div className={styles.box}>
              <div>Final Price: {unit.finalPrice ?? 0}</div>
              <div>Time-Share Price: {unit.timeSharePrice ?? 0}</div>
            </div>
          </>
        )}

        <div className={styles.box}>
          <div>Total declared area: {unit?.totalAreaSqft} sft</div>
          <div>Total component area: {total} sft</div>
        </div>
        {warn && (
          <div className={styles.warn}>
            Component total area exceeds unit total area
          </div>
        )}

        <h2 className="title" style={{ marginTop: 12 }}>Suite Area Composition</h2>

        <form className={styles.addRow} onSubmit={addComponent}>
          <input
            placeholder="Component name (e.g., Bedroom)"
            value={newItem.componentName}
            onChange={(e) => setNewItem({ ...newItem, componentName: e.target.value })}
            required
          />
          <input
            placeholder="Area (sft)"
            type="number"
            min={1}
            value={newItem.areaSqft}
            onChange={(e) => setNewItem({ ...newItem, areaSqft: e.target.value })}
            required
          />
          <button className={styles.submit} type="submit">Add</button>
        </form>

        <table className={styles.table}>
          <thead>
            <tr>
              <th>Component</th>
              <th>Area (sft)</th>
              <th>Share</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {components.map((c) => (
              <tr key={c._id}>
                <td>
                  <input className={styles.cellInput} defaultValue={c.componentName} onBlur={(e) => updateComponent({ ...c, componentName: e.target.value })} />
                </td>
                <td>
                  <input className={styles.cellInput} type="number" min={1} defaultValue={c.areaSqft} onBlur={(e) => updateComponent({ ...c, areaSqft: Number(e.target.value) })} />
                </td>
                <td>
                  <div className={styles.barWrap}>
                    <div className={styles.bar} style={{ width: `${percent(c.areaSqft)}%` }} />
                  </div>
                  <span>{percent(c.areaSqft)}%</span>
                </td>
                <td>
                  <button className={styles.delete} onClick={() => deleteComponent(c._id)}>Delete</button>
                </td>
              </tr>
            ))}
          </tbody>
          <tfoot>
            <tr>
              <td><strong>Total</strong></td>
              <td><strong>{total} sft</strong></td>
              <td colSpan={2}><strong>Declared: {unit?.totalAreaSqft} sft</strong></td>
            </tr>
          </tfoot>
        </table>
      </div>
    </section>
  );
}
