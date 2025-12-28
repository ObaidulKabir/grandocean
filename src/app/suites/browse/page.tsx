"use client";
import { useEffect, useMemo, useState } from "react";
import styles from "./Browse.module.css";

type Unit = {
  _id: string;
  unitCode: string;
  floor: number;
  totalAreaSqft: number;
  sizeCategory: string;
  quality: string;
  viewType: string;
  ownershipAllowed: string;
  status: string;
};

const sizeOptions = ["Studio", "1BR", "2BR", "3BR"];
const qualityOptions = ["Premium", "Regular"];
const viewOptions = ["Sea View", "Hill View", "Other"];

export default function BrowseSuitesPage() {
  const [units, setUnits] = useState<Unit[]>([]);
  const [filters, setFilters] = useState({
    floor: "",
    viewType: "",
    sizeCategory: "",
    quality: "",
  });
  const load = async () => {
    const qs = new URLSearchParams(
      Object.fromEntries(
        Object.entries({ ...filters, status: "Available" }).filter(([, v]) => v !== "" && v !== undefined)
      )
    ).toString();
    const res = await fetch(`/api/units?${qs}`);
    const json = await res.json();
    setUnits(json.data || []);
  };
  useEffect(() => {
    load();
  }, []);
  const filtered = useMemo(() => units, [units]);
  return (
    <section className="section">
      <div className="container">
        <h1 className="title">Available Suites</h1>
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
          <button className={styles.submit} onClick={load}>Apply Filters</button>
        </div>
        <div className={styles.grid}>
          {filtered.map((u) => (
            <a key={u._id} href={`/suites/${u._id}`} className={styles.card}>
              <div className={styles.cardHeader}>
                <strong>{u.unitCode}</strong>
                <span>{u.sizeCategory}</span>
              </div>
              <div className={styles.cardBody}>
                <div>Floor: {u.floor}</div>
                <div>Size: {u.totalAreaSqft} sqft</div>
                <div>Quality: {u.quality}</div>
                <div>View: {u.viewType}</div>
              </div>
              <div className={styles.cardFooter}>
                <span className={styles.badge}>{u.status}</span>
              </div>
            </a>
          ))}
        </div>
      </div>
    </section>
  );
}

