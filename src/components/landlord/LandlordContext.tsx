"use client";

import { createContext, useContext, useState } from "react";
import { useSearchParams } from "next/navigation";
import { LANDLORDS, type Lease } from "@/lib/mock-admin-data";
import type { PaymentOverride, TenantEditValues, Unit, UnitOverrides } from "@/lib/units";
import type { LandlordDocument } from "@/lib/documents";

type LandlordContextValue = {
  landlordId: string;
  landlordName: string;
  unitOverrides: UnitOverrides;
  addTenant: (lease: Lease) => void;
  updateTenant: (unit: Unit, values: TenantEditValues) => void;
  removeTenant: (unit: Unit) => void;
  recordPayment: (unit: Unit, record: PaymentOverride) => void;
  documents: LandlordDocument[];
  addDocument: (doc: LandlordDocument) => void;
  removeDocument: (id: string) => void;
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

  const [extraLeases, setExtraLeases] = useState<Lease[]>([]);
  const [removedLeaseIds, setRemovedLeaseIds] = useState<string[]>([]);
  const [unitEdits, setUnitEdits] = useState<Record<string, Partial<TenantEditValues>>>({});
  const [vacatedUnitIds, setVacatedUnitIds] = useState<string[]>([]);
  const [paymentOverrides, setPaymentOverrides] = useState<Record<string, PaymentOverride>>({});
  const [documents, setDocuments] = useState<LandlordDocument[]>([]);

  const recordPayment = (unit: Unit, record: PaymentOverride) => {
    setPaymentOverrides((prev) => ({ ...prev, [unit.id]: record }));
  };

  const addDocument = (doc: LandlordDocument) => {
    setDocuments((prev) => [doc, ...prev]);
  };

  const removeDocument = (id: string) => {
    setDocuments((prev) => prev.filter((d) => d.id !== id));
  };

  const addTenant = (lease: Lease) => {
    setExtraLeases((prev) => [...prev, lease]);
  };

  const updateTenant = (unit: Unit, values: TenantEditValues) => {
    setUnitEdits((prev) => ({ ...prev, [unit.id]: values }));
  };

  const removeTenant = (unit: Unit) => {
    if (unit.isReal && unit.leaseId) {
      setRemovedLeaseIds((prev) => [...prev, unit.leaseId as string]);
    } else {
      setVacatedUnitIds((prev) => [...prev, unit.id]);
    }
    setUnitEdits((prev) => {
      if (!(unit.id in prev)) return prev;
      const next = { ...prev };
      delete next[unit.id];
      return next;
    });
  };

  const unitOverrides: UnitOverrides = {
    extraLeases,
    removedLeaseIds,
    unitEdits,
    vacatedUnitIds,
    paymentOverrides,
  };

  return (
    <LandlordContext.Provider
      value={{
        landlordId,
        landlordName,
        unitOverrides,
        addTenant,
        updateTenant,
        removeTenant,
        recordPayment,
        documents,
        addDocument,
        removeDocument,
      }}
    >
      {children}
    </LandlordContext.Provider>
  );
}

export function useLandlord() {
  const ctx = useContext(LandlordContext);
  if (!ctx) throw new Error("useLandlord must be used within LandlordProvider");
  return ctx;
}
