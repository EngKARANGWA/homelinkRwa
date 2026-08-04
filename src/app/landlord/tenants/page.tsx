"use client";

import { useEffect, useState } from "react";
import { AlertCircle, CheckCircle2, Plus, Search } from "lucide-react";
import { listProperties, listUnits } from "@/lib/api/properties";
import { listLeases } from "@/lib/api/leases";
import { listInvoices } from "@/lib/api/payments";
import { inviteTenant } from "@/lib/api/iam";
import { ApiError } from "@/lib/api/client";
import type { Invoice, Lease, Property, PropertyUnit } from "@/lib/api/types";
import { useAuth } from "@/components/auth/AuthContext";
import { Modal } from "@/components/admin/Modal";
import { InviteTenantForm, type InviteTenantValues } from "@/components/landlord/InviteTenantForm";
import { SummaryCard } from "@/components/dashboard/SummaryCard";
import { EmptyRow, Table, TBody, Td, Th, THead, Tr } from "@/components/dashboard/Table";
import { DEFAULT_PAGE_SIZE, Pagination } from "@/components/dashboard/Pagination";
import { formatMoney } from "@/lib/money";

type TenantStatus = "Paid" | "Overdue";

const STATUS_STYLES: Record<TenantStatus, string> = {
  Paid: "bg-emerald-50 text-emerald-700",
  Overdue: "bg-red-50 text-red-700",
};

type TenantRow = {
  leaseId: string;
  tenantLabel: string;
  propertyTitle: string;
  unitLabel: string;
  monthlyRent: number;
  status: TenantStatus;
  endDate: string | null;
};

export default function LandlordTenantsPage() {
  const { user } = useAuth();
  const [properties, setProperties] = useState<Property[]>([]);
  const [leases, setLeases] = useState<Lease[]>([]);
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [units, setUnits] = useState<PropertyUnit[]>([]);
  const [isLoading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [propertyFilter, setPropertyFilter] = useState("All Properties");
  const [statusFilter, setStatusFilter] = useState<"All" | TenantStatus>("All");
  const [isInviting, setInviting] = useState(false);
  const [notice, setNotice] = useState<string | null>(null);
  const [page, setPage] = useState(1);

  const load = () => {
    if (!user) return;
    setLoading(true);
    setError(null);
    Promise.all([
      listProperties({ ownerId: user.id, limit: 100 }),
      listLeases({ status: "active", limit: 100 }),
      listInvoices({ limit: 100 }),
    ])
      .then(async ([propertiesRes, leasesRes, invoicesRes]) => {
        setProperties(propertiesRes.data);
        setLeases(leasesRes.data);
        setInvoices(invoicesRes.data);
        const unitsByProperty = await Promise.all(
          propertiesRes.data.map((p) => listUnits(p.id)),
        );
        setUnits(unitsByProperty.flat());
      })
      .catch((err) =>
        setError(err instanceof ApiError ? err.message : "Failed to load tenants."),
      )
      .finally(() => setLoading(false));
  };

  useEffect(load, [user]);

  const propertyById = new Map(properties.map((p) => [p.id, p]));
  const unitById = new Map(units.map((u) => [u.id, u]));

  const statusForLease = (lease: Lease): TenantStatus => {
    const hasOverdueInvoice = invoices.some(
      (inv) => inv.leaseId === lease.id && inv.status === "overdue",
    );
    return hasOverdueInvoice ? "Overdue" : "Paid";
  };

  const rows: TenantRow[] = leases.map((lease) => ({
    leaseId: lease.id,
    tenantLabel: `Tenant ${lease.tenantId.slice(0, 8).toUpperCase()}`,
    propertyTitle: propertyById.get(lease.propertyId)?.title ?? "—",
    unitLabel: unitById.get(lease.unitId)?.label ?? "—",
    monthlyRent: Number(lease.rentAmount),
    status: statusForLease(lease),
    endDate: lease.endDate,
  }));

  const propertyOptions = ["All Properties", ...properties.map((p) => p.title)];

  const filteredRows = rows.filter((row) => {
    const matchesSearch =
      !search.trim() ||
      row.tenantLabel.toLowerCase().includes(search.toLowerCase()) ||
      row.unitLabel.toLowerCase().includes(search.toLowerCase());
    const matchesProperty =
      propertyFilter === "All Properties" || row.propertyTitle === propertyFilter;
    const matchesStatus = statusFilter === "All" || row.status === statusFilter;
    return matchesSearch && matchesProperty && matchesStatus;
  });

  const totalPages = Math.max(1, Math.ceil(filteredRows.length / DEFAULT_PAGE_SIZE));
  useEffect(() => {
    if (page > totalPages) setPage(totalPages);
  }, [page, totalPages]);
  const pagedRows = filteredRows.slice(
    (page - 1) * DEFAULT_PAGE_SIZE,
    page * DEFAULT_PAGE_SIZE,
  );

  const overdueCount = rows.filter((r) => r.status === "Overdue").length;
  const paidCount = rows.filter((r) => r.status === "Paid").length;
  const totalMonthlyRent = rows.reduce((sum, r) => sum + r.monthlyRent, 0);

  const handleInvite = async (values: InviteTenantValues) => {
    setActionError(null);
    try {
      await inviteTenant(values.email, values.propertyId);
      setInviting(false);
      setNotice(`Invite sent to ${values.email}.`);
    } catch (err) {
      setActionError(err instanceof ApiError ? err.message : "Failed to send invite.");
    }
  };

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-navy">Tenants</h1>
          <p className="mt-1 text-sm text-slate-500">
            Everyone renting from you, in one place.
          </p>
        </div>
        <button
          type="button"
          onClick={() => setInviting(true)}
          className="inline-flex items-center gap-2 rounded-lg bg-gold px-5 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-gold/90"
        >
          <Plus className="h-4 w-4" />
          Invite Tenant
        </button>
      </div>

      {notice && (
        <div className="flex items-center gap-2 rounded-lg border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm font-medium text-emerald-700">
          <CheckCircle2 className="h-4 w-4" />
          {notice}
        </div>
      )}

      {(error || actionError) && (
        <div className="flex items-center justify-between gap-3 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-700">
          <span className="flex items-center gap-2">
            <AlertCircle className="h-4 w-4" />
            {error ?? actionError}
          </span>
          {error && (
            <button type="button" onClick={load} className="underline hover:no-underline">
              Retry
            </button>
          )}
        </div>
      )}

      <div className="grid grid-cols-2 gap-5 lg:grid-cols-4">
        <SummaryCard label="Total Tenants" value={rows.length} />
        <SummaryCard label="Paid" value={paidCount} accent="emerald" />
        <SummaryCard label="Overdue" value={overdueCount} accent="red" />
        <SummaryCard
          label="Total Monthly Rent"
          value={`${formatMoney(totalMonthlyRent)} RWF`}
        />
      </div>

      <div className="flex flex-wrap items-end gap-4 rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
        <label className="flex flex-1 min-w-[200px] flex-col gap-1.5 text-sm font-medium text-slate-700">
          Search
          <div className="flex items-center gap-2 rounded-lg border border-slate-300 px-3 py-2.5 focus-within:border-gold">
            <Search className="h-4 w-4 text-slate-400" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by unit"
              className="w-full bg-transparent text-sm text-navy placeholder:text-slate-400 focus:outline-none"
            />
          </div>
        </label>

        <label className="flex flex-col gap-1.5 text-sm font-medium text-slate-700">
          Property
          <select
            value={propertyFilter}
            onChange={(e) => setPropertyFilter(e.target.value)}
            className="rounded-lg border border-slate-300 px-3 py-2.5 text-sm text-navy focus:border-gold focus:outline-none"
          >
            {propertyOptions.map((name) => (
              <option key={name}>{name}</option>
            ))}
          </select>
        </label>

        <label className="flex flex-col gap-1.5 text-sm font-medium text-slate-700">
          Status
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value as typeof statusFilter)}
            className="rounded-lg border border-slate-300 px-3 py-2.5 text-sm text-navy focus:border-gold focus:outline-none"
          >
            <option value="All">All</option>
            <option value="Paid">Paid</option>
            <option value="Overdue">Overdue</option>
          </select>
        </label>
      </div>

      <Table variant="standalone">
        <THead>
          <Tr>
            <Th className="max-w-[10rem] px-4 py-3 sm:px-6">Tenant</Th>
            <Th className="hidden px-6 py-3 md:table-cell">Property</Th>
            <Th className="hidden px-6 py-3 md:table-cell">Unit</Th>
            <Th className="hidden px-6 py-3 sm:table-cell">Monthly Rent</Th>
            <Th className="px-4 py-3 sm:px-6">Status</Th>
            <Th className="hidden px-6 py-3 lg:table-cell">Lease End</Th>
          </Tr>
        </THead>
        <TBody>
          {isLoading ? (
            <EmptyRow colSpan={6}>Loading tenants...</EmptyRow>
          ) : pagedRows.length === 0 ? (
            <EmptyRow colSpan={6}>No tenants match these filters.</EmptyRow>
          ) : (
            pagedRows.map((row) => (
              <Tr key={row.leaseId}>
                <Td className="max-w-[10rem] px-4 py-3 sm:max-w-none sm:px-6">
                  <p className="truncate font-medium text-navy sm:overflow-visible sm:whitespace-normal">
                    {row.tenantLabel}
                  </p>
                  <p className="truncate text-xs text-slate-400 md:hidden">
                    {row.propertyTitle} · {row.unitLabel}
                  </p>
                </Td>
                <Td className="hidden px-6 py-3 text-slate-500 md:table-cell">
                  {row.propertyTitle}
                </Td>
                <Td className="hidden px-6 py-3 text-slate-500 md:table-cell">
                  {row.unitLabel}
                </Td>
                <Td className="hidden px-6 py-3 text-slate-500 sm:table-cell">
                  {formatMoney(row.monthlyRent)}
                </Td>
                <Td className="px-4 py-3 sm:px-6">
                  <span
                    className={`rounded-full px-2.5 py-1 text-xs font-medium ${STATUS_STYLES[row.status]}`}
                  >
                    {row.status}
                  </span>
                </Td>
                <Td className="hidden px-6 py-3 text-slate-500 lg:table-cell">
                  {row.endDate ?? "Open-ended"}
                </Td>
              </Tr>
            ))
          )}
        </TBody>
      </Table>

      <Pagination
        page={page}
        totalPages={totalPages}
        totalItems={filteredRows.length}
        pageSize={DEFAULT_PAGE_SIZE}
        onPageChange={setPage}
      />

      {isInviting && (
        <Modal
          title="Invite Tenant"
          description="Send a tenant an invite to join HomeLink."
          onClose={() => setInviting(false)}
        >
          <InviteTenantForm
            properties={properties}
            onCancel={() => setInviting(false)}
            onSuccess={handleInvite}
          />
        </Modal>
      )}
    </div>
  );
}
