"use client";

import { useEffect, useRef, useState } from "react";
import { CheckCircle2, Columns3, Download } from "lucide-react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Legend,
  Pie,
  PieChart,
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
import { SummaryCard } from "@/components/dashboard/SummaryCard";
import { EmptyRow, Table, TBody, Td, Th, THead, Tr } from "@/components/dashboard/Table";
import { DEFAULT_PAGE_SIZE, Pagination } from "@/components/dashboard/Pagination";
import { downloadCSV } from "@/lib/csv";
import { formatMoney } from "@/lib/money";
import { useLanguage } from "@/lib/i18n/LanguageContext";
import type { Translations } from "@/lib/i18n/translations";

const REPORT_TYPES = [
  { id: "rental-history", labelKey: "rentalHistory", hasDateFilter: true, hasPropertyFilter: true },
  { id: "payment-history", labelKey: "paymentHistory", hasDateFilter: true, hasPropertyFilter: true },
  { id: "occupancy", labelKey: "occupancy", hasDateFilter: false, hasPropertyFilter: true },
  { id: "maintenance-activity", labelKey: "maintenanceActivity", hasDateFilter: true, hasPropertyFilter: true },
  { id: "revenue-performance", labelKey: "revenuePerformance", hasDateFilter: true, hasPropertyFilter: true },
] as const satisfies readonly {
  id: string;
  labelKey: keyof Translations["dashboard"]["landlord"]["reports"]["reportTypes"];
  hasDateFilter: boolean;
  hasPropertyFilter: boolean;
}[];

type ReportId = (typeof REPORT_TYPES)[number]["id"];

const PAYMENT_REPORT_IDS: ReportId[] = ["payment-history", "revenue-performance"];

type Column<T> = {
  key: string;
  label: string;
  cell: (row: T) => React.ReactNode;
  csv: (row: T) => string | number;
};

const LEASE_STATUS_KEY: Record<string, keyof Translations["dashboard"]["status"]> = {
  Active: "active",
  "Renewal Requested": "renewalRequested",
  "Termination Requested": "terminationRequested",
  Terminated: "terminated",
  Expired: "expired",
};

const PAYMENT_STATUS_KEY: Record<string, keyof Translations["dashboard"]["status"]> = {
  Paid: "paid",
  Late: "late",
  Pending: "pending",
  "Pending Approval": "pendingApproval",
};

const AVAILABILITY_KEY: Record<string, keyof Translations["dashboard"]["status"]> = {
  Available: "available",
  Occupied: "occupied",
};

const APPROVAL_KEY: Record<string, keyof Translations["dashboard"]["status"]> = {
  Approved: "approved",
  Pending: "pending",
  Rejected: "rejected",
};

const PROPERTY_TYPE_KEY: Record<string, keyof Translations["dashboard"]["status"]> = {
  House: "house",
  Apartment: "apartment",
  "Unit (Door)": "unitDoor",
  Unit: "unit",
};

const MAINTENANCE_STATUS_KEY: Record<string, keyof Translations["dashboard"]["status"]> = {
  Submitted: "submitted",
  Assigned: "assigned",
  "In Progress": "inProgress",
  Completed: "completed",
};

const PRIORITY_KEY: Record<string, keyof Translations["dashboard"]["status"]> = {
  Low: "low",
  Medium: "medium",
  High: "high",
};

function getRentalHistoryColumns(t: Translations): Column<Lease>[] {
  const openEnded = t.dashboard.admin.leases.openEnded;
  return [
    { key: "tenant", label: t.dashboard.table.tenant, cell: (l) => l.tenant, csv: (l) => l.tenant },
    { key: "property", label: t.dashboard.table.property, cell: (l) => l.property, csv: (l) => l.property },
    { key: "rent", label: t.dashboard.table.rentRwf, cell: (l) => formatMoney(l.rent), csv: (l) => l.rent },
    { key: "start", label: t.dashboard.table.start, cell: (l) => l.startDate, csv: (l) => l.startDate },
    {
      key: "end",
      label: t.dashboard.table.end,
      cell: (l) => l.endDate ?? openEnded,
      csv: (l) => l.endDate ?? openEnded,
    },
    {
      key: "status",
      label: t.dashboard.table.status,
      cell: (l) => t.dashboard.status[LEASE_STATUS_KEY[l.status]],
      csv: (l) => l.status,
    },
  ];
}

function getPaymentHistoryColumns(t: Translations): Column<Payment>[] {
  return [
    { key: "tenant", label: t.dashboard.table.tenant, cell: (p) => p.tenant, csv: (p) => p.tenant },
    { key: "property", label: t.dashboard.table.property, cell: (p) => p.property, csv: (p) => p.property },
    {
      key: "amount",
      label: t.dashboard.table.amountRwf,
      cell: (p) => formatMoney(p.amount),
      csv: (p) => p.amount,
    },
    { key: "method", label: t.dashboard.table.method, cell: (p) => p.method, csv: (p) => p.method },
    { key: "dueDate", label: t.dashboard.table.dueDate, cell: (p) => p.dueDate, csv: (p) => p.dueDate },
    {
      key: "paidDate",
      label: t.dashboard.table.paidDate,
      cell: (p) => p.paidDate ?? "—",
      csv: (p) => p.paidDate ?? "—",
    },
    {
      key: "status",
      label: t.dashboard.table.status,
      cell: (p) => t.dashboard.status[PAYMENT_STATUS_KEY[p.status]],
      csv: (p) => p.status,
    },
  ];
}

function getOccupancyColumns(t: Translations): Column<Property>[] {
  return [
    { key: "property", label: t.dashboard.table.property, cell: (p) => p.name, csv: (p) => p.name },
    {
      key: "type",
      label: t.dashboard.table.type,
      cell: (p) => t.dashboard.status[PROPERTY_TYPE_KEY[p.type] ?? "unit"],
      csv: (p) => p.type,
    },
    {
      key: "availability",
      label: t.dashboard.table.availability,
      cell: (p) => t.dashboard.status[AVAILABILITY_KEY[p.availability]],
      csv: (p) => p.availability,
    },
    {
      key: "approval",
      label: t.dashboard.table.approval,
      cell: (p) => t.dashboard.status[APPROVAL_KEY[p.approval]],
      csv: (p) => p.approval,
    },
  ];
}

function getMaintenanceColumns(t: Translations): Column<MaintenanceRequest>[] {
  const workerTemplate = t.dashboard.admin.maintenance.workerCountTemplate;
  return [
    { key: "tenant", label: t.dashboard.table.tenant, cell: (m) => m.tenant, csv: (m) => m.tenant },
    { key: "property", label: t.dashboard.table.property, cell: (m) => m.property, csv: (m) => m.property },
    {
      key: "issue",
      label: t.dashboard.table.issue,
      cell: (m) => m.issue.join("; "),
      csv: (m) => m.issue.join("; "),
    },
    {
      key: "priority",
      label: t.dashboard.table.priority,
      cell: (m) => t.dashboard.status[PRIORITY_KEY[m.priority]],
      csv: (m) => m.priority,
    },
    {
      key: "status",
      label: t.dashboard.table.status,
      cell: (m) => t.dashboard.status[MAINTENANCE_STATUS_KEY[m.status]],
      csv: (m) => m.status,
    },
    {
      key: "assignedTo",
      label: t.dashboard.table.assignedTo,
      cell: (m) =>
        m.laborers.length > 0
          ? workerTemplate
              .replace("{count}", String(m.laborers.length))
              .replace("{plural}", m.laborers.length === 1 ? "" : "s")
          : "—",
      csv: (m) => m.laborers.map((l) => l.name).join("; ") || "—",
    },
    { key: "submitted", label: t.dashboard.table.submitted, cell: (m) => m.submittedAt, csv: (m) => m.submittedAt },
  ];
}

function getRevenueColumns(t: Translations): Column<Payment>[] {
  return [
    { key: "tenant", label: t.dashboard.table.tenant, cell: (p) => p.tenant, csv: (p) => p.tenant },
    { key: "property", label: t.dashboard.table.property, cell: (p) => p.property, csv: (p) => p.property },
    {
      key: "amount",
      label: t.dashboard.table.amountRwf,
      cell: (p) => formatMoney(p.amount),
      csv: (p) => p.amount,
    },
    { key: "method", label: t.dashboard.table.method, cell: (p) => p.method, csv: (p) => p.method },
    {
      key: "paidDate",
      label: t.dashboard.table.paidDate,
      cell: (p) => p.paidDate ?? "—",
      csv: (p) => p.paidDate ?? "—",
    },
  ];
}

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
    <Table variant="bare">
      <THead>
        <Tr>
          {columns.map((col) => (
            <Th key={col.key} className="px-6 py-3">
              {col.label}
            </Th>
          ))}
        </Tr>
      </THead>
      <TBody>
        {rows.map((row) => (
          <Tr key={getKey(row)}>
            {columns.map((col, i) => (
              <Td
                key={col.key}
                className={`px-6 py-3 ${i === 0 ? "font-medium text-navy" : "text-slate-500"}`}
              >
                {col.cell(row)}
              </Td>
            ))}
          </Tr>
        ))}
        {rows.length === 0 && <EmptyRow colSpan={columns.length}>{emptyMessage}</EmptyRow>}
      </TBody>
    </Table>
  );
}

const axisTick = { fontSize: 12, fill: CHART_TEXT_COLOR };

export default function LandlordReportsPage() {
  const { t } = useLanguage();
  const c = t.dashboard.landlord.reports;
  const { landlordName } = useLandlord();
  const [reportId, setReportId] = useState<ReportId>("rental-history");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");
  const [propertyFilter, setPropertyFilter] = useState(c.allProperties);
  const [notice, setNotice] = useState<string | null>(null);
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

  const propertyOptions = [c.allProperties, ...myPropertyNames];
  const activeReport = REPORT_TYPES.find((r) => r.id === reportId)!;

  const inRange = (date: string) =>
    (!dateFrom || date >= dateFrom) && (!dateTo || date <= dateTo);
  const matchesProperty = (propertyName: string) =>
    propertyFilter === c.allProperties || propertyName === propertyFilter;

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

  const occupancyData = [
    {
      name: t.dashboard.status.available,
      value: myProperties.filter((p) => p.availability === "Available").length,
    },
    {
      name: t.dashboard.status.occupied,
      value: myProperties.filter((p) => p.availability === "Occupied").length,
    },
  ];

  const paymentStatusData = (
    ["Paid", "Late", "Pending", "Pending Approval"] as const
  ).map((status) => ({
    name: t.dashboard.status[PAYMENT_STATUS_KEY[status]],
    value: myPayments.filter((p) => p.status === status).length,
  }));

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

  const activeReportRows: unknown[] =
    reportId === "rental-history"
      ? rentalHistory
      : reportId === "payment-history"
        ? paymentHistory
        : reportId === "occupancy"
          ? occupancy
          : reportId === "maintenance-activity"
            ? maintenanceActivity
            : revenuePerformance;

  const [page, setPage] = useState(1);
  const totalPages = Math.max(1, Math.ceil(activeReportRows.length / DEFAULT_PAGE_SIZE));
  useEffect(() => {
    if (page > totalPages) setPage(totalPages);
  }, [page, totalPages]);
  const paginate = <T,>(rows: T[]): T[] =>
    rows.slice((page - 1) * DEFAULT_PAGE_SIZE, page * DEFAULT_PAGE_SIZE);

  const [expensePage, setExpensePage] = useState(1);
  const expenseTotalPages = Math.max(
    1,
    Math.ceil(expenseBreakdown.length / DEFAULT_PAGE_SIZE),
  );
  useEffect(() => {
    if (expensePage > expenseTotalPages) setExpensePage(expenseTotalPages);
  }, [expensePage, expenseTotalPages]);
  const pagedExpenseBreakdown = expenseBreakdown.slice(
    (expensePage - 1) * DEFAULT_PAGE_SIZE,
    expensePage * DEFAULT_PAGE_SIZE,
  );

  const COLUMNS_BY_REPORT: Record<ReportId, Column<never>[]> = {
    "rental-history": getRentalHistoryColumns(t) as Column<never>[],
    "payment-history": getPaymentHistoryColumns(t) as Column<never>[],
    occupancy: getOccupancyColumns(t) as Column<never>[],
    "maintenance-activity": getMaintenanceColumns(t) as Column<never>[],
    "revenue-performance": getRevenueColumns(t) as Column<never>[],
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
        pad(`${c.totalIncome} (RWF)`, incomeForActiveReport),
        pad(`${c.totalExpenses} (RWF)`, expensesForActiveReport),
        pad(`${c.netProfit} (RWF)`, netProfitForActiveReport),
      ];

      if (expenseBreakdown.length > 0) {
        rows = [
          ...rows,
          Array(headers.length).fill(""),
          [`${c.expensesSourceTitle} (${c.completedMaintenanceCosts})`],
          [t.dashboard.table.property, c.workDone, c.laborCostRwf, c.itemCostRwf, c.totalRwf, c.date],
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
    setNotice(c.downloadedNotice.replace("{filename}", filename));
  };

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-bold text-navy">{c.title}</h1>
        <p className="mt-1 text-sm text-slate-500">
          {c.subtitle}
        </p>
      </div>

      {notice && (
        <div className="flex items-center gap-2 rounded-lg border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm font-medium text-emerald-700">
          <CheckCircle2 className="h-4 w-4" />
          {notice}
        </div>
      )}

      <div className="grid grid-cols-2 gap-5 lg:grid-cols-4">
        <SummaryCard
          label={c.totalCollected}
          value={`${formatMoney(totalCollected)} RWF`}
          accent="emerald"
        />
        <SummaryCard
          label={c.totalOutstanding}
          value={`${formatMoney(totalOutstanding)} RWF`}
          accent="red"
        />
        <SummaryCard label={c.occupancyRate} value={`${occupancyRate}%`} />
        <SummaryCard label={c.averageRent} value={`${formatMoney(averageRent)} RWF`} />
      </div>

      {revenueByMonth.length > 0 && (
        <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
          <p className="font-semibold text-navy">{c.revenueByMonth}</p>
          <ResponsiveContainer width="100%" height={240}>
            <BarChart data={revenueByMonth}>
              <CartesianGrid strokeDasharray="3 3" stroke={CHART_GRID_COLOR} />
              <XAxis dataKey="month" tick={axisTick} />
              <YAxis tick={axisTick} />
              <Tooltip formatter={(value) => `${formatMoney(Number(value))} RWF`} />
              <Bar dataKey="amount" fill={CHART_COLORS[0]} radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}

      {myProperties.length > 0 && (
        <div className="grid gap-5 lg:grid-cols-2">
          <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
            <p className="font-semibold text-navy">{c.occupancy}</p>
            <ResponsiveContainer width="100%" height={220}>
              <PieChart>
                <Pie
                  data={occupancyData}
                  dataKey="value"
                  nameKey="name"
                  innerRadius={50}
                  outerRadius={80}
                  paddingAngle={2}
                >
                  {occupancyData.map((entry, i) => (
                    <Cell
                      key={entry.name}
                      fill={CHART_COLORS[i % CHART_COLORS.length]}
                    />
                  ))}
                </Pie>
                <Tooltip />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </div>

          <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
            <p className="font-semibold text-navy">{c.paymentStatus}</p>
            <ResponsiveContainer width="100%" height={220}>
              <PieChart>
                <Pie
                  data={paymentStatusData}
                  dataKey="value"
                  nameKey="name"
                  innerRadius={50}
                  outerRadius={80}
                  paddingAngle={2}
                >
                  {paymentStatusData.map((entry, i) => (
                    <Cell
                      key={entry.name}
                      fill={CHART_COLORS[i % CHART_COLORS.length]}
                    />
                  ))}
                </Pie>
                <Tooltip />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}

      <div className="flex flex-wrap items-end gap-4 rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
        <label className="flex flex-col gap-1.5 text-sm font-medium text-slate-700">
          {c.reportTypeLabel}
          <select
            value={reportId}
            onChange={(e) => setReportId(e.target.value as ReportId)}
            className="rounded-lg border border-slate-300 px-3 py-2.5 text-sm text-navy focus:border-gold focus:outline-none"
          >
            {REPORT_TYPES.map((r) => (
              <option key={r.id} value={r.id}>
                {c.reportTypes[r.labelKey]}
              </option>
            ))}
          </select>
        </label>

        <label className="flex flex-col gap-1.5 text-sm font-medium text-slate-700">
          {c.fromLabel}
          <input
            type="date"
            value={dateFrom}
            onChange={(e) => setDateFrom(e.target.value)}
            disabled={!activeReport.hasDateFilter}
            className="rounded-lg border border-slate-300 px-3 py-2.5 text-sm text-navy focus:border-gold focus:outline-none disabled:cursor-not-allowed disabled:bg-slate-50 disabled:text-slate-300"
          />
        </label>

        <label className="flex flex-col gap-1.5 text-sm font-medium text-slate-700">
          {c.toLabel}
          <input
            type="date"
            value={dateTo}
            onChange={(e) => setDateTo(e.target.value)}
            disabled={!activeReport.hasDateFilter}
            className="rounded-lg border border-slate-300 px-3 py-2.5 text-sm text-navy focus:border-gold focus:outline-none disabled:cursor-not-allowed disabled:bg-slate-50 disabled:text-slate-300"
          />
        </label>

        <label className="flex flex-col gap-1.5 text-sm font-medium text-slate-700">
          {c.propertyLabel}
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
            {c.columns}
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
          {c.exportCsv}
        </button>
      </div>

      {PAYMENT_REPORT_IDS.includes(reportId) && (
        <div className="grid grid-cols-2 gap-5 sm:grid-cols-3">
          <SummaryCard
            label={c.totalIncome}
            value={`${formatMoney(incomeForActiveReport)} RWF`}
            accent="emerald"
          />
          <SummaryCard
            label={c.totalExpenses}
            value={`${formatMoney(expensesForActiveReport)} RWF`}
            accent="red"
            subtitle={c.completedMaintenanceCosts}
          />
          <SummaryCard
            label={c.netProfit}
            value={`${formatMoney(netProfitForActiveReport)} RWF`}
            accent={netProfitForActiveReport >= 0 ? "navy" : "red"}
          />
        </div>
      )}

      {PAYMENT_REPORT_IDS.includes(reportId) && (
        <div className="overflow-x-auto rounded-xl border border-slate-200 bg-white shadow-sm">
          <div className="border-b border-slate-100 px-6 py-4">
            <p className="font-semibold text-navy">{c.expensesSourceTitle}</p>
            <p className="mt-1 text-sm text-slate-500">
              {c.expensesSourceSubtitle}
            </p>
          </div>
          <Table variant="bare">
            <THead>
              <Tr>
                <Th className="px-6 py-3">{t.dashboard.table.property}</Th>
                <Th className="px-6 py-3">{c.workDone}</Th>
                <Th className="px-6 py-3">{c.laborCostRwf}</Th>
                <Th className="px-6 py-3">{c.itemCostRwf}</Th>
                <Th className="px-6 py-3">{c.totalRwf}</Th>
                <Th className="px-6 py-3">{c.date}</Th>
              </Tr>
            </THead>
            <TBody>
              {pagedExpenseBreakdown.map((e) => (
                <Tr key={e.id}>
                  <Td className="px-6 py-3 font-medium text-navy">{e.property}</Td>
                  <Td className="max-w-xs px-6 py-3 text-slate-500">{e.workDone}</Td>
                  <Td className="px-6 py-3 text-slate-500">
                    {formatMoney(e.laborCost)}
                  </Td>
                  <Td className="px-6 py-3 text-slate-500">
                    {formatMoney(e.itemCost)}
                  </Td>
                  <Td className="px-6 py-3 font-medium text-red-600">
                    {formatMoney(e.total)}
                  </Td>
                  <Td className="px-6 py-3 text-slate-500">{e.date}</Td>
                </Tr>
              ))}
              {pagedExpenseBreakdown.length === 0 && (
                <EmptyRow colSpan={6}>{c.noExpenses}</EmptyRow>
              )}
            </TBody>
          </Table>

          <Pagination
            page={expensePage}
            totalPages={expenseTotalPages}
            totalItems={expenseBreakdown.length}
            pageSize={DEFAULT_PAGE_SIZE}
            onPageChange={setExpensePage}
          />
        </div>
      )}

      <div className="overflow-x-auto rounded-xl border border-slate-200 bg-white shadow-sm">
        {reportId === "rental-history" && (
          <ReportTable
            columns={activeColumns as Column<Lease>[]}
            rows={paginate(rentalHistory)}
            getKey={(l) => l.id}
            emptyMessage={c.empty.leases}
          />
        )}

        {reportId === "payment-history" && (
          <ReportTable
            columns={activeColumns as Column<Payment>[]}
            rows={paginate(paymentHistory)}
            getKey={(p) => p.id}
            emptyMessage={c.empty.payments}
          />
        )}

        {reportId === "occupancy" && (
          <ReportTable
            columns={activeColumns as Column<Property>[]}
            rows={paginate(occupancy)}
            getKey={(p) => p.id}
            emptyMessage={c.empty.properties}
          />
        )}

        {reportId === "maintenance-activity" && (
          <ReportTable
            columns={activeColumns as Column<MaintenanceRequest>[]}
            rows={paginate(maintenanceActivity)}
            getKey={(m) => m.id}
            emptyMessage={c.empty.requests}
          />
        )}

        {reportId === "revenue-performance" && (
          <>
            <div className="flex items-center justify-between border-b border-slate-100 px-6 py-4">
              <p className="text-sm font-medium text-slate-500">{c.totalCollectedLabel}</p>
              <p className="text-lg font-bold text-navy">
                {formatMoney(revenueTotal)} RWF
              </p>
            </div>
            <ReportTable
              columns={activeColumns as Column<Payment>[]}
              rows={paginate(revenuePerformance)}
              getKey={(p) => p.id}
              emptyMessage={c.empty.revenue}
            />
          </>
        )}

        <Pagination
          page={page}
          totalPages={totalPages}
          totalItems={activeReportRows.length}
          pageSize={DEFAULT_PAGE_SIZE}
          onPageChange={setPage}
        />
      </div>
    </div>
  );
}
