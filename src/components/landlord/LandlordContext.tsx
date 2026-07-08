"use client";

import { createContext, useContext, useState } from "react";
import { LANDLORDS } from "@/lib/mock-admin-data";

type LandlordContextValue = {
  landlordId: string;
  setLandlordId: (id: string) => void;
  landlordName: string;
};

const LandlordContext = createContext<LandlordContextValue | null>(null);

export function LandlordProvider({ children }: { children: React.ReactNode }) {
  const [landlordId, setLandlordId] = useState(LANDLORDS[0].id);
  const landlordName =
    LANDLORDS.find((l) => l.id === landlordId)?.name ?? LANDLORDS[0].name;

  return (
    <LandlordContext.Provider value={{ landlordId, setLandlordId, landlordName }}>
      {children}
    </LandlordContext.Provider>
  );
}

export function useLandlord() {
  const ctx = useContext(LandlordContext);
  if (!ctx) throw new Error("useLandlord must be used within LandlordProvider");
  return ctx;
}
