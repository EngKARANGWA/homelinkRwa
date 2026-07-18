"use client";

import { useState } from "react";
import { CheckCircle2, Eye, Pencil, Plus } from "lucide-react";
import {
  PROPERTIES,
  TODAY,
  daysVacant,
  type Property,
} from "@/lib/mock-admin-data";
import { useLandlord } from "@/components/landlord/LandlordContext";
import { Modal } from "@/components/admin/Modal";
import {
  PropertyForm,
  type PropertyFormValues,
} from "@/components/landlord/PropertyForm";
import { PropertyDetail } from "@/components/admin/PropertyDetail";

const AVAILABILITY_STYLES: Record<Property["availability"], string> = {
  Available: "bg-emerald-50 text-emerald-700",
  Occupied: "bg-slate-100 text-slate-600",
};

const APPROVAL_STYLES: Record<Property["approval"], string> = {
  Approved: "bg-emerald-50 text-emerald-700",
  Pending: "bg-amber-50 text-amber-700",
  Rejected: "bg-red-50 text-red-700",
};

export default function LandlordPropertiesPage() {
  const { landlordName } = useLandlord();
  const [properties, setProperties] = useState(PROPERTIES);
  const [isAdding, setAdding] = useState(false);
  const [editingProperty, setEditingProperty] = useState<Property | null>(null);
  const [viewingProperty, setViewingProperty] = useState<Property | null>(null);
  const [justSaved, setJustSaved] = useState(false);

  const myProperties = properties.filter((p) => p.owner === landlordName);

  const addProperty = (values: PropertyFormValues) => {
    const newProperty: Property = {
      id: String(Date.now()),
      owner: landlordName,
      approval: "Pending",
      vacantSince: values.availability === "Available" ? TODAY : null,
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
        <button
          type="button"
          onClick={() => setAdding(true)}
          className="inline-flex items-center gap-2 rounded-lg bg-gold px-5 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-gold/90"
        >
          <Plus className="h-4 w-4" />
          Add Property
        </button>
      </div>

      {justSaved && (
        <div className="flex items-center gap-2 rounded-lg border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm font-medium text-emerald-700">
          <CheckCircle2 className="h-4 w-4" />
          Property saved successfully.
        </div>
      )}

      <div className="overflow-x-auto rounded-xl border border-slate-200 bg-white shadow-sm">
        <table className="w-full text-left text-sm">
          <thead>
            <tr className="text-xs uppercase tracking-wide text-slate-400">
              <th className="px-4 py-3 font-medium sm:px-6">Property</th>
              <th className="hidden px-6 py-3 font-medium lg:table-cell">UPI</th>
              <th className="hidden px-6 py-3 font-medium md:table-cell">Type</th>
              <th className="hidden px-6 py-3 font-medium md:table-cell">Rent (RWF)</th>
              <th className="hidden px-6 py-3 font-medium sm:table-cell">Availability</th>
              <th className="hidden px-6 py-3 font-medium lg:table-cell">Days Vacant</th>
              <th className="px-4 py-3 font-medium sm:px-6">Approval</th>
              <th className="px-4 py-3 font-medium sm:px-6">Actions</th>
            </tr>
          </thead>
          <tbody>
            {myProperties.map((property) => (
              <tr key={property.id} className="border-t border-slate-100">
                <td className="max-w-[10rem] px-4 py-3 sm:max-w-none sm:px-6">
                  <p className="truncate font-medium text-navy sm:overflow-visible sm:whitespace-normal">
                    {property.name}
                  </p>
                  <p className="hidden text-xs text-slate-400 sm:block">
                    {property.address}
                  </p>
                  <p className="truncate text-xs text-slate-400 md:hidden">
                    {property.type} · {property.rent.toLocaleString()} RWF
                  </p>
                </td>
                <td className="hidden px-6 py-3 text-slate-500 lg:table-cell">
                  {property.upi}
                </td>
                <td className="hidden px-6 py-3 text-slate-500 md:table-cell">
                  {property.type}
                </td>
                <td className="hidden px-6 py-3 text-slate-500 md:table-cell">
                  {property.rent.toLocaleString()}
                </td>
                <td className="hidden px-6 py-3 sm:table-cell">
                  <span
                    className={`rounded-full px-2.5 py-1 text-xs font-medium ${AVAILABILITY_STYLES[property.availability]}`}
                  >
                    {property.availability}
                  </span>
                </td>
                <td className="hidden px-6 py-3 text-slate-500 lg:table-cell">
                  {daysVacant(property.vacantSince) ?? "—"}
                </td>
                <td className="px-4 py-3 sm:px-6">
                  <span
                    className={`rounded-full px-2.5 py-1 text-xs font-medium ${APPROVAL_STYLES[property.approval]}`}
                  >
                    {property.approval}
                  </span>
                </td>
                <td className="max-w-[6.5rem] px-4 py-3 sm:max-w-none sm:whitespace-nowrap sm:px-6">
                  <div className="flex flex-wrap items-center gap-2">
                    <button
                      type="button"
                      onClick={() => setViewingProperty(property)}
                      className="inline-flex items-center gap-1.5 rounded-lg border border-slate-300 px-2.5 py-1 text-xs font-medium text-slate-600 hover:bg-slate-50"
                    >
                      <Eye className="h-3.5 w-3.5" />
                      View
                    </button>
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
                </td>
              </tr>
            ))}
            {myProperties.length === 0 && (
              <tr>
                <td colSpan={8} className="px-6 py-8 text-center text-slate-400">
                  No properties registered yet.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

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

      {viewingProperty && (
        <Modal
          title="Property Details"
          description={viewingProperty.name}
          onClose={() => setViewingProperty(null)}
          maxWidthClassName="max-w-2xl"
        >
          <PropertyDetail property={viewingProperty} />
        </Modal>
      )}
    </div>
  );
}
