"use client";

import { useEffect, useState } from "react";
import { AppLink as Link } from "@/components/shared/AppLink";
import { useParams, useRouter } from "next/navigation";
import { ArrowLeft, Eye, LayoutGrid, Pencil, Search, Trash2 } from "lucide-react";
import {
  deleteUnit,
  getProperty,
  listFloors,
  listUnitsByFloor,
} from "@/lib/api/properties";
import { ApiError } from "@/lib/api/client";
import type { Floor, Property, PropertyUnit, UnitStatus } from "@/lib/api/types";
import { Modal } from "@/components/admin/Modal";
import { ConfirmModal } from "@/components/shared/ConfirmModal";
import { EditUnitForm } from "@/components/admin/EditUnitForm";
import { UnitSetupForm } from "@/components/admin/UnitSetupForm";
import { EmptyRow, Table, TBody, Td, Th, THead, Tr } from "@/components/dashboard/Table";
import { DEFAULT_PAGE_SIZE, Pagination } from "@/components/dashboard/Pagination";
import { formatMoney } from "@/lib/money";
import { useToast } from "@/components/shared/ToastContext";
import { useLanguage } from "@/lib/i18n/LanguageContext";

type StatusFilter = "All" | UnitStatus;

const UNIT_STATUS_BADGE_STYLES: Record<UnitStatus, string> = {
  available: "bg-slate-100 text-slate-600",
  occupied: "bg-emerald-50 text-emerald-700",
  maintenance: "bg-amber-50 text-amber-700",
  inactive: "bg-slate-200 text-slate-500",
};

export default function FloorDetailPage() {
  const { t } = useLanguage();
  const toast = useToast();
  const { id, floorId } = useParams<{ id: string; floorId: string }>();
  const router = useRouter();

  const [property, setProperty] = useState<Property | null>(null);
  const [floor, setFloor] = useState<Floor | null>(null);
  const [units, setUnits] = useState<PropertyUnit[]>([]);
  const [isLoading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);

  const [isManaging, setManaging] = useState(false);
  const [deletingUnit, setDeletingUnit] = useState<PropertyUnit | null>(null);
  const [editingUnit, setEditingUnit] = useState<PropertyUnit | null>(null);
  const [floors, setFloors] = useState<Floor[]>([]);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("All");
  const [page, setPage] = useState(1);

  const load = () => {
    if (!id || !floorId) return;
    setLoading(true);
    Promise.all([getProperty(id), listFloors(id), listUnitsByFloor(id, floorId)])
      .then(([propertyResult, floorsResult, unitsResult]) => {
        setProperty(propertyResult);
        setFloors(floorsResult);
        setFloor(floorsResult.find((f) => f.id === floorId) ?? null);
        setUnits(unitsResult);
        setLoadError(null);
      })
      .catch((err) => {
        setLoadError(err instanceof ApiError ? err.message : "Failed to load this floor.");
      })
      .finally(() => setLoading(false));
  };

  useEffect(load, [id, floorId]);

  const reloadUnits = () => {
    if (!id || !floorId) return;
    listUnitsByFloor(id, floorId).then(setUnits).catch(() => undefined);
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
        Loading floor...
      </div>
    );
  }

  if (loadError || !property || !floor) {
    return (
      <div className="flex flex-col items-center gap-3 py-24 text-center">
        <p className="text-sm text-slate-500">{loadError ?? "Floor not found."}</p>
        <Link
          href={`/landlord/properties/${id}`}
          className="text-sm font-medium text-gold hover:underline"
        >
          Back to property
        </Link>
      </div>
    );
  }

  const occupied = units.filter((u) => u.status === "occupied").length;

  const handleDeleteUnit = async () => {
    if (!deletingUnit) return;
    try {
      await deleteUnit(property.id, deletingUnit.id);
    } catch (err) {
      throw new Error(err instanceof ApiError ? err.message : "Failed to delete this unit.");
    }
    toast.success(`"${deletingUnit.label}" deleted.`);
    setDeletingUnit(null);
    reloadUnits();
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
            Back
          </button>
          <h1 className="mt-2 text-2xl font-bold text-navy">{floor.name}</h1>
          <p className="mt-1 text-sm text-slate-500">
            {property.title} · {property.location}
          </p>
        </div>
        <button
          type="button"
          onClick={() => setManaging(true)}
          className="inline-flex items-center gap-2 rounded-lg bg-gold px-5 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-gold/90"
        >
          <LayoutGrid className="h-4 w-4" />
          Manage Floor
        </button>
      </div>

      <div className="grid grid-cols-2 gap-5 lg:grid-cols-3">
        <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
          <p className="text-xs text-slate-400">Units</p>
          <p className="mt-1 text-2xl font-bold text-navy">{units.length}</p>
        </div>
        <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
          <p className="text-xs text-slate-400">Occupied</p>
          <p className="mt-1 text-2xl font-bold text-navy">{occupied}</p>
        </div>
        <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
          <p className="text-xs text-slate-400">Scale</p>
          <p className="mt-1 text-2xl font-bold text-navy">{floor.scale ?? "—"}</p>
        </div>
      </div>

      <div className="flex flex-wrap items-end gap-4 rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
        <label className="flex min-w-[200px] flex-1 flex-col gap-1.5 text-sm font-medium text-slate-700">
          Search
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
          Status
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value as StatusFilter)}
            className="rounded-lg border border-slate-300 px-3 py-2.5 text-sm text-navy focus:border-gold focus:outline-none"
          >
            <option value="All">All</option>
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
            <Th className="hidden px-6 py-3 md:table-cell">Monthly Rent</Th>
            <Th className="hidden px-6 py-3 lg:table-cell">Scale</Th>
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
              <Td className="hidden px-6 py-3 text-slate-500 md:table-cell">
                {formatMoney(Number(unit.rentAmount))}
              </Td>
              <Td className="hidden px-6 py-3 text-slate-500 lg:table-cell">
                {unit.scale ?? "—"}
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
                    onClick={() => router.push(`/landlord/properties/${property.id}/units/${unit.id}`)}
                    title="View unit details"
                    className="inline-flex items-center gap-1 rounded-md p-1.5 text-slate-400 transition-colors hover:bg-slate-100 hover:text-navy"
                  >
                    <Eye className="h-4 w-4" />
                  </button>
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
                    disabled={unit.status === "occupied"}
                    onClick={() => setDeletingUnit(unit)}
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
          {pagedUnits.length === 0 && <EmptyRow colSpan={5}>No units match these filters.</EmptyRow>}
        </TBody>
      </Table>

      <Pagination
        page={page}
        totalPages={totalPages}
        totalItems={filteredUnits.length}
        pageSize={DEFAULT_PAGE_SIZE}
        onPageChange={setPage}
      />

      {editingUnit && (
        <Modal
          title={`Edit Unit — ${editingUnit.label}`}
          description="Update this unit's own details."
          onClose={() => setEditingUnit(null)}
        >
          <EditUnitForm
            propertyId={property.id}
            propertyType={property.type}
            unit={editingUnit}
            floors={floors}
            onCancel={() => setEditingUnit(null)}
            onSuccess={() => {
              setEditingUnit(null);
              reloadUnits();
              toast.success(`"${editingUnit.label}" updated.`);
            }}
          />
        </Modal>
      )}

      {isManaging && (
        <Modal
          title={`Manage Floor — ${floor.name}`}
          description={`Add units to ${floor.name} in ${property.title}.`}
          onClose={() => setManaging(false)}
        >
          <UnitSetupForm
            propertyId={property.id}
            propertyType={property.type}
            floorId={floor.id}
            floorName={floor.name}
            existingUnitsCount={units.length}
            onDone={({ created }) => {
              setManaging(false);
              reloadUnits();
              if (created > 0) {
                toast.success(`${created} unit${created === 1 ? "" : "s"} added on ${floor.name}.`);
              }
            }}
          />
        </Modal>
      )}

      {deletingUnit && (
        <ConfirmModal
          title="Delete unit"
          description={`Delete unit "${deletingUnit.label}"? This can't be undone.`}
          confirmLabel="Delete"
          tone="danger"
          onCancel={() => setDeletingUnit(null)}
          onConfirm={handleDeleteUnit}
        />
      )}
    </div>
  );
}
