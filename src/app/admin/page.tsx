"use client";

import Link from "next/link";
import { ArrowRight, Eye, Plus } from "lucide-react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Legend,
  Line,
  LineChart,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { ADMIN_STATS, LANDLORDS, PAYMENTS, PROPERTIES } from "@/lib/mock-admin-data";
import {
  CHART_COLORS,
  CHART_GRID_COLOR,
  CHART_TEXT_COLOR,
} from "@/lib/chart-colors";

const STATUS_STYLES: Record<string, string> = {
  Active: "bg-emerald-50 text-emerald-700",
  Pending: "bg-amber-50 text-amber-700",
  Suspended: "bg-red-50 text-red-700",
};

const STAT_LINKS: Record<string, string> = {
  "Registered Landlords": "/admin/landlords",
  "Managed Properties": "/admin/properties",
  "Active Tenants": "/admin/tenants",
  "Revenue this month": "/admin/payments",
};

const axisTick = { fontSize: 12, fill: CHART_TEXT_COLOR };

function propertiesByType() {
  const counts = new Map<string, number>();
  PROPERTIES.forEach((p) => counts.set(p.type, (counts.get(p.type) ?? 0) + 1));
  return Array.from(counts.entries()).map(([type, count]) => ({ type, count }));
}

function occupancyData() {
  return [
    {
      name: "Occupied",
      value: PROPERTIES.filter((p) => p.availability === "Occupied").length,
    },
    {
      name: "Available",
      value: PROPERTIES.filter((p) => p.availability === "Available").length,
    },
  ];
}

function approvalData() {
  return (["Approved", "Pending", "Rejected"] as const).map((status) => ({
    name: status,
    value: PROPERTIES.filter((p) => p.approval === status).length,
  }));
}

function revenueByMonth() {
  const totals = new Map<string, number>();
  PAYMENTS.filter((p) => p.status === "Paid").forEach((p) => {
    const month = (p.paidDate ?? p.dueDate).slice(0, 7);
    totals.set(month, (totals.get(month) ?? 0) + p.amount);
  });
  return Array.from(totals.entries())
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([month, amount]) => ({ month, amount }));
}

function landlordsByProperties() {
  return [...LANDLORDS]
    .sort((a, b) => b.properties - a.properties)
    .slice(0, 5)
    .map((l) => ({ name: l.name.split(" ")[0], properties: l.properties }));
}

export default function AdminOverviewPage() {
  const recentLandlords = LANDLORDS.slice(0, 3);

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

      <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
        {ADMIN_STATS.map(({ label, value }) => (
          <Link
            key={label}
            href={STAT_LINKS[label] ?? "/admin"}
            className="group rounded-xl border border-slate-200 bg-white p-5 shadow-sm transition-all hover:-translate-y-0.5 hover:border-gold/40 hover:shadow-md"
          >
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
          <p className="font-semibold text-navy">Properties by Type</p>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={propertiesByType()}>
              <CartesianGrid strokeDasharray="3 3" stroke={CHART_GRID_COLOR} />
              <XAxis dataKey="type" tick={axisTick} />
              <YAxis allowDecimals={false} tick={axisTick} />
              <Tooltip />
              <Bar dataKey="count" fill={CHART_COLORS[0]} radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
          <p className="font-semibold text-navy">Occupancy</p>
          <ResponsiveContainer width="100%" height={220}>
            <PieChart>
              <Pie
                data={occupancyData()}
                dataKey="value"
                nameKey="name"
                innerRadius={50}
                outerRadius={80}
                paddingAngle={2}
              >
                {occupancyData().map((entry, i) => (
                  <Cell key={entry.name} fill={CHART_COLORS[i % CHART_COLORS.length]} />
                ))}
              </Pie>
              <Tooltip />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        </div>

        <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
          <p className="font-semibold text-navy">Approval Status</p>
          <ResponsiveContainer width="100%" height={220}>
            <PieChart>
              <Pie
                data={approvalData()}
                dataKey="value"
                nameKey="name"
                innerRadius={50}
                outerRadius={80}
                paddingAngle={2}
              >
                {approvalData().map((entry, i) => (
                  <Cell key={entry.name} fill={CHART_COLORS[i % CHART_COLORS.length]} />
                ))}
              </Pie>
              <Tooltip />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="grid gap-5 lg:grid-cols-2">
        <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
          <p className="font-semibold text-navy">Revenue Trend</p>
          <ResponsiveContainer width="100%" height={240}>
            <LineChart data={revenueByMonth()}>
              <CartesianGrid strokeDasharray="3 3" stroke={CHART_GRID_COLOR} />
              <XAxis dataKey="month" tick={axisTick} />
              <YAxis tick={axisTick} />
              <Tooltip formatter={(value) => `${Number(value).toLocaleString()} RWF`} />
              <Line
                type="monotone"
                dataKey="amount"
                stroke={CHART_COLORS[0]}
                strokeWidth={2}
                dot={{ r: 4 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>

        <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
          <p className="font-semibold text-navy">Landlords by Properties</p>
          <ResponsiveContainer width="100%" height={240}>
            <BarChart data={landlordsByProperties()} layout="vertical" margin={{ left: 8 }}>
              <CartesianGrid strokeDasharray="3 3" stroke={CHART_GRID_COLOR} horizontal={false} />
              <XAxis type="number" allowDecimals={false} tick={axisTick} />
              <YAxis type="category" dataKey="name" width={80} tick={axisTick} />
              <Tooltip />
              <Bar dataKey="properties" fill={CHART_COLORS[0]} radius={[0, 6, 6, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
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
              <th className="px-6 py-3 text-right font-medium">Actions</th>
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
                <td className="px-6 py-3 text-right">
                  <Link
                    href="/admin/landlords"
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
    </div>
  );
}
