"use client";

import { useEffect, useState } from "react";
import { AppLink as Link } from "@/components/shared/AppLink";
import {
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
  PROPERTIES,
  TODAY,
  daysVacant,
  type Lease,
  type Property,
} from "@/lib/mock-admin-data";
import { getUnitsForProperty, type UnitOverrides } from "@/lib/units";
import { useLandlord } from "@/components/landlord/LandlordContext";
import { Modal } from "@/components/admin/Modal";
import {
  PropertyForm,
  type PropertyFormValues,
} from "@/components/landlord/PropertyForm";
import { AddTenantForm } from "@/components/landlord/AddTenantForm";
import { EmptyRow, Table, TBody, Td, Th, THead, Tr } from "@/components/dashboard/Table";
import { DEFAULT_PAGE_SIZE, Pagination } from "@/components/dashboard/Pagination";
import { formatMoney } from "@/lib/money";
import { useLanguage } from "@/lib/i18n/LanguageContext";
import type { Translations } from "@/lib/i18n/translations";

const AVAILABILITY_STYLES: Record<Property["availability"], string> = {
  Available: "bg-emerald-50 text-emerald-700",
  Occupied: "bg-slate-100 text-slate-600",
};

const APPROVAL_STYLES: Record<Property["approval"], string> = {
  Approved: "bg-emerald-50 text-emerald-700",
  Pending: "bg-amber-50 text-amber-700",
  Rejected: "bg-red-50 text-red-700",
};

const AVAILABILITY_KEY: Record<Property["availability"], keyof Translations["dashboard"]["status"]> = {
  Available: "available",
  Occupied: "occupied",
};

const APPROVAL_KEY: Record<Property["approval"], keyof Translations["dashboard"]["status"]> = {
  Approved: "approved",
  Pending: "pending",
  Rejected: "rejected",
};

const PROPERTY_TYPE_KEY: Record<string, keyof Translations["dashboard"]["status"]> = {
  House: "house",
  Apartment: "apartment",
  "Unit (Door)": "unitDoor",
  Unit: "unit",
};

function propertyStats(property: Property, unitOverrides: UnitOverrides) {
  const units = getUnitsForProperty(property, unitOverrides);
  const total = units.length;
  const occupied = units.filter((u) => u.occupancyStatus === "Occupied").length;
  const collected = units
    .filter((u) => u.currentPaymentStatus === "Paid")
    .reduce((sum, u) => sum + u.monthlyRent, 0);
  return {
    total,
    occupancyPercent: total ? Math.round((occupied / total) * 100) : 0,
    collected,
  };
}

export default function LandlordPropertiesPage() {
  const { t } = useLanguage();
  const c = t.dashboard.landlord.properties;
  const { landlordName, unitOverrides, addTenant } = useLandlord();
  const [properties, setProperties] = useState(PROPERTIES);
  const [view, setView] = useState<"cards" | "table">("cards");
  const [isAdding, setAdding] = useState(false);
  const [isAddingTenant, setAddingTenant] = useState(false);
  const [editingProperty, setEditingProperty] = useState<Property | null>(null);
  const [justSaved, setJustSaved] = useState(false);
  const [justAddedTenant, setJustAddedTenant] = useState<string | null>(null);

  const myProperties = properties.filter((p) => p.owner === landlordName);

  const [page, setPage] = useState(1);
  const totalPages = Math.max(1, Math.ceil(myProperties.length / DEFAULT_PAGE_SIZE));
  useEffect(() => {
    if (page > totalPages) setPage(totalPages);
  }, [page, totalPages]);
  const pagedProperties = myProperties.slice(
    (page - 1) * DEFAULT_PAGE_SIZE,
    page * DEFAULT_PAGE_SIZE,
  );

  const addProperty = (values: PropertyFormValues) => {
    const newProperty: Property = {
      id: String(Date.now()),
      owner: landlordName,
      approval: "Pending",
      vacantSince: values.availability === "Available" ? TODAY : null,
      totalUnits: 1,
      occupiedUnits: values.availability === "Occupied" ? 1 : 0,
      ...values,
    };
    setProperties((prev) => [newProperty, ...prev]);
    setAdding(false);
    setJustSaved(true);
  };

  const editProperty = (id: string, values: PropertyFormValues) => {
    setProperties((prev) =>
      prev.map((p) => {
        if (p.id !== id) return p;
        const vacantSince =
          values.availability === "Available"
            ? (p.vacantSince ?? TODAY)
            : null;
        return { ...p, ...values, vacantSince };
      }),
    );
    setEditingProperty(null);
    setJustSaved(true);
  };

  const handleAddTenant = (lease: Lease) => {
    addTenant(lease);
    setAddingTenant(false);
    setJustAddedTenant(
      c.addedTenantTemplate
        .replace("{tenant}", lease.tenant)
        .replace("{property}", lease.property)
        .replace("{unit}", lease.unitNumber ?? ""),
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
            onClick={() => setAddingTenant(true)}
            className="inline-flex items-center gap-1.5 rounded-lg bg-gold px-3 py-2 text-xs font-semibold text-white transition-colors hover:bg-gold/90 sm:gap-2 sm:px-5 sm:py-2.5 sm:text-sm"
          >
            <Plus className="h-4 w-4" />
            {c.addTenant}
          </button>
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

      {justAddedTenant && (
        <div className="flex items-center gap-2 rounded-lg border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm font-medium text-emerald-700">
          <CheckCircle2 className="h-4 w-4" />
          {justAddedTenant}
        </div>
      )}

      {view === "cards" ? (
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {pagedProperties.map((property) => {
            const stats = propertyStats(property, unitOverrides);
            const Icon = property.buildingType === "Commercial" ? Building2 : Home;
            return (
              <div
                key={property.id}
                className="group relative overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm transition-all hover:-translate-y-0.5 hover:shadow-md"
              >
                <button
                  type="button"
                  onClick={() => setEditingProperty(property)}
                  aria-label={c.editAriaTemplate.replace("{name}", property.name)}
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
                        {property.name}
                      </p>
                      <p className="truncate text-xs text-slate-500">
                        {property.address}
                      </p>
                    </div>
                  </div>

                  <div className="mt-5 grid grid-cols-3 gap-3 border-t border-slate-100 pt-4">
                    <div>
                      <p className="text-xs text-slate-400">{c.units}</p>
                      <p className="mt-0.5 font-semibold text-navy">{stats.total}</p>
                    </div>
                    <div>
                      <p className="text-xs text-slate-400">{c.occupancy}</p>
                      <p className="mt-0.5 font-semibold text-navy">
                        {stats.occupancyPercent}%
                      </p>
                    </div>
                    <div>
                      <p className="text-xs text-slate-400">{c.collected}</p>
                      <p className="mt-0.5 truncate font-semibold text-emerald-600">
                        {formatMoney(stats.collected)} RWF
                      </p>
                    </div>
                  </div>
                </Link>
              </div>
            );
          })}
          {pagedProperties.length === 0 && (
            <div className="col-span-full rounded-xl border border-dashed border-slate-300 bg-white py-16 text-center text-slate-400">
              {c.noProperties}
            </div>
          )}
        </div>
      ) : (
        <Table variant="standalone">
          <THead>
            <Tr>
              <Th className="px-4 py-3 sm:px-6">{t.dashboard.table.property}</Th>
              <Th className="hidden px-6 py-3 lg:table-cell">{t.dashboard.table.upi}</Th>
              <Th className="hidden px-6 py-3 md:table-cell">{t.dashboard.table.type}</Th>
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
                    {t.dashboard.status[PROPERTY_TYPE_KEY[property.type] ?? "unit"]} · {formatMoney(property.rent)} RWF
                  </p>
                </Td>
                <Td className="hidden px-6 py-3 text-slate-500 lg:table-cell">
                  {property.upi}
                </Td>
                <Td className="hidden px-6 py-3 text-slate-500 md:table-cell">
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
                      aria-label={c.editAriaTemplate.replace("{name}", property.name)}
                      className="inline-flex items-center gap-1.5 rounded-lg border border-slate-300 px-2.5 py-1 text-xs font-medium text-slate-600 hover:bg-slate-50"
                    >
                      <Pencil className="h-3.5 w-3.5" />
                      <span className="hidden sm:inline">{c.edit}</span>
                    </button>
                  </div>
                </Td>
              </Tr>
            ))}
            {pagedProperties.length === 0 && (
              <EmptyRow colSpan={8}>{c.noProperties}</EmptyRow>
            )}
          </TBody>
        </Table>
      )}

      <Pagination
        page={page}
        totalPages={totalPages}
        totalItems={myProperties.length}
        pageSize={DEFAULT_PAGE_SIZE}
        onPageChange={setPage}
      />

      {isAdding && (
        <Modal
          title={c.addPropertyTitle}
          description={c.addPropertyDescription}
          onClose={() => setAdding(false)}
        >
          <PropertyForm onCancel={() => setAdding(false)} onSuccess={addProperty} />
        </Modal>
      )}

      {isAddingTenant && (
        <Modal
          title={c.addTenantTitle}
          description={c.addTenantDescription}
          onClose={() => setAddingTenant(false)}
        >
          <AddTenantForm
            properties={myProperties}
            unitOverrides={unitOverrides}
            onCancel={() => setAddingTenant(false)}
            onSuccess={handleAddTenant}
          />
        </Modal>
      )}

      {editingProperty && (
        <Modal
          title={c.editPropertyTitle}
          description={c.editPropertyDescription}
          onClose={() => setEditingProperty(null)}
        >
          <PropertyForm
            initialProperty={editingProperty}
            onCancel={() => setEditingProperty(null)}
            onSuccess={(values) => editProperty(editingProperty.id, values)}
          />
        </Modal>
      )}
    </div>
  );
}
