"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  AlertCircle,
  ArrowRight,
  Building2,
  Eye,
  Percent,
  Plus,
  Users,
  Wallet,
} from "lucide-react";
import { getAdminDashboard } from "@/lib/api/dashboard";
import { countPropertiesForOwner, listUsers } from "@/lib/api/admin";
import { ApiError } from "@/lib/api/client";
import type { AdminDashboard, User } from "@/lib/api/types";
import { StatCard } from "@/components/dashboard/StatCard";
import { Table, TBody, Td, Th, THead, Tr } from "@/components/dashboard/Table";
import { formatMoney } from "@/lib/money";
import { useLanguage } from "@/lib/i18n/LanguageContext";
import type { Translations } from "@/lib/i18n/translations";

const STATUS_STYLES: Record<string, string> = {
  Active: "bg-emerald-50 text-emerald-700",
  Pending: "bg-amber-50 text-amber-700",
  Suspended: "bg-red-50 text-red-700",
};

const STATUS_KEY: Record<string, keyof Translations["dashboard"]["status"]> = {
  Active: "active",
  Pending: "pending",
  Suspended: "suspended",
};

function statusFor(user: User): "Active" | "Pending" | "Suspended" {
  if (!user.isApproved) return "Pending";
  if (!user.isActive) return "Suspended";
  return "Active";
}

export default function AdminOverviewPage() {
  const { t } = useLanguage();
  const c = t.dashboard.admin.overview;

  const [data, setData] = useState<AdminDashboard | null>(null);
  const [recentLandlords, setRecentLandlords] = useState<User[]>([]);
  const [propertyCounts, setPropertyCounts] = useState<Record<string, number>>({});
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = () => {
    setIsLoading(true);
    setError(null);
    Promise.all([getAdminDashboard(), listUsers({ role: "owner", limit: 3 })])
      .then(async ([dashboard, landlordsRes]) => {
        setData(dashboard);
        setRecentLandlords(landlordsRes.data);
        const counts = await Promise.all(
          landlordsRes.data.map((u) => countPropertiesForOwner(u.id)),
        );
        setPropertyCounts(
          Object.fromEntries(landlordsRes.data.map((u, i) => [u.id, counts[i]])),
        );
      })
      .catch((err) =>
        setError(err instanceof ApiError ? err.message : "Failed to load dashboard."),
      )
      .finally(() => setIsLoading(false));
  };

  useEffect(() => {
    load();
  }, []);

  const stats = data
    ? [
        {
          label: "Platform Revenue",
          value: `${formatMoney(data.totalPlatformRevenue)} RWF`,
          href: "/admin/payments",
          icon: Wallet,
          accent: "teal" as const,
        },
        {
          label: "Active Users",
          value: String(data.activeUsers),
          href: "/admin/tenants",
          icon: Users,
          accent: "blue" as const,
        },
        {
          label: c.statLabels.managedProperties,
          value: String(data.properties.total),
          href: "/admin/properties",
          icon: Building2,
          accent: "emerald" as const,
        },
        {
          label: "Payment Success Rate",
          value: `${data.payments.successRatePercent}%`,
          href: "/admin/payments",
          icon: Percent,
          accent: "amber" as const,
        },
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

  return (
    <div className="flex flex-col gap-8">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-navy">{c.title}</h1>
          <p className="mt-1 text-sm text-slate-500">{c.subtitle}</p>
        </div>
        <Link
          href="/admin/landlords"
          className="inline-flex items-center gap-2 rounded-lg bg-gold px-5 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-gold/90"
        >
          <Plus className="h-4 w-4" />
          {c.registerLandlord}
        </Link>
      </div>

      <div className="grid grid-cols-2 gap-5 lg:grid-cols-4">
        {stats.map((stat) => (
          <StatCard
            key={stat.label}
            label={stat.label}
            value={stat.value}
            href={stat.href}
            icon={stat.icon}
            accent={stat.accent}
          />
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
          <p className="mt-2 text-3xl font-bold text-navy">
            {data.iam.pendingInvites} / {data.iam.pendingSuspensionRequests}
          </p>
        </div>
      </div>

      <div className="rounded-xl border border-slate-200 bg-white shadow-sm">
        <div className="flex items-center justify-between border-b border-slate-100 px-6 py-4">
          <h2 className="font-semibold text-navy">{c.recentLandlords}</h2>
          <Link
            href="/admin/landlords"
            className="inline-flex items-center gap-1 text-sm font-medium text-gold hover:underline"
          >
            {t.dashboard.actions.viewAll}
            <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        </div>

        <Table variant="plain">
          <THead>
            <Tr>
              <Th className="px-6 py-3">{t.dashboard.table.name}</Th>
              <Th className="px-6 py-3">{t.dashboard.table.email}</Th>
              <Th className="px-6 py-3">{t.dashboard.table.properties}</Th>
              <Th className="px-6 py-3">{t.dashboard.table.status}</Th>
              <Th className="px-6 py-3 text-right">{t.dashboard.table.actions}</Th>
            </Tr>
          </THead>
          <TBody>
            {recentLandlords.map((landlord) => {
              const status = statusFor(landlord);
              return (
                <Tr key={landlord.id}>
                  <Td className="px-6 py-3 font-medium text-navy">
                    {landlord.firstName} {landlord.lastName}
                  </Td>
                  <Td className="px-6 py-3 text-slate-500">{landlord.email}</Td>
                  <Td className="px-6 py-3 text-slate-500">
                    {propertyCounts[landlord.id] ?? 0}
                  </Td>
                  <Td className="px-6 py-3">
                    <span
                      className={`rounded-full px-2.5 py-1 text-xs font-medium ${STATUS_STYLES[status]}`}
                    >
                      {t.dashboard.status[STATUS_KEY[status]]}
                    </span>
                  </Td>
                  <Td className="px-6 py-3 text-right">
                    <Link
                      href="/admin/landlords"
                      className="inline-flex items-center gap-1.5 rounded-lg border border-slate-300 px-2.5 py-1 text-xs font-medium text-slate-600 hover:bg-slate-50"
                    >
                      <Eye className="h-3.5 w-3.5" />
                      {t.dashboard.actions.view}
                    </Link>
                  </Td>
                </Tr>
              );
            })}
          </TBody>
        </Table>
      </div>
    </div>
  );
}
