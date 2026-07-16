"use client";

import { createContext, useContext } from "react";
import { useSearchParams } from "next/navigation";
import { TENANTS } from "@/lib/mock-admin-data";

type TenantContextValue = {
  tenantId: string;
  tenantName: string;
};

const TenantContext = createContext<TenantContextValue | null>(null);

export function TenantProvider({ children }: { children: React.ReactNode }) {
  const searchParams = useSearchParams();
  const initialId = searchParams.get("id");
  const tenantId = TENANTS.some((t) => t.id === initialId)
    ? initialId!
    : TENANTS[0].id;
  const tenantName =
    TENANTS.find((t) => t.id === tenantId)?.name ?? TENANTS[0].name;

  return (
    <TenantContext.Provider value={{ tenantId, tenantName }}>
      {children}
    </TenantContext.Provider>
  );
}

export function useTenant() {
  const ctx = useContext(TenantContext);
  if (!ctx) throw new Error("useTenant must be used within TenantProvider");
  return ctx;
}
