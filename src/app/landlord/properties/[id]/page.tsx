"use client";

import { useEffect, useState } from "react";
import { AppLink as Link } from "@/components/shared/AppLink";
import { useParams, useRouter } from "next/navigation";
import {
  ArrowLeft,
  ArrowRight,
  CheckCircle2,
  LayoutGrid,
  Pencil,
  Plus,
  Search,
  Trash2,
} from "lucide-react";
import {
  deleteUnit,
  getProperty,
  listUnits,
  updateProperty,
  uploadPropertyDocument,
} from "@/lib/api/properties";
import { ApiError } from "@/lib/api/client";
import type { Property, PropertyUnit, UnitStatus, UpdatePropertyInput } from "@/lib/api/types";
import { Modal } from "@/components/admin/Modal";
import { PropertyForm } from "@/components/admin/PropertyForm";
import { UnitSetupForm } from "@/components/admin/UnitSetupForm";
import { EditUnitForm } from "@/components/admin/EditUnitForm";
import { AddTenantForm } from "@/components/landlord/AddTenantForm";
import { SummaryCard } from "@/components/dashboard/SummaryCard";
import { EmptyRow, Table, TBody, Td, Th, THead, Tr } from "@/components/dashboard/Table";
import { DEFAULT_PAGE_SIZE, Pagination } from "@/components/dashboard/Pagination";
import { formatMoney } from "@/lib/money";
import { useLanguage } from "@/lib/i18n/LanguageContext";

type StatusFilter = "All" | UnitStatus;

const UNIT_STATUS_BADGE_STYLES: Record<UnitStatus, string> = {
  available: "bg-slate-100 text-slate-600",
  occupied: "bg-emerald-50 text-emerald-700",
  maintenance: "bg-amber-50 text-amber-700",
  inactive: "bg-slate-200 text-slate-500",
};

export default function PropertyDetailPage() {
  const { t } = useLanguage();
  const c = t.dashboard.landlord.propertyDetail;
  const { id } = useParams<{ id: string }>();
  const router = useRouter();

  const [property, setProperty] = useState<Property | null>(null);
  const [units, setUnits] = useState<PropertyUnit[]>([]);
  const [isLoading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);

  const [isAddingTenant, setAddingTenant] = useState(false);
  const [isEditing, setEditing] = useState(false);
  const [editError, setEditError] = useState<string | null>(null);
  const [isManagingUnits, setManagingUnits] = useState(false);
  const [unitsNotice, setUnitsNotice] = useState<string | null>(null);
  const [deletingUnitId, setDeletingUnitId] = useState<string | null>(null);
  const [deleteUnitError, setDeleteUnitError] = useState<string | null>(null);
  const [editingUnit, setEditingUnit] = useState<PropertyUnit | null>(null);
  const [justAddedTenant, setJustAddedTenant] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("All");
  const [page, setPage] = useState(1);

  useEffect(() => {
    if (!id) return;
    let cancelled = false;
    setLoading(true);
    Promise.all([getProperty(id), listUnits(id)])
      .then(([propertyResult, unitsResult]) => {
        if (cancelled) return;
        setProperty(propertyResult);
        setUnits(unitsResult);
        setLoadError(null);
      })
      .catch((err) => {
        if (!cancelled) {
          setLoadError(err instanceof ApiError ? err.message : "Failed to load this property.");
        }
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [id]);

  const reloadUnits = () => {
    if (!id) return;
    listUnits(id).then(setUnits).catch(() => undefined);
  };

  const filteredUnits = units.filter((u) => {
    const matchesSearch = !search.trim() || u.label.toLowerCase().includes(search.toLowerCase());
    const matchesStatus = statusFilter === "All" || u.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const totalPages = Math.max(1, Math.ceil(filteredUnits.length / DEFAULT_PAGE_SIZE));
  useEffect(() => {
    if (page > totalPages) setPage(totalPages);
  }, [page, totalPages]);
  const pagedUnits = filteredUnits.slice(
    (page - 1) * DEFAULT_PAGE_SIZE,
    page * DEFAULT_PAGE_SIZE,
  );

  if (isLoading) {
    return (
      <div className="flex flex-col items-center gap-3 py-24 text-center text-sm text-slate-400">
        Loading property...
      </div>
    );
  }

  if (loadError || !property) {
    return (
      <div className="flex flex-col items-center gap-3 py-24 text-center">
        <p className="text-sm text-slate-500">{loadError ?? c.propertyNotFound}</p>
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
  const occupied = units.filter((u) => u.status === "occupied").length;
  const occupancyPercent = totalUnits ? Math.round((occupied / totalUnits) * 100) : 0;

  const handleAddTenant = () => {
    setAddingTenant(false);
    reloadUnits();
    setJustAddedTenant(
      `Tenant added and assigned to their unit in ${property.title} — they'll receive an email to set up their account.`,
    );
  };

  const handleEditProperty = async (values: UpdatePropertyInput, documentFile: File | null) => {
    setEditError(null);
    try {
      const updated = await updateProperty(property.id, values);
      if (documentFile) {
        await uploadPropertyDocument(property.id, documentFile).catch(() => undefined);
      }
      setProperty(updated);
      setEditing(false);
    } catch (err) {
      setEditError(err instanceof ApiError ? err.message : "Failed to update property.");
    }
  };

  const handleDeleteUnit = async (unit: PropertyUnit) => {
    if (!window.confirm(`Delete unit "${unit.label}"? This can't be undone.`)) return;
    setDeletingUnitId(unit.id);
    setDeleteUnitError(null);
    try {
      await deleteUnit(property.id, unit.id);
      reloadUnits();
    } catch (err) {
      setDeleteUnitError(err instanceof ApiError ? err.message : "Failed to delete this unit.");
    } finally {
      setDeletingUnitId(null);
    }
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
          <h1 className="mt-2 text-2xl font-bold text-navy">{property.title}</h1>
          <p className="mt-1 text-sm text-slate-500">{property.addressLine}</p>
        </div>
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => setEditing(true)}
            className="inline-flex items-center gap-2 rounded-lg border border-slate-300 px-5 py-2.5 text-sm font-semibold text-slate-600 transition-colors hover:bg-slate-50"
          >
            <Pencil className="h-4 w-4" />
            {c.edit}
          </button>
          <button
            type="button"
            onClick={() => setManagingUnits(true)}
            className="inline-flex items-center gap-2 rounded-lg border border-slate-300 px-5 py-2.5 text-sm font-semibold text-slate-600 transition-colors hover:bg-slate-50"
          >
            <LayoutGrid className="h-4 w-4" />
            Manage Units
          </button>
          <button
            type="button"
            onClick={() => setAddingTenant(true)}
            className="inline-flex items-center gap-2 rounded-lg bg-gold px-5 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-gold/90"
          >
            <Plus className="h-4 w-4" />
            {c.addTenant}
          </button>
        </div>
      </div>

      {justAddedTenant && (
        <div className="flex items-center gap-2 rounded-lg border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm font-medium text-emerald-700">
          <CheckCircle2 className="h-4 w-4" />
          {justAddedTenant}
        </div>
      )}

      {unitsNotice && (
        <div className="flex items-center gap-2 rounded-lg border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm font-medium text-emerald-700">
          <CheckCircle2 className="h-4 w-4" />
          {unitsNotice}
        </div>
      )}

      {deleteUnitError && (
        <p className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {deleteUnitError}
        </p>
      )}

      <div className="grid grid-cols-2 gap-5 lg:grid-cols-2">
        <SummaryCard label={c.summaryUnits} value={totalUnits} />
        <SummaryCard label={c.summaryOccupied} value={`${occupancyPercent}%`} />
      </div>

      {property.unitsCount != null && property.unitsCount !== totalUnits && (
        <p className="rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">
          This property is set to <strong>{property.unitsCount}</strong> planned units, but has{" "}
          <strong>{totalUnits}</strong> actual unit record{totalUnits === 1 ? "" : "s"}
          {" "}below. Use &quot;Manage Units&quot; to add or remove units so the two match.
        </p>
      )}

      <div className="flex flex-wrap items-end gap-4 rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
        <label className="flex min-w-[200px] flex-1 flex-col gap-1.5 text-sm font-medium text-slate-700">
          {c.search}
          <div className="flex items-center gap-2 rounded-lg border border-slate-300 px-3 py-2.5 focus-within:border-gold">
            <Search className="h-4 w-4 text-slate-400" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by unit label"
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
            <option value="available">{t.dashboard.status.available}</option>
            <option value="occupied">{t.dashboard.status.occupied}</option>
            <option value="maintenance">{t.dashboard.status.maintenance}</option>
            <option value="inactive">{t.dashboard.status.inactive}</option>
          </select>
        </label>
      </div>

      <Table variant="standalone">
        <THead>
          <Tr>
            <Th className="max-w-[9rem] px-4 py-3 sm:px-6">{t.dashboard.table.unit}</Th>
            <Th className="hidden px-6 py-3 sm:table-cell">Floor</Th>
            <Th className="hidden px-6 py-3 md:table-cell">{c.monthlyAmount}</Th>
            <Th className="px-4 py-3 sm:px-6">{t.dashboard.table.status}</Th>
            <Th className="px-4 py-3 text-right sm:px-6">Action</Th>
          </Tr>
        </THead>
        <TBody>
          {pagedUnits.map((unit) => (
            <Tr key={unit.id}>
              <Td className="max-w-[9rem] px-4 py-3 sm:max-w-none sm:px-6">
                <p className="truncate font-medium text-navy sm:overflow-visible sm:whitespace-normal">
                  {unit.label}
                </p>
                <p className="truncate text-xs text-slate-400 md:hidden">
                  {formatMoney(Number(unit.rentAmount))} RWF
                </p>
              </Td>
              <Td className="hidden px-6 py-3 text-slate-500 sm:table-cell">
                {unit.floor ?? "—"}
              </Td>
              <Td className="hidden px-6 py-3 text-slate-500 md:table-cell">
                {formatMoney(Number(unit.rentAmount))}
              </Td>
              <Td className="px-4 py-3 sm:px-6">
                <span
                  className={`rounded-full px-2.5 py-1 text-xs font-medium ${UNIT_STATUS_BADGE_STYLES[unit.status]}`}
                >
                  {t.dashboard.status[unit.status]}
                </span>
              </Td>
              <Td className="px-4 py-3 text-right sm:px-6">
                <div className="flex items-center justify-end gap-1">
                  <button
                    type="button"
                    onClick={() => setEditingUnit(unit)}
                    title="Edit this unit"
                    className="inline-flex items-center gap-1 rounded-md p-1.5 text-slate-400 transition-colors hover:bg-slate-100 hover:text-navy"
                  >
                    <Pencil className="h-4 w-4" />
                  </button>
                  <button
                    type="button"
                    disabled={unit.status === "occupied" || deletingUnitId === unit.id}
                    onClick={() => handleDeleteUnit(unit)}
                    title={
                      unit.status === "occupied"
                        ? "End the lease on this unit before deleting it"
                        : "Delete this unit"
                    }
                    className="inline-flex items-center gap-1 rounded-md p-1.5 text-slate-400 transition-colors hover:bg-red-50 hover:text-red-600 disabled:cursor-not-allowed disabled:opacity-30 disabled:hover:bg-transparent disabled:hover:text-slate-400"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </Td>
            </Tr>
          ))}
          {pagedUnits.length === 0 && <EmptyRow colSpan={5}>{c.noUnitsMatch}</EmptyRow>}
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
          description={c.addTenantDescriptionTemplate.replace("{property}", property.title)}
          onClose={() => setAddingTenant(false)}
        >
          <AddTenantForm
            propertyId={property.id}
            defaultRentAmount={Number(property.rentAmount)}
            onCancel={() => setAddingTenant(false)}
            onSuccess={handleAddTenant}
          />
        </Modal>
      )}

      {isEditing && (
        <Modal
          title={c.editPropertyTitle}
          description={c.editPropertyDescription}
          onClose={() => setEditing(false)}
        >
          {editError && (
            <p className="mb-4 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
              {editError}
            </p>
          )}
          <PropertyForm
            owners={[]}
            showOwnerField={false}
            initialProperty={property}
            onCancel={() => setEditing(false)}
            onSuccess={handleEditProperty}
          />
        </Modal>
      )}

      {editingUnit && (
        <Modal
          title={`Edit Unit — ${editingUnit.label}`}
          description="Update this unit's own details."
          onClose={() => setEditingUnit(null)}
        >
          <EditUnitForm
            propertyId={property.id}
            unit={editingUnit}
            onCancel={() => setEditingUnit(null)}
            onSuccess={() => {
              setEditingUnit(null);
              reloadUnits();
              setUnitsNotice(`"${editingUnit.label}" updated.`);
            }}
          />
        </Modal>
      )}

      {isManagingUnits && (
        <Modal
          title={`Manage Units — ${property.title}`}
          description="Add units to this property, or import/generate several at once."
          onClose={() => setManagingUnits(false)}
        >
          <UnitSetupForm
            propertyId={property.id}
            units={units}
            onSkip={() => setManagingUnits(false)}
            onDone={({ created, removed }) => {
              setManagingUnits(false);
              reloadUnits();
              const parts: string[] = [];
              if (created > 0) parts.push(`${created} unit${created === 1 ? "" : "s"} added`);
              if (removed > 0) parts.push(`${removed} unit${removed === 1 ? "" : "s"} removed`);
              setUnitsNotice(parts.length > 0 ? `${parts.join(" and ")} for ${property.title}.` : null);
            }}
          />
        </Modal>
      )}
    </div>
  );
}
