"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { Bell, CheckCircle2, Eye, Plus, Search } from "lucide-react";
import { PROPERTIES, type Lease } from "@/lib/mock-admin-data";
import { getUnitsForProperty, type Unit } from "@/lib/units";
import { useLandlord } from "@/components/landlord/LandlordContext";
import { Modal } from "@/components/admin/Modal";
import { AddTenantForm } from "@/components/landlord/AddTenantForm";

const STATUS_STYLES: Record<string, string> = {
  Paid: "bg-emerald-50 text-emerald-700",
  Overdue: "bg-red-50 text-red-700",
};

export default function LandlordTenantsPage() {
  const { landlordName, unitOverrides, addTenant } = useLandlord();
  const [search, setSearch] = useState("");
  const [propertyFilter, setPropertyFilter] = useState("All Properties");
  const [statusFilter, setStatusFilter] = useState<"All" | "Paid" | "Overdue">("All");
  const [reminderNotice, setReminderNotice] = useState<string | null>(null);
  const [isAdding, setAdding] = useState(false);
  const [justAdded, setJustAdded] = useState<string | null>(null);

  const myProperties = PROPERTIES.filter((p) => p.owner === landlordName);
  const propertyOptions = ["All Properties", ...myProperties.map((p) => p.name)];

  const allTenants: Unit[] = useMemo(
    () =>
      myProperties.flatMap((property) =>
        getUnitsForProperty(property, unitOverrides).filter(
          (u) => u.occupancyStatus === "Occupied",
        ),
      ),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [landlordName, unitOverrides],
  );

  const handleAddTenant = (lease: Lease) => {
    addTenant(lease);
    setAdding(false);
    setJustAdded(`${lease.tenant} added to ${lease.property} · ${lease.unitNumber}.`);
  };

  const filteredTenants = allTenants.filter((t) => {
    const matchesSearch = t.tenant?.toLowerCase().includes(search.toLowerCase()) ?? true;
    const matchesProperty =
      propertyFilter === "All Properties" || t.propertyName === propertyFilter;
    const matchesStatus =
      statusFilter === "All" || t.currentPaymentStatus === statusFilter;
    return matchesSearch && matchesProperty && matchesStatus;
  });

  const overdueTenants = allTenants.filter((t) => t.currentPaymentStatus === "Overdue");
  const paidTenants = allTenants.filter((t) => t.currentPaymentStatus === "Paid");
  const totalMonthlyRent = allTenants.reduce((sum, t) => sum + t.monthlyRent, 0);

  const handleSendReminders = () => {
    setReminderNotice(
      overdueTenants.length > 0
        ? `Reminder sent to ${overdueTenants.length} tenant${overdueTenants.length === 1 ? "" : "s"} with an overdue balance.`
        : "No tenants currently have an overdue balance.",
    );
  };

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-navy">Tenants</h1>
          <p className="mt-1 text-sm text-slate-500">
            Everyone renting from you, in one place.
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <button
            type="button"
            onClick={handleSendReminders}
            className="inline-flex items-center gap-2 rounded-lg border border-slate-300 px-5 py-2.5 text-sm font-semibold text-slate-600 transition-colors hover:bg-slate-50"
          >
            <Bell className="h-4 w-4" />
            Remind Overdue Tenants
          </button>
          <button
            type="button"
            onClick={() => setAdding(true)}
            className="inline-flex items-center gap-2 rounded-lg bg-gold px-5 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-gold/90"
          >
            <Plus className="h-4 w-4" />
            Add Tenant
          </button>
        </div>
      </div>

      {reminderNotice && (
        <div className="flex items-center gap-2 rounded-lg border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm font-medium text-emerald-700">
          <CheckCircle2 className="h-4 w-4" />
          {reminderNotice}
        </div>
      )}

      {justAdded && (
        <div className="flex items-center gap-2 rounded-lg border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm font-medium text-emerald-700">
          <CheckCircle2 className="h-4 w-4" />
          {justAdded}
        </div>
      )}

      <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
        <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
          <p className="text-sm text-slate-500">Total Tenants</p>
          <p className="mt-2 text-xl font-bold text-navy">{allTenants.length}</p>
        </div>
        <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
          <p className="text-sm text-slate-500">Paid</p>
          <p className="mt-2 text-xl font-bold text-emerald-600">{paidTenants.length}</p>
        </div>
        <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
          <p className="text-sm text-slate-500">Overdue</p>
          <p className="mt-2 text-xl font-bold text-red-600">{overdueTenants.length}</p>
        </div>
        <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
          <p className="text-sm text-slate-500">Total Monthly Rent</p>
          <p className="mt-2 text-xl font-bold text-navy">
            {totalMonthlyRent.toLocaleString()} RWF
          </p>
        </div>
      </div>

      <div className="flex flex-wrap items-end gap-4 rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
        <label className="flex flex-1 min-w-[200px] flex-col gap-1.5 text-sm font-medium text-slate-700">
          Search
          <div className="flex items-center gap-2 rounded-lg border border-slate-300 px-3 py-2.5 focus-within:border-gold">
            <Search className="h-4 w-4 text-slate-400" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by tenant name"
              className="w-full bg-transparent text-sm text-navy placeholder:text-slate-400 focus:outline-none"
            />
          </div>
        </label>

        <label className="flex flex-col gap-1.5 text-sm font-medium text-slate-700">
          Property
          <select
            value={propertyFilter}
            onChange={(e) => setPropertyFilter(e.target.value)}
            className="rounded-lg border border-slate-300 px-3 py-2.5 text-sm text-navy focus:border-gold focus:outline-none"
          >
            {propertyOptions.map((name) => (
              <option key={name}>{name}</option>
            ))}
          </select>
        </label>

        <label className="flex flex-col gap-1.5 text-sm font-medium text-slate-700">
          Status
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value as typeof statusFilter)}
            className="rounded-lg border border-slate-300 px-3 py-2.5 text-sm text-navy focus:border-gold focus:outline-none"
          >
            <option value="All">All</option>
            <option value="Paid">Paid</option>
            <option value="Overdue">Overdue</option>
          </select>
        </label>
      </div>

      <div className="overflow-x-auto rounded-xl border border-slate-200 bg-white shadow-sm">
        <table className="w-full text-left text-sm">
          <thead>
            <tr className="text-xs uppercase tracking-wide text-slate-400">
              <th className="max-w-[10rem] px-4 py-3 font-medium sm:px-6">Tenant</th>
              <th className="hidden px-6 py-3 font-medium md:table-cell">Property</th>
              <th className="hidden px-6 py-3 font-medium md:table-cell">Unit</th>
              <th className="hidden px-6 py-3 font-medium sm:table-cell">
                Monthly Rent
              </th>
              <th className="px-4 py-3 font-medium sm:px-6">Status</th>
              <th className="hidden px-6 py-3 font-medium lg:table-cell">Lease End</th>
              <th className="px-4 py-3 text-right font-medium sm:px-6">Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredTenants.map((tenant) => (
              <tr key={tenant.id} className="border-t border-slate-100">
                <td className="max-w-[10rem] px-4 py-3 sm:max-w-none sm:px-6">
                  <p className="truncate font-medium text-navy sm:overflow-visible sm:whitespace-normal">
                    {tenant.tenant}
                  </p>
                  <p className="truncate text-xs text-slate-400 md:hidden">
                    {tenant.propertyName} · {tenant.unitNumber}
                  </p>
                  <p className="text-xs text-slate-400 sm:hidden">
                    {tenant.monthlyRent.toLocaleString()} RWF
                  </p>
                </td>
                <td className="hidden px-6 py-3 text-slate-500 md:table-cell">
                  {tenant.propertyName}
                </td>
                <td className="hidden px-6 py-3 text-slate-500 md:table-cell">
                  {tenant.unitNumber}
                </td>
                <td className="hidden px-6 py-3 text-slate-500 sm:table-cell">
                  {tenant.monthlyRent.toLocaleString()}
                </td>
                <td className="px-4 py-3 sm:px-6">
                  <span
                    className={`rounded-full px-2.5 py-1 text-xs font-medium ${STATUS_STYLES[tenant.currentPaymentStatus] ?? "bg-slate-100 text-slate-600"}`}
                  >
                    {tenant.currentPaymentStatus}
                  </span>
                </td>
                <td className="hidden px-6 py-3 text-slate-500 lg:table-cell">
                  {tenant.endDate ?? "Open-ended"}
                </td>
                <td className="px-4 py-3 text-right sm:px-6">
                  <Link
                    href={`/landlord/properties/${tenant.propertyId}/units/${tenant.id}`}
                    className="inline-flex items-center gap-1.5 rounded-lg border border-slate-300 px-2.5 py-1 text-xs font-medium text-slate-600 hover:bg-slate-50"
                  >
                    <Eye className="h-3.5 w-3.5" />
                    View
                  </Link>
                </td>
              </tr>
            ))}
            {filteredTenants.length === 0 && (
              <tr>
                <td colSpan={7} className="px-6 py-8 text-center text-slate-400">
                  No tenants match these filters.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {isAdding && (
        <Modal
          title="Add Tenant"
          description="Assign a new tenant to a vacant unit."
          onClose={() => setAdding(false)}
        >
          <AddTenantForm
            properties={myProperties}
            unitOverrides={unitOverrides}
            onCancel={() => setAdding(false)}
            onSuccess={handleAddTenant}
          />
        </Modal>
      )}
    </div>
  );
}
