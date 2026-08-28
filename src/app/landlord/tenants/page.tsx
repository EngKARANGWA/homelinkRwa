"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { AlertCircle, Bell, CheckCircle2, Eye, Plus, Search } from "lucide-react";
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
import { useLanguage } from "@/lib/i18n/LanguageContext";
import type { Translations } from "@/lib/i18n/translations";

type TenantStatus = "Paid" | "Overdue";

const STATUS_STYLES: Record<TenantStatus, string> = {
  Paid: "bg-emerald-50 text-emerald-700",
  Overdue: "bg-red-50 text-red-700",
};

const STATUS_KEY: Record<TenantStatus, keyof Translations["dashboard"]["status"]> = {
  Paid: "paid",
  Overdue: "overdue",
};

function daysBetween(from: string, to: string): number {
  const ms = new Date(to).getTime() - new Date(from).getTime();
  return Math.max(0, Math.floor(ms / (1000 * 60 * 60 * 24)));
}

type TenantRow = {
  leaseId: string;
  propertyId: string;
  unitId: string | null;
  tenantLabel: string;
  propertyTitle: string;
  unitLabel: string;
  monthlyRent: number;
  status: TenantStatus;
  endDate: string | null;
  daysOverdue: number | null;
};

export default function LandlordTenantsPage() {
  const { user } = useAuth();
  const { t } = useLanguage();
  const c = t.dashboard.landlord.tenants;
  const [properties, setProperties] = useState<Property[]>([]);
  const [leases, setLeases] = useState<Lease[]>([]);
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [units, setUnits] = useState<PropertyUnit[]>([]);
  const [isLoading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [propertyFilter, setPropertyFilter] = useState(t.dashboard.landlord.payments.allProperties);
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

  const oldestOverdueInvoiceForLease = (lease: Lease) =>
    invoices
      .filter((inv) => inv.leaseId === lease.id && inv.status === "overdue")
      .sort((a, b) => a.dueDate.localeCompare(b.dueDate))[0];

  const rows: TenantRow[] = leases.map((lease) => {
    const overdueInvoice = oldestOverdueInvoiceForLease(lease);
    return {
      leaseId: lease.id,
      propertyId: lease.propertyId,
      unitId: lease.unitId ?? null,
      tenantLabel: `Tenant ${lease.tenantId.slice(0, 8).toUpperCase()}`,
      propertyTitle: propertyById.get(lease.propertyId)?.title ?? "—",
      unitLabel: unitById.get(lease.unitId)?.label ?? "—",
      monthlyRent: Number(lease.rentAmount),
      status: overdueInvoice ? "Overdue" : "Paid",
      endDate: lease.endDate,
      daysOverdue: overdueInvoice
        ? daysBetween(overdueInvoice.dueDate, new Date().toISOString())
        : null,
    };
  });

  const propertyOptions = [t.dashboard.landlord.payments.allProperties, ...properties.map((p) => p.title)];

  const filteredRows = rows.filter((row) => {
    const matchesSearch =
      !search.trim() ||
      row.tenantLabel.toLowerCase().includes(search.toLowerCase()) ||
      row.unitLabel.toLowerCase().includes(search.toLowerCase());
    const matchesProperty =
      propertyFilter === t.dashboard.landlord.payments.allProperties ||
      row.propertyTitle === propertyFilter;
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

  const handleSendReminders = () => {
    setNotice(
      overdueCount > 0
        ? c.reminderSentTemplate
            .replace("{count}", String(overdueCount))
            .replace("{plural}", overdueCount === 1 ? "" : "s")
        : c.noOverdueTenants,
    );
  };

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-navy">{c.title}</h1>
          <p className="mt-1 text-sm text-slate-500">
            {c.subtitle}
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <button
            type="button"
            onClick={handleSendReminders}
            className="inline-flex items-center gap-2 rounded-lg border border-slate-300 px-5 py-2.5 text-sm font-semibold text-slate-600 transition-colors hover:bg-slate-50"
          >
            <Bell className="h-4 w-4" />
            {c.remindOverdue}
          </button>
          <button
            type="button"
            onClick={() => setInviting(true)}
            className="inline-flex items-center gap-2 rounded-lg bg-gold px-5 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-gold/90"
          >
            <Plus className="h-4 w-4" />
            Invite Tenant
          </button>
        </div>
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
        <SummaryCard label={c.totalTenants} value={rows.length} />
        <SummaryCard label={c.paid} value={paidCount} accent="emerald" />
        <SummaryCard label={c.overdue} value={overdueCount} accent="red" />
        <SummaryCard
          label={c.totalMonthlyRent}
          value={`${formatMoney(totalMonthlyRent)} RWF`}
        />
      </div>

      <div className="flex flex-wrap items-end gap-4 rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
        <label className="flex flex-1 min-w-[200px] flex-col gap-1.5 text-sm font-medium text-slate-700">
          {c.search}
          <div className="flex items-center gap-2 rounded-lg border border-slate-300 px-3 py-2.5 focus-within:border-gold">
            <Search className="h-4 w-4 text-slate-400" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder={c.searchPlaceholder}
              className="w-full bg-transparent text-sm text-navy placeholder:text-slate-400 focus:outline-none"
            />
          </div>
        </label>

        <label className="flex flex-col gap-1.5 text-sm font-medium text-slate-700">
          {c.property}
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
          {c.status}
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value as typeof statusFilter)}
            className="rounded-lg border border-slate-300 px-3 py-2.5 text-sm text-navy focus:border-gold focus:outline-none"
          >
            <option value="All">{t.dashboard.actions.all}</option>
            <option value="Paid">{t.dashboard.status.paid}</option>
            <option value="Overdue">{t.dashboard.status.overdue}</option>
          </select>
        </label>
      </div>

      <Table variant="standalone">
        <THead>
          <Tr>
            <Th className="max-w-[10rem] px-4 py-3 sm:px-6">{t.dashboard.table.tenant}</Th>
            <Th className="hidden px-6 py-3 md:table-cell">{t.dashboard.table.property}</Th>
            <Th className="hidden px-6 py-3 md:table-cell">{t.dashboard.table.unit}</Th>
            <Th className="hidden px-6 py-3 sm:table-cell">{c.monthlyRent}</Th>
            <Th className="px-4 py-3 sm:px-6">{t.dashboard.table.status}</Th>
            <Th className="hidden px-6 py-3 lg:table-cell">{c.leaseEnd}</Th>
            <Th className="px-4 py-3 text-right sm:px-6">{t.dashboard.table.actions}</Th>
          </Tr>
        </THead>
        <TBody>
          {isLoading ? (
            <EmptyRow colSpan={7}>Loading tenants...</EmptyRow>
          ) : pagedRows.length === 0 ? (
            <EmptyRow colSpan={7}>{c.noTenantsMatch}</EmptyRow>
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
                    {t.dashboard.status[STATUS_KEY[row.status]]}
                  </span>
                  {row.status === "Overdue" && row.daysOverdue !== null && (
                    <p className="mt-1 whitespace-nowrap text-xs text-slate-400">
                      {row.daysOverdue} day{row.daysOverdue === 1 ? "" : "s"} overdue
                    </p>
                  )}
                </Td>
                <Td className="hidden px-6 py-3 text-slate-500 lg:table-cell">
                  {row.endDate ?? t.dashboard.landlord.unitDetail.openEnded}
                </Td>
                <Td className="px-4 py-3 text-right sm:px-6">
                  {row.unitId && (
                    <Link
                      href={`/landlord/properties/${row.propertyId}/units/${row.unitId}`}
                      className="inline-flex items-center gap-1.5 rounded-lg border border-slate-300 px-2.5 py-1 text-xs font-medium text-slate-600 hover:bg-slate-50"
                    >
                      <Eye className="h-3.5 w-3.5" />
                      {t.dashboard.actions.view}
                    </Link>
                  )}
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
