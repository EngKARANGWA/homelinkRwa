"use client";

import { useState } from "react";
import Link from "next/link";
import {
  ArrowRight,
  Bell,
  Building2,
  CheckCircle2,
  Eye,
  FileText,
  Wallet,
  Wrench,
} from "lucide-react";
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
import {
  LEASES,
  MAINTENANCE_REQUESTS,
  PAYMENTS,
  PROPERTIES,
  TODAY,
} from "@/lib/mock-admin-data";
import { useLandlord } from "@/components/landlord/LandlordContext";
import {
  CHART_COLORS,
  CHART_GRID_COLOR,
  CHART_TEXT_COLOR,
} from "@/lib/chart-colors";
import { StatCard, type StatAccent } from "@/components/dashboard/StatCard";
import { AlertBanner } from "@/components/dashboard/AlertBanner";
import { Card } from "@/components/dashboard/Card";
import { MiniStatGroup } from "@/components/dashboard/MiniStatGroup";
import { FeaturedStatCard } from "@/components/dashboard/FeaturedStatCard";

const AVAILABILITY_STYLES: Record<string, string> = {
  Available: "bg-emerald-50 text-emerald-700",
  Occupied: "bg-slate-100 text-slate-600",
};

const STAT_META: Record<
  string,
  { href: string; icon: typeof Building2; accent: StatAccent; subtitle: string }
> = {
  "My Properties": {
    href: "/landlord/properties",
    icon: Building2,
    accent: "blue",
    subtitle: "Registered by you",
  },
  "Active Leases": {
    href: "/landlord/leases",
    icon: FileText,
    accent: "emerald",
    subtitle: "Currently active",
  },
  "Pending Maintenance": {
    href: "/landlord/maintenance",
    icon: Wrench,
    accent: "amber",
    subtitle: "Awaiting action",
  },
  "Revenue Collected": {
    href: "/landlord/payments",
    icon: Wallet,
    accent: "teal",
    subtitle: "This month",
  },
};

const axisTick = { fontSize: 12, fill: CHART_TEXT_COLOR };

export default function LandlordOverviewPage() {
  const { landlordName } = useLandlord();
  const [reminderNotice, setReminderNotice] = useState<string | null>(null);

  const myProperties = PROPERTIES.filter((p) => p.owner === landlordName);
  const myPropertyNames = myProperties.map((p) => p.name);
  const myLeases = LEASES.filter((l) => l.owner === landlordName);
  const myMaintenance = MAINTENANCE_REQUESTS.filter((m) =>
    myPropertyNames.includes(m.property),
  );
  const myPayments = PAYMENTS.filter((p) => p.owner === landlordName);

  const currentMonth = TODAY.slice(0, 7);
  const paymentsDueThisMonth = myPayments.filter(
    (p) => p.dueDate.slice(0, 7) === currentMonth,
  );
  const totalDueThisMonth = paymentsDueThisMonth.reduce(
    (sum, p) => sum + p.amount,
    0,
  );
  const amountCollectedThisMonth = paymentsDueThisMonth
    .filter((p) => p.status === "Paid")
    .reduce((sum, p) => sum + p.amount, 0);
  const balanceDue = totalDueThisMonth - amountCollectedThisMonth;
  const outstandingPayments = paymentsDueThisMonth.filter(
    (p) => p.status !== "Paid",
  );
  const outstandingTenants = new Set(
    outstandingPayments.map((p) => p.tenant),
  ).size;

  const featuredProperty =
    myProperties.find((p) => p.totalUnits && p.occupiedUnits != null) ??
    myProperties[0];
  const occupancyPercent =
    featuredProperty?.totalUnits && featuredProperty.occupiedUnits != null
      ? Math.round(
          (featuredProperty.occupiedUnits / featuredProperty.totalUnits) * 100,
        )
      : null;

  const handleSendReminder = () => {
    setReminderNotice(
      outstandingTenants > 0
        ? `Reminder sent to ${outstandingTenants} tenant${outstandingTenants === 1 ? "" : "s"} with an outstanding balance.`
        : "No tenants currently have an outstanding balance.",
    );
  };

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

  const occupancyData = [
    {
      name: "Available",
      value: myProperties.filter((p) => p.availability === "Available").length,
    },
    {
      name: "Occupied",
      value: myProperties.filter((p) => p.availability === "Occupied").length,
    },
  ];

  const paymentStatusData = (
    ["Paid", "Late", "Pending", "Pending Approval"] as const
  ).map((status) => ({
    name: status,
    value: myPayments.filter((p) => p.status === status).length,
  }));

  const rentByProperty = myProperties.map((p) => ({
    name: p.name.length > 16 ? `${p.name.slice(0, 16)}…` : p.name,
    rent: p.rent,
  }));

  return (
    <div className="flex flex-col gap-8">
      <div>
        <h1 className="text-2xl font-bold text-navy">Overview</h1>
        <p className="mt-1 text-sm text-slate-500">
          A quick look at your properties, {landlordName}.
        </p>
      </div>

      <div className="grid gap-5 lg:grid-cols-3">
        <Card title="This Month" className="lg:col-span-2">
          <MiniStatGroup
            stats={[
              {
                label: "Total Due",
                value: totalDueThisMonth.toLocaleString(),
                unit: "RWF",
              },
              {
                label: "Collected",
                value: amountCollectedThisMonth.toLocaleString(),
                unit: "RWF",
                accent: "emerald",
              },
              {
                label: "Balance Due",
                value: balanceDue.toLocaleString(),
                unit: "RWF",
                accent: "red",
              },
            ]}
          />
        </Card>

        {featuredProperty && (
          <FeaturedStatCard
            title={featuredProperty.name}
            value={occupancyPercent !== null ? `${occupancyPercent}%` : featuredProperty.availability}
            label={occupancyPercent !== null ? "Occupancy" : "Status"}
            subtext={
              occupancyPercent !== null
                ? `${featuredProperty.occupiedUnits}/${featuredProperty.totalUnits} units occupied`
                : undefined
            }
            size={occupancyPercent !== null ? "lg" : "md"}
          />
        )}
      </div>

      <AlertBanner
        isAlert={balanceDue > 0}
        stats={[
          { label: "Balance Due", value: `${balanceDue.toLocaleString()} RWF` },
          { label: "Tenants Outstanding", value: outstandingTenants },
        ]}
      >
        <button
          type="button"
          onClick={handleSendReminder}
          className="inline-flex items-center gap-2 rounded-lg bg-gold px-5 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-gold/90"
        >
          <Bell className="h-4 w-4" />
          Send Reminder
        </button>
        <Link
          href="/landlord/reports"
          className="inline-flex items-center gap-2 rounded-lg border border-slate-300 bg-white px-5 py-2.5 text-sm font-semibold text-slate-600 transition-colors hover:bg-slate-50"
        >
          View Report
        </Link>
      </AlertBanner>

      {reminderNotice && (
        <div className="flex items-center gap-2 rounded-lg border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm font-medium text-emerald-700">
          <CheckCircle2 className="h-4 w-4" />
          {reminderNotice}
        </div>
      )}

      <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map(({ label, value }) => {
          const meta = STAT_META[label];
          return (
            <StatCard
              key={label}
              label={label}
              value={value}
              subtitle={meta?.subtitle}
              href={meta?.href ?? "/landlord"}
              icon={meta?.icon ?? Building2}
              accent={meta?.accent ?? "blue"}
            />
          );
        })}
      </div>

      {myProperties.length > 0 && (
        <>
          <div className="grid gap-5 lg:grid-cols-2">
            <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
              <p className="font-semibold text-navy">Occupancy</p>
              <ResponsiveContainer width="100%" height={220}>
                <PieChart>
                  <Pie
                    data={occupancyData}
                    dataKey="value"
                    nameKey="name"
                    innerRadius={50}
                    outerRadius={80}
                    paddingAngle={2}
                  >
                    {occupancyData.map((entry, i) => (
                      <Cell
                        key={entry.name}
                        fill={CHART_COLORS[i % CHART_COLORS.length]}
                      />
                    ))}
                  </Pie>
                  <Tooltip />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </div>

            <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
              <p className="font-semibold text-navy">Payment Status</p>
              <ResponsiveContainer width="100%" height={220}>
                <PieChart>
                  <Pie
                    data={paymentStatusData}
                    dataKey="value"
                    nameKey="name"
                    innerRadius={50}
                    outerRadius={80}
                    paddingAngle={2}
                  >
                    {paymentStatusData.map((entry, i) => (
                      <Cell
                        key={entry.name}
                        fill={CHART_COLORS[i % CHART_COLORS.length]}
                      />
                    ))}
                  </Pie>
                  <Tooltip />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
            <p className="font-semibold text-navy">Rent by Property</p>
            <ResponsiveContainer width="100%" height={240}>
              <BarChart
                data={rentByProperty}
                layout="vertical"
                margin={{ left: 8 }}
              >
                <CartesianGrid
                  strokeDasharray="3 3"
                  stroke={CHART_GRID_COLOR}
                  horizontal={false}
                />
                <XAxis type="number" tick={axisTick} />
                <YAxis type="category" dataKey="name" width={140} tick={axisTick} />
                <Tooltip formatter={(value) => `${Number(value).toLocaleString()} RWF`} />
                <Bar dataKey="rent" fill={CHART_COLORS[0]} radius={[0, 6, 6, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </>
      )}

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

        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="text-xs uppercase tracking-wide text-slate-400">
                <th className="px-4 py-3 font-medium sm:px-6">Property</th>
                <th className="hidden px-6 py-3 font-medium md:table-cell">Type</th>
                <th className="hidden px-6 py-3 font-medium sm:table-cell">Rent (RWF)</th>
                <th className="px-4 py-3 font-medium sm:px-6">Availability</th>
                <th className="px-4 py-3 text-right font-medium sm:px-6">Actions</th>
              </tr>
            </thead>
            <tbody>
              {myProperties.slice(0, 3).map((property) => (
                <tr key={property.id} className="border-t border-slate-100">
                  <td className="max-w-[9rem] px-4 py-3 sm:max-w-none sm:px-6">
                    <p className="truncate font-medium text-navy sm:overflow-visible sm:whitespace-normal">
                      {property.name}
                    </p>
                    <p className="truncate text-xs text-slate-400 md:hidden">
                      {property.type}
                    </p>
                  </td>
                  <td className="hidden px-6 py-3 text-slate-500 md:table-cell">{property.type}</td>
                  <td className="hidden px-6 py-3 text-slate-500 sm:table-cell">
                    {property.rent.toLocaleString()}
                  </td>
                  <td className="px-4 py-3 sm:px-6">
                    <span
                      className={`rounded-full px-2.5 py-1 text-xs font-medium ${AVAILABILITY_STYLES[property.availability]}`}
                    >
                      {property.availability}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-right sm:px-6">
                    <Link
                      href={`/landlord/properties/${property.id}`}
                      className="inline-flex items-center gap-1.5 rounded-lg border border-slate-300 px-2.5 py-1 text-xs font-medium text-slate-600 hover:bg-slate-50"
                    >
                      <Eye className="h-3.5 w-3.5" />
                      View
                    </Link>
                  </td>
                </tr>
              ))}
              {myProperties.length === 0 && (
                <tr>
                  <td colSpan={5} className="px-6 py-8 text-center text-slate-400">
                    No properties registered yet.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
