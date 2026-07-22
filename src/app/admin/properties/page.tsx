"use client";

import { useState } from "react";
import { Check, CheckCircle2, Eye, Plus, X } from "lucide-react";
import { PROPERTIES, TODAY, daysVacant, type Property } from "@/lib/mock-admin-data";
import { Modal } from "@/components/admin/Modal";
import { PropertyForm, type PropertyFormValues } from "@/components/admin/PropertyForm";
import { PropertyDetail } from "@/components/admin/PropertyDetail";
import { Table, TBody, Td, Th, THead, Tr } from "@/components/dashboard/Table";

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
  const [viewingProperty, setViewingProperty] = useState<Property | null>(null);

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

      <Table variant="standalone">
        <THead>
          <Tr>
            <Th className="px-4 py-3 sm:px-6">Property</Th>
            <Th className="hidden px-6 py-3 lg:table-cell">UPI</Th>
            <Th className="hidden px-6 py-3 md:table-cell">Owner</Th>
            <Th className="hidden px-6 py-3 lg:table-cell">Type</Th>
            <Th className="hidden px-6 py-3 md:table-cell">Rent (RWF)</Th>
            <Th className="hidden px-6 py-3 sm:table-cell">Availability</Th>
            <Th className="hidden px-6 py-3 lg:table-cell">Days Vacant</Th>
            <Th className="px-4 py-3 sm:px-6">Approval</Th>
            <Th className="px-4 py-3 sm:px-6">Actions</Th>
          </Tr>
        </THead>
        <TBody>
          {properties.map((property) => (
            <Tr key={property.id}>
              <Td className="max-w-[10rem] px-4 py-3 sm:max-w-none sm:px-6">
                <p className="truncate font-medium text-navy sm:overflow-visible sm:whitespace-normal">
                  {property.name}
                </p>
                <p className="hidden text-xs text-slate-400 sm:block">
                  {property.address}
                </p>
                <p className="truncate text-xs text-slate-400 md:hidden">
                  {property.owner} · {property.type}
                </p>
              </Td>
              <Td className="hidden px-6 py-3 text-slate-500 lg:table-cell">
                {property.upi}
              </Td>
              <Td className="hidden px-6 py-3 text-slate-500 md:table-cell">
                {property.owner}
              </Td>
              <Td className="hidden px-6 py-3 text-slate-500 lg:table-cell">
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
                  <button
                    type="button"
                    onClick={() => setViewingProperty(property)}
                    className="inline-flex items-center gap-1.5 rounded-lg border border-slate-300 px-2.5 py-1 text-xs font-medium text-slate-600 hover:bg-slate-50"
                  >
                    <Eye className="h-3.5 w-3.5" />
                    View
                  </button>
                  {property.approval === "Pending" && (
                    <>
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
                    </>
                  )}
                </div>
              </Td>
            </Tr>
          ))}
        </TBody>
      </Table>

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
