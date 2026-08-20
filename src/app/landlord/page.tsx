"use client";

import { useState } from "react";
import { AppLink as Link } from "@/components/shared/AppLink";
import {
  AlertCircle,
  AlertTriangle,
  ArrowRight,
  Bell,
  Building2,
  CheckCircle2,
  Clock,
  FileText,
  ListChecks,
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
import { LEASES, MAINTENANCE_REQUESTS, PAYMENTS, PROPERTIES, TODAY } from "@/lib/mock-admin-data";
import { useLandlord } from "@/components/landlord/LandlordContext";
import { getUnitsForProperty } from "@/lib/units";
import {
  CHART_COLORS,
  CHART_GRID_COLOR,
  CHART_TEXT_COLOR,
} from "@/lib/chart-colors";
import { StatCard, type StatAccent } from "@/components/dashboard/StatCard";
import { AlertBanner } from "@/components/dashboard/AlertBanner";
import { formatMoney } from "@/lib/money";
import { useLanguage } from "@/lib/i18n/LanguageContext";
import type { Translations } from "@/lib/i18n/translations";

const TRANSACTION_QUICK_ACTIONS: {
  key: "All" | "Pending Approval" | "Overdue" | "Arrears";
  labelKey: keyof Translations["dashboard"]["landlord"]["overview"]["tabs"];
  icon: typeof Building2;
}[] = [
  { key: "All", labelKey: "all", icon: ListChecks },
  { key: "Pending Approval", labelKey: "pendingApproval", icon: Clock },
  { key: "Overdue", labelKey: "overdue", icon: AlertTriangle },
  { key: "Arrears", labelKey: "arrears", icon: AlertCircle },
];

const STAT_META: Record<
  string,
  {
    href: string;
    icon: typeof Building2;
    accent: StatAccent;
    labelKey: keyof Translations["dashboard"]["landlord"]["overview"]["statLabels"];
    subtitleKey: keyof Translations["dashboard"]["landlord"]["overview"]["statSubtitles"];
  }
> = {
  "My Properties": {
    href: "/landlord/properties",
    icon: Building2,
    accent: "blue",
    labelKey: "myProperties",
    subtitleKey: "registeredByYou",
  },
  "Active Leases": {
    href: "/landlord/leases",
    icon: FileText,
    accent: "emerald",
    labelKey: "activeLeases",
    subtitleKey: "currentlyActive",
  },
  "Pending Maintenance": {
    href: "/landlord/maintenance",
    icon: Wrench,
    accent: "amber",
    labelKey: "pendingMaintenance",
    subtitleKey: "awaitingAction",
  },
  "Revenue Collected": {
    href: "/landlord/payments",
    icon: Wallet,
    accent: "teal",
    labelKey: "revenueCollected",
    subtitleKey: "thisMonth",
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
  const { t } = useLanguage();
  const c = t.dashboard.landlord.overview;
  const [reminderNotice, setReminderNotice] = useState<string | null>(null);

  const myProperties = PROPERTIES.filter((p) => p.owner === landlordName);
  const myPropertyNames = myProperties.map((p) => p.name);
  const myLeases = LEASES.filter((l) => l.owner === landlordName);
  const myMaintenance = MAINTENANCE_REQUESTS.filter((m) =>
    myPropertyNames.includes(m.property),
  );
  const myPayments = PAYMENTS.filter((p) => p.owner === landlordName);

  const allTenantUnits = myProperties.flatMap((property) =>
    getUnitsForProperty(property, unitOverrides).filter(
      (u) => u.occupancyStatus === "Occupied",
    ),
  );

  const overdueTenantUnits = allTenantUnits.filter(
    (u) => u.currentPaymentStatus === "Overdue" || u.currentPaymentStatus === "Arrears",
  );
  const overdueOnlyUnits = allTenantUnits.filter((u) => u.currentPaymentStatus === "Overdue");
  const arrearsOnlyUnits = allTenantUnits.filter((u) => u.currentPaymentStatus === "Arrears");
  const arrearsBalance = overdueTenantUnits.reduce((sum, u) => sum + u.monthlyRent, 0);
  const overdueOnlyBalance = overdueOnlyUnits.reduce((sum, u) => sum + u.monthlyRent, 0);
  const arrearsOnlyBalance = arrearsOnlyUnits.reduce((sum, u) => sum + u.monthlyRent, 0);

  const pendingApprovalPayments = myPayments.filter((p) => p.status === "Pending Approval");
  const pendingApprovalBalance = pendingApprovalPayments.reduce(
    (sum, p) => sum + p.amount,
    0,
  );

  const balanceDue = arrearsBalance + pendingApprovalBalance;
  const outstandingTenants = new Set([
    ...overdueTenantUnits.map((u) => u.tenant),
    ...pendingApprovalPayments.map((p) => p.tenant),
  ]).size;

  const handleSendReminder = () => {
    setReminderNotice(
      outstandingTenants > 0
        ? c.reminderSentTemplate
            .replace("{count}", String(outstandingTenants))
            .replace("{plural}", outstandingTenants === 1 ? "" : "s")
        : c.noOutstandingTenants,
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
      value: `${formatMoney(
        myPayments
          .filter((p) => p.status === "Paid")
          .reduce((sum, p) => sum + p.amount, 0),
      )} RWF`,
    },
  ];

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

  const transactionTabCounts: Record<(typeof TRANSACTION_QUICK_ACTIONS)[number]["key"], number> = {
    All: myPayments.length + overdueTenantUnits.length,
    "Pending Approval": pendingApprovalPayments.length,
    Overdue: overdueOnlyUnits.length,
    Arrears: arrearsOnlyUnits.length,
  };

  const transactionTabAmounts: Record<(typeof TRANSACTION_QUICK_ACTIONS)[number]["key"], number> = {
    All: balanceDue,
    "Pending Approval": pendingApprovalBalance,
    Overdue: overdueOnlyBalance,
    Arrears: arrearsOnlyBalance,
  };

  return (
    <div className="flex flex-col gap-8">
      <div>
        <h1 className="text-2xl font-bold text-navy">{c.title}</h1>
        <p className="mt-1 text-sm text-slate-500">
          {c.subtitlePrefix}{landlordName}{c.subtitleSuffix}
        </p>
      </div>

      <div className="grid grid-cols-2 gap-5 lg:grid-cols-4">
        {stats.map(({ label, value }) => {
          const meta = STAT_META[label];
          return (
            <StatCard
              key={label}
              label={meta ? c.statLabels[meta.labelKey] : label}
              value={value}
              subtitle={meta ? c.statSubtitles[meta.subtitleKey] : undefined}
              href={meta?.href ?? "/landlord"}
              icon={meta?.icon ?? Building2}
              accent={meta?.accent ?? "blue"}
            />
          );
        })}
      </div>

      <div className="grid gap-5 lg:grid-cols-2">
        <AlertBanner
          className="order-2 lg:order-1"
          isAlert={balanceDue > 0}
          stats={[
            { label: c.balanceDue, value: `${formatMoney(balanceDue)} RWF` },
            { label: c.tenantsOutstanding, value: outstandingTenants },
          ]}
          message={balanceDue > 0 ? c.alertMessage : c.allPaidMessage}
        >
          <button
            type="button"
            onClick={handleSendReminder}
            className="inline-flex items-center gap-2 rounded-lg bg-gold px-5 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-gold/90"
          >
            <Bell className="h-4 w-4" />
            {c.sendReminder}
          </button>
          <Link
            href="/landlord/reports"
            className="inline-flex items-center gap-2 rounded-lg border border-slate-300 bg-white px-5 py-2.5 text-sm font-semibold text-slate-600 transition-colors hover:bg-slate-50"
          >
            {c.viewReport}
          </Link>
        </AlertBanner>

        {myProperties.length > 0 && (
          <div className="order-1 rounded-xl border border-slate-200 bg-white p-5 shadow-sm lg:order-2">
            <p className="font-semibold text-navy">{c.revenueByMonth}</p>
            <ResponsiveContainer width="100%" height={240}>
              <BarChart data={revenueByMonth}>
                <CartesianGrid strokeDasharray="3 3" stroke={CHART_GRID_COLOR} />
                <XAxis dataKey="month" tickFormatter={formatMonth} tick={axisTick} />
                <YAxis tickFormatter={(value) => formatMoney(Number(value))} tick={axisTick} />
                <Tooltip
                  labelFormatter={(label) => formatMonth(String(label))}
                  formatter={(value) => `${formatMoney(Number(value))} RWF`}
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

      <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="font-semibold text-navy">{c.transactionsTitle}</h2>
            <p className="mt-1 text-sm text-slate-500">
              {c.transactionsSubtitle}
            </p>
          </div>
          <Link
            href="/landlord/payments"
            className="inline-flex items-center gap-1 whitespace-nowrap text-sm font-medium text-gold hover:underline"
          >
            {t.dashboard.actions.viewAll}
            <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        </div>

        <div className="mt-4 grid grid-cols-2 gap-3 lg:grid-cols-4">
          {TRANSACTION_QUICK_ACTIONS.map((action) => (
            <Link
              key={action.key}
              href={`/landlord/payments?status=${encodeURIComponent(action.key)}`}
              className="flex flex-col items-center justify-center gap-1.5 rounded-2xl border border-slate-200 px-4 py-3 text-center transition-colors hover:border-gold/40 hover:bg-slate-50"
            >
              <span className="flex items-center gap-2 text-sm font-medium text-navy">
                <action.icon className="h-4 w-4 shrink-0 text-slate-500" />
                {c.tabs[action.labelKey]}
                <span className="rounded-full bg-slate-100 px-2 py-0.5 text-xs font-semibold text-slate-500">
                  {transactionTabCounts[action.key]}
                </span>
              </span>
              <span className="text-sm font-semibold text-slate-500">
                {formatMoney(transactionTabAmounts[action.key])} RWF
              </span>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
