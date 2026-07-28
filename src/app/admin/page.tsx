"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { AlertCircle, Building2, Percent, Plus, Users, Wallet } from "lucide-react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Legend,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { getAdminDashboard } from "@/lib/api/dashboard";
import { ApiError } from "@/lib/api/client";
import type { AdminDashboard } from "@/lib/api/types";
import {
  CHART_COLORS,
  CHART_GRID_COLOR,
  CHART_TEXT_COLOR,
} from "@/lib/chart-colors";
import { StatCard, type StatAccent } from "@/components/dashboard/StatCard";
import { formatMoney } from "@/lib/money";

const STAT_META: Record<
  string,
  { href: string; icon: typeof Users; accent: StatAccent }
> = {
  "Platform Revenue": { href: "/admin/payments", icon: Wallet, accent: "teal" },
  "Active Users": { href: "/admin/tenants", icon: Users, accent: "blue" },
  "Managed Properties": { href: "/admin/properties", icon: Building2, accent: "emerald" },
  "Payment Success Rate": { href: "/admin/payments", icon: Percent, accent: "amber" },
};

const axisTick = { fontSize: 12, fill: CHART_TEXT_COLOR };

const ROLE_LABELS: Record<string, string> = {
  tenant: "Tenant",
  owner: "Owner",
  agent: "Agent",
  admin: "Admin",
  superadmin: "Superadmin",
  house_manager: "House Manager",
};

export default function AdminOverviewPage() {
  const [data, setData] = useState<AdminDashboard | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setLoading] = useState(true);

  const load = () => {
    setLoading(true);
    setError(null);
    getAdminDashboard()
      .then(setData)
      .catch((err) =>
        setError(err instanceof ApiError ? err.message : "Failed to load dashboard."),
      )
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    load();
  }, []);

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
        <p className="text-sm font-medium text-red-700">
          {error ?? "Failed to load dashboard."}
        </p>
        <button
          type="button"
          onClick={load}
          className="rounded-lg border border-red-300 px-4 py-2 text-sm font-semibold text-red-700 hover:bg-red-100"
        >
          Retry
        </button>
      </div>
    );
  }

  const stats = [
    {
      label: "Platform Revenue",
      value: `${formatMoney(data.totalPlatformRevenue)} RWF`,
    },
    { label: "Active Users", value: data.activeUsers },
    { label: "Managed Properties", value: data.properties.total },
    { label: "Payment Success Rate", value: `${data.payments.successRatePercent}%` },
  ];

  const usersByRoleData = Object.entries(data.usersByRole).map(([role, count]) => ({
    role: ROLE_LABELS[role] ?? role,
    count,
  }));

  const paymentsData = [
    { name: "Successful", value: data.payments.successCount },
    { name: "Failed", value: data.payments.failedCount },
  ];

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
          className="inline-flex items-center gap-2 rounded-lg bg-gold px-5 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-gold/90"
        >
          <Plus className="h-4 w-4" />
          Register Landlord
        </Link>
      </div>

      <div className="grid grid-cols-2 gap-5 lg:grid-cols-4">
        {stats.map(({ label, value }) => {
          const meta = STAT_META[label];
          return (
            <StatCard
              key={label}
              label={label}
              value={value}
              href={meta?.href ?? "/admin"}
              icon={meta?.icon ?? Users}
              accent={meta?.accent ?? "blue"}
            />
          );
        })}
      </div>

      <div className="grid gap-5 lg:grid-cols-3">
        <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
          <p className="text-sm text-slate-500">New Properties This Month</p>
          <p className="mt-2 text-3xl font-bold text-navy">
            {data.properties.newThisMonth}
          </p>
        </div>
        <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
          <p className="text-sm text-slate-500">Active Managers (IAM)</p>
          <p className="mt-2 text-3xl font-bold text-navy">
            {data.iam.activeManagers}
          </p>
        </div>
        <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
          <p className="text-sm text-slate-500">Pending Invites / Suspensions</p>
          <p className="mt-2 text-3xl font-bold text-navy">
            {data.iam.pendingInvites} / {data.iam.pendingSuspensionRequests}
          </p>
        </div>
      </div>

      <div className="grid gap-5 lg:grid-cols-2">
        <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
          <p className="font-semibold text-navy">Users by Role</p>
          <ResponsiveContainer width="100%" height={260}>
            <BarChart data={usersByRoleData}>
              <CartesianGrid strokeDasharray="3 3" stroke={CHART_GRID_COLOR} />
              <XAxis dataKey="role" tick={axisTick} interval={0} angle={-20} textAnchor="end" height={60} />
              <YAxis allowDecimals={false} tick={axisTick} />
              <Tooltip />
              <Bar dataKey="count" fill={CHART_COLORS[0]} radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
          <p className="font-semibold text-navy">Payments</p>
          <ResponsiveContainer width="100%" height={260}>
            <PieChart>
              <Pie
                data={paymentsData}
                dataKey="value"
                nameKey="name"
                innerRadius={50}
                outerRadius={80}
                paddingAngle={2}
              >
                {paymentsData.map((entry, i) => (
                  <Cell key={entry.name} fill={CHART_COLORS[i % CHART_COLORS.length]} />
                ))}
              </Pie>
              <Tooltip />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}
