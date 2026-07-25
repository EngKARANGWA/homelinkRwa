"use client";

import { useState } from "react";
import { AppLink as Link } from "@/components/shared/AppLink";
import {
  ArrowRight,
  Banknote,
  CalendarClock,
  CheckCircle2,
  Home,
  Wallet,
  Wrench,
} from "lucide-react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import {
  LEASES,
  MAINTENANCE_REQUESTS,
  PAYMENTS,
  TODAY,
  type Payment,
} from "@/lib/mock-admin-data";
import { useTenant } from "@/components/tenant/TenantContext";
import { CHART_GRID_COLOR, CHART_TEXT_COLOR } from "@/lib/chart-colors";
import { Modal } from "@/components/admin/Modal";
import { PayNowForm } from "@/components/tenant/PayNowForm";
import { StatCard, type StatAccent } from "@/components/dashboard/StatCard";
import { formatMoney } from "@/lib/money";

const STATUS_COLORS: Record<string, string> = {
  Paid: "#10b981",
  Late: "#f43f5e",
  Pending: "#f59e0b",
  "Pending Approval": "#0ea5e9",
};

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

const axisTick = { fontSize: 12, fill: CHART_TEXT_COLOR };

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

  const stats = [
    {
      label: "Current Property",
      value: currentLease ? currentLease.property : "No active lease",
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
      value: nextPayment ? nextPayment.dueDate : "All paid up",
    },
  ];

  const paymentHistory = [...myPayments]
    .sort((a, b) => a.dueDate.localeCompare(b.dueDate))
    .map((p) => ({ date: p.dueDate, amount: p.amount, status: p.status }));

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
              {nextPayment.property} · due {nextPayment.dueDate}
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
        {stats.map(({ label, value }) => {
          const meta = STAT_META[label];
          return (
            <StatCard
              key={label}
              label={label}
              value={value}
              subtitle={meta?.subtitle}
              href={meta?.href ?? "/tenant"}
              icon={meta?.icon ?? Home}
              accent={meta?.accent ?? "blue"}
            />
          );
        })}
      </div>

      {paymentHistory.length > 0 && (
        <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
          <p className="font-semibold text-navy">Payment History</p>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={paymentHistory}>
              <CartesianGrid strokeDasharray="3 3" stroke={CHART_GRID_COLOR} />
              <XAxis dataKey="date" tick={axisTick} />
              <YAxis tick={axisTick} />
              <Tooltip formatter={(value) => `${formatMoney(Number(value))} RWF`} />
              <Bar dataKey="amount" radius={[6, 6, 0, 0]}>
                {paymentHistory.map((entry) => (
                  <Cell key={entry.date} fill={STATUS_COLORS[entry.status]} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
          <div className="mt-2 flex flex-wrap gap-4 text-xs text-slate-500">
            {Object.entries(STATUS_COLORS).map(([status, color]) => (
              <div key={status} className="flex items-center gap-1.5">
                <span
                  className="h-2.5 w-2.5 rounded-full"
                  style={{ backgroundColor: color }}
                />
                {status}
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="grid gap-5 sm:grid-cols-2">
        <Link
          href="/tenant/maintenance"
          className="flex items-center justify-between rounded-xl border border-slate-200 bg-white p-5 shadow-sm transition-colors hover:border-gold/40"
        >
          <div>
            <p className="font-semibold text-navy">Submit a maintenance request</p>
            <p className="mt-1 text-sm text-slate-500">
              Something needs fixing? Let your landlord know.
            </p>
          </div>
          <ArrowRight className="h-5 w-5 shrink-0 text-gold" />
        </Link>

        <Link
          href="/tenant/payments"
          className="flex items-center justify-between rounded-xl border border-slate-200 bg-white p-5 shadow-sm transition-colors hover:border-gold/40"
        >
          <div>
            <p className="font-semibold text-navy">Pay rent</p>
            <p className="mt-1 text-sm text-slate-500">
              {nextPayment
                ? "View your payment history or pay what's due."
                : "View your payment history — you're all paid up."}
            </p>
          </div>
          <ArrowRight className="h-5 w-5 shrink-0 text-gold" />
        </Link>
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
