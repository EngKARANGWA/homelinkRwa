"use client";

import { useState } from "react";
import { AppLink as Link } from "@/components/shared/AppLink";
import {
  Banknote,
  CalendarClock,
  CheckCircle2,
  FileText,
  Home,
  Wallet,
  Wrench,
} from "lucide-react";
import {
  LEASES,
  MAINTENANCE_REQUESTS,
  PAYMENTS,
  TODAY,
  type Payment,
} from "@/lib/mock-admin-data";
import { useTenant } from "@/components/tenant/TenantContext";
import { getTenantUnitNumber } from "@/lib/units";
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
  const { tenantName } = useTenant();
  const { t } = useLanguage();
  const c = t.dashboard.tenant.overview;
  const [payments, setPayments] = useState(PAYMENTS);
  const [isPaying, setPaying] = useState(false);
  const [notice, setNotice] = useState<string | null>(null);

  const myLeases = LEASES.filter((l) => l.tenant === tenantName);
  const currentLease =
    myLeases.find((l) => l.status === "Active") ??
    myLeases.find(
      (l) =>
        l.status === "Renewal Requested" || l.status === "Termination Requested",
    ) ??
    myLeases[0];

  const myMaintenance = MAINTENANCE_REQUESTS.filter(
    (m) => m.tenant === tenantName,
  );
  const myPayments = payments.filter((p) => p.tenant === tenantName);
  const nextPayment = myPayments
    .filter((p) => p.status !== "Paid" && p.status !== "Pending Approval")
    .sort((a, b) => a.dueDate.localeCompare(b.dueDate))[0];

  const currentUnitNumber = currentLease
    ? getTenantUnitNumber(currentLease.property, tenantName)
    : undefined;
  const nextPaymentUnitNumber = nextPayment
    ? getTenantUnitNumber(nextPayment.property, tenantName)
    : undefined;

  const payNow = (method: Payment["method"]) => {
    if (!nextPayment) return;
    const needsApproval = method === "Cash" || method === "Bank Transfer";
    setPayments((prev) =>
      prev.map((p) =>
        p.id === nextPayment.id
          ? {
              ...p,
              status: needsApproval ? "Pending Approval" : "Paid",
              method,
              paidDate: needsApproval ? null : TODAY,
            }
          : p,
      ),
    );
    setPaying(false);
    setNotice(needsApproval ? c.paymentSubmitted : c.paymentSuccessful);
  };

  const stats: {
    label: keyof Translations["dashboard"]["tenant"]["overview"]["statLabels"];
    value: string | number;
    subtitle?: string;
  }[] = [
    {
      label: "currentProperty",
      value: currentLease ? currentLease.property : c.noActiveLease,
      subtitle: currentUnitNumber ? `${c.unitPrefix}${currentUnitNumber}` : undefined,
    },
    {
      label: "monthlyRent",
      value: currentLease
        ? `${formatMoney(currentLease.rent)} RWF`
        : "-",
    },
    {
      label: "pendingMaintenance",
      value: myMaintenance.filter((m) => m.status !== "Completed").length,
    },
    {
      label: "nextPaymentDue",
      value: nextPayment ? shortDate(nextPayment.dueDate) : c.allPaidUp,
    },
  ];

  return (
    <div className="flex flex-col gap-8">
      <div>
        <h1 className="text-2xl font-bold text-navy">{c.title}</h1>
        <p className="mt-1 text-sm text-slate-500">
          {c.welcomeBackPrefix}{tenantName}{c.welcomeBackSuffix}
        </p>
      </div>

      {notice && (
        <div className="flex items-center gap-2 rounded-lg border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm font-medium text-emerald-700">
          <CheckCircle2 className="h-4 w-4" />
          {notice}
        </div>
      )}

      {nextPayment && (
        <div className="flex flex-wrap items-center justify-between gap-4 rounded-xl border border-gold/30 bg-gold/5 p-5 shadow-sm">
          <div>
            <p className="font-semibold text-navy">
              {c.rentPendingTemplate.replace("{amount}", formatMoney(nextPayment.amount))}
            </p>
            <p className="mt-1 text-sm text-slate-500">
              {nextPayment.property}
              {nextPaymentUnitNumber ? ` · ${c.unitPrefix}${nextPaymentUnitNumber}` : ""} · {c.due}{" "}
              {nextPayment.dueDate}
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
              href={meta?.href ?? "/tenant"}
              icon={meta?.icon ?? Home}
              accent={meta?.accent ?? "blue"}
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

      {isPaying && nextPayment && (
        <Modal
          title={c.payRentModalTitle}
          description={nextPayment.property}
          onClose={() => setPaying(false)}
        >
          <PayNowForm
            amount={nextPayment.amount}
            onCancel={() => setPaying(false)}
            onSuccess={(method) => payNow(method)}
          />
        </Modal>
      )}
    </div>
  );
}
