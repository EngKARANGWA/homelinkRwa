"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  AlertCircle,
  Banknote,
  CalendarClock,
  CheckCircle2,
  FileText,
  Home,
  Wallet,
  Wrench,
} from "lucide-react";
import { useAuth } from "@/components/auth/AuthContext";
import { getTenantDashboard } from "@/lib/api/dashboard";
import { getLease } from "@/lib/api/leases";
import { listUnits } from "@/lib/api/properties";
import { payInvoice } from "@/lib/api/payments";
import { ApiError } from "@/lib/api/client";
import type { PayInvoiceInput, TenantDashboard } from "@/lib/api/types";
import { Modal } from "@/components/admin/Modal";
import { PayNowForm } from "@/components/tenant/PayNowForm";
import { StatCard, type StatAccent } from "@/components/dashboard/StatCard";
import { formatMoney } from "@/lib/money";
import { useLanguage } from "@/lib/i18n/LanguageContext";
import type { Translations } from "@/lib/i18n/translations";

const QUICK_ACTIONS = [
  { key: "payRent", href: "/tenant/payments", icon: Wallet },
  { key: "invoices", href: "/tenant/payments", icon: FileText },
  { key: "maintenance", href: "/tenant/maintenance", icon: Wrench },
  { key: "lease", href: "/tenant/lease", icon: Home },
] as const;

function shortDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString("en-GB", {
    day: "numeric",
    month: "short",
  });
}

const STAT_META: Record<
  keyof Translations["dashboard"]["tenant"]["overview"]["statLabels"],
  {
    href: string;
    icon: typeof Home;
    accent: StatAccent;
    subtitleKey: keyof Translations["dashboard"]["tenant"]["overview"]["statSubtitles"];
  }
> = {
  currentProperty: {
    href: "/tenant/lease",
    icon: Home,
    accent: "blue",
    subtitleKey: "activeResidence",
  },
  monthlyRent: {
    href: "/tenant/lease",
    icon: Banknote,
    accent: "emerald",
    subtitleKey: "dueMonthly",
  },
  pendingMaintenance: {
    href: "/tenant/maintenance",
    icon: Wrench,
    accent: "amber",
    subtitleKey: "openRequests",
  },
  nextPaymentDue: {
    href: "/tenant/payments",
    icon: CalendarClock,
    accent: "teal",
    subtitleKey: "upcomingDueDate",
  },
};

export default function TenantOverviewPage() {
  const { user } = useAuth();
  const { t } = useLanguage();
  const c = t.dashboard.tenant.overview;
  const [dashboard, setDashboard] = useState<TenantDashboard | null>(null);
  const [unitLabel, setUnitLabel] = useState<string | null>(null);
  const [isLoading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isPaying, setPaying] = useState(false);
  const [notice, setNotice] = useState<string | null>(null);

  const load = () => {
    setLoading(true);
    setError(null);
    getTenantDashboard()
      .then(async (dash) => {
        setDashboard(dash);
        if (dash.activeLease) {
          const lease = await getLease(dash.activeLease.id);
          const units = await listUnits(lease.propertyId);
          setUnitLabel(units.find((u) => u.id === lease.unitId)?.label ?? null);
        } else {
          setUnitLabel(null);
        }
      })
      .catch((err) =>
        setError(err instanceof ApiError ? err.message : "Failed to load your dashboard."),
      )
      .finally(() => setLoading(false));
  };

  useEffect(load, []);

  const payNow = async (values: PayInvoiceInput) => {
    if (!dashboard?.nextDueInvoice) return;
    setError(null);
    try {
      await payInvoice(dashboard.nextDueInvoice.id, values);
      setPaying(false);
      setNotice(
        values.method === "mobile_money" ? c.paymentSuccessful : c.paymentSubmitted,
      );
      load();
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Failed to submit payment.");
    }
  };

  const activeLease = dashboard?.activeLease ?? null;
  const nextDueInvoice = dashboard?.nextDueInvoice ?? null;
  const pendingMaintenance = dashboard
    ? dashboard.maintenanceRequests.open + dashboard.maintenanceRequests.inProgress
    : 0;

  const stats: {
    label: keyof Translations["dashboard"]["tenant"]["overview"]["statLabels"];
    value: string | number;
    subtitle?: string;
  }[] = [
    {
      label: "currentProperty",
      value: isLoading ? "…" : (activeLease?.propertyTitle ?? c.noActiveLease),
      subtitle: unitLabel ? `${c.unitPrefix}${unitLabel}` : undefined,
    },
    {
      label: "monthlyRent",
      value: isLoading ? "…" : activeLease ? `${formatMoney(activeLease.rentAmount)} RWF` : "-",
    },
    {
      label: "pendingMaintenance",
      value: isLoading ? "…" : pendingMaintenance,
    },
    {
      label: "nextPaymentDue",
      value: isLoading ? "…" : nextDueInvoice ? shortDate(nextDueInvoice.dueDate) : c.allPaidUp,
    },
  ];

  return (
    <div className="flex flex-col gap-8">
      <div>
        <h1 className="text-2xl font-bold text-navy">{c.title}</h1>
        <p className="mt-1 text-sm text-slate-500">
          {c.welcomeBackPrefix}
          {user ? `${user.firstName} ${user.lastName}` : ""}
          {c.welcomeBackSuffix}
        </p>
      </div>

      {notice && (
        <div className="flex items-center gap-2 rounded-lg border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm font-medium text-emerald-700">
          <CheckCircle2 className="h-4 w-4" />
          {notice}
        </div>
      )}

      {error && (
        <div className="flex items-center justify-between gap-3 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-700">
          <span className="flex items-center gap-2">
            <AlertCircle className="h-4 w-4" />
            {error}
          </span>
          <button type="button" onClick={load} className="underline hover:no-underline">
            Retry
          </button>
        </div>
      )}

      {nextDueInvoice && activeLease && (
        <div className="flex flex-wrap items-center justify-between gap-4 rounded-xl border border-gold/30 bg-gold/5 p-5 shadow-sm">
          <div>
            <p className="font-semibold text-navy">
              {c.rentPendingTemplate.replace("{amount}", formatMoney(nextDueInvoice.amountDue))}
            </p>
            <p className="mt-1 text-sm text-slate-500">
              {activeLease.propertyTitle}
              {unitLabel ? ` · ${c.unitPrefix}${unitLabel}` : ""} · {c.due} {nextDueInvoice.dueDate}
            </p>
          </div>
          <button
            type="button"
            onClick={() => setPaying(true)}
            className="inline-flex items-center gap-1.5 rounded-lg bg-gold px-5 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-gold/90"
          >
            <Wallet className="h-4 w-4" />
            {c.payNow}
          </button>
        </div>
      )}

      <div className="grid grid-cols-2 gap-5 lg:grid-cols-4">
        {stats.map(({ label, value, subtitle }) => {
          const meta = STAT_META[label];
          return (
            <StatCard
              key={label}
              label={c.statLabels[label]}
              value={value}
              subtitle={subtitle ?? c.statSubtitles[meta.subtitleKey]}
              href={meta.href}
              icon={meta.icon}
              accent={meta.accent}
            />
          );
        })}
      </div>

      <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
        <p className="font-semibold text-navy">{c.quickActions}</p>
        <div className="mt-3 grid grid-cols-2 gap-3">
          {QUICK_ACTIONS.map(({ key, href, icon: Icon }) => (
            <Link
              key={key}
              href={href}
              className="flex items-center justify-center gap-2 rounded-full border border-slate-200 px-4 py-2.5 text-sm font-medium text-navy transition-colors hover:border-gold/40 hover:bg-slate-50"
            >
              <Icon className="h-4 w-4 shrink-0 text-slate-500" />
              {c.quickActionLabels[key]}
            </Link>
          ))}
        </div>
      </div>

      {isPaying && nextDueInvoice && activeLease && (
        <Modal
          title={c.payRentModalTitle}
          description={activeLease.propertyTitle}
          onClose={() => setPaying(false)}
        >
          <PayNowForm
            amount={nextDueInvoice.amountDue}
            onCancel={() => setPaying(false)}
            onSuccess={(values) => payNow(values)}
          />
        </Modal>
      )}
    </div>
  );
}
