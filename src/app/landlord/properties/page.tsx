"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  AlertCircle,
  Building2,
  CheckCircle2,
  Eye,
  Home,
  LayoutGrid,
  Pencil,
  Plus,
  Table as TableIcon,
} from "lucide-react";
import {
  createProperty,
  listProperties,
  updateProperty,
} from "@/lib/api/properties";
import { ApiError } from "@/lib/api/client";
import type {
  ApprovalStatus,
  CreatePropertyInput,
  Property,
  PropertyStatus,
  UpdatePropertyInput,
} from "@/lib/api/types";
import { useAuth } from "@/components/auth/AuthContext";
import { Modal } from "@/components/admin/Modal";
import { PropertyForm } from "@/components/admin/PropertyForm";
import { EmptyRow, Table, TBody, Td, Th, THead, Tr } from "@/components/dashboard/Table";
import { DEFAULT_PAGE_SIZE, Pagination } from "@/components/dashboard/Pagination";
import { formatMoney } from "@/lib/money";
import { useLanguage } from "@/lib/i18n/LanguageContext";
import type { Translations } from "@/lib/i18n/translations";

const STATUS_STYLES: Record<PropertyStatus, string> = {
  available: "bg-emerald-50 text-emerald-700",
  occupied: "bg-slate-100 text-slate-600",
};

const APPROVAL_STYLES: Record<ApprovalStatus, string> = {
  approved: "bg-emerald-50 text-emerald-700",
  pending: "bg-amber-50 text-amber-700",
  rejected: "bg-red-50 text-red-700",
};

const STATUS_KEY: Record<PropertyStatus, keyof Translations["dashboard"]["status"]> = {
  available: "available",
  occupied: "occupied",
};

const APPROVAL_KEY: Record<ApprovalStatus, keyof Translations["dashboard"]["status"]> = {
  approved: "approved",
  pending: "pending",
  rejected: "rejected",
};

const CATEGORY_KEY: Record<Property["category"], keyof Translations["dashboard"]["status"]> = {
  residential: "residential",
  commercial: "commercial",
};

function capitalize(value: string) {
  return value.charAt(0).toUpperCase() + value.slice(1);
}

export default function LandlordPropertiesPage() {
  const { user } = useAuth();
  const { t } = useLanguage();
  const c = t.dashboard.landlord.properties;
  const [properties, setProperties] = useState<Property[]>([]);
  const [view, setView] = useState<"cards" | "table">("cards");
  const [isLoading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isAdding, setAdding] = useState(false);
  const [editingProperty, setEditingProperty] = useState<Property | null>(null);
  const [formError, setFormError] = useState<string | null>(null);
  const [justSaved, setJustSaved] = useState(false);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);

  const load = () => {
    if (!user) return;
    setLoading(true);
    setError(null);
    listProperties({ ownerId: user.id, page, limit: DEFAULT_PAGE_SIZE })
      .then((res) => {
        setProperties(res.data);
        setTotalPages(res.meta.totalPages);
        setTotalItems(res.meta.total);
      })
      .catch((err) =>
        setError(err instanceof ApiError ? err.message : "Failed to load properties."),
      )
      .finally(() => setLoading(false));
  };

  useEffect(load, [user, page]);

  const addProperty = async (values: CreatePropertyInput) => {
    setFormError(null);
    try {
      await createProperty(values);
      setAdding(false);
      setJustSaved(true);
      load();
    } catch (err) {
      setFormError(err instanceof ApiError ? err.message : "Failed to add property.");
    }
  };

  const editProperty = async (values: UpdatePropertyInput) => {
    if (!editingProperty) return;
    setFormError(null);
    try {
      await updateProperty(editingProperty.id, values);
      setEditingProperty(null);
      setJustSaved(true);
      load();
    } catch (err) {
      setFormError(err instanceof ApiError ? err.message : "Failed to update property.");
    }
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
        <div className="flex flex-wrap items-center gap-2 sm:gap-3">
          <div className="flex items-center rounded-lg border border-slate-300 bg-white p-1">
            <button
              type="button"
              onClick={() => setView("cards")}
              aria-label={c.cardView}
              className={`flex items-center gap-1.5 rounded-md px-3 py-1.5 text-xs font-medium transition-colors ${
                view === "cards"
                  ? "bg-navy text-white"
                  : "text-slate-500 hover:bg-slate-50"
              }`}
            >
              <LayoutGrid className="h-3.5 w-3.5" />
              {c.cards}
            </button>
            <button
              type="button"
              onClick={() => setView("table")}
              aria-label={c.tableView}
              className={`flex items-center gap-1.5 rounded-md px-3 py-1.5 text-xs font-medium transition-colors ${
                view === "table"
                  ? "bg-navy text-white"
                  : "text-slate-500 hover:bg-slate-50"
              }`}
            >
              <TableIcon className="h-3.5 w-3.5" />
              {c.table}
            </button>
          </div>
          <button
            type="button"
            onClick={() => setAdding(true)}
            className="inline-flex items-center gap-1.5 rounded-lg bg-gold px-3 py-2 text-xs font-semibold text-white transition-colors hover:bg-gold/90 sm:gap-2 sm:px-5 sm:py-2.5 sm:text-sm"
          >
            <Plus className="h-4 w-4" />
            {c.addProperty}
          </button>
        </div>
      </div>

      {justSaved && (
        <div className="flex items-center gap-2 rounded-lg border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm font-medium text-emerald-700">
          <CheckCircle2 className="h-4 w-4" />
          {c.savedNotice}
        </div>
      )}

      {error && (
        <div className="flex items-center justify-between gap-3 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-700">
          <span className="flex items-center gap-2">
            <AlertCircle className="h-4 w-4" />
            {error}
          </span>
          <button type="button" onClick={load} className="underline hover:no-underline">
            Retry
          </button>
        </div>
      )}

      {view === "cards" ? (
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {isLoading ? (
            <div className="col-span-full rounded-xl border border-dashed border-slate-300 bg-white py-16 text-center text-slate-400">
              Loading properties...
            </div>
          ) : properties.length === 0 ? (
            <div className="col-span-full rounded-xl border border-dashed border-slate-300 bg-white py-16 text-center text-slate-400">
              {c.noProperties}
            </div>
          ) : (
            properties.map((property) => {
              const Icon = property.category === "commercial" ? Building2 : Home;
              return (
                <div
                  key={property.id}
                  className="group relative overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm transition-all hover:-translate-y-0.5 hover:shadow-md"
                >
                  <button
                    type="button"
                    onClick={() => setEditingProperty(property)}
                    aria-label={c.editAriaTemplate.replace("{name}", property.title)}
                    className="absolute right-3 top-3 z-10 flex h-8 w-8 items-center justify-center rounded-full bg-white/90 text-slate-500 shadow-sm hover:bg-slate-100"
                  >
                    <Pencil className="h-3.5 w-3.5" />
                  </button>
                  <Link href={`/landlord/properties/${property.id}`} className="block p-5">
                    <div className="flex items-start gap-3 pr-8">
                      <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-gold/10 text-gold">
                        <Icon className="h-5 w-5" />
                      </span>
                      <div className="min-w-0">
                        <p className="truncate font-semibold text-navy">
                          {property.title}
                        </p>
                        <p className="truncate text-xs text-slate-500">
                          {property.addressLine}, {property.city}
                        </p>
                      </div>
                    </div>

                    <div className="mt-5 grid grid-cols-3 gap-3 border-t border-slate-100 pt-4">
                      <div>
                        <p className="text-xs text-slate-400">{t.dashboard.table.type}</p>
                        <p className="mt-0.5 truncate font-semibold text-navy">
                          {capitalize(property.type)}
                        </p>
                      </div>
                      <div>
                        <p className="text-xs text-slate-400">{t.dashboard.table.rentRwf}</p>
                        <p className="mt-0.5 truncate font-semibold text-navy">
                          {formatMoney(Number(property.rentAmount))} RWF
                        </p>
                      </div>
                      <div>
                        <p className="text-xs text-slate-400">{t.dashboard.table.status}</p>
                        <span
                          className={`mt-0.5 inline-block rounded-full px-2 py-0.5 text-xs font-medium ${STATUS_STYLES[property.status]}`}
                        >
                          {t.dashboard.status[STATUS_KEY[property.status]]}
                        </span>
                      </div>
                    </div>
                  </Link>
                </div>
              );
            })
          )}
        </div>
      ) : (
        <Table variant="standalone">
          <THead>
            <Tr>
              <Th className="px-4 py-3 sm:px-6">{t.dashboard.table.property}</Th>
              <Th className="hidden px-6 py-3 lg:table-cell">{t.dashboard.table.type}</Th>
              <Th className="hidden px-6 py-3 md:table-cell">{t.dashboard.table.rentRwf}</Th>
              <Th className="hidden px-6 py-3 sm:table-cell">{t.dashboard.table.availability}</Th>
              <Th className="px-4 py-3 sm:px-6">{t.dashboard.table.approval}</Th>
              <Th className="px-4 py-3 sm:px-6">{t.dashboard.table.actions}</Th>
            </Tr>
          </THead>
          <TBody>
            {isLoading ? (
              <EmptyRow colSpan={6}>Loading properties...</EmptyRow>
            ) : properties.length === 0 ? (
              <EmptyRow colSpan={6}>{c.noProperties}</EmptyRow>
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
                      {capitalize(property.type)} · {formatMoney(Number(property.rentAmount))} RWF
                    </p>
                  </Td>
                  <Td className="hidden px-6 py-3 text-slate-500 lg:table-cell">
                    {t.dashboard.status[CATEGORY_KEY[property.category]]} · {capitalize(property.type)}
                  </Td>
                  <Td className="hidden px-6 py-3 text-slate-500 md:table-cell">
                    {formatMoney(Number(property.rentAmount))}
                  </Td>
                  <Td className="hidden px-6 py-3 sm:table-cell">
                    <span
                      className={`rounded-full px-2.5 py-1 text-xs font-medium ${STATUS_STYLES[property.status]}`}
                    >
                      {t.dashboard.status[STATUS_KEY[property.status]]}
                    </span>
                  </Td>
                  <Td className="px-4 py-3 sm:px-6">
                    <span
                      className={`rounded-full px-2.5 py-1 text-xs font-medium ${APPROVAL_STYLES[property.approvalStatus]}`}
                    >
                      {t.dashboard.status[APPROVAL_KEY[property.approvalStatus]]}
                    </span>
                  </Td>
                  <Td className="max-w-[6.5rem] px-4 py-3 sm:max-w-none sm:whitespace-nowrap sm:px-6">
                    <div className="flex flex-wrap items-center gap-2">
                      <Link
                        href={`/landlord/properties/${property.id}`}
                        className="inline-flex items-center gap-1.5 rounded-lg border border-slate-300 px-2.5 py-1 text-xs font-medium text-slate-600 hover:bg-slate-50"
                      >
                        <Eye className="h-3.5 w-3.5" />
                        {t.dashboard.actions.view}
                      </Link>
                      <button
                        type="button"
                        onClick={() => setEditingProperty(property)}
                        aria-label={c.editAriaTemplate.replace("{name}", property.title)}
                        className="inline-flex items-center gap-1.5 rounded-lg border border-slate-300 px-2.5 py-1 text-xs font-medium text-slate-600 hover:bg-slate-50"
                      >
                        <Pencil className="h-3.5 w-3.5" />
                        <span className="hidden sm:inline">{c.edit}</span>
                      </button>
                    </div>
                  </Td>
                </Tr>
              ))
            )}
          </TBody>
        </Table>
      )}

      <Pagination
        page={page}
        totalPages={totalPages}
        totalItems={totalItems}
        pageSize={DEFAULT_PAGE_SIZE}
        onPageChange={setPage}
      />

      {isAdding && (
        <Modal
          title={c.addPropertyTitle}
          description={c.addPropertyDescription}
          onClose={() => setAdding(false)}
        >
          {formError && (
            <p className="mb-4 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
              {formError}
            </p>
          )}
          <PropertyForm
            owners={[]}
            showOwnerField={false}
            onCancel={() => setAdding(false)}
            onSuccess={addProperty}
          />
        </Modal>
      )}

      {editingProperty && (
        <Modal
          title={c.editPropertyTitle}
          description={c.editPropertyDescription}
          onClose={() => setEditingProperty(null)}
        >
          {formError && (
            <p className="mb-4 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
              {formError}
            </p>
          )}
          <PropertyForm
            owners={[]}
            showOwnerField={false}
            initialProperty={editingProperty}
            onCancel={() => setEditingProperty(null)}
            onSuccess={editProperty}
          />
        </Modal>
      )}
    </div>
  );
}
