"use client";
import { UnitsProvider } from "@/context/UnitsContext";

export default function AppProviders({ children }: { children: React.ReactNode }) {
  return <UnitsProvider>{children}</UnitsProvider>;
}
