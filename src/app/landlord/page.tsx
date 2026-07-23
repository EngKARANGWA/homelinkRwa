"use client";

import { useState } from "react";
import { AppLink as Link } from "@/components/shared/AppLink";
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
  type Payment,
} from "@/lib/mock-admin-data";
import { useLandlord } from "@/components/landlord/LandlordContext";
import { getUnitsForProperty } from "@/lib/units";
import {
  CHART_COLORS,
  CHART_GRID_COLOR,
  CHART_TEXT_COLOR,
} from "@/lib/chart-colors";
import { StatCard, type StatAccent } from "@/components/dashboard/StatCard";
import { AlertBanner } from "@/components/dashboard/AlertBanner";
import { EmptyRow, Table, TBody, Td, Th, THead, Tr } from "@/components/dashboard/Table";

const AVAILABILITY_STYLES: Record<string, string> = {
  Available: "bg-emerald-50 text-emerald-700",
  Occupied: "bg-slate-100 text-slate-600",
};

const PAYMENT_STATUS_STYLES: Record<Payment["status"], string> = {
  Paid: "bg-emerald-50 text-emerald-700",
  Late: "bg-red-50 text-red-700",
  Pending: "bg-amber-50 text-amber-700",
  "Pending Approval": "bg-sky-50 text-sky-700",
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

const MONTH_LABELS = [
  "Jan", "Feb", "Mar", "Apr", "May", "Jun",
  "Jul", "Aug", "Sep", "Oct", "Nov", "Dec",
];

function formatMonth(month: string): string {
  return MONTH_LABELS[Number(month.slice(5, 7)) - 1] ?? month;
}

export default function LandlordOverviewPage() {
  const { landlordName, unitOverrides } = useLandlord();
  const [reminderNotice, setReminderNotice] = useState<string | null>(null);
  const [propertyTab, setPropertyTab] = useState<"All" | Payment["status"] | "Arrears">("All");

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

  const paymentStatusFor = (propertyName: string): Payment["status"] | null => {
    const thisMonth = paymentsDueThisMonth.find((p) => p.property === propertyName);
    if (thisMonth) return thisMonth.status;
    const latest = myPayments
      .filter((p) => p.property === propertyName)
      .sort((a, b) => b.dueDate.localeCompare(a.dueDate))[0];
    return latest?.status ?? null;
  };

  const propertyHasArrears = (property: (typeof myProperties)[number]): boolean =>
    getUnitsForProperty(property, unitOverrides).some(
      (u) => u.occupancyStatus === "Occupied" && u.currentPaymentStatus === "Overdue",
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

  const PROPERTY_TABS: { key: "All" | Payment["status"] | "Arrears"; label: string }[] = [
    { key: "All", label: "All" },
    { key: "Paid", label: "Paid" },
    { key: "Late", label: "Late" },
    { key: "Pending", label: "Pending" },
    { key: "Pending Approval", label: "Pending Approval" },
    { key: "Arrears", label: "Arrears" },
  ];
  const propertyTabCounts: Record<(typeof PROPERTY_TABS)[number]["key"], number> = {
    All: myProperties.length,
    Paid: myProperties.filter((p) => paymentStatusFor(p.name) === "Paid").length,
    Late: myProperties.filter((p) => paymentStatusFor(p.name) === "Late").length,
    Pending: myProperties.filter((p) => paymentStatusFor(p.name) === "Pending").length,
    "Pending Approval": myProperties.filter(
      (p) => paymentStatusFor(p.name) === "Pending Approval",
    ).length,
    Arrears: myProperties.filter(propertyHasArrears).length,
  };
  const visibleProperties = myProperties
    .filter((p) => {
      if (propertyTab === "All") return true;
      if (propertyTab === "Arrears") return propertyHasArrears(p);
      return paymentStatusFor(p.name) === propertyTab;
    })
    .slice(0, 3);

  const revenueByMonth = (() => {
    const currentYear = TODAY.slice(0, 4);
    const totals = new Map<string, number>();
    myPayments
      .filter((p) => p.status === "Paid")
      .forEach((p) => {
        const month = (p.paidDate ?? p.dueDate).slice(0, 7);
        totals.set(month, (totals.get(month) ?? 0) + p.amount);
      });
    return Array.from({ length: 12 }, (_, i) => {
      const month = `${currentYear}-${String(i + 1).padStart(2, "0")}`;
      return { month, amount: totals.get(month) ?? 0 };
    });
  })();

  return (
    <div className="flex flex-col gap-8">
      <div>
        <h1 className="text-2xl font-bold text-navy">Overview</h1>
        <p className="mt-1 text-sm text-slate-500">
          A quick look at your properties, {landlordName}.
        </p>
      </div>

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

      <div className="grid gap-5 lg:grid-cols-2">
        <AlertBanner
          isAlert={balanceDue > 0}
          stats={[
            { label: "Balance Due", value: `${balanceDue.toLocaleString()} RWF` },
            { label: "Tenants Outstanding", value: outstandingTenants },
          ]}
          message={
            balanceDue > 0
              ? "Some tenants haven't paid this month's rent yet. Send a reminder or check the full report."
              : "All tenants are paid up this month."
          }
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

        {myProperties.length > 0 && (
          <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
            <p className="font-semibold text-navy">Revenue by Month</p>
            <ResponsiveContainer width="100%" height={240}>
              <BarChart data={revenueByMonth}>
                <CartesianGrid strokeDasharray="3 3" stroke={CHART_GRID_COLOR} />
                <XAxis dataKey="month" tickFormatter={formatMonth} tick={axisTick} />
                <YAxis tick={axisTick} />
                <Tooltip
                  labelFormatter={(label) => formatMonth(String(label))}
                  formatter={(value) => `${Number(value).toLocaleString()} RWF`}
                />
                <Bar dataKey="amount" fill={CHART_COLORS[0]} radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        )}
      </div>

      {reminderNotice && (
        <div className="flex items-center gap-2 rounded-lg border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm font-medium text-emerald-700">
          <CheckCircle2 className="h-4 w-4" />
          {reminderNotice}
        </div>
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

        <div className="flex items-center gap-6 overflow-x-auto border-b border-slate-100 px-6">
          {PROPERTY_TABS.map((tab) => {
            const isActive = propertyTab === tab.key;
            return (
              <button
                key={tab.key}
                type="button"
                onClick={() => setPropertyTab(tab.key)}
                className={`flex shrink-0 items-center gap-2 border-b-2 py-3 text-sm font-medium transition-colors ${
                  isActive
                    ? "border-gold text-navy"
                    : "border-transparent text-slate-500 hover:text-navy"
                }`}
              >
                {tab.label}
                <span
                  className={`rounded-full px-2 py-0.5 text-xs font-semibold ${
                    isActive ? "bg-gold/10 text-gold" : "bg-slate-100 text-slate-500"
                  }`}
                >
                  {propertyTabCounts[tab.key]}
                </span>
              </button>
            );
          })}
        </div>

        <Table variant="plain">
          <THead>
            <Tr>
              <Th className="px-4 py-3 sm:px-6">Property</Th>
              <Th className="hidden px-6 py-3 md:table-cell">Type</Th>
              <Th className="hidden px-6 py-3 sm:table-cell">Rent (RWF)</Th>
              <Th className="px-4 py-3 sm:px-6">Availability</Th>
              <Th className="hidden px-6 py-3 lg:table-cell">Payment Status</Th>
              <Th className="px-4 py-3 text-right sm:px-6">Actions</Th>
            </Tr>
          </THead>
          <TBody>
            {visibleProperties.map((property) => (
              <Tr key={property.id}>
                <Td className="max-w-[9rem] px-4 py-3 sm:max-w-none sm:px-6">
                  <p className="truncate font-medium text-navy sm:overflow-visible sm:whitespace-normal">
                    {property.name}
                  </p>
                  <p className="truncate text-xs text-slate-400 md:hidden">
                    {property.type}
                  </p>
                </Td>
                <Td className="hidden px-6 py-3 text-slate-500 md:table-cell">{property.type}</Td>
                <Td className="hidden px-6 py-3 text-slate-500 sm:table-cell">
                  {property.rent.toLocaleString()}
                </Td>
                <Td className="px-4 py-3 sm:px-6">
                  <span
                    className={`rounded-full px-2.5 py-1 text-xs font-medium ${AVAILABILITY_STYLES[property.availability]}`}
                  >
                    {property.availability}
                  </span>
                </Td>
                <Td className="hidden px-6 py-3 lg:table-cell">
                  {(() => {
                    const paymentStatus = paymentStatusFor(property.name);
                    return paymentStatus ? (
                      <span
                        className={`rounded-full px-2.5 py-1 text-xs font-medium ${PAYMENT_STATUS_STYLES[paymentStatus]}`}
                      >
                        {paymentStatus}
                      </span>
                    ) : (
                      <span className="text-xs text-slate-400">No data</span>
                    );
                  })()}
                </Td>
                <Td className="px-4 py-3 text-right sm:px-6">
                  <Link
                    href={`/landlord/properties/${property.id}`}
                    className="inline-flex items-center gap-1.5 rounded-lg border border-slate-300 px-2.5 py-1 text-xs font-medium text-slate-600 hover:bg-slate-50"
                  >
                    <Eye className="h-3.5 w-3.5" />
                    View
                  </Link>
                </Td>
              </Tr>
            ))}
            {visibleProperties.length === 0 && (
              <EmptyRow colSpan={6}>
                {myProperties.length === 0
                  ? "No properties registered yet."
                  : "No properties match this filter."}
              </EmptyRow>
            )}
          </TBody>
        </Table>
      </div>
    </div>
  );
}
