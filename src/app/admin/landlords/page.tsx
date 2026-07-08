"use client";

import { useState } from "react";
import { CheckCircle2, Plus } from "lucide-react";
import { LANDLORDS } from "@/lib/mock-admin-data";
import { Modal } from "@/components/admin/Modal";
import { LandlordForm } from "@/components/admin/LandlordForm";

const STATUS_STYLES: Record<string, string> = {
  Active: "bg-emerald-50 text-emerald-700",
  Pending: "bg-amber-50 text-amber-700",
  Suspended: "bg-red-50 text-red-700",
};

export default function LandlordsPage() {
  const [isModalOpen, setModalOpen] = useState(false);
  const [justRegistered, setJustRegistered] = useState(false);

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-navy">Landlords</h1>
          <p className="mt-1 text-sm text-slate-500">
            Property owners registered on the platform.
          </p>
        </div>
        <button
          type="button"
          onClick={() => setModalOpen(true)}
          className="inline-flex items-center gap-2 rounded-lg bg-gold px-5 py-2.5 text-sm font-semibold text-navy transition-colors hover:bg-gold/90"
        >
          <Plus className="h-4 w-4" />
          Register Landlord
        </button>
      </div>

      {justRegistered && (
        <div className="flex items-center gap-2 rounded-lg border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm font-medium text-emerald-700">
          <CheckCircle2 className="h-4 w-4" />
          Landlord registered successfully.
        </div>
      )}

      <div className="overflow-x-auto rounded-xl border border-slate-200 bg-white shadow-sm">
        <table className="w-full text-left text-sm">
          <thead>
            <tr className="text-xs uppercase tracking-wide text-slate-400">
              <th className="px-6 py-3 font-medium">Name</th>
              <th className="px-6 py-3 font-medium">Email</th>
              <th className="px-6 py-3 font-medium">Phone</th>
              <th className="px-6 py-3 font-medium">Properties</th>
              <th className="px-6 py-3 font-medium">Status</th>
              <th className="px-6 py-3 font-medium">Registered</th>
            </tr>
          </thead>
          <tbody>
            {LANDLORDS.map((landlord) => (
              <tr key={landlord.id} className="border-t border-slate-100">
                <td className="px-6 py-3 font-medium text-navy">
                  {landlord.name}
                </td>
                <td className="px-6 py-3 text-slate-500">{landlord.email}</td>
                <td className="px-6 py-3 text-slate-500">{landlord.phone}</td>
                <td className="px-6 py-3 text-slate-500">
                  {landlord.properties}
                </td>
                <td className="px-6 py-3">
                  <span
                    className={`rounded-full px-2.5 py-1 text-xs font-medium ${STATUS_STYLES[landlord.status]}`}
                  >
                    {landlord.status}
                  </span>
                </td>
                <td className="px-6 py-3 text-slate-500">
                  {landlord.registeredAt}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {isModalOpen && (
        <Modal
          title="Register Landlord"
          description="Add a new property owner to the platform."
          onClose={() => setModalOpen(false)}
        >
          <LandlordForm
            onCancel={() => setModalOpen(false)}
            onSuccess={() => {
              setModalOpen(false);
              setJustRegistered(true);
            }}
          />
        </Modal>
      )}
    </div>
  );
}
