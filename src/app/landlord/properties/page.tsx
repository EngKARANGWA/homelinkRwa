"use client";

import { useState } from "react";
import { CheckCircle2, Pencil, Plus } from "lucide-react";
import { PROPERTIES, type Property } from "@/lib/mock-admin-data";
import { useLandlord } from "@/components/landlord/LandlordContext";
import { Modal } from "@/components/admin/Modal";
import {
  PropertyForm,
  type PropertyFormValues,
} from "@/components/landlord/PropertyForm";

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
  const [justSaved, setJustSaved] = useState(false);

  const myProperties = properties.filter((p) => p.owner === landlordName);

  const addProperty = (values: PropertyFormValues) => {
    const newProperty: Property = {
      id: String(Date.now()),
      owner: landlordName,
      approval: "Pending",
      ...values,
    };
    setProperties((prev) => [newProperty, ...prev]);
    setAdding(false);
    setJustSaved(true);
  };

  const editProperty = (id: string, values: PropertyFormValues) => {
    setProperties((prev) =>
      prev.map((p) => (p.id === id ? { ...p, ...values } : p)),
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
              <th className="px-6 py-3 font-medium">Property</th>
              <th className="px-6 py-3 font-medium">Type</th>
              <th className="px-6 py-3 font-medium">Rent (RWF)</th>
              <th className="px-6 py-3 font-medium">Availability</th>
              <th className="px-6 py-3 font-medium">Approval</th>
              <th className="px-6 py-3 font-medium">Actions</th>
            </tr>
          </thead>
          <tbody>
            {myProperties.map((property) => (
              <tr key={property.id} className="border-t border-slate-100">
                <td className="px-6 py-3">
                  <p className="font-medium text-navy">{property.name}</p>
                  <p className="text-xs text-slate-400">{property.address}</p>
                </td>
                <td className="px-6 py-3 text-slate-500">{property.type}</td>
                <td className="px-6 py-3 text-slate-500">
                  {property.rent.toLocaleString()}
                </td>
                <td className="px-6 py-3">
                  <span
                    className={`rounded-full px-2.5 py-1 text-xs font-medium ${AVAILABILITY_STYLES[property.availability]}`}
                  >
                    {property.availability}
                  </span>
                </td>
                <td className="px-6 py-3">
                  <span
                    className={`rounded-full px-2.5 py-1 text-xs font-medium ${APPROVAL_STYLES[property.approval]}`}
                  >
                    {property.approval}
                  </span>
                </td>
                <td className="px-6 py-3">
                  <button
                    type="button"
                    onClick={() => setEditingProperty(property)}
                    className="inline-flex items-center gap-1.5 rounded-lg border border-slate-300 px-2.5 py-1 text-xs font-medium text-slate-600 hover:bg-slate-50"
                  >
                    <Pencil className="h-3.5 w-3.5" />
                    Edit
                  </button>
                </td>
              </tr>
            ))}
            {myProperties.length === 0 && (
              <tr>
                <td colSpan={6} className="px-6 py-8 text-center text-slate-400">
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
    </div>
  );
}
