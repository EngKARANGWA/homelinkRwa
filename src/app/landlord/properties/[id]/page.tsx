"use client";

import { useEffect, useState } from "react";
import { AppLink as Link } from "@/components/shared/AppLink";
import { useParams, useRouter } from "next/navigation";
import { ArrowLeft, ArrowRight, CheckCircle2, Eye, Plus, Search } from "lucide-react";
import { PROPERTIES, type Lease } from "@/lib/mock-admin-data";
import { getUnitsForProperty, type Unit } from "@/lib/units";
import { useLandlord } from "@/components/landlord/LandlordContext";
import { Modal } from "@/components/admin/Modal";
import { AddTenantForm } from "@/components/landlord/AddTenantForm";
import { SummaryCard } from "@/components/dashboard/SummaryCard";
import { EmptyRow, Table, TBody, Td, Th, THead, Tr } from "@/components/dashboard/Table";
import { DEFAULT_PAGE_SIZE, Pagination } from "@/components/dashboard/Pagination";
import { formatMoney } from "@/lib/money";
import { useLanguage } from "@/lib/i18n/LanguageContext";
import type { Translations } from "@/lib/i18n/translations";

type StatusFilter = "All" | Unit["currentPaymentStatus"];

const STATUS_STYLES: Record<string, string> = {
  Paid: "bg-emerald-50 text-emerald-700",
  Overdue: "bg-amber-50 text-amber-700",
  Arrears: "bg-red-50 text-red-700",
  Vacant: "bg-slate-100 text-slate-600",
};

const STATUS_KEY: Record<string, keyof Translations["dashboard"]["status"]> = {
  Paid: "paid",
  Overdue: "overdue",
  Arrears: "arrears",
  Vacant: "vacant",
};

export default function PropertyDetailPage() {
  const { t } = useLanguage();
  const c = t.dashboard.landlord.propertyDetail;
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const { landlordName, unitOverrides, addTenant } = useLandlord();
  const [isAddingTenant, setAddingTenant] = useState(false);
  const [justAddedTenant, setJustAddedTenant] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("All");

  const property = PROPERTIES.find((p) => p.id === id && p.owner === landlordName);

  const units: Unit[] = property ? getUnitsForProperty(property, unitOverrides) : [];

  const filteredUnits = units.filter((u) => {
    const matchesSearch =
      !search.trim() ||
      u.unitNumber.toLowerCase().includes(search.toLowerCase()) ||
      (u.tenant?.toLowerCase().includes(search.toLowerCase()) ?? false);
    const matchesStatus = statusFilter === "All" || u.currentPaymentStatus === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const [page, setPage] = useState(1);
  const totalPages = Math.max(1, Math.ceil(filteredUnits.length / DEFAULT_PAGE_SIZE));
  useEffect(() => {
    if (page > totalPages) setPage(totalPages);
  }, [page, totalPages]);
  const pagedUnits = filteredUnits.slice(
    (page - 1) * DEFAULT_PAGE_SIZE,
    page * DEFAULT_PAGE_SIZE,
  );

  if (!property) {
    return (
      <div className="flex flex-col items-center gap-3 py-24 text-center">
        <p className="text-sm text-slate-500">{c.propertyNotFound}</p>
        <Link
          href="/landlord/properties"
          className="text-sm font-medium text-gold hover:underline"
        >
          {c.backToProperties}
        </Link>
      </div>
    );
  }

  const totalUnits = units.length;
  const occupied = units.filter((u) => u.occupancyStatus === "Occupied").length;
  const occupancyPercent = totalUnits
    ? Math.round((occupied / totalUnits) * 100)
    : 0;
  const collected = units
    .filter((u) => u.currentPaymentStatus === "Paid")
    .reduce((sum, u) => sum + u.monthlyRent, 0);
  const outstanding = units
    .filter((u) => u.currentPaymentStatus === "Overdue" || u.currentPaymentStatus === "Arrears")
    .reduce((sum, u) => sum + u.monthlyRent, 0);

  const handleAddTenant = (lease: Lease) => {
    addTenant(lease);
    setAddingTenant(false);
    setJustAddedTenant(
      t.dashboard.landlord.properties.addedTenantTemplate
        .replace("{tenant}", lease.tenant)
        .replace("{property}", lease.property)
        .replace("{unit}", lease.unitNumber ?? ""),
    );
  };

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
          <h1 className="mt-2 text-2xl font-bold text-navy">{property.name}</h1>
          <p className="mt-1 text-sm text-slate-500">{property.address}</p>
        </div>
        <button
          type="button"
          onClick={() => setAddingTenant(true)}
          className="inline-flex items-center gap-2 rounded-lg bg-gold px-5 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-gold/90"
        >
          <Plus className="h-4 w-4" />
          {c.addTenant}
        </button>
      </div>

      {justAddedTenant && (
        <div className="flex items-center gap-2 rounded-lg border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm font-medium text-emerald-700">
          <CheckCircle2 className="h-4 w-4" />
          {justAddedTenant}
        </div>
      )}

      <div className="grid grid-cols-2 gap-5 lg:grid-cols-4">
        <SummaryCard label={c.summaryUnits} value={totalUnits} />
        <SummaryCard label={c.summaryOccupied} value={`${occupancyPercent}%`} />
        <SummaryCard
          label={c.summaryCollected}
          value={`${formatMoney(collected)} RWF`}
          accent="emerald"
        />
        <SummaryCard
          label={c.summaryOutstanding}
          value={`${formatMoney(outstanding)} RWF`}
          accent="red"
        />
      </div>

      <div className="flex flex-wrap items-end gap-4 rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
        <label className="flex min-w-[200px] flex-1 flex-col gap-1.5 text-sm font-medium text-slate-700">
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
          {c.status}
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value as StatusFilter)}
            className="rounded-lg border border-slate-300 px-3 py-2.5 text-sm text-navy focus:border-gold focus:outline-none"
          >
            <option value="All">{c.statusAll}</option>
            <option value="Paid">{t.dashboard.status.paid}</option>
            <option value="Overdue">{t.dashboard.status.overdue}</option>
            <option value="Arrears">{t.dashboard.status.arrears}</option>
            <option value="Vacant">{t.dashboard.status.vacant}</option>
          </select>
        </label>
      </div>

      <Table variant="standalone">
        <THead>
          <Tr>
            <Th className="max-w-[9rem] px-4 py-3 sm:px-6">{t.dashboard.table.unit}</Th>
            <Th className="hidden px-6 py-3 sm:table-cell">{t.dashboard.table.tenant}</Th>
            <Th className="hidden px-6 py-3 md:table-cell">{c.monthlyAmount}</Th>
            <Th className="px-4 py-3 sm:px-6">{t.dashboard.table.status}</Th>
            <Th className="px-4 py-3 text-right sm:px-6">{t.dashboard.table.actions}</Th>
          </Tr>
        </THead>
        <TBody>
          {pagedUnits.map((unit) => (
            <Tr key={unit.id}>
              <Td className="max-w-[9rem] px-4 py-3 sm:max-w-none sm:px-6">
                <p className="truncate font-medium text-navy sm:overflow-visible sm:whitespace-normal">
                  {unit.unitNumber}
                </p>
                <p className="truncate text-xs text-slate-400 sm:hidden">
                  {unit.tenant ?? c.vacant}
                </p>
                <p className="truncate text-xs text-slate-400 md:hidden">
                  {formatMoney(unit.monthlyRent)} RWF
                </p>
              </Td>
              <Td className="hidden px-6 py-3 text-slate-500 sm:table-cell">
                {unit.tenant ?? c.vacant}
              </Td>
              <Td className="hidden px-6 py-3 text-slate-500 md:table-cell">
                {formatMoney(unit.monthlyRent)}
              </Td>
              <Td className="px-4 py-3 sm:px-6">
                <span
                  className={`rounded-full px-2.5 py-1 text-xs font-medium ${STATUS_STYLES[unit.currentPaymentStatus]}`}
                >
                  {t.dashboard.status[STATUS_KEY[unit.currentPaymentStatus]]}
                </span>
              </Td>
              <Td className="px-4 py-3 text-right sm:px-6">
                <Link
                  href={`/landlord/properties/${property.id}/units/${unit.id}`}
                  className="inline-flex items-center gap-1.5 rounded-lg border border-slate-300 px-2.5 py-1 text-xs font-medium text-slate-600 hover:bg-slate-50"
                >
                  <Eye className="h-3.5 w-3.5" />
                  {t.dashboard.actions.view}
                </Link>
              </Td>
            </Tr>
          ))}
          {pagedUnits.length === 0 && (
            <EmptyRow colSpan={5}>{c.noUnitsMatch}</EmptyRow>
          )}
        </TBody>
      </Table>

      <Pagination
        page={page}
        totalPages={totalPages}
        totalItems={filteredUnits.length}
        pageSize={DEFAULT_PAGE_SIZE}
        onPageChange={setPage}
      />

      <Link
        href="/landlord/leases"
        className="inline-flex items-center gap-1 self-start text-sm font-medium text-gold hover:underline"
      >
        {c.viewLeasesLink}
        <ArrowRight className="h-3.5 w-3.5" />
      </Link>

      {isAddingTenant && (
        <Modal
          title={c.addTenant}
          description={c.addTenantDescriptionTemplate.replace("{property}", property.name)}
          onClose={() => setAddingTenant(false)}
        >
          <AddTenantForm
            properties={[property]}
            unitOverrides={unitOverrides}
            onCancel={() => setAddingTenant(false)}
            onSuccess={handleAddTenant}
          />
        </Modal>
      )}
    </div>
  );
}
