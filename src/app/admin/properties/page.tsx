"use client";

import { useState } from "react";
import { Check, CheckCircle2, Plus, X } from "lucide-react";
import { PROPERTIES, TODAY, daysVacant, type Property } from "@/lib/mock-admin-data";
import { Modal } from "@/components/admin/Modal";
import { PropertyForm, type PropertyFormValues } from "@/components/admin/PropertyForm";

const APPROVAL_STYLES: Record<Property["approval"], string> = {
  Approved: "bg-emerald-50 text-emerald-700",
  Pending: "bg-amber-50 text-amber-700",
  Rejected: "bg-red-50 text-red-700",
};

const AVAILABILITY_STYLES: Record<Property["availability"], string> = {
  Available: "bg-emerald-50 text-emerald-700",
  Occupied: "bg-slate-100 text-slate-600",
};

export default function PropertiesPage() {
  const [properties, setProperties] = useState(PROPERTIES);
  const [isModalOpen, setModalOpen] = useState(false);
  const [justAdded, setJustAdded] = useState(false);

  const updateApproval = (id: string, approval: Property["approval"]) => {
    setProperties((prev) =>
      prev.map((p) => (p.id === id ? { ...p, approval } : p)),
    );
  };

  const addProperty = (values: PropertyFormValues) => {
    const newProperty: Property = {
      id: String(Date.now()),
      approval: "Pending",
      vacantSince: values.availability === "Available" ? TODAY : null,
      ...values,
    };
    setProperties((prev) => [newProperty, ...prev]);
    setModalOpen(false);
    setJustAdded(true);
  };

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-navy">Properties</h1>
          <p className="mt-1 text-sm text-slate-500">
            All property listings submitted by landlords.
          </p>
        </div>
        <button
          type="button"
          onClick={() => setModalOpen(true)}
          className="inline-flex items-center gap-2 rounded-lg bg-gold px-5 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-gold/90"
        >
          <Plus className="h-4 w-4" />
          Add Property
        </button>
      </div>

      {justAdded && (
        <div className="flex items-center gap-2 rounded-lg border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm font-medium text-emerald-700">
          <CheckCircle2 className="h-4 w-4" />
          Property submitted for approval.
        </div>
      )}

      <div className="overflow-x-auto rounded-xl border border-slate-200 bg-white shadow-sm">
        <table className="w-full text-left text-sm">
          <thead>
            <tr className="text-xs uppercase tracking-wide text-slate-400">
              <th className="px-6 py-3 font-medium">Property</th>
              <th className="px-6 py-3 font-medium">UPI</th>
              <th className="px-6 py-3 font-medium">Owner</th>
              <th className="px-6 py-3 font-medium">Type</th>
              <th className="px-6 py-3 font-medium">Rent (RWF)</th>
              <th className="px-6 py-3 font-medium">Availability</th>
              <th className="px-6 py-3 font-medium">Days Vacant</th>
              <th className="px-6 py-3 font-medium">Approval</th>
              <th className="px-6 py-3 font-medium">Actions</th>
            </tr>
          </thead>
          <tbody>
            {properties.map((property) => (
              <tr key={property.id} className="border-t border-slate-100">
                <td className="px-6 py-3">
                  <p className="font-medium text-navy">{property.name}</p>
                  <p className="text-xs text-slate-400">{property.address}</p>
                </td>
                <td className="px-6 py-3 text-slate-500">{property.upi}</td>
                <td className="px-6 py-3 text-slate-500">{property.owner}</td>
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
                <td className="px-6 py-3 text-slate-500">
                  {daysVacant(property.vacantSince) ?? "—"}
                </td>
                <td className="px-6 py-3">
                  <span
                    className={`rounded-full px-2.5 py-1 text-xs font-medium ${APPROVAL_STYLES[property.approval]}`}
                  >
                    {property.approval}
                  </span>
                </td>
                <td className="px-6 py-3">
                  {property.approval === "Pending" ? (
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => updateApproval(property.id, "Approved")}
                        aria-label={`Approve ${property.name}`}
                        className="flex h-7 w-7 items-center justify-center rounded-full bg-emerald-50 text-emerald-700 hover:bg-emerald-100"
                      >
                        <Check className="h-4 w-4" />
                      </button>
                      <button
                        type="button"
                        onClick={() => updateApproval(property.id, "Rejected")}
                        aria-label={`Reject ${property.name}`}
                        className="flex h-7 w-7 items-center justify-center rounded-full bg-red-50 text-red-700 hover:bg-red-100"
                      >
                        <X className="h-4 w-4" />
                      </button>
                    </div>
                  ) : (
                    <span className="text-xs text-slate-400">—</span>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {isModalOpen && (
        <Modal
          title="Add Property"
          description="Register a new property listing on behalf of a landlord."
          onClose={() => setModalOpen(false)}
        >
          <PropertyForm
            onCancel={() => setModalOpen(false)}
            onSuccess={addProperty}
          />
        </Modal>
      )}
    </div>
  );
}
