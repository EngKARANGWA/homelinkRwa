"use client";

import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { LEASES, MAINTENANCE_REQUESTS, PAYMENTS } from "@/lib/mock-admin-data";
import { useTenant } from "@/components/tenant/TenantContext";

export default function TenantOverviewPage() {
  const { tenantName } = useTenant();

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
  const myPayments = PAYMENTS.filter((p) => p.tenant === tenantName);
  const nextPayment = myPayments
    .filter((p) => p.status !== "Paid")
    .sort((a, b) => a.dueDate.localeCompare(b.dueDate))[0];

  const stats = [
    {
      label: "Current Property",
      value: currentLease ? currentLease.property : "No active lease",
    },
    {
      label: "Monthly Rent",
      value: currentLease
        ? `${currentLease.rent.toLocaleString()} RWF`
        : "—",
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

  return (
    <div className="flex flex-col gap-8">
      <div>
        <h1 className="text-2xl font-bold text-navy">Overview</h1>
        <p className="mt-1 text-sm text-slate-500">
          Welcome back, {tenantName}.
        </p>
      </div>

      <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map(({ label, value }) => (
          <div
            key={label}
            className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm"
          >
            <p className="text-sm text-slate-500">{label}</p>
            <p className="mt-2 text-xl font-bold text-navy">{value}</p>
          </div>
        ))}
      </div>

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
              View your payment history or pay what&apos;s due.
            </p>
          </div>
          <ArrowRight className="h-5 w-5 shrink-0 text-gold" />
        </Link>
      </div>
    </div>
  );
}
