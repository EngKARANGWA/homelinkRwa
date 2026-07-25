"use client";

import { useEffect, useState } from "react";
import { CheckCircle2, Eye, Plus, ShieldCheck } from "lucide-react";
import { TENANTS, type Tenant } from "@/lib/mock-admin-data";
import { Modal } from "@/components/admin/Modal";
import { TenantForm } from "@/components/admin/TenantForm";
import { TenantDetail } from "@/components/admin/TenantDetail";
import { Table, TBody, Td, Th, THead, Tr } from "@/components/dashboard/Table";
import { DEFAULT_PAGE_SIZE, Pagination } from "@/components/dashboard/Pagination";

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
  const [page, setPage] = useState(1);

  const totalPages = Math.max(1, Math.ceil(tenants.length / DEFAULT_PAGE_SIZE));
  useEffect(() => {
    if (page > totalPages) setPage(totalPages);
  }, [page, totalPages]);
  const pagedTenants = tenants.slice((page - 1) * DEFAULT_PAGE_SIZE, page * DEFAULT_PAGE_SIZE);

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

      <Table variant="standalone">
        <THead>
          <Tr>
            <Th className="max-w-[10rem] px-4 py-3 sm:px-6">Name</Th>
            <Th className="hidden px-6 py-3 md:table-cell">Email</Th>
            <Th className="hidden px-6 py-3 lg:table-cell">Phone</Th>
            <Th className="hidden px-6 py-3 md:table-cell">Current Property</Th>
            <Th className="px-4 py-3 sm:px-6">Status</Th>
            <Th className="hidden px-6 py-3 lg:table-cell">Registered</Th>
            <Th className="px-4 py-3 sm:px-6">Actions</Th>
          </Tr>
        </THead>
        <TBody>
          {pagedTenants.map((tenant) => (
            <Tr key={tenant.id}>
              <Td className="max-w-[10rem] px-4 py-3 sm:max-w-none sm:px-6">
                <p className="truncate font-medium text-navy sm:overflow-visible sm:whitespace-normal">
                  {tenant.name}
                </p>
                <p className="truncate text-xs text-slate-400 md:hidden">
                  {tenant.email}
                </p>
              </Td>
              <Td className="hidden px-6 py-3 text-slate-500 md:table-cell">
                {tenant.email}
              </Td>
              <Td className="hidden px-6 py-3 text-slate-500 lg:table-cell">
                {tenant.phone}
              </Td>
              <Td className="hidden px-6 py-3 text-slate-500 md:table-cell">
                {tenant.property}
              </Td>
              <Td className="px-4 py-3 sm:px-6">
                <span
                  className={`rounded-full px-2.5 py-1 text-xs font-medium ${STATUS_STYLES[tenant.status]}`}
                >
                  {tenant.status}
                </span>
              </Td>
              <Td className="hidden px-6 py-3 text-slate-500 lg:table-cell">
                {tenant.registeredAt}
              </Td>
              <Td className="max-w-[6.5rem] px-4 py-3 sm:max-w-none sm:whitespace-nowrap sm:px-6">
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
              </Td>
            </Tr>
          ))}
        </TBody>
      </Table>

      <Pagination
        page={page}
        totalPages={totalPages}
        totalItems={tenants.length}
        pageSize={DEFAULT_PAGE_SIZE}
        onPageChange={setPage}
      />

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
