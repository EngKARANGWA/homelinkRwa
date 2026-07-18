"use client";

import { useState } from "react";
import { CheckCircle2, Eye, Plus, ShieldCheck } from "lucide-react";
import { TENANTS, type Tenant } from "@/lib/mock-admin-data";
import { Modal } from "@/components/admin/Modal";
import { TenantForm } from "@/components/admin/TenantForm";
import { TenantDetail } from "@/components/admin/TenantDetail";

const STATUS_STYLES: Record<Tenant["status"], string> = {
  Active: "bg-emerald-50 text-emerald-700",
  Pending: "bg-amber-50 text-amber-700",
  Inactive: "bg-slate-100 text-slate-600",
};

export default function TenantsPage() {
  const [tenants, setTenants] = useState(TENANTS);
  const [isModalOpen, setModalOpen] = useState(false);
  const [justAdded, setJustAdded] = useState(false);
  const [viewingTenant, setViewingTenant] = useState<Tenant | null>(null);

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
          className="inline-flex items-center gap-2 rounded-lg bg-gold px-5 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-gold/90"
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
              <th className="max-w-[10rem] px-4 py-3 font-medium sm:px-6">Name</th>
              <th className="hidden px-6 py-3 font-medium md:table-cell">Email</th>
              <th className="hidden px-6 py-3 font-medium lg:table-cell">Phone</th>
              <th className="hidden px-6 py-3 font-medium md:table-cell">
                Current Property
              </th>
              <th className="px-4 py-3 font-medium sm:px-6">Status</th>
              <th className="hidden px-6 py-3 font-medium lg:table-cell">Registered</th>
              <th className="px-4 py-3 font-medium sm:px-6">Actions</th>
            </tr>
          </thead>
          <tbody>
            {tenants.map((tenant) => (
              <tr key={tenant.id} className="border-t border-slate-100">
                <td className="max-w-[10rem] px-4 py-3 sm:max-w-none sm:px-6">
                  <p className="truncate font-medium text-navy sm:overflow-visible sm:whitespace-normal">
                    {tenant.name}
                  </p>
                  <p className="truncate text-xs text-slate-400 md:hidden">
                    {tenant.email}
                  </p>
                </td>
                <td className="hidden px-6 py-3 text-slate-500 md:table-cell">
                  {tenant.email}
                </td>
                <td className="hidden px-6 py-3 text-slate-500 lg:table-cell">
                  {tenant.phone}
                </td>
                <td className="hidden px-6 py-3 text-slate-500 md:table-cell">
                  {tenant.property}
                </td>
                <td className="px-4 py-3 sm:px-6">
                  <span
                    className={`rounded-full px-2.5 py-1 text-xs font-medium ${STATUS_STYLES[tenant.status]}`}
                  >
                    {tenant.status}
                  </span>
                </td>
                <td className="hidden px-6 py-3 text-slate-500 lg:table-cell">
                  {tenant.registeredAt}
                </td>
                <td className="max-w-[6.5rem] px-4 py-3 sm:max-w-none sm:whitespace-nowrap sm:px-6">
                  <div className="flex flex-wrap items-center gap-2">
                    <button
                      type="button"
                      onClick={() => setViewingTenant(tenant)}
                      className="inline-flex items-center gap-1.5 rounded-lg border border-slate-300 px-2.5 py-1 text-xs font-medium text-slate-600 hover:bg-slate-50"
                    >
                      <Eye className="h-3.5 w-3.5" />
                      View
                    </button>
                    {tenant.status === "Pending" && (
                      <button
                        type="button"
                        onClick={() => verifyTenant(tenant.id)}
                        aria-label={`Verify ${tenant.name}`}
                        className="inline-flex items-center gap-1.5 rounded-lg border border-emerald-200 bg-emerald-50 px-2.5 py-1 text-xs font-medium text-emerald-700 hover:bg-emerald-100"
                      >
                        <ShieldCheck className="h-3.5 w-3.5" />
                        <span className="hidden sm:inline">Verify</span>
                      </button>
                    )}
                  </div>
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

      {viewingTenant && (
        <Modal
          title="Tenant Details"
          description={viewingTenant.name}
          onClose={() => setViewingTenant(null)}
        >
          <TenantDetail tenant={viewingTenant} />
        </Modal>
      )}
    </div>
  );
}
