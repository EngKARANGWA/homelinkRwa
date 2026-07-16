"use client";

import { createContext, useContext } from "react";
import { useSearchParams } from "next/navigation";
import { LANDLORDS } from "@/lib/mock-admin-data";

type LandlordContextValue = {
  landlordId: string;
  landlordName: string;
};

const LandlordContext = createContext<LandlordContextValue | null>(null);

export function LandlordProvider({ children }: { children: React.ReactNode }) {
  const searchParams = useSearchParams();
  const initialId = searchParams.get("id");
  const landlordId = LANDLORDS.some((l) => l.id === initialId)
    ? initialId!
    : LANDLORDS[0].id;
  const landlordName =
    LANDLORDS.find((l) => l.id === landlordId)?.name ?? LANDLORDS[0].name;

  return (
    <LandlordContext.Provider value={{ landlordId, landlordName }}>
      {children}
    </LandlordContext.Provider>
  );
}

export function useLandlord() {
  const ctx = useContext(LandlordContext);
  if (!ctx) throw new Error("useLandlord must be used within LandlordProvider");
  return ctx;
}
