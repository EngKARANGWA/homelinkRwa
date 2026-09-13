"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { AppLink as Link } from "@/components/shared/AppLink";
import { ArrowLeft, CheckCircle2, Eye, Pencil, Plus } from "lucide-react";
import { getProperty, listUnits } from "@/lib/api/properties";
import { getLease, listLeases } from "@/lib/api/leases";
import { listPayments } from "@/lib/api/payments";
import { ApiError } from "@/lib/api/client";
import type { Lease, Payment, Property, PropertyUnit, UnitStatus } from "@/lib/api/types";
import { useAuth } from "@/components/auth/AuthContext";
import { Modal } from "@/components/admin/Modal";
import { EditUnitForm } from "@/components/admin/EditUnitForm";
import { LeaseDetail } from "@/components/leases/LeaseDetail";
import { TenantProfileCard } from "@/components/leases/TenantProfileCard";
import { AddTenantForm } from "@/components/landlord/AddTenantForm";
import { EmptyRow, Table, TBody, Td, Th, THead, Tr } from "@/components/dashboard/Table";
import { formatMoney } from "@/lib/money";
import { PAYMENT_STATUS_STYLES, formatStatusLabel } from "@/lib/paymentStatus";
import { LEASE_STATUS_STYLES, formatLeaseStatus } from "@/lib/leaseStatus";
import { useLanguage } from "@/lib/i18n/LanguageContext";

const UNIT_STATUS_BADGE_STYLES: Record<UnitStatus, string> = {
  available: "bg-slate-100 text-slate-600",
  occupied: "bg-emerald-50 text-emerald-700",
  maintenance: "bg-amber-50 text-amber-700",
  inactive: "bg-slate-200 text-slate-500",
};

type Tab = "tenant" | "history" | "payments";

function formatDate(dateStr: string | null) {
  if (!dateStr) return "—";
  return new Date(dateStr).toLocaleDateString("en-GB", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

// Owners can't look up other users' names directly — a lease's tenant
// summary is resolved server-side (GET /leases/:id only) and falls back to
// a stable id-derived label here if that enrichment isn't available.
function tenantLabel(lease: Lease) {
  return lease.tenant ? `${lease.tenant.firstName} ${lease.tenant.lastName}` : `Tenant ${lease.tenantId.slice(0, 8).toUpperCase()}`;
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">{label}</p>
      <div className="mt-1 text-sm font-medium text-navy">{children}</div>
    </div>
  );
}

export default function UnitDetailPage() {
  const { user } = useAuth();
  const { t } = useLanguage();
  const c = t.dashboard.landlord.unitDetail;
  const { id, unitId } = useParams<{ id: string; unitId: string }>();
  const router = useRouter();

  const [property, setProperty] = useState<Property | null>(null);
  const [unit, setUnit] = useState<PropertyUnit | null>(null);
  const [unitLeases, setUnitLeases] = useState<Lease[]>([]);
  const [currentLease, setCurrentLease] = useState<Lease | null>(null);
  const [payments, setPayments] = useState<Payment[]>([]);
  const [isLoading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);

  const [tab, setTab] = useState<Tab>("tenant");
  const [isEditing, setEditing] = useState(false);
  const [editNotice, setEditNotice] = useState<string | null>(null);
  const [isAddingTenant, setAddingTenant] = useState(false);
  const [viewingLease, setViewingLease] = useState<Lease | null>(null);
  const [viewLeaseError, setViewLeaseError] = useState<string | null>(null);

  const load = () => {
    if (!id || !unitId) return;
    let cancelled = false;
    setLoading(true);
    Promise.all([
      getProperty(id),
      listUnits(id),
      listPayments({ unitId, limit: 50 }),
      listLeases({ propertyId: id, limit: 100 }),
    ])
      .then(async ([propertyResult, unitsResult, paymentsResult, leasesResult]) => {
        if (cancelled) return;
        const unitResult = unitsResult.find((u) => u.id === unitId) ?? null;
        const thisUnitLeases = leasesResult.data
          .filter((l) => l.unitId === unitId)
          .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

        setProperty(propertyResult);
        setUnit(unitResult);
        setPayments(paymentsResult.data);
        setUnitLeases(thisUnitLeases);

        const activeLease = thisUnitLeases.find((l) => l.status === "active") ?? thisUnitLeases[0] ?? null;
        const full = activeLease ? await getLease(activeLease.id) : null;
        if (!cancelled) setCurrentLease(full);
        setLoadError(null);
      })
      .catch((err) => {
        if (!cancelled) {
          setLoadError(err instanceof ApiError ? err.message : "Failed to load this unit.");
        }
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  };

  useEffect(load, [id, unitId]);

  const viewLeaseHistory = async (lease: Lease) => {
    setViewLeaseError(null);
    try {
      setViewingLease(await getLease(lease.id));
    } catch (err) {
      setViewLeaseError(err instanceof ApiError ? err.message : "Failed to load lease details.");
    }
  };

  if (isLoading) {
    return (
      <div className="flex flex-col items-center gap-3 py-24 text-center text-sm text-slate-400">
        Loading unit...
      </div>
    );
  }

  if (loadError || !property || !unit) {
    return (
      <div className="flex flex-col items-center gap-3 py-24 text-center">
        <p className="text-sm text-slate-500">{loadError ?? c.unitNotFound}</p>
        <Link
          href={`/landlord/properties/${id}`}
          className="text-sm font-medium text-gold hover:underline"
        >
          {c.backToProperties}
        </Link>
      </div>
    );
  }

  const TABS: { key: Tab; label: string }[] = [
    { key: "tenant", label: "Current Tenant" },
    { key: "history", label: `Tenant History (${unitLeases.length})` },
    { key: "payments", label: `Payments (${payments.length})` },
  ];

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <button
            type="button"
            onClick={() => router.back()}
            className="inline-flex items-center gap-1.5 text-sm font-medium text-slate-500 hover:text-navy"
          >
            <ArrowLeft className="h-4 w-4" />
            {c.back}
          </button>
          <h1 className="mt-2 text-2xl font-bold text-navy">{unit.label}</h1>
          <p className="mt-1 text-sm text-slate-500">
            {property.title} · {property.addressLine}
          </p>
        </div>
        <button
          type="button"
          onClick={() => setEditing(true)}
          className="inline-flex items-center gap-2 rounded-lg border border-slate-300 px-5 py-2.5 text-sm font-semibold text-slate-600 transition-colors hover:bg-slate-50"
        >
          <Pencil className="h-4 w-4" />
          {c.edit}
        </button>
      </div>

      {editNotice && (
        <div className="flex items-center gap-2 rounded-lg border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm font-medium text-emerald-700">
          <CheckCircle2 className="h-4 w-4" />
          {editNotice}
        </div>
      )}

      <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="flex items-center justify-between">
          <p className="font-semibold text-navy">Unit Details</p>
          <span
            className={`inline-block rounded-full px-2.5 py-1 text-xs font-medium ${UNIT_STATUS_BADGE_STYLES[unit.status]}`}
          >
            {t.dashboard.status[unit.status]}
          </span>
        </div>

        {unit.unitType && <p className="mt-1 text-sm text-slate-500">{unit.unitType}</p>}

        <div className="mt-4 grid grid-cols-2 gap-5 sm:grid-cols-5">
          <Field label={c.monthlyRent}>{formatMoney(Number(unit.rentAmount))} RWF</Field>
          <Field label={c.deposit}>
            {unit.deposit != null ? `${formatMoney(Number(unit.deposit))} RWF` : "—"}
          </Field>
          <Field label="Floor">{unit.floor ?? "—"}</Field>
          <Field label="Bedrooms">{unit.bedrooms ?? "—"}</Field>
          <Field label="Bathrooms">{unit.bathrooms ?? "—"}</Field>
        </div>

        {unit.description && (
          <div className="mt-4 border-t border-slate-100 pt-4">
            <Field label="Description">{unit.description}</Field>
          </div>
        )}

        <div className="mt-4 grid grid-cols-2 gap-5 border-t border-slate-100 pt-4">
          <Field label="Created">{formatDate(unit.createdAt)}</Field>
          <Field label="Last updated">{formatDate(unit.updatedAt)}</Field>
        </div>
      </div>

      <div className="flex gap-2 rounded-lg border border-slate-200 bg-slate-50 p-1">
        {TABS.map((tabDef) => (
          <button
            key={tabDef.key}
            type="button"
            onClick={() => setTab(tabDef.key)}
            className={`flex flex-1 items-center justify-center rounded-md px-3 py-2 text-sm font-medium transition-colors ${
              tab === tabDef.key ? "bg-white text-navy shadow-sm" : "text-slate-500"
            }`}
          >
            {tabDef.label}
          </button>
        ))}
      </div>

      {tab === "tenant" &&
        (unit.status !== "occupied" || !currentLease ? (
          <div className="flex flex-col items-center gap-3 rounded-xl border border-dashed border-slate-300 bg-white py-24 text-center">
            <h2 className="text-lg font-bold text-navy">{c.vacantTitle}</h2>
            <p className="max-w-sm text-sm text-slate-500">{c.vacantDescription}</p>
            <button
              type="button"
              onClick={() => setAddingTenant(true)}
              className="mt-2 inline-flex items-center gap-2 rounded-lg bg-gold px-5 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-gold/90"
            >
              <Plus className="h-4 w-4" />
              {c.addTenant}
            </button>
          </div>
        ) : (
          <div className="flex flex-col gap-6">
            <TenantProfileCard lease={currentLease} />
            <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
              <p className="mb-4 font-semibold text-navy">{c.leaseDetails}</p>
              <LeaseDetail
                lease={currentLease}
                propertyLabel={property.title}
                unitLabel={unit.label}
                tenantLabel={tenantLabel(currentLease)}
                ownerLabel={user ? `${user.firstName} ${user.lastName}` : "—"}
              />
            </div>
          </div>
        ))}

      {tab === "history" && (
        <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
          <p className="mb-4 font-semibold text-navy">Tenants in this unit</p>
          {viewLeaseError && (
            <p className="mb-4 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
              {viewLeaseError}
            </p>
          )}
          <Table variant="plain">
            <THead>
              <Tr>
                <Th className="py-2">Tenant</Th>
                <Th className="py-2">Term</Th>
                <Th className="py-2">Rent</Th>
                <Th className="py-2">Status</Th>
                <Th className="py-2 text-right">
                  <span className="sr-only">View</span>
                </Th>
              </Tr>
            </THead>
            <TBody>
              {unitLeases.map((l) => (
                <Tr key={l.id}>
                  <Td className="py-2.5 font-medium text-navy">{tenantLabel(l)}</Td>
                  <Td className="py-2.5 text-slate-500">
                    {l.startDate} → {l.endDate ?? "Open-ended"}
                  </Td>
                  <Td className="py-2.5 text-slate-500">{formatMoney(l.rentAmount)} RWF</Td>
                  <Td className="py-2.5">
                    <span
                      className={`rounded-full px-2.5 py-1 text-xs font-medium ${LEASE_STATUS_STYLES[l.status]}`}
                    >
                      {formatLeaseStatus(l.status)}
                    </span>
                  </Td>
                  <Td className="py-2.5 text-right">
                    <button
                      type="button"
                      onClick={() => viewLeaseHistory(l)}
                      title="View lease details"
                      className="inline-flex items-center gap-1 rounded-md p-1.5 text-slate-400 transition-colors hover:bg-slate-100 hover:text-navy"
                    >
                      <Eye className="h-4 w-4" />
                    </button>
                  </Td>
                </Tr>
              ))}
              {unitLeases.length === 0 && (
                <EmptyRow colSpan={5}>No tenant has ever been assigned to this unit.</EmptyRow>
              )}
            </TBody>
          </Table>
        </div>
      )}

      {tab === "payments" && (
        <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
          <p className="mb-4 font-semibold text-navy">{c.paymentHistory}</p>
          <Table variant="plain">
            <THead>
              <Tr>
                <Th className="py-2">{c.amount}</Th>
                <Th className="py-2">Method</Th>
                <Th className="py-2">{c.status}</Th>
                <Th className="py-2">Date</Th>
              </Tr>
            </THead>
            <TBody>
              {payments.map((p) => (
                <Tr key={p.id}>
                  <Td className="py-2.5 text-slate-500">{formatMoney(p.amount)} RWF</Td>
                  <Td className="py-2.5 text-slate-500">{formatStatusLabel(p.method)}</Td>
                  <Td className="py-2.5">
                    <span
                      className={`rounded-full px-2.5 py-1 text-xs font-medium ${PAYMENT_STATUS_STYLES[p.status]}`}
                    >
                      {formatStatusLabel(p.status)}
                    </span>
                  </Td>
                  <Td className="py-2.5 text-slate-500">{formatDate(p.paidAt ?? p.createdAt)}</Td>
                </Tr>
              ))}
              {payments.length === 0 && <EmptyRow colSpan={4}>{c.noPaymentHistory}</EmptyRow>}
            </TBody>
          </Table>
        </div>
      )}

      {isEditing && (
        <Modal
          title={`Edit Unit — ${unit.label}`}
          description="Update this unit's own details."
          onClose={() => setEditing(false)}
        >
          <EditUnitForm
            propertyId={property.id}
            unit={unit}
            onCancel={() => setEditing(false)}
            onSuccess={() => {
              setEditing(false);
              setEditNotice(`"${unit.label}" updated.`);
              load();
            }}
          />
        </Modal>
      )}

      {isAddingTenant && (
        <Modal
          title={c.addTenant}
          description={`Assign a new tenant to ${unit.label} in ${property.title}.`}
          onClose={() => setAddingTenant(false)}
        >
          <AddTenantForm
            propertyId={property.id}
            defaultRentAmount={Number(unit.rentAmount)}
            onCancel={() => setAddingTenant(false)}
            onSuccess={() => {
              setAddingTenant(false);
              load();
            }}
          />
        </Modal>
      )}

      {viewingLease && (
        <Modal
          title="Lease"
          description={`${tenantLabel(viewingLease)} · ${property.title} · ${unit.label}`}
          onClose={() => setViewingLease(null)}
        >
          <div className="flex flex-col gap-6">
            <TenantProfileCard lease={viewingLease} />
            <LeaseDetail
              lease={viewingLease}
              propertyLabel={property.title}
              unitLabel={unit.label}
              tenantLabel={tenantLabel(viewingLease)}
              ownerLabel={user ? `${user.firstName} ${user.lastName}` : "—"}
            />
          </div>
        </Modal>
      )}
    </div>
  );
}
