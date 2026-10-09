"use client";

import { useEffect, useState } from "react";
import { AppLink as Link } from "@/components/shared/AppLink";
import { useParams, useRouter } from "next/navigation";
import { ArrowLeft, ArrowRight, Eye, Pencil, Plus } from "lucide-react";
import {
  getProperty,
  listFloors,
  updateFloor,
  updateProperty,
  uploadPropertyDocument,
} from "@/lib/api/properties";
import { ApiError } from "@/lib/api/client";
import type { Floor, Property, UpdatePropertyInput } from "@/lib/api/types";
import { Modal } from "@/components/admin/Modal";
import { PropertyForm } from "@/components/admin/PropertyForm";
import { AddTenantForm } from "@/components/landlord/AddTenantForm";
import { SummaryCard } from "@/components/dashboard/SummaryCard";
import { EmptyRow, Table, TBody, Td, Th, THead, Tr } from "@/components/dashboard/Table";
import { useToast } from "@/components/shared/ToastContext";
import { useLanguage } from "@/lib/i18n/LanguageContext";

export default function PropertyDetailPage() {
  const { t } = useLanguage();
  const c = t.dashboard.landlord.propertyDetail;
  const toast = useToast();
  const { id } = useParams<{ id: string }>();
  const router = useRouter();

  const [property, setProperty] = useState<Property | null>(null);
  const [floors, setFloors] = useState<Floor[]>([]);
  const [isLoading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);

  const [isAddingTenant, setAddingTenant] = useState(false);
  const [isEditing, setEditing] = useState(false);
  const [editError, setEditError] = useState<string | null>(null);
  const [editingFloor, setEditingFloor] = useState<Floor | null>(null);
  const [floorError, setFloorError] = useState<string | null>(null);
  const [floorName, setFloorName] = useState("");
  const [floorScale, setFloorScale] = useState("");

  const load = () => {
    if (!id) return;
    setLoading(true);
    Promise.all([getProperty(id), listFloors(id)])
      .then(([propertyResult, floorsResult]) => {
        setProperty(propertyResult);
        setFloors(floorsResult);
        setLoadError(null);
      })
      .catch((err) => {
        setLoadError(err instanceof ApiError ? err.message : "Failed to load this property.");
      })
      .finally(() => setLoading(false));
  };

  useEffect(load, [id]);

  const reload = () => {
    if (!id) return;
    Promise.all([getProperty(id), listFloors(id)])
      .then(([propertyResult, floorsResult]) => {
        setProperty(propertyResult);
        setFloors(floorsResult);
      })
      .catch(() => undefined);
  };

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

  const totalUnits = floors.reduce((sum, f) => sum + f.unitsCount, 0);

  const handleAddTenant = () => {
    setAddingTenant(false);
    reload();
    toast.success(
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

  const openEditFloor = (floor: Floor) => {
    setFloorError(null);
    setFloorName(floor.name);
    setFloorScale(floor.scale != null ? String(floor.scale) : "");
    setEditingFloor(floor);
  };

  const goToFloor = (floor: Floor) => {
    router.push(`/landlord/properties/${property.id}/floors/${floor.id}`);
  };

  const handleSaveFloor = async () => {
    if (!editingFloor) return;
    if (!floorName.trim()) {
      setFloorError("Enter a name for this floor.");
      return;
    }
    setFloorError(null);
    try {
      await updateFloor(property.id, editingFloor.id, {
        name: floorName.trim(),
        scale: floorScale.trim() ? Number(floorScale) : undefined,
      });
      setEditingFloor(null);
      reload();
      toast.success(`"${floorName.trim()}" updated.`);
    } catch (err) {
      setFloorError(err instanceof ApiError ? err.message : "Failed to update this floor.");
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
          <p className="mt-1 text-sm text-slate-500">{property.location}</p>
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
            onClick={() => setAddingTenant(true)}
            className="inline-flex items-center gap-2 rounded-lg bg-gold px-5 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-gold/90"
          >
            <Plus className="h-4 w-4" />
            {c.addTenant}
          </button>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-5 lg:grid-cols-3">
        <SummaryCard label="Floors" value={property.numberOfFloors} />
        <SummaryCard label={c.summaryUnits} value={totalUnits} />
        <SummaryCard label={c.summaryOccupied} value={property.occupiedUnits ?? 0} />
      </div>

      <Table variant="standalone">
        <THead>
          <Tr>
            <Th className="max-w-[9rem] px-4 py-3 sm:px-6">Floor</Th>
            <Th className="hidden px-6 py-3 sm:table-cell">Units</Th>
            <Th className="hidden px-6 py-3 md:table-cell">Scale</Th>
            <Th className="px-4 py-3 text-right sm:px-6">Action</Th>
          </Tr>
        </THead>
        <TBody>
          {floors.map((floor) => (
            <Tr key={floor.id}>
              <Td className="max-w-[9rem] px-4 py-3 sm:max-w-none sm:px-6">
                <button
                  type="button"
                  onClick={() => goToFloor(floor)}
                  className="truncate text-left font-medium text-navy hover:underline sm:overflow-visible sm:whitespace-normal"
                >
                  {floor.name}
                </button>
                <p className="truncate text-xs text-slate-400 sm:hidden">
                  {floor.unitsCount} unit{floor.unitsCount === 1 ? "" : "s"}
                </p>
              </Td>
              <Td className="hidden px-6 py-3 text-slate-500 sm:table-cell">
                {floor.unitsCount}
              </Td>
              <Td className="hidden px-6 py-3 text-slate-500 md:table-cell">
                {floor.scale != null ? floor.scale : "—"}
              </Td>
              <Td className="px-4 py-3 text-right sm:px-6">
                <div className="flex items-center justify-end gap-1">
                  <button
                    type="button"
                    onClick={() => goToFloor(floor)}
                    title="View and manage this floor's units"
                    className="inline-flex items-center gap-1 rounded-md p-1.5 text-slate-400 transition-colors hover:bg-slate-100 hover:text-navy"
                  >
                    <Eye className="h-4 w-4" />
                  </button>
                  <button
                    type="button"
                    onClick={() => openEditFloor(floor)}
                    title="Edit this floor's name/scale"
                    className="inline-flex items-center gap-1 rounded-md p-1.5 text-slate-400 transition-colors hover:bg-slate-100 hover:text-navy"
                  >
                    <Pencil className="h-4 w-4" />
                  </button>
                  <button
                    type="button"
                    onClick={() => goToFloor(floor)}
                    className="ml-1 rounded-lg border border-slate-300 px-2.5 py-1 text-xs font-medium text-slate-600 hover:bg-slate-50"
                  >
                    Manage Floor
                  </button>
                </div>
              </Td>
            </Tr>
          ))}
          {floors.length === 0 && <EmptyRow colSpan={4}>No floors on this property yet.</EmptyRow>}
        </TBody>
      </Table>

      <Link
        href={`/landlord/leases?propertyId=${property.id}`}
        className="inline-flex items-center gap-1 self-start text-sm font-medium text-gold hover:underline"
      >
        {c.viewLeasesLink}
        <ArrowRight className="h-3.5 w-3.5" />
      </Link>

      {isAddingTenant && (
        <Modal
          title={c.addTenant}
          description="Register a new tenant and assign them to an available unit."
          onClose={() => setAddingTenant(false)}
        >
          <AddTenantForm onCancel={() => setAddingTenant(false)} onSuccess={handleAddTenant} />
        </Modal>
      )}

      {isEditing && (
        <Modal
          title={c.editPropertyTitle}
          description={c.editPropertyDescription}
          onClose={() => setEditing(false)}
          maxWidthClassName="max-w-3xl"
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

      {editingFloor && (
        <Modal
          title={`Edit Floor — ${editingFloor.name}`}
          description="Update this floor's name or scale (size/area)."
          onClose={() => setEditingFloor(null)}
        >
          {floorError && (
            <p className="mb-4 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
              {floorError}
            </p>
          )}
          <div className="flex flex-col gap-4">
            <label className="flex flex-col gap-1.5 text-sm font-medium text-slate-700">
              Floor name
              <input
                type="text"
                value={floorName}
                onChange={(e) => setFloorName(e.target.value)}
                className="rounded-lg border border-slate-300 px-3 py-2.5 text-sm text-navy focus:border-gold focus:outline-none"
              />
            </label>
            <label className="flex flex-col gap-1.5 text-sm font-medium text-slate-700">
              Scale (size/area)
              <input
                type="number"
                min={0}
                value={floorScale}
                onChange={(e) => setFloorScale(e.target.value)}
                className="rounded-lg border border-slate-300 px-3 py-2.5 text-sm text-navy focus:border-gold focus:outline-none"
              />
            </label>
            <div className="mt-2 flex justify-end gap-3">
              <button
                type="button"
                onClick={() => setEditingFloor(null)}
                className="rounded-lg border border-slate-300 px-5 py-2.5 text-sm font-semibold text-slate-600 hover:bg-slate-50"
              >
                {t.dashboard.actions.cancel}
              </button>
              <button
                type="button"
                onClick={handleSaveFloor}
                className="rounded-lg bg-gold px-6 py-2.5 text-sm font-semibold text-white hover:bg-gold/90"
              >
                Save
              </button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
}
