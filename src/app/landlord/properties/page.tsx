"use client";

import { useState } from "react";
import Link from "next/link";
import {
  Building2,
  CheckCircle2,
  Eye,
  Home,
  LayoutGrid,
  Pencil,
  Plus,
  Table as TableIcon,
} from "lucide-react";
import {
  PROPERTIES,
  TODAY,
  daysVacant,
  type Property,
} from "@/lib/mock-admin-data";
import { getUnitsForProperty, type UnitOverrides } from "@/lib/units";
import { useLandlord } from "@/components/landlord/LandlordContext";
import { Modal } from "@/components/admin/Modal";
import {
  PropertyForm,
  type PropertyFormValues,
} from "@/components/landlord/PropertyForm";
import { EmptyRow, Table, TBody, Td, Th, THead, Tr } from "@/components/dashboard/Table";

const AVAILABILITY_STYLES: Record<Property["availability"], string> = {
  Available: "bg-emerald-50 text-emerald-700",
  Occupied: "bg-slate-100 text-slate-600",
};

const APPROVAL_STYLES: Record<Property["approval"], string> = {
  Approved: "bg-emerald-50 text-emerald-700",
  Pending: "bg-amber-50 text-amber-700",
  Rejected: "bg-red-50 text-red-700",
};

function propertyStats(property: Property, unitOverrides: UnitOverrides) {
  const units = getUnitsForProperty(property, unitOverrides);
  const total = units.length;
  const occupied = units.filter((u) => u.occupancyStatus === "Occupied").length;
  const collected = units
    .filter((u) => u.currentPaymentStatus === "Paid")
    .reduce((sum, u) => sum + u.monthlyRent, 0);
  return {
    total,
    occupancyPercent: total ? Math.round((occupied / total) * 100) : 0,
    collected,
  };
}

export default function LandlordPropertiesPage() {
  const { landlordName, unitOverrides } = useLandlord();
  const [properties, setProperties] = useState(PROPERTIES);
  const [view, setView] = useState<"cards" | "table">("cards");
  const [isAdding, setAdding] = useState(false);
  const [editingProperty, setEditingProperty] = useState<Property | null>(null);
  const [justSaved, setJustSaved] = useState(false);

  const myProperties = properties.filter((p) => p.owner === landlordName);

  const addProperty = (values: PropertyFormValues) => {
    const newProperty: Property = {
      id: String(Date.now()),
      owner: landlordName,
      approval: "Pending",
      vacantSince: values.availability === "Available" ? TODAY : null,
      totalUnits: 1,
      occupiedUnits: values.availability === "Occupied" ? 1 : 0,
      ...values,
    };
    setProperties((prev) => [newProperty, ...prev]);
    setAdding(false);
    setJustSaved(true);
  };

  const editProperty = (id: string, values: PropertyFormValues) => {
    setProperties((prev) =>
      prev.map((p) => {
        if (p.id !== id) return p;
        const vacantSince =
          values.availability === "Available"
            ? (p.vacantSince ?? TODAY)
            : null;
        return { ...p, ...values, vacantSince };
      }),
    );
    setEditingProperty(null);
    setJustSaved(true);
  };

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-navy">My Properties</h1>
          <p className="mt-1 text-sm text-slate-500">
            Properties you own on the platform.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex items-center rounded-lg border border-slate-300 bg-white p-1">
            <button
              type="button"
              onClick={() => setView("cards")}
              aria-label="Card view"
              className={`flex items-center gap-1.5 rounded-md px-3 py-1.5 text-xs font-medium transition-colors ${
                view === "cards"
                  ? "bg-navy text-white"
                  : "text-slate-500 hover:bg-slate-50"
              }`}
            >
              <LayoutGrid className="h-3.5 w-3.5" />
              Cards
            </button>
            <button
              type="button"
              onClick={() => setView("table")}
              aria-label="Table view"
              className={`flex items-center gap-1.5 rounded-md px-3 py-1.5 text-xs font-medium transition-colors ${
                view === "table"
                  ? "bg-navy text-white"
                  : "text-slate-500 hover:bg-slate-50"
              }`}
            >
              <TableIcon className="h-3.5 w-3.5" />
              Table
            </button>
          </div>
          <button
            type="button"
            onClick={() => setAdding(true)}
            className="inline-flex items-center gap-2 rounded-lg bg-gold px-5 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-gold/90"
          >
            <Plus className="h-4 w-4" />
            Add Property
          </button>
        </div>
      </div>

      {justSaved && (
        <div className="flex items-center gap-2 rounded-lg border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm font-medium text-emerald-700">
          <CheckCircle2 className="h-4 w-4" />
          Property saved successfully.
        </div>
      )}

      {view === "cards" ? (
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {myProperties.map((property) => {
            const stats = propertyStats(property, unitOverrides);
            const Icon = property.buildingType === "Commercial" ? Building2 : Home;
            return (
              <div
                key={property.id}
                className="group relative overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm transition-all hover:-translate-y-0.5 hover:shadow-md"
              >
                <button
                  type="button"
                  onClick={() => setEditingProperty(property)}
                  aria-label={`Edit ${property.name}`}
                  className="absolute right-3 top-3 z-10 flex h-8 w-8 items-center justify-center rounded-full bg-white/90 text-slate-500 shadow-sm hover:bg-slate-100"
                >
                  <Pencil className="h-3.5 w-3.5" />
                </button>
                <Link href={`/landlord/properties/${property.id}`} className="block p-5">
                  <div className="flex items-start gap-3 pr-8">
                    <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-gold/10 text-gold">
                      <Icon className="h-5 w-5" />
                    </span>
                    <div className="min-w-0">
                      <p className="truncate font-semibold text-navy">
                        {property.name}
                      </p>
                      <p className="truncate text-xs text-slate-500">
                        {property.address}
                      </p>
                    </div>
                  </div>

                  <div className="mt-5 grid grid-cols-3 gap-3 border-t border-slate-100 pt-4">
                    <div>
                      <p className="text-xs text-slate-400">Units</p>
                      <p className="mt-0.5 font-semibold text-navy">{stats.total}</p>
                    </div>
                    <div>
                      <p className="text-xs text-slate-400">Occupancy</p>
                      <p className="mt-0.5 font-semibold text-navy">
                        {stats.occupancyPercent}%
                      </p>
                    </div>
                    <div>
                      <p className="text-xs text-slate-400">Collected</p>
                      <p className="mt-0.5 truncate font-semibold text-emerald-600">
                        {stats.collected.toLocaleString()} RWF
                      </p>
                    </div>
                  </div>
                </Link>
              </div>
            );
          })}
          {myProperties.length === 0 && (
            <div className="col-span-full rounded-xl border border-dashed border-slate-300 bg-white py-16 text-center text-slate-400">
              No properties registered yet.
            </div>
          )}
        </div>
      ) : (
        <Table variant="standalone">
          <THead>
            <Tr>
              <Th className="px-4 py-3 sm:px-6">Property</Th>
              <Th className="hidden px-6 py-3 lg:table-cell">UPI</Th>
              <Th className="hidden px-6 py-3 md:table-cell">Type</Th>
              <Th className="hidden px-6 py-3 md:table-cell">Rent (RWF)</Th>
              <Th className="hidden px-6 py-3 sm:table-cell">Availability</Th>
              <Th className="hidden px-6 py-3 lg:table-cell">Days Vacant</Th>
              <Th className="px-4 py-3 sm:px-6">Approval</Th>
              <Th className="px-4 py-3 sm:px-6">Actions</Th>
            </Tr>
          </THead>
          <TBody>
            {myProperties.map((property) => (
              <Tr key={property.id}>
                <Td className="max-w-[10rem] px-4 py-3 sm:max-w-none sm:px-6">
                  <p className="truncate font-medium text-navy sm:overflow-visible sm:whitespace-normal">
                    {property.name}
                  </p>
                  <p className="hidden text-xs text-slate-400 sm:block">
                    {property.address}
                  </p>
                  <p className="truncate text-xs text-slate-400 md:hidden">
                    {property.type} · {property.rent.toLocaleString()} RWF
                  </p>
                </Td>
                <Td className="hidden px-6 py-3 text-slate-500 lg:table-cell">
                  {property.upi}
                </Td>
                <Td className="hidden px-6 py-3 text-slate-500 md:table-cell">
                  {property.type}
                </Td>
                <Td className="hidden px-6 py-3 text-slate-500 md:table-cell">
                  {property.rent.toLocaleString()}
                </Td>
                <Td className="hidden px-6 py-3 sm:table-cell">
                  <span
                    className={`rounded-full px-2.5 py-1 text-xs font-medium ${AVAILABILITY_STYLES[property.availability]}`}
                  >
                    {property.availability}
                  </span>
                </Td>
                <Td className="hidden px-6 py-3 text-slate-500 lg:table-cell">
                  {daysVacant(property.vacantSince) ?? "—"}
                </Td>
                <Td className="px-4 py-3 sm:px-6">
                  <span
                    className={`rounded-full px-2.5 py-1 text-xs font-medium ${APPROVAL_STYLES[property.approval]}`}
                  >
                    {property.approval}
                  </span>
                </Td>
                <Td className="max-w-[6.5rem] px-4 py-3 sm:max-w-none sm:whitespace-nowrap sm:px-6">
                  <div className="flex flex-wrap items-center gap-2">
                    <Link
                      href={`/landlord/properties/${property.id}`}
                      className="inline-flex items-center gap-1.5 rounded-lg border border-slate-300 px-2.5 py-1 text-xs font-medium text-slate-600 hover:bg-slate-50"
                    >
                      <Eye className="h-3.5 w-3.5" />
                      View
                    </Link>
                    <button
                      type="button"
                      onClick={() => setEditingProperty(property)}
                      aria-label={`Edit ${property.name}`}
                      className="inline-flex items-center gap-1.5 rounded-lg border border-slate-300 px-2.5 py-1 text-xs font-medium text-slate-600 hover:bg-slate-50"
                    >
                      <Pencil className="h-3.5 w-3.5" />
                      <span className="hidden sm:inline">Edit</span>
                    </button>
                  </div>
                </Td>
              </Tr>
            ))}
            {myProperties.length === 0 && (
              <EmptyRow colSpan={8}>No properties registered yet.</EmptyRow>
            )}
          </TBody>
        </Table>
      )}

      {isAdding && (
        <Modal
          title="Add Property"
          description="Register a new property. It will be submitted for admin approval."
          onClose={() => setAdding(false)}
        >
          <PropertyForm onCancel={() => setAdding(false)} onSuccess={addProperty} />
        </Modal>
      )}

      {editingProperty && (
        <Modal
          title="Edit Property"
          description="Update this property's details."
          onClose={() => setEditingProperty(null)}
        >
          <PropertyForm
            initialProperty={editingProperty}
            onCancel={() => setEditingProperty(null)}
            onSuccess={(values) => editProperty(editingProperty.id, values)}
          />
        </Modal>
      )}
    </div>
  );
}
