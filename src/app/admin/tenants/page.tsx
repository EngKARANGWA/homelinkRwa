"use client";

import { useEffect, useState } from "react";
import { AlertCircle, CheckCircle2, Eye, Plus, ShieldCheck } from "lucide-react";
import { listUsers } from "@/lib/api/admin";
import { ApiError } from "@/lib/api/client";
import type { User } from "@/lib/api/types";
import { Modal } from "@/components/admin/Modal";
import { TenantForm } from "@/components/admin/TenantForm";
import { TenantDetail } from "@/components/admin/TenantDetail";
import { EmptyRow, Table, TBody, Td, Th, THead, Tr } from "@/components/dashboard/Table";
import { DEFAULT_PAGE_SIZE, Pagination } from "@/components/dashboard/Pagination";
import { useLanguage } from "@/lib/i18n/LanguageContext";

const STATUS_STYLES: Record<string, string> = {
  Active: "bg-emerald-50 text-emerald-700",
  Pending: "bg-amber-50 text-amber-700",
  Inactive: "bg-slate-100 text-slate-600",
};

const STATUS_KEY = {
  Active: "active",
  Pending: "pending",
  Inactive: "inactive",
} as const;

function statusFor(user: User): "Active" | "Pending" | "Inactive" {
  if (!user.isApproved) return "Pending";
  if (!user.isActive) return "Inactive";
  return "Active";
}

export default function TenantsPage() {
  const { t } = useLanguage();
  const c = t.dashboard.admin.tenants;
  const [tenants, setTenants] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isModalOpen, setModalOpen] = useState(false);
  const [justAdded, setJustAdded] = useState(false);
  const [viewingTenant, setViewingTenant] = useState<User | null>(null);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);

  const loadTenants = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const res = await listUsers({ role: "tenant", page, limit: DEFAULT_PAGE_SIZE });
      setTenants(res.data);
      setTotalPages(res.meta.totalPages);
      setTotalItems(res.meta.total);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Failed to load tenants.");
      console.error("Failed to load tenants:", err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadTenants();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page]);

  const verifyTenant = (id: string) => {
    // This would typically call an API endpoint to verify/approve a tenant
    setTenants((prev) =>
      prev.map((tenant) =>
        tenant.id === id ? { ...tenant, isApproved: true } : tenant,
      ),
    );
  };

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-navy">{c.title}</h1>
          <p className="mt-1 text-sm text-slate-500">
            {c.subtitle}
          </p>
        </div>
        <button
          type="button"
          onClick={() => setModalOpen(true)}
          className="inline-flex items-center gap-2 rounded-lg bg-gold px-5 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-gold/90"
        >
          <Plus className="h-4 w-4" />
          {c.addTenant}
        </button>
      </div>

      {error && (
        <div className="flex items-start gap-3 rounded-lg border border-red-200 bg-red-50 px-4 py-3">
          <AlertCircle className="mt-0.5 h-4 w-4 text-red-600 flex-shrink-0" />
          <div className="flex-1">
            <p className="text-sm font-medium text-red-700">{error}</p>
            <button
              type="button"
              onClick={loadTenants}
              className="mt-2 text-sm font-medium text-red-600 hover:text-red-700"
            >
              Retry
            </button>
          </div>
        </div>
      )}

      {justAdded && (
        <div className="flex items-center gap-2 rounded-lg border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm font-medium text-emerald-700">
          <CheckCircle2 className="h-4 w-4" />
          {c.successNotice}
        </div>
      )}

      <Table variant="standalone">
        <THead>
          <Tr>
            <Th className="max-w-[10rem] px-4 py-3 sm:px-6">{t.dashboard.table.name}</Th>
            <Th className="hidden px-6 py-3 md:table-cell">{t.dashboard.table.email}</Th>
            <Th className="hidden px-6 py-3 lg:table-cell">{t.dashboard.table.phone}</Th>
            <Th className="px-4 py-3 sm:px-6">{t.dashboard.table.status}</Th>
            <Th className="hidden px-6 py-3 lg:table-cell">{t.dashboard.table.registered}</Th>
            <Th className="px-4 py-3 sm:px-6">{t.dashboard.table.actions}</Th>
          </Tr>
        </THead>
        <TBody>
          {isLoading ? (
            <EmptyRow colSpan={6}>Loading tenants...</EmptyRow>
          ) : tenants.length === 0 ? (
            <EmptyRow colSpan={6}>No tenants yet.</EmptyRow>
          ) : (
            tenants.map((tenant) => (
              <Tr key={tenant.id}>
                <Td className="max-w-[10rem] px-4 py-3 sm:max-w-none sm:px-6">
                  <p className="truncate font-medium text-navy sm:overflow-visible sm:whitespace-normal">
                    {`${tenant.firstName} ${tenant.lastName}`}
                  </p>
                  <p className="truncate text-xs text-slate-400 md:hidden">
                    {tenant.email}
                  </p>
                </Td>
                <Td className="hidden px-6 py-3 text-slate-500 md:table-cell">
                  {tenant.email}
                </Td>
                <Td className="hidden px-6 py-3 text-slate-500 lg:table-cell">
                  {tenant.phone || "—"}
                </Td>
                <Td className="px-4 py-3 sm:px-6">
                  <span
                    className={`rounded-full px-2.5 py-1 text-xs font-medium ${STATUS_STYLES[statusFor(tenant)]}`}
                  >
                    {t.dashboard.status[STATUS_KEY[statusFor(tenant)]]}
                  </span>
                </Td>
                <Td className="hidden px-6 py-3 text-slate-500 lg:table-cell">
                  {tenant.createdAt ? new Date(tenant.createdAt).toLocaleDateString() : "—"}
                </Td>
                <Td className="max-w-[6.5rem] px-4 py-3 sm:max-w-none sm:whitespace-nowrap sm:px-6">
                  <div className="flex flex-wrap items-center gap-2">
                    <button
                      type="button"
                      onClick={() => setViewingTenant(tenant)}
                      className="inline-flex items-center gap-1.5 rounded-lg border border-slate-300 px-2.5 py-1 text-xs font-medium text-slate-600 hover:bg-slate-50"
                    >
                      <Eye className="h-3.5 w-3.5" />
                      {t.dashboard.actions.view}
                    </button>
                    {!tenant.isApproved && (
                      <button
                        type="button"
                        onClick={() => verifyTenant(tenant.id)}
                        aria-label={c.verifyAriaTemplate.replace(
                          "{name}",
                          `${tenant.firstName} ${tenant.lastName}`,
                        )}
                        className="inline-flex items-center gap-1.5 rounded-lg border border-emerald-200 bg-emerald-50 px-2.5 py-1 text-xs font-medium text-emerald-700 hover:bg-emerald-100"
                      >
                        <ShieldCheck className="h-3.5 w-3.5" />
                        <span className="hidden sm:inline">{c.verify}</span>
                      </button>
                    )}
                  </div>
                </Td>
              </Tr>
            ))
          )}
        </TBody>
      </Table>

      <Pagination
        page={page}
        totalPages={totalPages}
        totalItems={totalItems}
        pageSize={DEFAULT_PAGE_SIZE}
        onPageChange={setPage}
      />

      {isModalOpen && (
        <Modal
          title={c.addTitle}
          description={c.addDescription}
          onClose={() => setModalOpen(false)}
        >
          <TenantForm
            onCancel={() => setModalOpen(false)}
            onSuccess={() => {
              setModalOpen(false);
              setJustAdded(true);
              setTimeout(() => setJustAdded(false), 5000);
              loadTenants();
            }}
          />
        </Modal>
      )}

      {viewingTenant && (
        <Modal
          title={c.detailsTitle}
          description={`${viewingTenant.firstName} ${viewingTenant.lastName}`}
          onClose={() => setViewingTenant(null)}
        >
          <TenantDetail tenant={viewingTenant} />
        </Modal>
      )}
    </div>
  );
}
