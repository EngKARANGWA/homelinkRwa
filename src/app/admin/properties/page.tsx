"use client";

import { useEffect, useState } from "react";
import { Check, CheckCircle2, Eye, Plus, X } from "lucide-react";
import { PROPERTIES, TODAY, daysVacant, type Property } from "@/lib/mock-admin-data";
import { Modal } from "@/components/admin/Modal";
import { PropertyForm, type PropertyFormValues } from "@/components/admin/PropertyForm";
import { PropertyDetail } from "@/components/admin/PropertyDetail";
import { Table, TBody, Td, Th, THead, Tr } from "@/components/dashboard/Table";
import { DEFAULT_PAGE_SIZE, Pagination } from "@/components/dashboard/Pagination";
import { formatMoney } from "@/lib/money";
import { useLanguage } from "@/lib/i18n/LanguageContext";
import type { Translations } from "@/lib/i18n/translations";

const APPROVAL_STYLES: Record<Property["approval"], string> = {
  Approved: "bg-emerald-50 text-emerald-700",
  Pending: "bg-amber-50 text-amber-700",
  Rejected: "bg-red-50 text-red-700",
};

const AVAILABILITY_STYLES: Record<Property["availability"], string> = {
  Available: "bg-emerald-50 text-emerald-700",
  Occupied: "bg-slate-100 text-slate-600",
};

const APPROVAL_KEY: Record<Property["approval"], keyof Translations["dashboard"]["status"]> = {
  Approved: "approved",
  Pending: "pending",
  Rejected: "rejected",
};

const AVAILABILITY_KEY: Record<Property["availability"], keyof Translations["dashboard"]["status"]> = {
  Available: "available",
  Occupied: "occupied",
};

const PROPERTY_TYPE_KEY: Record<string, keyof Translations["dashboard"]["status"]> = {
  House: "house",
  Apartment: "apartment",
  "Unit (Door)": "unitDoor",
  Unit: "unit",
};

export default function PropertiesPage() {
  const { t } = useLanguage();
  const c = t.dashboard.admin.properties;
  const [properties, setProperties] = useState(PROPERTIES);
  const [isModalOpen, setModalOpen] = useState(false);
  const [justAdded, setJustAdded] = useState(false);
  const [viewingProperty, setViewingProperty] = useState<Property | null>(null);
  const [page, setPage] = useState(1);

  const totalPages = Math.max(1, Math.ceil(properties.length / DEFAULT_PAGE_SIZE));
  useEffect(() => {
    if (page > totalPages) setPage(totalPages);
  }, [page, totalPages]);
  const pagedProperties = properties.slice(
    (page - 1) * DEFAULT_PAGE_SIZE,
    page * DEFAULT_PAGE_SIZE,
  );

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
          {c.addProperty}
        </button>
      </div>

      {justAdded && (
        <div className="flex items-center gap-2 rounded-lg border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm font-medium text-emerald-700">
          <CheckCircle2 className="h-4 w-4" />
          {c.successNotice}
        </div>
      )}

      <Table variant="standalone">
        <THead>
          <Tr>
            <Th className="px-4 py-3 sm:px-6">{t.dashboard.table.property}</Th>
            <Th className="hidden px-6 py-3 lg:table-cell">{t.dashboard.table.upi}</Th>
            <Th className="hidden px-6 py-3 md:table-cell">{t.dashboard.table.owner}</Th>
            <Th className="hidden px-6 py-3 lg:table-cell">{t.dashboard.table.type}</Th>
            <Th className="hidden px-6 py-3 md:table-cell">{t.dashboard.table.rentRwf}</Th>
            <Th className="hidden px-6 py-3 sm:table-cell">{t.dashboard.table.availability}</Th>
            <Th className="hidden px-6 py-3 lg:table-cell">{t.dashboard.table.daysVacant}</Th>
            <Th className="px-4 py-3 sm:px-6">{t.dashboard.table.approval}</Th>
            <Th className="px-4 py-3 sm:px-6">{t.dashboard.table.actions}</Th>
          </Tr>
        </THead>
        <TBody>
          {pagedProperties.map((property) => (
            <Tr key={property.id}>
              <Td className="max-w-[10rem] px-4 py-3 sm:max-w-none sm:px-6">
                <p className="truncate font-medium text-navy sm:overflow-visible sm:whitespace-normal">
                  {property.name}
                </p>
                <p className="hidden text-xs text-slate-400 sm:block">
                  {property.address}
                </p>
                <p className="truncate text-xs text-slate-400 md:hidden">
                  {property.owner} · {t.dashboard.status[PROPERTY_TYPE_KEY[property.type] ?? "unit"]}
                </p>
              </Td>
              <Td className="hidden px-6 py-3 text-slate-500 lg:table-cell">
                {property.upi}
              </Td>
              <Td className="hidden px-6 py-3 text-slate-500 md:table-cell">
                {property.owner}
              </Td>
              <Td className="hidden px-6 py-3 text-slate-500 lg:table-cell">
                {t.dashboard.status[PROPERTY_TYPE_KEY[property.type] ?? "unit"]}
              </Td>
              <Td className="hidden px-6 py-3 text-slate-500 md:table-cell">
                {formatMoney(property.rent)}
              </Td>
              <Td className="hidden px-6 py-3 sm:table-cell">
                <span
                  className={`rounded-full px-2.5 py-1 text-xs font-medium ${AVAILABILITY_STYLES[property.availability]}`}
                >
                  {t.dashboard.status[AVAILABILITY_KEY[property.availability]]}
                </span>
              </Td>
              <Td className="hidden px-6 py-3 text-slate-500 lg:table-cell">
                {daysVacant(property.vacantSince) ?? "—"}
              </Td>
              <Td className="px-4 py-3 sm:px-6">
                <span
                  className={`rounded-full px-2.5 py-1 text-xs font-medium ${APPROVAL_STYLES[property.approval]}`}
                >
                  {t.dashboard.status[APPROVAL_KEY[property.approval]]}
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
                  {property.approval === "Pending" && (
                    <>
                      <button
                        type="button"
                        onClick={() => updateApproval(property.id, "Approved")}
                        aria-label={c.approveAriaTemplate.replace("{name}", property.name)}
                        className="flex h-7 w-7 items-center justify-center rounded-full bg-emerald-50 text-emerald-700 hover:bg-emerald-100"
                      >
                        <Check className="h-4 w-4" />
                      </button>
                      <button
                        type="button"
                        onClick={() => updateApproval(property.id, "Rejected")}
                        aria-label={c.rejectAriaTemplate.replace("{name}", property.name)}
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

      <Pagination
        page={page}
        totalPages={totalPages}
        totalItems={properties.length}
        pageSize={DEFAULT_PAGE_SIZE}
        onPageChange={setPage}
      />

      {isModalOpen && (
        <Modal
          title={c.addTitle}
          description={c.addDescription}
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
          title={c.detailsTitle}
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
