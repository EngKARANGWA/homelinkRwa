"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { ArrowLeft, ArrowRight, Eye } from "lucide-react";
import { PROPERTIES } from "@/lib/mock-admin-data";
import { getUnitsForProperty } from "@/lib/units";
import { useLandlord } from "@/components/landlord/LandlordContext";

const STATUS_STYLES: Record<string, string> = {
  Paid: "bg-emerald-50 text-emerald-700",
  Overdue: "bg-red-50 text-red-700",
  Vacant: "bg-slate-100 text-slate-600",
};

function StatBlock({
  label,
  value,
  accent,
}: {
  label: string;
  value: string | number;
  accent?: "emerald" | "red";
}) {
  const valueColor =
    accent === "emerald"
      ? "text-emerald-600"
      : accent === "red"
        ? "text-red-600"
        : "text-navy";
  return (
    <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
      <p className="text-sm text-slate-500">{label}</p>
      <p className={`mt-2 text-xl font-bold ${valueColor}`}>{value}</p>
    </div>
  );
}

export default function PropertyDetailPage() {
  const { id } = useParams<{ id: string }>();
  const { landlordName, unitOverrides } = useLandlord();

  const property = PROPERTIES.find((p) => p.id === id && p.owner === landlordName);

  if (!property) {
    return (
      <div className="flex flex-col items-center gap-3 py-24 text-center">
        <p className="text-sm text-slate-500">Property not found.</p>
        <Link
          href="/landlord/properties"
          className="text-sm font-medium text-gold hover:underline"
        >
          Back to Properties
        </Link>
      </div>
    );
  }

  const units = getUnitsForProperty(property, unitOverrides);
  const totalUnits = units.length;
  const occupied = units.filter((u) => u.occupancyStatus === "Occupied").length;
  const occupancyPercent = totalUnits
    ? Math.round((occupied / totalUnits) * 100)
    : 0;
  const collected = units
    .filter((u) => u.currentPaymentStatus === "Paid")
    .reduce((sum, u) => sum + u.monthlyRent, 0);
  const outstanding = units
    .filter((u) => u.currentPaymentStatus === "Overdue")
    .reduce((sum, u) => sum + u.monthlyRent, 0);

  return (
    <div className="flex flex-col gap-6">
      <div>
        <Link
          href="/landlord/properties"
          className="inline-flex items-center gap-1.5 text-sm font-medium text-slate-500 hover:text-navy"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Properties
        </Link>
        <h1 className="mt-2 text-2xl font-bold text-navy">{property.name}</h1>
        <p className="mt-1 text-sm text-slate-500">{property.address}</p>
      </div>

      <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
        <StatBlock label="Units" value={totalUnits} />
        <StatBlock label="Occupied" value={`${occupancyPercent}%`} />
        <StatBlock
          label="Collected"
          value={`${collected.toLocaleString()} RWF`}
          accent="emerald"
        />
        <StatBlock
          label="Outstanding"
          value={`${outstanding.toLocaleString()} RWF`}
          accent="red"
        />
      </div>

      <div className="overflow-x-auto rounded-xl border border-slate-200 bg-white shadow-sm">
        <table className="w-full text-left text-sm">
          <thead>
            <tr className="text-xs uppercase tracking-wide text-slate-400">
              <th className="max-w-[9rem] px-4 py-3 font-medium sm:px-6">Unit</th>
              <th className="hidden px-6 py-3 font-medium sm:table-cell">Tenant</th>
              <th className="hidden px-6 py-3 font-medium md:table-cell">
                Monthly Amount
              </th>
              <th className="px-4 py-3 font-medium sm:px-6">Status</th>
              <th className="px-4 py-3 text-right font-medium sm:px-6">Actions</th>
            </tr>
          </thead>
          <tbody>
            {units.map((unit) => (
              <tr key={unit.id} className="border-t border-slate-100">
                <td className="max-w-[9rem] px-4 py-3 sm:max-w-none sm:px-6">
                  <p className="truncate font-medium text-navy sm:overflow-visible sm:whitespace-normal">
                    {unit.unitNumber}
                  </p>
                  <p className="truncate text-xs text-slate-400 sm:hidden">
                    {unit.tenant ?? "Vacant"}
                  </p>
                  <p className="truncate text-xs text-slate-400 md:hidden">
                    {unit.monthlyRent.toLocaleString()} RWF
                  </p>
                </td>
                <td className="hidden px-6 py-3 text-slate-500 sm:table-cell">
                  {unit.tenant ?? "Vacant"}
                </td>
                <td className="hidden px-6 py-3 text-slate-500 md:table-cell">
                  {unit.monthlyRent.toLocaleString()}
                </td>
                <td className="px-4 py-3 sm:px-6">
                  <span
                    className={`rounded-full px-2.5 py-1 text-xs font-medium ${STATUS_STYLES[unit.currentPaymentStatus]}`}
                  >
                    {unit.currentPaymentStatus}
                  </span>
                </td>
                <td className="px-4 py-3 text-right sm:px-6">
                  <Link
                    href={`/landlord/properties/${property.id}/units/${unit.id}`}
                    className="inline-flex items-center gap-1.5 rounded-lg border border-slate-300 px-2.5 py-1 text-xs font-medium text-slate-600 hover:bg-slate-50"
                  >
                    <Eye className="h-3.5 w-3.5" />
                    View
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <Link
        href="/landlord/leases"
        className="inline-flex items-center gap-1 self-start text-sm font-medium text-gold hover:underline"
      >
        View leases for this property
        <ArrowRight className="h-3.5 w-3.5" />
      </Link>
    </div>
  );
}
