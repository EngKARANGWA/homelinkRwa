"use client";

import { useState } from "react";
import Link from "next/link";
import { ArrowRight, CheckCircle2, Wallet } from "lucide-react";
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

const STATUS_COLORS: Record<string, string> = {
  Paid: "#10b981",
  Late: "#f43f5e",
  Pending: "#f59e0b",
};

const STAT_LINKS: Record<string, string> = {
  "Current Property": "/tenant/lease",
  "Monthly Rent": "/tenant/lease",
  "Pending Maintenance": "/tenant/maintenance",
  "Next Payment Due": "/tenant/payments",
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
    .filter((p) => p.status !== "Paid")
    .sort((a, b) => a.dueDate.localeCompare(b.dueDate))[0];

  const payNow = (method: Payment["method"]) => {
    if (!nextPayment) return;
    setPayments((prev) =>
      prev.map((p) =>
        p.id === nextPayment.id
          ? { ...p, status: "Paid", method, paidDate: TODAY }
          : p,
      ),
    );
    setPaying(false);
    setNotice("Payment successful. Your receipt is available on the Payments page.");
  };

  const stats = [
    {
      label: "Current Property",
      value: currentLease ? currentLease.property : "No active lease",
    },
    {
      label: "Monthly Rent",
      value: currentLease
        ? `${currentLease.rent.toLocaleString()} RWF`
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
              Rent pending - {nextPayment.amount.toLocaleString()} RWF
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

      <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map(({ label, value }) => (
          <Link
            key={label}
            href={STAT_LINKS[label] ?? "/tenant"}
            className="group rounded-xl border border-slate-200 bg-white p-5 shadow-sm transition-all hover:-translate-y-0.5 hover:border-gold/40 hover:shadow-md"
          >
            <div className="flex items-center justify-between">
              <p className="text-sm text-slate-500">{label}</p>
              <ArrowRight className="h-3.5 w-3.5 text-slate-300 transition-colors group-hover:text-gold" />
            </div>
            <p className="mt-2 text-xl font-bold text-navy">{value}</p>
          </Link>
        ))}
      </div>

      {paymentHistory.length > 0 && (
        <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
          <p className="font-semibold text-navy">Payment History</p>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={paymentHistory}>
              <CartesianGrid strokeDasharray="3 3" stroke={CHART_GRID_COLOR} />
              <XAxis dataKey="date" tick={axisTick} />
              <YAxis tick={axisTick} />
              <Tooltip formatter={(value) => `${Number(value).toLocaleString()} RWF`} />
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
