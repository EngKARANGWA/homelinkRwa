"use client";

import { useEffect, useRef, useState } from "react";
import { Columns3, Download } from "lucide-react";
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
  type Lease,
  type MaintenanceRequest,
  type Payment,
  type Property,
} from "@/lib/mock-admin-data";
import { useLandlord } from "@/components/landlord/LandlordContext";
import { CHART_COLORS, CHART_GRID_COLOR, CHART_TEXT_COLOR } from "@/lib/chart-colors";
import { downloadCSV } from "@/lib/csv";

const REPORT_TYPES = [
  { id: "rental-history", label: "Rental History", hasDateFilter: true, hasPropertyFilter: true },
  { id: "payment-history", label: "Payment History", hasDateFilter: true, hasPropertyFilter: true },
  { id: "occupancy", label: "Occupancy", hasDateFilter: false, hasPropertyFilter: true },
  { id: "maintenance-activity", label: "Maintenance Activity", hasDateFilter: true, hasPropertyFilter: true },
  { id: "revenue-performance", label: "Revenue Performance", hasDateFilter: true, hasPropertyFilter: true },
] as const;

type ReportId = (typeof REPORT_TYPES)[number]["id"];

const PAYMENT_REPORT_IDS: ReportId[] = ["payment-history", "revenue-performance"];

type Column<T> = {
  key: string;
  label: string;
  cell: (row: T) => React.ReactNode;
  csv: (row: T) => string | number;
};

const RENTAL_HISTORY_COLUMNS: Column<Lease>[] = [
  { key: "tenant", label: "Tenant", cell: (l) => l.tenant, csv: (l) => l.tenant },
  { key: "property", label: "Property", cell: (l) => l.property, csv: (l) => l.property },
  { key: "rent", label: "Rent (RWF)", cell: (l) => l.rent.toLocaleString(), csv: (l) => l.rent },
  { key: "start", label: "Start", cell: (l) => l.startDate, csv: (l) => l.startDate },
  {
    key: "end",
    label: "End",
    cell: (l) => l.endDate ?? "Open-ended",
    csv: (l) => l.endDate ?? "Open-ended",
  },
  { key: "status", label: "Status", cell: (l) => l.status, csv: (l) => l.status },
];

const PAYMENT_HISTORY_COLUMNS: Column<Payment>[] = [
  { key: "tenant", label: "Tenant", cell: (p) => p.tenant, csv: (p) => p.tenant },
  { key: "property", label: "Property", cell: (p) => p.property, csv: (p) => p.property },
  {
    key: "amount",
    label: "Amount (RWF)",
    cell: (p) => p.amount.toLocaleString(),
    csv: (p) => p.amount,
  },
  { key: "method", label: "Method", cell: (p) => p.method, csv: (p) => p.method },
  { key: "dueDate", label: "Due Date", cell: (p) => p.dueDate, csv: (p) => p.dueDate },
  {
    key: "paidDate",
    label: "Paid Date",
    cell: (p) => p.paidDate ?? "—",
    csv: (p) => p.paidDate ?? "—",
  },
  { key: "status", label: "Status", cell: (p) => p.status, csv: (p) => p.status },
];

const OCCUPANCY_COLUMNS: Column<Property>[] = [
  { key: "property", label: "Property", cell: (p) => p.name, csv: (p) => p.name },
  { key: "type", label: "Type", cell: (p) => p.type, csv: (p) => p.type },
  {
    key: "availability",
    label: "Availability",
    cell: (p) => p.availability,
    csv: (p) => p.availability,
  },
  { key: "approval", label: "Approval", cell: (p) => p.approval, csv: (p) => p.approval },
];

const MAINTENANCE_COLUMNS: Column<MaintenanceRequest>[] = [
  { key: "tenant", label: "Tenant", cell: (m) => m.tenant, csv: (m) => m.tenant },
  { key: "property", label: "Property", cell: (m) => m.property, csv: (m) => m.property },
  {
    key: "issue",
    label: "Issue",
    cell: (m) => m.issue.join("; "),
    csv: (m) => m.issue.join("; "),
  },
  { key: "priority", label: "Priority", cell: (m) => m.priority, csv: (m) => m.priority },
  { key: "status", label: "Status", cell: (m) => m.status, csv: (m) => m.status },
  {
    key: "assignedTo",
    label: "Assigned To",
    cell: (m) =>
      m.laborers.length > 0
        ? `${m.laborers.length} worker${m.laborers.length === 1 ? "" : "s"}`
        : "—",
    csv: (m) => m.laborers.map((l) => l.name).join("; ") || "—",
  },
  { key: "submitted", label: "Submitted", cell: (m) => m.submittedAt, csv: (m) => m.submittedAt },
];

const REVENUE_COLUMNS: Column<Payment>[] = [
  { key: "tenant", label: "Tenant", cell: (p) => p.tenant, csv: (p) => p.tenant },
  { key: "property", label: "Property", cell: (p) => p.property, csv: (p) => p.property },
  {
    key: "amount",
    label: "Amount (RWF)",
    cell: (p) => p.amount.toLocaleString(),
    csv: (p) => p.amount,
  },
  { key: "method", label: "Method", cell: (p) => p.method, csv: (p) => p.method },
  {
    key: "paidDate",
    label: "Paid Date",
    cell: (p) => p.paidDate ?? "—",
    csv: (p) => p.paidDate ?? "—",
  },
];

function ReportTable<T>({
  columns,
  rows,
  getKey,
  emptyMessage,
}: {
  columns: Column<T>[];
  rows: T[];
  getKey: (row: T) => string;
  emptyMessage: string;
}) {
  return (
    <table className="w-full text-left text-sm">
      <thead>
        <tr className="text-xs uppercase tracking-wide text-slate-400">
          {columns.map((col) => (
            <th key={col.key} className="px-6 py-3 font-medium">
              {col.label}
            </th>
          ))}
        </tr>
      </thead>
      <tbody>
        {rows.map((row) => (
          <tr key={getKey(row)} className="border-t border-slate-100">
            {columns.map((col, i) => (
              <td
                key={col.key}
                className={`px-6 py-3 ${i === 0 ? "font-medium text-navy" : "text-slate-500"}`}
              >
                {col.cell(row)}
              </td>
            ))}
          </tr>
        ))}
        {rows.length === 0 && (
          <tr>
            <td
              colSpan={columns.length}
              className="px-6 py-8 text-center text-slate-400"
            >
              {emptyMessage}
            </td>
          </tr>
        )}
      </tbody>
    </table>
  );
}

const axisTick = { fontSize: 12, fill: CHART_TEXT_COLOR };

export default function LandlordReportsPage() {
  const { landlordName } = useLandlord();
  const [reportId, setReportId] = useState<ReportId>("rental-history");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");
  const [propertyFilter, setPropertyFilter] = useState("All Properties");
  const [hiddenColumns, setHiddenColumns] = useState<Record<ReportId, Set<string>>>({
    "rental-history": new Set(),
    "payment-history": new Set(),
    occupancy: new Set(),
    "maintenance-activity": new Set(),
    "revenue-performance": new Set(),
  });
  const [columnsMenuOpen, setColumnsMenuOpen] = useState(false);
  const columnsMenuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (columnsMenuRef.current && !columnsMenuRef.current.contains(e.target as Node)) {
        setColumnsMenuOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const myProperties = PROPERTIES.filter((p) => p.owner === landlordName);
  const myPropertyNames = myProperties.map((p) => p.name);
  const myLeases = LEASES.filter((l) => l.owner === landlordName);
  const myPayments = PAYMENTS.filter((p) => p.owner === landlordName);
  const myMaintenance = MAINTENANCE_REQUESTS.filter((m) =>
    myPropertyNames.includes(m.property),
  );

  const propertyOptions = ["All Properties", ...myPropertyNames];
  const activeReport = REPORT_TYPES.find((r) => r.id === reportId)!;

  const inRange = (date: string) =>
    (!dateFrom || date >= dateFrom) && (!dateTo || date <= dateTo);
  const matchesProperty = (propertyName: string) =>
    propertyFilter === "All Properties" || propertyName === propertyFilter;

  const rentalHistory = myLeases.filter(
    (l) => matchesProperty(l.property) && inRange(l.startDate),
  );
  const paymentHistory = myPayments.filter(
    (p) => matchesProperty(p.property) && inRange(p.dueDate),
  );
  const occupancy = myProperties.filter((p) => matchesProperty(p.name));
  const maintenanceActivity = myMaintenance.filter(
    (m) => matchesProperty(m.property) && inRange(m.submittedAt),
  );
  const revenuePerformance = myPayments.filter(
    (p) =>
      p.status === "Paid" &&
      matchesProperty(p.property) &&
      inRange(p.paidDate ?? p.dueDate),
  );
  const revenueTotal = revenuePerformance.reduce((sum, p) => sum + p.amount, 0);

  const totalCollected = myPayments
    .filter((p) => p.status === "Paid")
    .reduce((sum, p) => sum + p.amount, 0);
  const totalOutstanding = myPayments
    .filter((p) => p.status !== "Paid")
    .reduce((sum, p) => sum + p.amount, 0);
  const occupiedCount = myProperties.filter((p) => p.availability === "Occupied").length;
  const occupancyRate = myProperties.length
    ? Math.round((occupiedCount / myProperties.length) * 100)
    : 0;
  const averageRent = myProperties.length
    ? Math.round(myProperties.reduce((sum, p) => sum + p.rent, 0) / myProperties.length)
    : 0;

  const revenueByMonth = (() => {
    const totals = new Map<string, number>();
    myPayments
      .filter((p) => p.status === "Paid")
      .forEach((p) => {
        const month = (p.paidDate ?? p.dueDate).slice(0, 7);
        totals.set(month, (totals.get(month) ?? 0) + p.amount);
      });
    return Array.from(totals.entries())
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([month, amount]) => ({ month, amount }));
  })();

  // Income/expense/profit for the payment-related reports, scoped to the
  // currently active date range + property filters so it matches what's
  // shown (and exported). Expenses are completed maintenance work — the
  // only cost data this app tracks — kept as an itemized breakdown so the
  // total is traceable back to the jobs that make it up.
  const incomeForActiveReport =
    reportId === "payment-history"
      ? paymentHistory
          .filter((p) => p.status === "Paid")
          .reduce((sum, p) => sum + p.amount, 0)
      : revenueTotal;
  const expenseBreakdown = myMaintenance
    .filter(
      (m) =>
        matchesProperty(m.property) &&
        m.status === "Completed" &&
        inRange(m.submittedAt),
    )
    .map((m) => ({
      id: m.id,
      property: m.property,
      workDone: m.workDone ?? m.issue.join("; "),
      laborCost: m.laborCost ?? 0,
      itemCost: m.itemCost ?? 0,
      total: (m.laborCost ?? 0) + (m.itemCost ?? 0),
      date: m.submittedAt,
    }));
  const expensesForActiveReport = expenseBreakdown.reduce(
    (sum, e) => sum + e.total,
    0,
  );
  const netProfitForActiveReport = incomeForActiveReport - expensesForActiveReport;

  const COLUMNS_BY_REPORT: Record<ReportId, Column<never>[]> = {
    "rental-history": RENTAL_HISTORY_COLUMNS as Column<never>[],
    "payment-history": PAYMENT_HISTORY_COLUMNS as Column<never>[],
    occupancy: OCCUPANCY_COLUMNS as Column<never>[],
    "maintenance-activity": MAINTENANCE_COLUMNS as Column<never>[],
    "revenue-performance": REVENUE_COLUMNS as Column<never>[],
  };

  const toggleColumn = (key: string) => {
    setHiddenColumns((prev) => {
      const current = new Set(prev[reportId]);
      const allColumns = COLUMNS_BY_REPORT[reportId].length;
      if (current.has(key)) {
        current.delete(key);
      } else if (current.size < allColumns - 1) {
        current.add(key);
      }
      return { ...prev, [reportId]: current };
    });
  };

  const activeColumns = COLUMNS_BY_REPORT[reportId].filter(
    (col) => !hiddenColumns[reportId].has(col.key),
  );

  const handleExport = () => {
    let headers: string[] = [];
    let rows: (string | number)[][] = [];
    let filename = "";

    switch (reportId) {
      case "rental-history":
        filename = "rental-history.csv";
        headers = activeColumns.map((c) => c.label);
        rows = rentalHistory.map((l) =>
          (activeColumns as Column<Lease>[]).map((c) => c.csv(l)),
        );
        break;
      case "payment-history":
        filename = "payment-history.csv";
        headers = activeColumns.map((c) => c.label);
        rows = paymentHistory.map((p) =>
          (activeColumns as Column<Payment>[]).map((c) => c.csv(p)),
        );
        break;
      case "occupancy":
        filename = "occupancy.csv";
        headers = activeColumns.map((c) => c.label);
        rows = occupancy.map((p) =>
          (activeColumns as Column<Property>[]).map((c) => c.csv(p)),
        );
        break;
      case "maintenance-activity":
        filename = "maintenance-activity.csv";
        headers = activeColumns.map((c) => c.label);
        rows = maintenanceActivity.map((m) =>
          (activeColumns as Column<MaintenanceRequest>[]).map((c) => c.csv(m)),
        );
        break;
      case "revenue-performance":
        filename = "revenue-performance.csv";
        headers = activeColumns.map((c) => c.label);
        rows = revenuePerformance.map((p) =>
          (activeColumns as Column<Payment>[]).map((c) => c.csv(p)),
        );
        break;
    }

    if (PAYMENT_REPORT_IDS.includes(reportId)) {
      const pad = (label: string, value: string | number) => [
        label,
        value,
        ...Array(Math.max(headers.length - 2, 0)).fill(""),
      ];
      rows = [
        ...rows,
        Array(headers.length).fill(""),
        pad("Total Income (RWF)", incomeForActiveReport),
        pad("Total Expenses (RWF)", expensesForActiveReport),
        pad("Net Profit (RWF)", netProfitForActiveReport),
      ];

      if (expenseBreakdown.length > 0) {
        rows = [
          ...rows,
          Array(headers.length).fill(""),
          ["Expense Breakdown (completed maintenance)"],
          ["Property", "Work Done", "Labor Cost (RWF)", "Item Cost (RWF)", "Total (RWF)", "Date"],
          ...expenseBreakdown.map((e) => [
            e.property,
            e.workDone,
            e.laborCost,
            e.itemCost,
            e.total,
            e.date,
          ]),
        ];
      }
    }

    downloadCSV(filename, headers, rows);
  };

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-bold text-navy">Reports</h1>
        <p className="mt-1 text-sm text-slate-500">
          Rent collection, occupancy, and performance across your properties.
        </p>
      </div>

      <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
        <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
          <p className="text-sm text-slate-500">Total Collected</p>
          <p className="mt-2 text-xl font-bold text-emerald-600">
            {totalCollected.toLocaleString()} RWF
          </p>
        </div>
        <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
          <p className="text-sm text-slate-500">Total Outstanding</p>
          <p className="mt-2 text-xl font-bold text-red-600">
            {totalOutstanding.toLocaleString()} RWF
          </p>
        </div>
        <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
          <p className="text-sm text-slate-500">Occupancy Rate</p>
          <p className="mt-2 text-xl font-bold text-navy">{occupancyRate}%</p>
        </div>
        <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
          <p className="text-sm text-slate-500">Average Rent</p>
          <p className="mt-2 text-xl font-bold text-navy">
            {averageRent.toLocaleString()} RWF
          </p>
        </div>
      </div>

      {revenueByMonth.length > 0 && (
        <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
          <p className="font-semibold text-navy">Revenue Collected by Month</p>
          <ResponsiveContainer width="100%" height={240}>
            <BarChart data={revenueByMonth}>
              <CartesianGrid strokeDasharray="3 3" stroke={CHART_GRID_COLOR} />
              <XAxis dataKey="month" tick={axisTick} />
              <YAxis tick={axisTick} />
              <Tooltip formatter={(value) => `${Number(value).toLocaleString()} RWF`} />
              <Bar dataKey="amount" fill={CHART_COLORS[0]} radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}

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
            {propertyOptions.map((name) => (
              <option key={name}>{name}</option>
            ))}
          </select>
        </label>

        <div className="relative ml-auto" ref={columnsMenuRef}>
          <button
            type="button"
            onClick={() => setColumnsMenuOpen((open) => !open)}
            className="inline-flex items-center gap-2 rounded-lg border border-slate-300 px-4 py-2.5 text-sm font-semibold text-slate-600 transition-colors hover:bg-slate-50"
          >
            <Columns3 className="h-4 w-4" />
            Columns
          </button>

          {columnsMenuOpen && (
            <div className="absolute right-0 top-full z-20 mt-2 w-56 overflow-hidden rounded-lg border border-slate-200 bg-white p-2 shadow-lg">
              {COLUMNS_BY_REPORT[reportId].map((col) => (
                <label
                  key={col.key}
                  className="flex items-center gap-2 rounded-md px-2 py-1.5 text-sm text-slate-600 hover:bg-slate-50"
                >
                  <input
                    type="checkbox"
                    checked={!hiddenColumns[reportId].has(col.key)}
                    onChange={() => toggleColumn(col.key)}
                    className="h-4 w-4 rounded border-slate-300 text-gold focus:ring-gold"
                  />
                  {col.label}
                </label>
              ))}
            </div>
          )}
        </div>

        <button
          type="button"
          onClick={handleExport}
          className="inline-flex items-center gap-2 rounded-lg bg-gold px-5 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-gold/90"
        >
          <Download className="h-4 w-4" />
          Export CSV
        </button>
      </div>

      {PAYMENT_REPORT_IDS.includes(reportId) && (
        <div className="grid gap-5 sm:grid-cols-3">
          <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
            <p className="text-sm text-slate-500">Total Income</p>
            <p className="mt-2 text-xl font-bold text-emerald-600">
              {incomeForActiveReport.toLocaleString()} RWF
            </p>
          </div>
          <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
            <p className="text-sm text-slate-500">Total Expenses</p>
            <p className="mt-2 text-xl font-bold text-red-600">
              {expensesForActiveReport.toLocaleString()} RWF
            </p>
            <p className="mt-1 text-xs text-slate-400">Completed maintenance costs</p>
          </div>
          <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
            <p className="text-sm text-slate-500">Net Profit</p>
            <p
              className={`mt-2 text-xl font-bold ${
                netProfitForActiveReport >= 0 ? "text-navy" : "text-red-600"
              }`}
            >
              {netProfitForActiveReport.toLocaleString()} RWF
            </p>
          </div>
        </div>
      )}

      {PAYMENT_REPORT_IDS.includes(reportId) && (
        <div className="overflow-x-auto rounded-xl border border-slate-200 bg-white shadow-sm">
          <div className="border-b border-slate-100 px-6 py-4">
            <p className="font-semibold text-navy">Where your expenses come from</p>
            <p className="mt-1 text-sm text-slate-500">
              Completed maintenance jobs on your properties in this period.
            </p>
          </div>
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="text-xs uppercase tracking-wide text-slate-400">
                <th className="px-6 py-3 font-medium">Property</th>
                <th className="px-6 py-3 font-medium">Work Done</th>
                <th className="px-6 py-3 font-medium">Labor Cost (RWF)</th>
                <th className="px-6 py-3 font-medium">Item Cost (RWF)</th>
                <th className="px-6 py-3 font-medium">Total (RWF)</th>
                <th className="px-6 py-3 font-medium">Date</th>
              </tr>
            </thead>
            <tbody>
              {expenseBreakdown.map((e) => (
                <tr key={e.id} className="border-t border-slate-100">
                  <td className="px-6 py-3 font-medium text-navy">{e.property}</td>
                  <td className="max-w-xs px-6 py-3 text-slate-500">{e.workDone}</td>
                  <td className="px-6 py-3 text-slate-500">
                    {e.laborCost.toLocaleString()}
                  </td>
                  <td className="px-6 py-3 text-slate-500">
                    {e.itemCost.toLocaleString()}
                  </td>
                  <td className="px-6 py-3 font-medium text-red-600">
                    {e.total.toLocaleString()}
                  </td>
                  <td className="px-6 py-3 text-slate-500">{e.date}</td>
                </tr>
              ))}
              {expenseBreakdown.length === 0 && (
                <tr>
                  <td colSpan={6} className="px-6 py-8 text-center text-slate-400">
                    No completed maintenance costs in this period.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}

      <div className="overflow-x-auto rounded-xl border border-slate-200 bg-white shadow-sm">
        {reportId === "rental-history" && (
          <ReportTable
            columns={activeColumns as Column<Lease>[]}
            rows={rentalHistory}
            getKey={(l) => l.id}
            emptyMessage="No leases match these filters."
          />
        )}

        {reportId === "payment-history" && (
          <ReportTable
            columns={activeColumns as Column<Payment>[]}
            rows={paymentHistory}
            getKey={(p) => p.id}
            emptyMessage="No payments match these filters."
          />
        )}

        {reportId === "occupancy" && (
          <ReportTable
            columns={activeColumns as Column<Property>[]}
            rows={occupancy}
            getKey={(p) => p.id}
            emptyMessage="No properties match these filters."
          />
        )}

        {reportId === "maintenance-activity" && (
          <ReportTable
            columns={activeColumns as Column<MaintenanceRequest>[]}
            rows={maintenanceActivity}
            getKey={(m) => m.id}
            emptyMessage="No requests match these filters."
          />
        )}

        {reportId === "revenue-performance" && (
          <>
            <div className="flex items-center justify-between border-b border-slate-100 px-6 py-4">
              <p className="text-sm font-medium text-slate-500">Total collected</p>
              <p className="text-lg font-bold text-navy">
                {revenueTotal.toLocaleString()} RWF
              </p>
            </div>
            <ReportTable
              columns={activeColumns as Column<Payment>[]}
              rows={revenuePerformance}
              getKey={(p) => p.id}
              emptyMessage="No revenue matches these filters."
            />
          </>
        )}
      </div>
    </div>
  );
}
