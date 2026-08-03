"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { AlertCircle, ArrowRight, Plus, Users, Building2, Wallet, Percent } from "lucide-react";
import { getAdminDashboard } from "@/lib/api/dashboard";
import { ApiError } from "@/lib/api/client";
import type { AdminDashboard } from "@/lib/api/types";
import { formatMoney } from "@/lib/money";

const STAT_LINKS: Record<string, string> = {
  "Platform Revenue": "/admin/payments",
  "Active Users": "/admin/tenants",
  "Managed Properties": "/admin/properties",
  "Payment Success Rate": "/admin/payments",
};

export default function AdminOverviewPage() {
  const [data, setData] = useState<AdminDashboard | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = () => {
    setIsLoading(true);
    setError(null);
    getAdminDashboard()
      .then(setData)
      .catch((err) => setError(err instanceof ApiError ? err.message : "Failed to load dashboard."))
      .finally(() => setIsLoading(false));
  };

  useEffect(() => {
    load();
  }, []);

  const stats = data
    ? [
        { label: "Platform Revenue", value: `${formatMoney(data.totalPlatformRevenue)} RWF` },
        { label: "Active Users", value: String(data.activeUsers) },
        { label: "Managed Properties", value: String(data.properties.total) },
        { label: "Payment Success Rate", value: `${data.payments.successRatePercent}%` },
      ]
    : [];

  if (isLoading) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center">
        <p className="text-sm text-slate-400">Loading dashboard...</p>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="flex flex-col items-center gap-3 rounded-xl border border-red-200 bg-red-50 p-8 text-center">
        <AlertCircle className="h-6 w-6 text-red-600" />
        <p className="text-sm font-medium text-red-700">{error ?? "Failed to load dashboard."}</p>
        <button type="button" onClick={load} className="rounded-lg border border-red-300 px-4 py-2 text-sm font-semibold text-red-700 hover:bg-red-100">Retry</button>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-8">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-navy">Overview</h1>
          <p className="mt-1 text-sm text-slate-500">A quick look at what's happening across the platform.</p>
        </div>
        <Link href="/admin/landlords" className="inline-flex items-center gap-2 rounded-lg bg-gold px-5 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-gold/90">
          <Plus className="h-4 w-4" />
          Register Landlord
        </Link>
      </div>

      <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map(({ label, value }) => (
          <Link key={label} href={STAT_LINKS[label] ?? "/admin"} className="group rounded-xl border border-slate-200 bg-white p-5 shadow-sm transition-all hover:-translate-y-0.5 hover:border-gold/40 hover:shadow-md">
            <div className="flex items-center justify-between">
              <p className="text-sm text-slate-500">{label}</p>
              <ArrowRight className="h-3.5 w-3.5 text-slate-300 transition-colors group-hover:text-gold" />
            </div>
            <p className="mt-2 text-2xl font-bold text-navy">{value}</p>
          </Link>
        ))}
      </div>

      <div className="grid gap-5 lg:grid-cols-3">
        <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
          <p className="text-sm text-slate-500">New Properties This Month</p>
          <p className="mt-2 text-3xl font-bold text-navy">{data.properties.newThisMonth}</p>
        </div>
        <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
          <p className="text-sm text-slate-500">Active Managers (IAM)</p>
          <p className="mt-2 text-3xl font-bold text-navy">{data.iam.activeManagers}</p>
        </div>
        <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
          <p className="text-sm text-slate-500">Pending Invites / Suspensions</p>
          <p className="mt-2 text-3xl font-bold text-navy">{data.iam.pendingInvites} / {data.iam.pendingSuspensionRequests}</p>
        </div>
      </div>
    </div>
  );
}
