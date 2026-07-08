"use client";

import { useState } from "react";
import { CheckCircle2, Plus, ShieldCheck } from "lucide-react";
import { TENANTS, type Tenant } from "@/lib/mock-admin-data";
import { Modal } from "@/components/admin/Modal";
import { TenantForm } from "@/components/admin/TenantForm";

const STATUS_STYLES: Record<Tenant["status"], string> = {
  Active: "bg-emerald-50 text-emerald-700",
  Pending: "bg-amber-50 text-amber-700",
  Inactive: "bg-slate-100 text-slate-600",
};

export default function TenantsPage() {
  const [tenants, setTenants] = useState(TENANTS);
  const [isModalOpen, setModalOpen] = useState(false);
  const [justAdded, setJustAdded] = useState(false);

  const verifyTenant = (id: string) => {
    setTenants((prev) =>
      prev.map((t) => (t.id === id ? { ...t, status: "Active" } : t)),
    );
  };

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-navy">Tenants</h1>
          <p className="mt-1 text-sm text-slate-500">
            Tenants registered on the platform.
          </p>
        </div>
        <button
          type="button"
          onClick={() => setModalOpen(true)}
          className="inline-flex items-center gap-2 rounded-lg bg-gold px-5 py-2.5 text-sm font-semibold text-navy transition-colors hover:bg-gold/90"
        >
          <Plus className="h-4 w-4" />
          Add Tenant
        </button>
      </div>

      {justAdded && (
        <div className="flex items-center gap-2 rounded-lg border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm font-medium text-emerald-700">
          <CheckCircle2 className="h-4 w-4" />
          Tenant added successfully.
        </div>
      )}

      <div className="overflow-x-auto rounded-xl border border-slate-200 bg-white shadow-sm">
        <table className="w-full text-left text-sm">
          <thead>
            <tr className="text-xs uppercase tracking-wide text-slate-400">
              <th className="px-6 py-3 font-medium">Name</th>
              <th className="px-6 py-3 font-medium">Email</th>
              <th className="px-6 py-3 font-medium">Phone</th>
              <th className="px-6 py-3 font-medium">Current Property</th>
              <th className="px-6 py-3 font-medium">Status</th>
              <th className="px-6 py-3 font-medium">Registered</th>
              <th className="px-6 py-3 font-medium">Actions</th>
            </tr>
          </thead>
          <tbody>
            {tenants.map((tenant) => (
              <tr key={tenant.id} className="border-t border-slate-100">
                <td className="px-6 py-3 font-medium text-navy">
                  {tenant.name}
                </td>
                <td className="px-6 py-3 text-slate-500">{tenant.email}</td>
                <td className="px-6 py-3 text-slate-500">{tenant.phone}</td>
                <td className="px-6 py-3 text-slate-500">
                  {tenant.property}
                </td>
                <td className="px-6 py-3">
                  <span
                    className={`rounded-full px-2.5 py-1 text-xs font-medium ${STATUS_STYLES[tenant.status]}`}
                  >
                    {tenant.status}
                  </span>
                </td>
                <td className="px-6 py-3 text-slate-500">
                  {tenant.registeredAt}
                </td>
                <td className="px-6 py-3">
                  {tenant.status === "Pending" ? (
                    <button
                      type="button"
                      onClick={() => verifyTenant(tenant.id)}
                      className="inline-flex items-center gap-1.5 rounded-lg border border-emerald-200 bg-emerald-50 px-2.5 py-1 text-xs font-medium text-emerald-700 hover:bg-emerald-100"
                    >
                      <ShieldCheck className="h-3.5 w-3.5" />
                      Verify
                    </button>
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
          title="Add Tenant"
          description="Register a new tenant on the platform."
          onClose={() => setModalOpen(false)}
        >
          <TenantForm
            onCancel={() => setModalOpen(false)}
            onSuccess={() => {
              setModalOpen(false);
              setJustAdded(true);
            }}
          />
        </Modal>
      )}
    </div>
  );
}
