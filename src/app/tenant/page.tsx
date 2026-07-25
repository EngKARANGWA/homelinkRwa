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

const QUICK_ACTIONS = [
  { label: "Pay Rent", href: "/tenant/payments", icon: Wallet },
  { label: "Invoices", href: "/tenant/payments", icon: FileText },
  { label: "Maintenance", href: "/tenant/maintenance", icon: Wrench },
  { label: "Lease", href: "/tenant/lease", icon: Home },
] as const;

function shortDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString("en-GB", {
    day: "numeric",
    month: "short",
  });
}

const STAT_META: Record<
  string,
  { href: string; icon: typeof Home; accent: StatAccent; subtitle: string }
> = {
  "Current Property": {
    href: "/tenant/lease",
    icon: Home,
    accent: "blue",
    subtitle: "Your active residence",
  },
  "Monthly Rent": {
    href: "/tenant/lease",
    icon: Banknote,
    accent: "emerald",
    subtitle: "Due monthly",
  },
  "Pending Maintenance": {
    href: "/tenant/maintenance",
    icon: Wrench,
    accent: "amber",
    subtitle: "Open requests",
  },
  "Next Payment Due": {
    href: "/tenant/payments",
    icon: CalendarClock,
    accent: "teal",
    subtitle: "Upcoming due date",
  },
};

export default function TenantOverviewPage() {
  const { tenantName } = useTenant();
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
    setNotice(
      needsApproval
        ? "Payment submitted. Awaiting your landlord's approval."
        : "Payment successful. Your receipt is available on the Payments page.",
    );
  };

  const stats: { label: string; value: string | number; subtitle?: string }[] = [
    {
      label: "Current Property",
      value: currentLease ? currentLease.property : "No active lease",
      subtitle: currentUnitNumber ? `Unit ${currentUnitNumber}` : undefined,
    },
    {
      label: "Monthly Rent",
      value: currentLease
        ? `${formatMoney(currentLease.rent)} RWF`
        : "-",
    },
    {
      label: "Pending Maintenance",
      value: myMaintenance.filter((m) => m.status !== "Completed").length,
    },
    {
      label: "Next Payment Due",
      value: nextPayment ? shortDate(nextPayment.dueDate) : "All paid up",
    },
  ];

  return (
    <div className="flex flex-col gap-8">
      <div>
        <h1 className="text-2xl font-bold text-navy">Overview</h1>
        <p className="mt-1 text-sm text-slate-500">
          Welcome back, {tenantName}.
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
              Rent pending - {formatMoney(nextPayment.amount)} RWF
            </p>
            <p className="mt-1 text-sm text-slate-500">
              {nextPayment.property}
              {nextPaymentUnitNumber ? ` · Unit ${nextPaymentUnitNumber}` : ""} · due{" "}
              {nextPayment.dueDate}
            </p>
          </div>
          <button
            type="button"
            onClick={() => setPaying(true)}
            className="inline-flex items-center gap-1.5 rounded-lg bg-gold px-5 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-gold/90"
          >
            <Wallet className="h-4 w-4" />
            Pay Now
          </button>
        </div>
      )}

      <div className="grid grid-cols-2 gap-5 lg:grid-cols-4">
        {stats.map(({ label, value, subtitle }) => {
          const meta = STAT_META[label];
          return (
            <StatCard
              key={label}
              label={label}
              value={value}
              subtitle={subtitle ?? meta?.subtitle}
              href={meta?.href ?? "/tenant"}
              icon={meta?.icon ?? Home}
              accent={meta?.accent ?? "blue"}
            />
          );
        })}
      </div>

      <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
        <p className="font-semibold text-navy">Quick Actions</p>
        <div className="mt-3 grid grid-cols-2 gap-3">
          {QUICK_ACTIONS.map(({ label, href, icon: Icon }) => (
            <Link
              key={label}
              href={href}
              className="flex items-center justify-center gap-2 rounded-full border border-slate-200 px-4 py-2.5 text-sm font-medium text-navy transition-colors hover:border-gold/40 hover:bg-slate-50"
            >
              <Icon className="h-4 w-4 shrink-0 text-slate-500" />
              {label}
            </Link>
          ))}
        </div>
      </div>

      {isPaying && nextPayment && (
        <Modal
          title="Pay Rent"
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
