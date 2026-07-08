"use client";

import { createContext, useContext, useState } from "react";
import { TENANTS } from "@/lib/mock-admin-data";

type TenantContextValue = {
  tenantId: string;
  setTenantId: (id: string) => void;
  tenantName: string;
};

const TenantContext = createContext<TenantContextValue | null>(null);

export function TenantProvider({ children }: { children: React.ReactNode }) {
  const [tenantId, setTenantId] = useState(TENANTS[0].id);
  const tenantName =
    TENANTS.find((t) => t.id === tenantId)?.name ?? TENANTS[0].name;

  return (
    <TenantContext.Provider value={{ tenantId, setTenantId, tenantName }}>
      {children}
    </TenantContext.Provider>
  );
}

export function useTenant() {
  const ctx = useContext(TenantContext);
  if (!ctx) throw new Error("useTenant must be used within TenantProvider");
  return ctx;
}
