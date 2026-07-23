"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import {
  AlertTriangle,
  ArrowLeft,
  Bell,
  CheckCircle2,
  FileText,
  Pencil,
  Phone,
  Trash2,
  Wallet,
} from "lucide-react";
import { PROPERTIES } from "@/lib/mock-admin-data";
import { getUnit } from "@/lib/units";
import { useLandlord } from "@/components/landlord/LandlordContext";
import { Modal } from "@/components/admin/Modal";
import { EditTenantForm } from "@/components/landlord/EditTenantForm";
import { EmptyRow, Table, TBody, Td, Th, THead, Tr } from "@/components/dashboard/Table";
import { DEFAULT_PAGE_SIZE, Pagination } from "@/components/dashboard/Pagination";

const PAYMENT_STATUS_STYLES: Record<string, string> = {
  Paid: "bg-emerald-50 text-emerald-700",
  Overdue: "bg-red-50 text-red-700",
};

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
        {label}
      </p>
      <div className="mt-1 text-sm font-medium text-navy">{children}</div>
    </div>
  );
}

function monthLabel(month: string): string {
  return new Date(`${month}-01`).toLocaleDateString("en-US", {
    month: "long",
    year: "numeric",
  });
}

export default function UnitDetailPage() {
  const { id, unitId } = useParams<{ id: string; unitId: string }>();
  const router = useRouter();
  const { landlordName, unitOverrides, updateTenant, removeTenant, documents } = useLandlord();
  const [reminderNotice, setReminderNotice] = useState<string | null>(null);
  const [isEditing, setEditing] = useState(false);
  const [isRemoving, setRemoving] = useState(false);
  const [paymentPage, setPaymentPage] = useState(1);

  const property = PROPERTIES.find((p) => p.id === id && p.owner === landlordName);
  const unit = property ? getUnit(property, unitId, unitOverrides) : undefined;
  const paymentHistory = unit?.paymentHistory ?? [];
  const paymentTotalPages = Math.max(
    1,
    Math.ceil(paymentHistory.length / DEFAULT_PAGE_SIZE),
  );
  useEffect(() => {
    if (paymentPage > paymentTotalPages) setPaymentPage(paymentTotalPages);
  }, [paymentPage, paymentTotalPages]);
  const pagedPaymentHistory = paymentHistory.slice(
    (paymentPage - 1) * DEFAULT_PAGE_SIZE,
    paymentPage * DEFAULT_PAGE_SIZE,
  );

  if (!property || !unit) {
    return (
      <div className="flex flex-col items-center gap-3 py-24 text-center">
        <p className="text-sm text-slate-500">Unit not found.</p>
        <Link
          href="/landlord/properties"
          className="text-sm font-medium text-gold hover:underline"
        >
          Back to Properties
        </Link>
      </div>
    );
  }

  const handleSendReminder = () => {
    setReminderNotice(`Reminder sent to ${unit.tenant}.`);
  };

  const unitDocuments = documents
    .filter(
      (d) =>
        d.propertyId === property.id &&
        (d.unitNumber === unit.unitNumber || d.unitNumber === null),
    )
    .map((d) => d.name);
  const allDocuments = [...unit.documents, ...unitDocuments];

  const handleRemoveTenant = () => {
    removeTenant(unit);
    router.push(`/landlord/properties/${property.id}`);
  };

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <Link
            href={`/landlord/properties/${property.id}`}
            className="inline-flex items-center gap-1.5 text-sm font-medium text-slate-500 hover:text-navy"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to {property.name}
          </Link>
          <h1 className="mt-2 text-2xl font-bold text-navy">
            Unit {unit.unitNumber}
            {unit.tenant ? ` · ${unit.tenant}` : ""}
          </h1>
          <p className="mt-1 text-sm text-slate-500">
            {property.name} · {property.address}
          </p>
        </div>

        {unit.occupancyStatus === "Occupied" && (
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setEditing(true)}
              className="inline-flex items-center gap-1.5 rounded-lg border border-slate-300 px-3.5 py-2 text-sm font-medium text-slate-600 hover:bg-slate-50"
            >
              <Pencil className="h-3.5 w-3.5" />
              Edit
            </button>
            <button
              type="button"
              onClick={() => setRemoving(true)}
              className="inline-flex items-center gap-1.5 rounded-lg border border-red-200 px-3.5 py-2 text-sm font-medium text-red-600 hover:bg-red-50"
            >
              <Trash2 className="h-3.5 w-3.5" />
              Remove Tenant
            </button>
          </div>
        )}
      </div>

      {reminderNotice && (
        <div className="flex items-center gap-2 rounded-lg border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm font-medium text-emerald-700">
          <CheckCircle2 className="h-4 w-4" />
          {reminderNotice}
        </div>
      )}

      {unit.occupancyStatus === "Vacant" ? (
        <div className="flex flex-col items-center gap-3 rounded-xl border border-dashed border-slate-300 bg-white py-24 text-center">
          <h2 className="text-lg font-bold text-navy">This unit is vacant</h2>
          <p className="max-w-sm text-sm text-slate-500">
            There&apos;s no active lease on this unit yet. Add a tenant to fill it.
          </p>
          <Link
            href="/landlord/tenants"
            className="mt-2 inline-flex items-center gap-2 rounded-lg bg-gold px-5 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-gold/90"
          >
            Add Tenant
          </Link>
        </div>
      ) : (
        <>
          <div className="grid gap-6 lg:grid-cols-2">
            <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
              <p className="font-semibold text-navy">Lease Details</p>
              <div className="mt-4 grid grid-cols-1 gap-5 sm:grid-cols-2">
                <Field label="Monthly Rent">
                  {unit.monthlyRent.toLocaleString()} RWF
                </Field>
                <Field label="Deposit">
                  {unit.deposit ? `${unit.deposit.toLocaleString()} RWF` : "—"}
                </Field>
                <Field label="Start Date">{unit.startDate ?? "—"}</Field>
                <Field label="End Date">{unit.endDate ?? "Open-ended"}</Field>
                <Field label="Rent Due Day">
                  {unit.rentDueDay ? `${unit.rentDueDay}st of the month` : "—"}
                </Field>
              </div>
            </div>

            <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
              <p className="font-semibold text-navy">Payment History</p>
              <Table variant="plain" className="mt-4">
                <THead>
                  <Tr>
                    <Th className="py-2">Month</Th>
                    <Th className="py-2">Amount</Th>
                    <Th className="py-2">Status</Th>
                  </Tr>
                </THead>
                <TBody>
                  {pagedPaymentHistory.map((p) => (
                    <Tr key={p.month}>
                      <Td className="py-2.5 text-slate-500">{monthLabel(p.month)}</Td>
                      <Td className="py-2.5 text-slate-500">
                        {p.amount.toLocaleString()} RWF
                      </Td>
                      <Td className="py-2.5">
                        <span
                          className={`rounded-full px-2.5 py-1 text-xs font-medium ${PAYMENT_STATUS_STYLES[p.status]}`}
                        >
                          {p.status === "Paid" && p.paidDate
                            ? `Paid ${p.paidDate}`
                            : p.status}
                        </span>
                      </Td>
                    </Tr>
                  ))}
                  {unit.paymentHistory.length === 0 && (
                    <EmptyRow colSpan={3}>No payment history yet.</EmptyRow>
                  )}
                </TBody>
              </Table>
              <Pagination
                page={paymentPage}
                totalPages={paymentTotalPages}
                totalItems={paymentHistory.length}
                pageSize={DEFAULT_PAGE_SIZE}
                onPageChange={setPaymentPage}
              />
            </div>
          </div>

          <div className="grid gap-6 lg:grid-cols-2">
            <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
              <p className="font-semibold text-navy">Contact</p>
              <div className="mt-4 flex flex-col gap-4">
                <div className="flex items-center gap-3">
                  <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-blue-50 text-blue-600">
                    <Phone className="h-4 w-4" />
                  </span>
                  <Field label="Phone">{unit.phone ?? "—"}</Field>
                </div>
                <div className="flex items-center gap-3">
                  <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-emerald-50 text-emerald-600">
                    <Wallet className="h-4 w-4" />
                  </span>
                  <Field label="Payment Method">{unit.paymentMethod ?? "—"}</Field>
                </div>
              </div>
            </div>

            <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
              <p className="font-semibold text-navy">Documents</p>
              {allDocuments.length > 0 ? (
                <ul className="mt-4 flex flex-col gap-2">
                  {allDocuments.map((doc) => (
                    <li
                      key={doc}
                      className="flex items-center gap-2 rounded-lg border border-slate-100 px-3 py-2 text-sm text-slate-600"
                    >
                      <FileText className="h-4 w-4 text-slate-400" />
                      {doc}
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="mt-4 text-sm text-slate-400">
                  No documents on file yet.
                </p>
              )}
            </div>
          </div>

          <button
            type="button"
            onClick={handleSendReminder}
            className="inline-flex items-center gap-2 self-start rounded-lg bg-gold px-5 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-gold/90"
          >
            <Bell className="h-4 w-4" />
            Send Reminder
          </button>
        </>
      )}

      {isEditing && (
        <Modal
          title="Edit Tenant"
          description={`${unit.tenant} · ${property.name} · ${unit.unitNumber}`}
          onClose={() => setEditing(false)}
        >
          <EditTenantForm
            unit={unit}
            onCancel={() => setEditing(false)}
            onSuccess={(values) => {
              updateTenant(unit, values);
              setEditing(false);
            }}
          />
        </Modal>
      )}

      {isRemoving && (
        <Modal
          title="Remove Tenant"
          description="This will end the tenancy and mark the unit as vacant."
          onClose={() => setRemoving(false)}
        >
          <div className="flex flex-col gap-5">
            <div className="flex items-start gap-3 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
              <AlertTriangle className="h-4 w-4 shrink-0" />
              <p>
                Are you sure you want to remove <strong>{unit.tenant}</strong> from
                unit {unit.unitNumber}? This cannot be undone.
              </p>
            </div>
            <div className="flex justify-end gap-3">
              <button
                type="button"
                onClick={() => setRemoving(false)}
                className="rounded-lg border border-slate-300 px-5 py-2.5 text-sm font-semibold text-slate-600 transition-colors hover:bg-slate-50"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleRemoveTenant}
                className="rounded-lg bg-red-600 px-5 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-red-700"
              >
                Remove Tenant
              </button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
}
