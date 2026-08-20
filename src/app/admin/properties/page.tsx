"use client";

import { useEffect, useState } from "react";
import { AlertCircle, Check, CheckCircle2, Eye, Plus, X } from "lucide-react";
import { listUsers } from "@/lib/api/admin";
import { approveProperty, createProperty, listProperties, rejectProperty } from "@/lib/api/properties";
import { ApiError } from "@/lib/api/client";
import type { ApprovalStatus, CreatePropertyInput, Property, PropertyStatus, User } from "@/lib/api/types";
import { Modal } from "@/components/admin/Modal";
import { PropertyForm } from "@/components/admin/PropertyForm";
import { PropertyDetail } from "@/components/admin/PropertyDetail";
import { EmptyRow, Table, TBody, Td, Th, THead, Tr } from "@/components/dashboard/Table";
import { DEFAULT_PAGE_SIZE, Pagination } from "@/components/dashboard/Pagination";
import { formatMoney } from "@/lib/money";
import { useLanguage } from "@/lib/i18n/LanguageContext";

const APPROVAL_STYLES: Record<ApprovalStatus, string> = {
  approved: "bg-emerald-50 text-emerald-700",
  pending: "bg-amber-50 text-amber-700",
  rejected: "bg-red-50 text-red-700",
};

const STATUS_STYLES: Record<PropertyStatus, string> = {
  available: "bg-emerald-50 text-emerald-700",
  occupied: "bg-slate-100 text-slate-600",
};

function capitalize(value: string) {
  return value.charAt(0).toUpperCase() + value.slice(1);
}

export default function PropertiesPage() {
  const { t } = useLanguage();
  const c = t.dashboard.admin.properties;
  const [properties, setProperties] = useState<Property[]>([]);
  const [owners, setOwners] = useState<User[]>([]);
  const [isLoading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isModalOpen, setModalOpen] = useState(false);
  const [justAdded, setJustAdded] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);
  const [viewingProperty, setViewingProperty] = useState<Property | null>(null);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);

  const ownerName = (ownerId: string) => {
    const owner = owners.find((o) => o.id === ownerId);
    return owner ? `${owner.firstName} ${owner.lastName}` : "—";
  };

  const load = () => {
    setLoading(true);
    setError(null);
    Promise.all([
      listProperties({ page, limit: DEFAULT_PAGE_SIZE }),
      listUsers({ role: "owner", limit: 100 }),
    ])
      .then(([propertiesRes, ownersRes]) => {
        setProperties(propertiesRes.data);
        setTotalPages(propertiesRes.meta.totalPages);
        setTotalItems(propertiesRes.meta.total);
        setOwners(ownersRes.data);
      })
      .catch((err) => setError(err instanceof ApiError ? err.message : "Failed to load properties."))
      .finally(() => setLoading(false));
  };

  useEffect(load, [page]);

  const addProperty = async (values: CreatePropertyInput) => {
    setFormError(null);
    try {
      await createProperty(values);
      setModalOpen(false);
      setJustAdded(true);
      load();
    } catch (err) {
      setFormError(err instanceof ApiError ? err.message : "Failed to add property.");
    }
  };

  const handleApprove = async (id: string) => {
    setActionError(null);
    try {
      await approveProperty(id);
      load();
    } catch (err) {
      setActionError(err instanceof ApiError ? err.message : "Failed to approve property.");
    }
  };

  const handleReject = async (property: Property) => {
    const reason = window.prompt("Reason for rejecting this property:")?.trim();
    if (!reason) return;
    setActionError(null);
    try {
      await rejectProperty(property.id, reason);
      load();
    } catch (err) {
      setActionError(err instanceof ApiError ? err.message : "Failed to reject property.");
    }
  };

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-navy">{c.title}</h1>
          <p className="mt-1 text-sm text-slate-500">{c.subtitle}</p>
        </div>
        <button
          type="button"
          onClick={() => setModalOpen(true)}
          className="inline-flex items-center gap-2 rounded-lg bg-gold px-5 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-gold/90"
        >
          <Plus className="h-4 w-4" />
          {c.addProperty}
        </button>
      </div>

      {justAdded && (
        <div className="flex items-center gap-2 rounded-lg border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm font-medium text-emerald-700">
          <CheckCircle2 className="h-4 w-4" />
          {c.successNotice}
        </div>
      )}

      {(error || actionError) && (
        <div className="flex items-center justify-between gap-3 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-700">
          <span className="flex items-center gap-2">
            <AlertCircle className="h-4 w-4" />
            {error ?? actionError}
          </span>
          {error && (
            <button type="button" onClick={load} className="underline hover:no-underline">
              Retry
            </button>
          )}
        </div>
      )}

      <Table variant="standalone">
        <THead>
          <Tr>
            <Th className="px-4 py-3 sm:px-6">{t.dashboard.table.property}</Th>
            <Th className="hidden px-6 py-3 md:table-cell">{t.dashboard.table.owner}</Th>
            <Th className="hidden px-6 py-3 lg:table-cell">{t.dashboard.table.type}</Th>
            <Th className="hidden px-6 py-3 md:table-cell">{t.dashboard.table.rentRwf}</Th>
            <Th className="hidden px-6 py-3 sm:table-cell">{t.dashboard.table.availability}</Th>
            <Th className="px-4 py-3 sm:px-6">{t.dashboard.table.approval}</Th>
            <Th className="px-4 py-3 sm:px-6">{t.dashboard.table.actions}</Th>
          </Tr>
        </THead>
        <TBody>
          {isLoading ? (
            <EmptyRow colSpan={7}>Loading properties...</EmptyRow>
          ) : properties.length === 0 ? (
            <EmptyRow colSpan={7}>No properties listed yet.</EmptyRow>
          ) : (
            properties.map((property) => (
              <Tr key={property.id}>
                <Td className="max-w-[10rem] px-4 py-3 sm:max-w-none sm:px-6">
                  <p className="truncate font-medium text-navy sm:overflow-visible sm:whitespace-normal">
                    {property.title}
                  </p>
                  <p className="hidden text-xs text-slate-400 sm:block">
                    {property.addressLine}, {property.city}
                  </p>
                  <p className="truncate text-xs text-slate-400 md:hidden">
                    {ownerName(property.ownerId)} · {capitalize(property.type)}
                  </p>
                </Td>
                <Td className="hidden px-6 py-3 text-slate-500 md:table-cell">
                  {ownerName(property.ownerId)}
                </Td>
                <Td className="hidden px-6 py-3 text-slate-500 lg:table-cell">
                  {capitalize(property.category)} · {capitalize(property.type)}
                </Td>
                <Td className="hidden px-6 py-3 text-slate-500 md:table-cell">
                  {formatMoney(Number(property.rentAmount))}
                </Td>
                <Td className="hidden px-6 py-3 sm:table-cell">
                  <span
                    className={`rounded-full px-2.5 py-1 text-xs font-medium ${STATUS_STYLES[property.status]}`}
                  >
                    {t.dashboard.status[property.status]}
                  </span>
                </Td>
                <Td className="px-4 py-3 sm:px-6">
                  <span
                    className={`rounded-full px-2.5 py-1 text-xs font-medium ${APPROVAL_STYLES[property.approvalStatus]}`}
                  >
                    {t.dashboard.status[property.approvalStatus]}
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
                      {t.dashboard.actions.view}
                    </button>
                    {property.approvalStatus === "pending" && (
                      <>
                        <button
                          type="button"
                          onClick={() => handleApprove(property.id)}
                          aria-label={c.approveAriaTemplate.replace("{name}", property.title)}
                          className="flex h-7 w-7 items-center justify-center rounded-full bg-emerald-50 text-emerald-700 hover:bg-emerald-100"
                        >
                          <Check className="h-4 w-4" />
                        </button>
                        <button
                          type="button"
                          onClick={() => handleReject(property)}
                          aria-label={c.rejectAriaTemplate.replace("{name}", property.title)}
                          className="flex h-7 w-7 items-center justify-center rounded-full bg-red-50 text-red-700 hover:bg-red-100"
                        >
                          <X className="h-4 w-4" />
                        </button>
                      </>
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
        <Modal title={c.addTitle} description={c.addDescription} onClose={() => setModalOpen(false)}>
          {formError && (
            <p className="mb-4 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
              {formError}
            </p>
          )}
          <PropertyForm owners={owners} onCancel={() => setModalOpen(false)} onSuccess={addProperty} />
        </Modal>
      )}

      {viewingProperty && (
        <Modal
          title={c.detailsTitle}
          description={viewingProperty.title}
          onClose={() => setViewingProperty(null)}
          maxWidthClassName="max-w-2xl"
        >
          <PropertyDetail property={viewingProperty} ownerName={ownerName(viewingProperty.ownerId)} />
        </Modal>
      )}
    </div>
  );
}
