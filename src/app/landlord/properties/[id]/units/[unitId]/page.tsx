"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { AppLink as Link } from "@/components/shared/AppLink";
import { ArrowLeft, CheckCircle2, Pencil, Plus } from "lucide-react";
import { getProperty, listUnits } from "@/lib/api/properties";
import { getLease, listLeases } from "@/lib/api/leases";
import { listPayments } from "@/lib/api/payments";
import { ApiError } from "@/lib/api/client";
import type { Lease, Payment, Property, PropertyUnit, UnitStatus } from "@/lib/api/types";
import { useAuth } from "@/components/auth/AuthContext";
import { Modal } from "@/components/admin/Modal";
import { EditUnitForm } from "@/components/admin/EditUnitForm";
import { LeaseDetail } from "@/components/leases/LeaseDetail";
import { AddTenantForm } from "@/components/landlord/AddTenantForm";
import { EmptyRow, Table, TBody, Td, Th, THead, Tr } from "@/components/dashboard/Table";
import { formatMoney } from "@/lib/money";
import { PAYMENT_STATUS_STYLES, formatStatusLabel } from "@/lib/paymentStatus";
import { useLanguage } from "@/lib/i18n/LanguageContext";

const UNIT_STATUS_BADGE_STYLES: Record<UnitStatus, string> = {
  available: "bg-slate-100 text-slate-600",
  occupied: "bg-emerald-50 text-emerald-700",
  maintenance: "bg-amber-50 text-amber-700",
  inactive: "bg-slate-200 text-slate-500",
};

function formatDate(dateStr: string | null) {
  if (!dateStr) return "—";
  return new Date(dateStr).toLocaleDateString("en-GB", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
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
  const [lease, setLease] = useState<Lease | null>(null);
  const [payments, setPayments] = useState<Payment[]>([]);
  const [isLoading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);

  const [isEditing, setEditing] = useState(false);
  const [editNotice, setEditNotice] = useState<string | null>(null);
  const [isAddingTenant, setAddingTenant] = useState(false);

  const load = () => {
    if (!id || !unitId) return;
    let cancelled = false;
    setLoading(true);
    Promise.all([getProperty(id), listUnits(id), listPayments({ unitId, limit: 50 })])
      .then(async ([propertyResult, unitsResult, paymentsResult]) => {
        if (cancelled) return;
        const unitResult = unitsResult.find((u) => u.id === unitId) ?? null;
        setProperty(propertyResult);
        setUnit(unitResult);
        setPayments(paymentsResult.data);

        if (unitResult?.status === "occupied") {
          const leasesRes = await listLeases({ propertyId: id, limit: 100 });
          const match = [...leasesRes.data]
            .filter((l) => l.unitId === unitId)
            .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())[0];
          const full = match ? await getLease(match.id) : null;
          if (!cancelled) setLease(full);
        } else if (!cancelled) {
          setLease(null);
        }
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

        <div className="mt-4 grid grid-cols-2 gap-5 sm:grid-cols-4">
          <Field label="Floor">{unit.floor ?? "—"}</Field>
          <Field label="Bedrooms">{unit.bedrooms ?? "—"}</Field>
          <Field label="Bathrooms">{unit.bathrooms ?? "—"}</Field>
          <Field label={c.deposit}>
            {unit.deposit != null ? `${formatMoney(Number(unit.deposit))} RWF` : "—"}
          </Field>
        </div>

        <div className="mt-4 grid grid-cols-2 gap-5">
          <Field label={c.monthlyRent}>{formatMoney(Number(unit.rentAmount))} RWF</Field>
          {unit.description && <Field label="Description">{unit.description}</Field>}
        </div>

        <div className="mt-4 grid grid-cols-2 gap-5 border-t border-slate-100 pt-4">
          <Field label="Created">{formatDate(unit.createdAt)}</Field>
          <Field label="Last updated">{formatDate(unit.updatedAt)}</Field>
        </div>
      </div>

      {unit.status !== "occupied" || !lease ? (
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
        <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
          <p className="mb-4 font-semibold text-navy">{c.leaseDetails}</p>
          <LeaseDetail
            lease={lease}
            propertyLabel={property.title}
            unitLabel={unit.label}
            tenantLabel={lease.tenantName ?? "Tenant"}
            ownerLabel={user ? `${user.firstName} ${user.lastName}` : "—"}
          />
        </div>
      )}

      <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
        <p className="font-semibold text-navy">{c.paymentHistory}</p>
        <Table variant="plain" className="mt-4">
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
    </div>
  );
}
