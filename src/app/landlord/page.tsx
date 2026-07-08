"use client";

import Link from "next/link";
import { ArrowRight } from "lucide-react";
import {
  LEASES,
  MAINTENANCE_REQUESTS,
  PAYMENTS,
  PROPERTIES,
} from "@/lib/mock-admin-data";
import { useLandlord } from "@/components/landlord/LandlordContext";

const AVAILABILITY_STYLES: Record<string, string> = {
  Available: "bg-emerald-50 text-emerald-700",
  Occupied: "bg-slate-100 text-slate-600",
};

export default function LandlordOverviewPage() {
  const { landlordName } = useLandlord();

  const myProperties = PROPERTIES.filter((p) => p.owner === landlordName);
  const myPropertyNames = myProperties.map((p) => p.name);
  const myLeases = LEASES.filter((l) => l.owner === landlordName);
  const myMaintenance = MAINTENANCE_REQUESTS.filter((m) =>
    myPropertyNames.includes(m.property),
  );
  const myPayments = PAYMENTS.filter((p) => p.owner === landlordName);

  const stats = [
    { label: "My Properties", value: myProperties.length },
    {
      label: "Active Leases",
      value: myLeases.filter((l) => l.status === "Active").length,
    },
    {
      label: "Pending Maintenance",
      value: myMaintenance.filter((m) => m.status !== "Completed").length,
    },
    {
      label: "Revenue Collected",
      value: `${myPayments
        .filter((p) => p.status === "Paid")
        .reduce((sum, p) => sum + p.amount, 0)
        .toLocaleString()} RWF`,
    },
  ];

  return (
    <div className="flex flex-col gap-8">
      <div>
        <h1 className="text-2xl font-bold text-navy">Overview</h1>
        <p className="mt-1 text-sm text-slate-500">
          A quick look at your properties, {landlordName}.
        </p>
      </div>

      <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map(({ label, value }) => (
          <div
            key={label}
            className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm"
          >
            <p className="text-sm text-slate-500">{label}</p>
            <p className="mt-2 text-2xl font-bold text-navy">{value}</p>
          </div>
        ))}
      </div>

      <div className="rounded-xl border border-slate-200 bg-white shadow-sm">
        <div className="flex items-center justify-between border-b border-slate-100 px-6 py-4">
          <h2 className="font-semibold text-navy">My properties</h2>
          <Link
            href="/landlord/properties"
            className="inline-flex items-center gap-1 text-sm font-medium text-gold hover:underline"
          >
            View all
            <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        </div>

        <table className="w-full text-left text-sm">
          <thead>
            <tr className="text-xs uppercase tracking-wide text-slate-400">
              <th className="px-6 py-3 font-medium">Property</th>
              <th className="px-6 py-3 font-medium">Type</th>
              <th className="px-6 py-3 font-medium">Rent (RWF)</th>
              <th className="px-6 py-3 font-medium">Availability</th>
            </tr>
          </thead>
          <tbody>
            {myProperties.map((property) => (
              <tr key={property.id} className="border-t border-slate-100">
                <td className="px-6 py-3 font-medium text-navy">
                  {property.name}
                </td>
                <td className="px-6 py-3 text-slate-500">{property.type}</td>
                <td className="px-6 py-3 text-slate-500">
                  {property.rent.toLocaleString()}
                </td>
                <td className="px-6 py-3">
                  <span
                    className={`rounded-full px-2.5 py-1 text-xs font-medium ${AVAILABILITY_STYLES[property.availability]}`}
                  >
                    {property.availability}
                  </span>
                </td>
              </tr>
            ))}
            {myProperties.length === 0 && (
              <tr>
                <td colSpan={4} className="px-6 py-8 text-center text-slate-400">
                  No properties registered yet.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
