"use client";
import { createContext, useCallback, useEffect, useMemo, useState, useContext } from "react";
import { createUnit as createUnitApi, updateUnit as updateUnitApi, patchUnitStatus as patchUnitStatusApi } from "@/services/units";

export type Unit = {
  _id?: string;
  unitCode: string;
  floor: number;
  totalAreaSqft: number;
  maxShares?: number;
  sharesSold?: number;
  sizeCategory: string;
  quality: string;
  viewType: string;
  ownershipAllowed: string;
  status: string;
  finalPrice?: number;
  timeSharePrice?: number;
  _pending?: boolean;
  _error?: string;
};

type DbStatus = { ok: boolean; message?: string };

type UnitsContextType = {
  units: Unit[];
  dbStatus: DbStatus;
  loadUnits: (filters?: Record<string, string>) => Promise<void>;
  createUnit: (u: Unit) => Promise<void>;
  updateStatus: (id: string, status: string) => Promise<void>;
  saveEdit: (u: Unit) => Promise<boolean>;
  seedSamples: () => Promise<void>;
};

export const UnitsContext = createContext<UnitsContextType>({
  units: [],
  dbStatus: { ok: true },
  loadUnits: async () => {},
  createUnit: async () => {},
  updateStatus: async () => {},
  saveEdit: async () => false,
  seedSamples: async () => {},
});

export function UnitsProvider({ children }: { children: React.ReactNode }) {
  const [units, setUnits] = useState<Unit[]>([]);
  const [dbStatus, setDbStatus] = useState<DbStatus>({ ok: true });

  const checkDb = useCallback(async () => {
    try {
      const hc = await fetch("/api/health/db");
      const hcJson = await hc.json();
      if (!hc.ok || hcJson.ok === false) {
        setDbStatus({ ok: false, message: hcJson.error || "Database unavailable" });
        return false;
      } else {
        setDbStatus({ ok: true });
        return true;
      }
    } catch {
      setDbStatus({ ok: false, message: "Database unavailable" });
      return false;
    }
  }, []);

  const loadUnits = useCallback(async (filters?: Record<string, string>) => {
    await checkDb();
    const qs = filters
      ? new URLSearchParams(Object.fromEntries(Object.entries(filters).filter(([, v]) => v))).toString()
      : "";
    try {
      const res = await fetch(`/api/units${qs ? `?${qs}` : ""}`);
      const json = await res.json();
      if (res.ok) {
        setUnits(json.data || []);
      }
    } catch {}
  }, [checkDb]);

  const createUnit = useCallback(async (u: Unit) => {
    const tempId = `temp-${Date.now()}`;
    const tempUnit = { ...u, _id: tempId, _pending: true };
    setUnits((prev) => [tempUnit, ...prev]);
    const ok = await checkDb();
    try {
      if (ok) {
        const created = await createUnitApi(u as any);
        setUnits((prev) => [created, ...prev.filter((x) => x._id !== tempId)]);
      } else {
        setUnits((prev) => prev.map((x) => (x._id === tempId ? { ...x, _pending: false } : x)));
      }
    } catch {
      setUnits((prev) => prev.map((x) => (x._id === tempId ? { ...x, _pending: false, _error: "Failed" } : x)));
    }
  }, [checkDb]);

  const updateStatus = useCallback(async (id: string, status: string) => {
    setUnits((prev) => prev.map((x) => (x._id === id ? { ...x, status } : x)));
    const ok = await checkDb();
    if (!ok) return;
    await patchUnitStatusApi(id, status);
    await loadUnits();
  }, [checkDb, loadUnits]);

  const saveEdit = useCallback(async (u: Unit) => {
    setUnits((prev) => prev.map((x) => (x._id === u._id ? { ...x, ...u } : x)));
    const ok = await checkDb();
    if (!ok || !u._id) return false;
    try {
      const updated = await updateUnitApi(u._id, u as any);
      setUnits((prev) => prev.map((x) => (x._id === u._id ? { ...x, ...updated, _error: undefined } : x)));
      await loadUnits();
      return true;
    } catch (e: any) {
      setUnits((prev) => prev.map((x) => (x._id === u._id ? { ...x, _error: e?.message || "Failed to save" } : x)));
      return false;
    }
  }, [checkDb, loadUnits]);

  const seedSamples = useCallback(async () => {
    const ok = await checkDb();
    if (!ok) return;
    await fetch("/api/dev/seed", { method: "POST" });
    await loadUnits();
  }, [checkDb, loadUnits]);

  useEffect(() => {
    loadUnits();
  }, [loadUnits]);

  const value = useMemo(
    () => ({ units, dbStatus, loadUnits, createUnit, updateStatus, saveEdit, seedSamples }),
    [units, dbStatus, loadUnits, createUnit, updateStatus, saveEdit, seedSamples]
  );

  return <UnitsContext.Provider value={value}>{children}</UnitsContext.Provider>;
}

export function useUnits() {
  return useContext(UnitsContext);
}
