import Link from "next/link";
import { ArrowRight, Plus } from "lucide-react";
import { ADMIN_STATS, LANDLORDS } from "@/lib/mock-admin-data";

const STATUS_STYLES: Record<string, string> = {
  Active: "bg-emerald-50 text-emerald-700",
  Pending: "bg-amber-50 text-amber-700",
  Suspended: "bg-red-50 text-red-700",
};

export default function AdminOverviewPage() {
  const recentLandlords = LANDLORDS.slice(0, 4);

  return (
    <div className="flex flex-col gap-8">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-navy">Overview</h1>
          <p className="mt-1 text-sm text-slate-500">
            A quick look at what&apos;s happening across the platform.
          </p>
        </div>
        <Link
          href="/admin/landlords"
          className="inline-flex items-center gap-2 rounded-lg bg-gold px-5 py-2.5 text-sm font-semibold text-navy transition-colors hover:bg-gold/90"
        >
          <Plus className="h-4 w-4" />
          Register Landlord
        </Link>
      </div>

      <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
        {ADMIN_STATS.map(({ label, value }) => (
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
          <h2 className="font-semibold text-navy">Recently registered landlords</h2>
          <Link
            href="/admin/landlords"
            className="inline-flex items-center gap-1 text-sm font-medium text-gold hover:underline"
          >
            View all
            <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        </div>

        <table className="w-full text-left text-sm">
          <thead>
            <tr className="text-xs uppercase tracking-wide text-slate-400">
              <th className="px-6 py-3 font-medium">Name</th>
              <th className="px-6 py-3 font-medium">Email</th>
              <th className="px-6 py-3 font-medium">Properties</th>
              <th className="px-6 py-3 font-medium">Status</th>
            </tr>
          </thead>
          <tbody>
            {recentLandlords.map((landlord) => (
              <tr key={landlord.id} className="border-t border-slate-100">
                <td className="px-6 py-3 font-medium text-navy">
                  {landlord.name}
                </td>
                <td className="px-6 py-3 text-slate-500">{landlord.email}</td>
                <td className="px-6 py-3 text-slate-500">
                  {landlord.properties}
                </td>
                <td className="px-6 py-3">
                  <span
                    className={`rounded-full px-2.5 py-1 text-xs font-medium ${STATUS_STYLES[landlord.status]}`}
                  >
                    {landlord.status}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
