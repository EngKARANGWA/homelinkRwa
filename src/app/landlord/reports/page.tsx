"use client";

import { useEffect, useRef, useState } from "react";
import { AlertCircle, CheckCircle2, Columns3, Download } from "lucide-react";
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
import { useAuth } from "@/components/auth/AuthContext";
import { getOwnerDashboard } from "@/lib/api/dashboard";
import { listProperties } from "@/lib/api/properties";
import {
  exportReport,
  getMaintenanceActivityReport,
  getOccupancyReport,
  getPaymentHistoryReport,
  getRentalHistoryReport,
  getRevenuePerformanceReport,
  type MaintenanceActivityRow,
  type OccupancyRow,
  type PaymentHistoryRow,
  type RentalHistoryRow,
  type ReportId,
  type RevenuePerformanceRow,
} from "@/lib/api/reports";
import { ApiError } from "@/lib/api/client";
import type { OwnerDashboard, Property } from "@/lib/api/types";
import { CHART_COLORS, CHART_GRID_COLOR, CHART_TEXT_COLOR } from "@/lib/chart-colors";
import { SummaryCard } from "@/components/dashboard/SummaryCard";
import { EmptyRow, Table, TBody, Td, Th, THead, Tr } from "@/components/dashboard/Table";
import { DEFAULT_PAGE_SIZE, Pagination } from "@/components/dashboard/Pagination";
import { formatMoney } from "@/lib/money";

const REPORT_TYPES: {
  id: ReportId;
  label: string;
  hasDateFilter: boolean;
  hasPropertyFilter: boolean;
}[] = [
  { id: "rental-history", label: "Rental History", hasDateFilter: true, hasPropertyFilter: true },
  { id: "payment-history", label: "Payment History", hasDateFilter: true, hasPropertyFilter: false },
  { id: "occupancy", label: "Occupancy", hasDateFilter: true, hasPropertyFilter: true },
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
    hasPropertyFilter: false,
  },
];

const INCOME_REPORT_IDS: ReportId[] = ["payment-history", "revenue-performance"];

type Column<T> = {
  key: string;
  label: string;
  cell: (row: T) => React.ReactNode;
};

const RENTAL_HISTORY_COLUMNS: Column<RentalHistoryRow>[] = [
  { key: "Property", label: "Property", cell: (r) => r.Property },
  { key: "Address", label: "Address", cell: (r) => r.Address },
  { key: "RentAmount", label: "Rent (RWF)", cell: (r) => formatMoney(Number(r.RentAmount)) },
  { key: "StartDate", label: "Start", cell: (r) => r.StartDate },
  { key: "EndDate", label: "End", cell: (r) => r.EndDate ?? "Open-ended" },
  { key: "Status", label: "Status", cell: (r) => r.Status },
];

const PAYMENT_HISTORY_COLUMNS: Column<PaymentHistoryRow>[] = [
  { key: "Date", label: "Date", cell: (r) => r.Date },
  { key: "Amount", label: "Amount (RWF)", cell: (r) => formatMoney(Number(r.Amount)) },
  { key: "Method", label: "Method", cell: (r) => r.Method },
  { key: "Status", label: "Status", cell: (r) => r.Status },
  { key: "Reference", label: "Reference", cell: (r) => r.Reference },
];

const OCCUPANCY_COLUMNS: Column<OccupancyRow>[] = [
  { key: "Property", label: "Property", cell: (r) => r.Property },
  { key: "Status", label: "Status", cell: (r) => r.Status },
  { key: "LeaseCount", label: "Leases", cell: (r) => r.LeaseCount },
  { key: "OccupiedDays", label: "Occupied Days", cell: (r) => r.OccupiedDays },
  { key: "PeriodDays", label: "Period Days", cell: (r) => r.PeriodDays },
  {
    key: "OccupancyRatePercent",
    label: "Occupancy Rate",
    cell: (r) => `${r.OccupancyRatePercent}%`,
  },
];

const MAINTENANCE_COLUMNS: Column<MaintenanceActivityRow>[] = [
  { key: "Property", label: "Property", cell: (r) => r.Property },
  { key: "Title", label: "Title", cell: (r) => r.Title },
  { key: "Status", label: "Status", cell: (r) => r.Status },
  { key: "ItemsCost", label: "Items Cost (RWF)", cell: (r) => formatMoney(Number(r.ItemsCost)) },
  { key: "LaborCost", label: "Labor Cost (RWF)", cell: (r) => formatMoney(Number(r.LaborCost)) },
  { key: "CreatedAt", label: "Created", cell: (r) => r.CreatedAt },
  { key: "CompletedAt", label: "Completed", cell: (r) => r.CompletedAt || "—" },
];

const REVENUE_COLUMNS: Column<RevenuePerformanceRow>[] = [
  { key: "Month", label: "Month", cell: (r) => r.Month },
  { key: "Revenue", label: "Revenue (RWF)", cell: (r) => formatMoney(Number(r.Revenue)) },
];

const COLUMNS_BY_REPORT: Record<ReportId, Column<never>[]> = {
  "rental-history": RENTAL_HISTORY_COLUMNS as Column<never>[],
  "payment-history": PAYMENT_HISTORY_COLUMNS as Column<never>[],
  occupancy: OCCUPANCY_COLUMNS as Column<never>[],
  "maintenance-activity": MAINTENANCE_COLUMNS as Column<never>[],
  "revenue-performance": REVENUE_COLUMNS as Column<never>[],
};

function ReportTable<T>({
  columns,
  rows,
  emptyMessage,
}: {
  columns: Column<T>[];
  rows: T[];
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
        {rows.map((row, i) => (
          <Tr key={i}>
            {columns.map((col, j) => (
              <Td
                key={col.key}
                className={`px-6 py-3 ${j === 0 ? "font-medium text-navy" : "text-slate-500"}`}
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
  const { user } = useAuth();
  const [reportId, setReportId] = useState<ReportId>("rental-history");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");
  const [propertyFilter, setPropertyFilter] = useState("All Properties");
  const [notice, setNotice] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [hiddenColumns, setHiddenColumns] = useState<Record<ReportId, Set<string>>>({
    "rental-history": new Set(),
    "payment-history": new Set(),
    occupancy: new Set(),
    "maintenance-activity": new Set(),
    "revenue-performance": new Set(),
  });
  const [columnsMenuOpen, setColumnsMenuOpen] = useState(false);
  const columnsMenuRef = useRef<HTMLDivElement>(null);

  const [dashboard, setDashboard] = useState<OwnerDashboard | null>(null);
  const [properties, setProperties] = useState<Property[]>([]);
  const [revenueByMonth, setRevenueByMonth] = useState<RevenuePerformanceRow[]>([]);
  const [paymentStatusRows, setPaymentStatusRows] = useState<PaymentHistoryRow[]>([]);

  const [isLoading, setLoading] = useState(true);
  const [rows, setRows] = useState<unknown[]>([]);
  const [expenseRows, setExpenseRows] = useState<MaintenanceActivityRow[]>([]);
  const [reportSummary, setReportSummary] = useState<Record<string, unknown>>({});

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (columnsMenuRef.current && !columnsMenuRef.current.contains(e.target as Node)) {
        setColumnsMenuOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Page-level KPIs and charts — independent of the report selector/date filter.
  useEffect(() => {
    if (!user) return;
    Promise.all([
      getOwnerDashboard(),
      listProperties({ ownerId: user.id, limit: 100 }),
      getRevenuePerformanceReport(),
      getPaymentHistoryReport(),
    ])
      .then(([dash, propertiesRes, revenue, paymentHistory]) => {
        setDashboard(dash);
        setProperties(propertiesRes.data);
        setRevenueByMonth(revenue.rows);
        setPaymentStatusRows(paymentHistory.rows);
      })
      .catch((err) =>
        setError(err instanceof ApiError ? err.message : "Failed to load report data."),
      );
  }, [user]);

  const activeReport = REPORT_TYPES.find((r) => r.id === reportId)!;
  const range = { from: dateFrom || undefined, to: dateTo || undefined };

  // The selected report's rows — refetched whenever the report type or date range changes.
  useEffect(() => {
    if (!user) return;
    setLoading(true);
    setError(null);
    const loadReport = async () => {
      switch (reportId) {
        case "rental-history": {
          const res = await getRentalHistoryReport(range);
          setRows(res.rows);
          setReportSummary(res.summary ?? {});
          break;
        }
        case "payment-history": {
          const res = await getPaymentHistoryReport(range);
          setRows(res.rows);
          setReportSummary(res.summary ?? {});
          break;
        }
        case "occupancy": {
          const res = await getOccupancyReport(range);
          setRows(res.rows);
          setReportSummary(res.summary ?? {});
          break;
        }
        case "maintenance-activity": {
          const res = await getMaintenanceActivityReport(range);
          setRows(res.rows);
          setReportSummary(res.summary ?? {});
          break;
        }
        case "revenue-performance": {
          const res = await getRevenuePerformanceReport(range);
          setRows(res.rows);
          setReportSummary(res.summary ?? {});
          break;
        }
      }
      if (INCOME_REPORT_IDS.includes(reportId)) {
        const maintenance = await getMaintenanceActivityReport(range);
        setExpenseRows(maintenance.rows);
      } else {
        setExpenseRows([]);
      }
    };
    loadReport()
      .catch((err) => setError(err instanceof ApiError ? err.message : "Failed to load report."))
      .finally(() => setLoading(false));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user, reportId, dateFrom, dateTo]);

  const propertyOptions = ["All Properties", ...properties.map((p) => p.title)];

  const hasPropertyField = (row: unknown): row is { Property: string } =>
    typeof row === "object" && row !== null && "Property" in row;

  const filteredRows =
    activeReport.hasPropertyFilter && propertyFilter !== "All Properties"
      ? rows.filter((row) => hasPropertyField(row) && row.Property === propertyFilter)
      : rows;

  const totalCollected = dashboard?.revenue.thisYear ?? 0;
  const totalOutstanding = dashboard?.outstandingRent ?? 0;
  const occupancyRate = dashboard?.occupancy.occupancyRatePercent ?? 0;
  const averageRent = properties.length
    ? Math.round(
        properties.reduce((sum, p) => sum + Number(p.rentAmount), 0) / properties.length,
      )
    : 0;

  const occupancyData = [
    { name: "Available", value: properties.filter((p) => p.status === "available").length },
    { name: "Occupied", value: properties.filter((p) => p.status === "occupied").length },
  ];

  const paymentStatusData = (["pending", "success", "failed"] as const).map((status) => ({
    name: status,
    value: paymentStatusRows.filter((p) => p.Status === status).length,
  }));

  const income =
    reportId === "payment-history"
      ? Number(reportSummary.totalAmount ?? 0)
      : reportId === "revenue-performance"
        ? Number(reportSummary.totalRevenue ?? 0)
        : 0;
  const expenses = expenseRows.reduce((sum, r) => sum + Number(r.ItemsCost) + Number(r.LaborCost), 0);
  const netProfit = income - expenses;

  const [page, setPage] = useState(1);
  const totalPages = Math.max(1, Math.ceil(filteredRows.length / DEFAULT_PAGE_SIZE));
  useEffect(() => {
    if (page > totalPages) setPage(totalPages);
  }, [page, totalPages]);
  const pagedRows = filteredRows.slice((page - 1) * DEFAULT_PAGE_SIZE, page * DEFAULT_PAGE_SIZE);

  const [expensePage, setExpensePage] = useState(1);
  const expenseTotalPages = Math.max(1, Math.ceil(expenseRows.length / DEFAULT_PAGE_SIZE));
  useEffect(() => {
    if (expensePage > expenseTotalPages) setExpensePage(expenseTotalPages);
  }, [expensePage, expenseTotalPages]);
  const pagedExpenseRows = expenseRows.slice(
    (expensePage - 1) * DEFAULT_PAGE_SIZE,
    expensePage * DEFAULT_PAGE_SIZE,
  );

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

  const handleExport = async () => {
    setError(null);
    try {
      await exportReport(reportId, range);
      setNotice(`${reportId}.xlsx downloaded — check your browser's Downloads.`);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Failed to export report.");
    }
  };

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-bold text-navy">Reports</h1>
        <p className="mt-1 text-sm text-slate-500">
          Rent collection, occupancy, and performance across your properties.
        </p>
      </div>

      {notice && (
        <div className="flex items-center gap-2 rounded-lg border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm font-medium text-emerald-700">
          <CheckCircle2 className="h-4 w-4" />
          {notice}
        </div>
      )}

      {error && (
        <div className="flex items-center gap-2 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-700">
          <AlertCircle className="h-4 w-4" />
          {error}
        </div>
      )}

      <div className="grid grid-cols-2 gap-5 lg:grid-cols-4">
        <SummaryCard
          label="Total Collected"
          value={`${formatMoney(totalCollected)} RWF`}
          subtitle="This year"
          accent="emerald"
        />
        <SummaryCard
          label="Total Outstanding"
          value={`${formatMoney(totalOutstanding)} RWF`}
          accent="red"
        />
        <SummaryCard label="Occupancy Rate" value={`${occupancyRate}%`} />
        <SummaryCard label="Average Rent" value={`${formatMoney(averageRent)} RWF`} />
      </div>

      {revenueByMonth.length > 0 && (
        <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
          <p className="font-semibold text-navy">Revenue Collected by Month</p>
          <ResponsiveContainer width="100%" height={240}>
            <BarChart data={revenueByMonth}>
              <CartesianGrid strokeDasharray="3 3" stroke={CHART_GRID_COLOR} />
              <XAxis dataKey="Month" tick={axisTick} />
              <YAxis tick={axisTick} />
              <Tooltip formatter={(value) => `${formatMoney(Number(value))} RWF`} />
              <Bar dataKey="Revenue" fill={CHART_COLORS[0]} radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}

      {properties.length > 0 && (
        <div className="grid gap-5 lg:grid-cols-2">
          <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
            <p className="font-semibold text-navy">Occupancy</p>
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
                    <Cell key={entry.name} fill={CHART_COLORS[i % CHART_COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </div>

          <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
            <p className="font-semibold text-navy">Payment Status</p>
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
                    <Cell key={entry.name} fill={CHART_COLORS[i % CHART_COLORS.length]} />
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
          Report type
          <select
            value={reportId}
            onChange={(e) => {
              setReportId(e.target.value as ReportId);
              setPropertyFilter("All Properties");
            }}
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
          Export Excel
        </button>
      </div>

      {INCOME_REPORT_IDS.includes(reportId) && (
        <div className="grid grid-cols-2 gap-5 sm:grid-cols-3">
          <SummaryCard label="Total Income" value={`${formatMoney(income)} RWF`} accent="emerald" />
          <SummaryCard
            label="Total Expenses"
            value={`${formatMoney(expenses)} RWF`}
            accent="red"
            subtitle="Maintenance costs in this period"
          />
          <SummaryCard
            label="Net Profit"
            value={`${formatMoney(netProfit)} RWF`}
            accent={netProfit >= 0 ? "navy" : "red"}
          />
        </div>
      )}

      {INCOME_REPORT_IDS.includes(reportId) && (
        <div className="overflow-x-auto rounded-xl border border-slate-200 bg-white shadow-sm">
          <div className="border-b border-slate-100 px-6 py-4">
            <p className="font-semibold text-navy">Where your expenses come from</p>
            <p className="mt-1 text-sm text-slate-500">
              Maintenance costs on your properties in this period.
            </p>
          </div>
          <Table variant="bare">
            <THead>
              <Tr>
                <Th className="px-6 py-3">Property</Th>
                <Th className="px-6 py-3">Title</Th>
                <Th className="px-6 py-3">Labor Cost (RWF)</Th>
                <Th className="px-6 py-3">Items Cost (RWF)</Th>
                <Th className="px-6 py-3">Total (RWF)</Th>
                <Th className="px-6 py-3">Date</Th>
              </Tr>
            </THead>
            <TBody>
              {pagedExpenseRows.map((e, i) => (
                <Tr key={i}>
                  <Td className="px-6 py-3 font-medium text-navy">{e.Property}</Td>
                  <Td className="max-w-xs px-6 py-3 text-slate-500">{e.Title}</Td>
                  <Td className="px-6 py-3 text-slate-500">{formatMoney(Number(e.LaborCost))}</Td>
                  <Td className="px-6 py-3 text-slate-500">{formatMoney(Number(e.ItemsCost))}</Td>
                  <Td className="px-6 py-3 font-medium text-red-600">
                    {formatMoney(Number(e.ItemsCost) + Number(e.LaborCost))}
                  </Td>
                  <Td className="px-6 py-3 text-slate-500">{e.CreatedAt}</Td>
                </Tr>
              ))}
              {pagedExpenseRows.length === 0 && (
                <EmptyRow colSpan={6}>No maintenance costs in this period.</EmptyRow>
              )}
            </TBody>
          </Table>

          <Pagination
            page={expensePage}
            totalPages={expenseTotalPages}
            totalItems={expenseRows.length}
            pageSize={DEFAULT_PAGE_SIZE}
            onPageChange={setExpensePage}
          />
        </div>
      )}

      <div className="overflow-x-auto rounded-xl border border-slate-200 bg-white shadow-sm">
        {isLoading ? (
          <div className="px-6 py-10 text-center text-sm text-slate-500">Loading report...</div>
        ) : (
          <ReportTable
            columns={activeColumns as Column<unknown>[]}
            rows={pagedRows}
            emptyMessage="No rows match these filters."
          />
        )}

        <Pagination
          page={page}
          totalPages={totalPages}
          totalItems={filteredRows.length}
          pageSize={DEFAULT_PAGE_SIZE}
          onPageChange={setPage}
        />
      </div>
    </div>
  );
}
