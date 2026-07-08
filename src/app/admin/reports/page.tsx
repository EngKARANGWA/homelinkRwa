"use client";

import { useState } from "react";
import { Download } from "lucide-react";
import {
  LANDLORDS,
  LEASES,
  MAINTENANCE_REQUESTS,
  PAYMENTS,
  PROPERTIES,
} from "@/lib/mock-admin-data";
import { downloadCSV } from "@/lib/csv";

const REPORT_TYPES = [
  {
    id: "rental-history",
    label: "Rental History",
    hasDateFilter: true,
    hasPropertyFilter: true,
  },
  {
    id: "payment-history",
    label: "Payment History",
    hasDateFilter: true,
    hasPropertyFilter: true,
  },
  {
    id: "occupancy",
    label: "Occupancy",
    hasDateFilter: false,
    hasPropertyFilter: true,
  },
  {
    id: "maintenance-activity",
    label: "Maintenance Activity",
    hasDateFilter: true,
    hasPropertyFilter: true,
  },
  {
    id: "revenue-performance",
    label: "Revenue Performance",
    hasDateFilter: true,
    hasPropertyFilter: true,
  },
  {
    id: "landlord-performance",
    label: "Landlord Performance",
    hasDateFilter: false,
    hasPropertyFilter: false,
  },
] as const;

type ReportId = (typeof REPORT_TYPES)[number]["id"];

const PROPERTY_OPTIONS = ["All Properties", ...PROPERTIES.map((p) => p.name)];

export default function ReportsPage() {
  const [reportId, setReportId] = useState<ReportId>("rental-history");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");
  const [propertyFilter, setPropertyFilter] = useState("All Properties");

  const activeReport = REPORT_TYPES.find((r) => r.id === reportId)!;

  const inRange = (date: string) =>
    (!dateFrom || date >= dateFrom) && (!dateTo || date <= dateTo);
  const matchesProperty = (propertyName: string) =>
    propertyFilter === "All Properties" || propertyName === propertyFilter;

  const rentalHistory = LEASES.filter(
    (l) => matchesProperty(l.property) && inRange(l.startDate),
  );
  const paymentHistory = PAYMENTS.filter(
    (p) => matchesProperty(p.property) && inRange(p.dueDate),
  );
  const occupancy = PROPERTIES.filter((p) => matchesProperty(p.name));
  const maintenanceActivity = MAINTENANCE_REQUESTS.filter(
    (m) => matchesProperty(m.property) && inRange(m.submittedAt),
  );
  const revenuePerformance = PAYMENTS.filter(
    (p) =>
      p.status === "Paid" &&
      matchesProperty(p.property) &&
      inRange(p.paidDate ?? p.dueDate),
  );
  const revenueTotal = revenuePerformance.reduce((sum, p) => sum + p.amount, 0);

  const handleExport = () => {
    switch (reportId) {
      case "rental-history":
        downloadCSV(
          "rental-history.csv",
          ["Tenant", "Property", "Owner", "Rent", "Start Date", "End Date", "Status"],
          rentalHistory.map((l) => [
            l.tenant,
            l.property,
            l.owner,
            l.rent,
            l.startDate,
            l.endDate,
            l.status,
          ]),
        );
        break;
      case "payment-history":
        downloadCSV(
          "payment-history.csv",
          ["Tenant", "Property", "Amount", "Method", "Due Date", "Paid Date", "Status"],
          paymentHistory.map((p) => [
            p.tenant,
            p.property,
            p.amount,
            p.method,
            p.dueDate,
            p.paidDate ?? "—",
            p.status,
          ]),
        );
        break;
      case "occupancy":
        downloadCSV(
          "occupancy.csv",
          ["Property", "Owner", "Type", "Availability", "Approval"],
          occupancy.map((p) => [
            p.name,
            p.owner,
            p.type,
            p.availability,
            p.approval,
          ]),
        );
        break;
      case "maintenance-activity":
        downloadCSV(
          "maintenance-activity.csv",
          ["Tenant", "Property", "Issue", "Priority", "Status", "Assigned To", "Submitted"],
          maintenanceActivity.map((m) => [
            m.tenant,
            m.property,
            m.issue.join("; "),
            m.priority,
            m.status,
            m.assignedTo ?? "—",
            m.submittedAt,
          ]),
        );
        break;
      case "revenue-performance":
        downloadCSV(
          "revenue-performance.csv",
          ["Tenant", "Property", "Amount", "Method", "Paid Date"],
          revenuePerformance.map((p) => [
            p.tenant,
            p.property,
            p.amount,
            p.method,
            p.paidDate ?? "—",
          ]),
        );
        break;
      case "landlord-performance":
        downloadCSV(
          "landlord-performance.csv",
          ["Name", "Email", "Phone", "Properties", "Status", "Registered"],
          LANDLORDS.map((l) => [
            l.name,
            l.email,
            l.phone,
            l.properties,
            l.status,
            l.registeredAt,
          ]),
        );
        break;
    }
  };

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-bold text-navy">Reports</h1>
        <p className="mt-1 text-sm text-slate-500">
          Filter and customize the report you want, then export it.
        </p>
      </div>

      <div className="flex flex-wrap items-end gap-4 rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
        <label className="flex flex-col gap-1.5 text-sm font-medium text-slate-700">
          Report type
          <select
            value={reportId}
            onChange={(e) => setReportId(e.target.value as ReportId)}
            className="rounded-lg border border-slate-300 px-3 py-2.5 text-sm text-navy focus:border-gold focus:outline-none"
          >
            {REPORT_TYPES.map((r) => (
              <option key={r.id} value={r.id}>
                {r.label}
              </option>
            ))}
          </select>
        </label>

        <label className="flex flex-col gap-1.5 text-sm font-medium text-slate-700">
          From
          <input
            type="date"
            value={dateFrom}
            onChange={(e) => setDateFrom(e.target.value)}
            disabled={!activeReport.hasDateFilter}
            className="rounded-lg border border-slate-300 px-3 py-2.5 text-sm text-navy focus:border-gold focus:outline-none disabled:cursor-not-allowed disabled:bg-slate-50 disabled:text-slate-300"
          />
        </label>

        <label className="flex flex-col gap-1.5 text-sm font-medium text-slate-700">
          To
          <input
            type="date"
            value={dateTo}
            onChange={(e) => setDateTo(e.target.value)}
            disabled={!activeReport.hasDateFilter}
            className="rounded-lg border border-slate-300 px-3 py-2.5 text-sm text-navy focus:border-gold focus:outline-none disabled:cursor-not-allowed disabled:bg-slate-50 disabled:text-slate-300"
          />
        </label>

        <label className="flex flex-col gap-1.5 text-sm font-medium text-slate-700">
          Property
          <select
            value={propertyFilter}
            onChange={(e) => setPropertyFilter(e.target.value)}
            disabled={!activeReport.hasPropertyFilter}
            className="rounded-lg border border-slate-300 px-3 py-2.5 text-sm text-navy focus:border-gold focus:outline-none disabled:cursor-not-allowed disabled:bg-slate-50 disabled:text-slate-300"
          >
            {PROPERTY_OPTIONS.map((name) => (
              <option key={name}>{name}</option>
            ))}
          </select>
        </label>

        <button
          type="button"
          onClick={handleExport}
          className="ml-auto inline-flex items-center gap-2 rounded-lg bg-gold px-5 py-2.5 text-sm font-semibold text-navy transition-colors hover:bg-gold/90"
        >
          <Download className="h-4 w-4" />
          Export CSV
        </button>
      </div>

      <div className="overflow-x-auto rounded-xl border border-slate-200 bg-white shadow-sm">
        {reportId === "rental-history" && (
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="text-xs uppercase tracking-wide text-slate-400">
                <th className="px-6 py-3 font-medium">Tenant</th>
                <th className="px-6 py-3 font-medium">Property</th>
                <th className="px-6 py-3 font-medium">Owner</th>
                <th className="px-6 py-3 font-medium">Rent (RWF)</th>
                <th className="px-6 py-3 font-medium">Start</th>
                <th className="px-6 py-3 font-medium">End</th>
                <th className="px-6 py-3 font-medium">Status</th>
              </tr>
            </thead>
            <tbody>
              {rentalHistory.map((l) => (
                <tr key={l.id} className="border-t border-slate-100">
                  <td className="px-6 py-3 font-medium text-navy">{l.tenant}</td>
                  <td className="px-6 py-3 text-slate-500">{l.property}</td>
                  <td className="px-6 py-3 text-slate-500">{l.owner}</td>
                  <td className="px-6 py-3 text-slate-500">
                    {l.rent.toLocaleString()}
                  </td>
                  <td className="px-6 py-3 text-slate-500">{l.startDate}</td>
                  <td className="px-6 py-3 text-slate-500">{l.endDate}</td>
                  <td className="px-6 py-3 text-slate-500">{l.status}</td>
                </tr>
              ))}
              {rentalHistory.length === 0 && (
                <tr>
                  <td colSpan={7} className="px-6 py-8 text-center text-slate-400">
                    No leases match these filters.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        )}

        {reportId === "payment-history" && (
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="text-xs uppercase tracking-wide text-slate-400">
                <th className="px-6 py-3 font-medium">Tenant</th>
                <th className="px-6 py-3 font-medium">Property</th>
                <th className="px-6 py-3 font-medium">Amount (RWF)</th>
                <th className="px-6 py-3 font-medium">Method</th>
                <th className="px-6 py-3 font-medium">Due Date</th>
                <th className="px-6 py-3 font-medium">Paid Date</th>
                <th className="px-6 py-3 font-medium">Status</th>
              </tr>
            </thead>
            <tbody>
              {paymentHistory.map((p) => (
                <tr key={p.id} className="border-t border-slate-100">
                  <td className="px-6 py-3 font-medium text-navy">{p.tenant}</td>
                  <td className="px-6 py-3 text-slate-500">{p.property}</td>
                  <td className="px-6 py-3 text-slate-500">
                    {p.amount.toLocaleString()}
                  </td>
                  <td className="px-6 py-3 text-slate-500">{p.method}</td>
                  <td className="px-6 py-3 text-slate-500">{p.dueDate}</td>
                  <td className="px-6 py-3 text-slate-500">
                    {p.paidDate ?? "—"}
                  </td>
                  <td className="px-6 py-3 text-slate-500">{p.status}</td>
                </tr>
              ))}
              {paymentHistory.length === 0 && (
                <tr>
                  <td colSpan={7} className="px-6 py-8 text-center text-slate-400">
                    No payments match these filters.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        )}

        {reportId === "occupancy" && (
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="text-xs uppercase tracking-wide text-slate-400">
                <th className="px-6 py-3 font-medium">Property</th>
                <th className="px-6 py-3 font-medium">Owner</th>
                <th className="px-6 py-3 font-medium">Type</th>
                <th className="px-6 py-3 font-medium">Availability</th>
                <th className="px-6 py-3 font-medium">Approval</th>
              </tr>
            </thead>
            <tbody>
              {occupancy.map((p) => (
                <tr key={p.id} className="border-t border-slate-100">
                  <td className="px-6 py-3 font-medium text-navy">{p.name}</td>
                  <td className="px-6 py-3 text-slate-500">{p.owner}</td>
                  <td className="px-6 py-3 text-slate-500">{p.type}</td>
                  <td className="px-6 py-3 text-slate-500">
                    {p.availability}
                  </td>
                  <td className="px-6 py-3 text-slate-500">{p.approval}</td>
                </tr>
              ))}
              {occupancy.length === 0 && (
                <tr>
                  <td colSpan={5} className="px-6 py-8 text-center text-slate-400">
                    No properties match these filters.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        )}

        {reportId === "maintenance-activity" && (
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="text-xs uppercase tracking-wide text-slate-400">
                <th className="px-6 py-3 font-medium">Tenant</th>
                <th className="px-6 py-3 font-medium">Property</th>
                <th className="px-6 py-3 font-medium">Issue</th>
                <th className="px-6 py-3 font-medium">Priority</th>
                <th className="px-6 py-3 font-medium">Status</th>
                <th className="px-6 py-3 font-medium">Assigned To</th>
                <th className="px-6 py-3 font-medium">Submitted</th>
              </tr>
            </thead>
            <tbody>
              {maintenanceActivity.map((m) => (
                <tr key={m.id} className="border-t border-slate-100">
                  <td className="px-6 py-3 font-medium text-navy">{m.tenant}</td>
                  <td className="px-6 py-3 text-slate-500">{m.property}</td>
                  <td className="max-w-xs px-6 py-3 text-slate-500">
                    {m.issue.join("; ")}
                  </td>
                  <td className="px-6 py-3 text-slate-500">{m.priority}</td>
                  <td className="px-6 py-3 text-slate-500">{m.status}</td>
                  <td className="px-6 py-3 text-slate-500">
                    {m.assignedTo ?? "—"}
                  </td>
                  <td className="px-6 py-3 text-slate-500">
                    {m.submittedAt}
                  </td>
                </tr>
              ))}
              {maintenanceActivity.length === 0 && (
                <tr>
                  <td colSpan={7} className="px-6 py-8 text-center text-slate-400">
                    No requests match these filters.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        )}

        {reportId === "revenue-performance" && (
          <>
            <div className="flex items-center justify-between border-b border-slate-100 px-6 py-4">
              <p className="text-sm font-medium text-slate-500">
                Total collected
              </p>
              <p className="text-lg font-bold text-navy">
                {revenueTotal.toLocaleString()} RWF
              </p>
            </div>
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="text-xs uppercase tracking-wide text-slate-400">
                  <th className="px-6 py-3 font-medium">Tenant</th>
                  <th className="px-6 py-3 font-medium">Property</th>
                  <th className="px-6 py-3 font-medium">Amount (RWF)</th>
                  <th className="px-6 py-3 font-medium">Method</th>
                  <th className="px-6 py-3 font-medium">Paid Date</th>
                </tr>
              </thead>
              <tbody>
                {revenuePerformance.map((p) => (
                  <tr key={p.id} className="border-t border-slate-100">
                    <td className="px-6 py-3 font-medium text-navy">
                      {p.tenant}
                    </td>
                    <td className="px-6 py-3 text-slate-500">
                      {p.property}
                    </td>
                    <td className="px-6 py-3 text-slate-500">
                      {p.amount.toLocaleString()}
                    </td>
                    <td className="px-6 py-3 text-slate-500">{p.method}</td>
                    <td className="px-6 py-3 text-slate-500">
                      {p.paidDate ?? "—"}
                    </td>
                  </tr>
                ))}
                {revenuePerformance.length === 0 && (
                  <tr>
                    <td colSpan={5} className="px-6 py-8 text-center text-slate-400">
                      No revenue matches these filters.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </>
        )}

        {reportId === "landlord-performance" && (
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="text-xs uppercase tracking-wide text-slate-400">
                <th className="px-6 py-3 font-medium">Name</th>
                <th className="px-6 py-3 font-medium">Email</th>
                <th className="px-6 py-3 font-medium">Phone</th>
                <th className="px-6 py-3 font-medium">Properties</th>
                <th className="px-6 py-3 font-medium">Status</th>
                <th className="px-6 py-3 font-medium">Registered</th>
              </tr>
            </thead>
            <tbody>
              {LANDLORDS.map((l) => (
                <tr key={l.id} className="border-t border-slate-100">
                  <td className="px-6 py-3 font-medium text-navy">{l.name}</td>
                  <td className="px-6 py-3 text-slate-500">{l.email}</td>
                  <td className="px-6 py-3 text-slate-500">{l.phone}</td>
                  <td className="px-6 py-3 text-slate-500">
                    {l.properties}
                  </td>
                  <td className="px-6 py-3 text-slate-500">{l.status}</td>
                  <td className="px-6 py-3 text-slate-500">
                    {l.registeredAt}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
