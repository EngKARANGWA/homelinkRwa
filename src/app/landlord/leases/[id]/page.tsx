"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { AppLink as Link } from "@/components/shared/AppLink";
import { ArrowLeft } from "lucide-react";
import { getProperty, listUnits } from "@/lib/api/properties";
import { getLease } from "@/lib/api/leases";
import { ApiError } from "@/lib/api/client";
import type { Lease, Property, PropertyUnit } from "@/lib/api/types";
import { useAuth } from "@/components/auth/AuthContext";
import { LeaseDetail } from "@/components/leases/LeaseDetail";
import { TenantProfileCard } from "@/components/leases/TenantProfileCard";

export default function LandlordLeaseDetailPage() {
  const { user } = useAuth();
  const { id } = useParams<{ id: string }>();
  const router = useRouter();

  const [lease, setLease] = useState<Lease | null>(null);
  const [property, setProperty] = useState<Property | null>(null);
  const [unit, setUnit] = useState<PropertyUnit | null>(null);
  const [isLoading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);

  useEffect(() => {
    if (!id) return;
    let cancelled = false;
    setLoading(true);
    getLease(id)
      .then(async (leaseResult) => {
        if (cancelled) return;
        setLease(leaseResult);
        const [propertyResult, unitsResult] = await Promise.all([
          getProperty(leaseResult.propertyId),
          listUnits(leaseResult.propertyId),
        ]);
        if (cancelled) return;
        setProperty(propertyResult);
        setUnit(unitsResult.find((u) => u.id === leaseResult.unitId) ?? null);
        setLoadError(null);
      })
      .catch((err) => {
        if (!cancelled) {
          setLoadError(err instanceof ApiError ? err.message : "Failed to load this lease.");
        }
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [id]);

  if (isLoading) {
    return (
      <div className="flex flex-col items-center gap-3 py-24 text-center text-sm text-slate-400">
        Loading lease...
      </div>
    );
  }

  if (loadError || !lease || !property) {
    return (
      <div className="flex flex-col items-center gap-3 py-24 text-center">
        <p className="text-sm text-slate-500">{loadError ?? "Lease not found."}</p>
        <Link
          href="/landlord/leases"
          className="text-sm font-medium text-gold hover:underline"
        >
          Back to Leases
        </Link>
      </div>
    );
  }

  const tenantLabel = lease.tenant
    ? `${lease.tenant.firstName} ${lease.tenant.lastName}`
    : `Tenant ${lease.tenantId.slice(0, 8).toUpperCase()}`;

  return (
    <div className="flex flex-col gap-6">
      <div>
        <button
          type="button"
          onClick={() => router.back()}
          className="inline-flex items-center gap-1.5 text-sm font-medium text-slate-500 hover:text-navy"
        >
          <ArrowLeft className="h-4 w-4" />
          Back
        </button>
        <h1 className="mt-2 text-2xl font-bold text-navy">Lease Agreement</h1>
        <p className="mt-1 text-sm text-slate-500">
          {tenantLabel} · {property.title}
          {unit ? ` · ${unit.label}` : ""}
        </p>
      </div>

      <TenantProfileCard lease={lease} />

      <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
        <p className="mb-4 font-semibold text-navy">Lease Details</p>
        <LeaseDetail
          lease={lease}
          propertyLabel={property.title}
          unitLabel={unit?.label ?? "—"}
          tenantLabel={tenantLabel}
          ownerLabel={user ? `${user.firstName} ${user.lastName}` : "—"}
        />
      </div>
    </div>
  );
}
