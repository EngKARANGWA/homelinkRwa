"use client";

import { useEffect, useRef, useState } from "react";
import { AlertCircle, CheckCircle2, Columns3, Download } from "lucide-react";
import { listProperties } from "@/lib/api/properties";
import {
  exportReport,
  getAgentPerformanceReport,
  getLandlordPerformanceReport,
  getMaintenanceActivityReport,
  getOccupancyReport,
  getPaymentHistoryReport,
  getRentalHistoryReport,
  getRevenuePerformanceReport,
  type AgentPerformanceRow,
  type LandlordPerformanceRow,
  type MaintenanceActivityRow,
  type OccupancyRow,
  type PaymentHistoryRow,
  type RentalHistoryRow,
  type ReportId,
  type RevenuePerformanceRow,
} from "@/lib/api/reports";
import { ApiError } from "@/lib/api/client";
import type { Property } from "@/lib/api/types";
import { EmptyRow, Table, TBody, Td, Th, THead, Tr } from "@/components/dashboard/Table";
import { DEFAULT_PAGE_SIZE, Pagination } from "@/components/dashboard/Pagination";
import { formatMoney } from "@/lib/money";
import { useLanguage } from "@/lib/i18n/LanguageContext";
import type { Translations } from "@/lib/i18n/translations";

const REPORT_TYPES: {
  id: ReportId;
  labelKey: keyof Translations["dashboard"]["admin"]["reports"]["reportTypes"];
  hasDateFilter: boolean;
  hasPropertyFilter: boolean;
}[] = [
  { id: "rental-history", labelKey: "rentalHistory", hasDateFilter: true, hasPropertyFilter: true },
  { id: "payment-history", labelKey: "paymentHistory", hasDateFilter: true, hasPropertyFilter: false },
  { id: "occupancy", labelKey: "occupancy", hasDateFilter: true, hasPropertyFilter: true },
  { id: "maintenance-activity", labelKey: "maintenanceActivity", hasDateFilter: true, hasPropertyFilter: true },
  { id: "revenue-performance", labelKey: "revenuePerformance", hasDateFilter: true, hasPropertyFilter: false },
  { id: "agent-performance", labelKey: "agentPerformance", hasDateFilter: true, hasPropertyFilter: false },
  { id: "landlord-performance", labelKey: "landlordPerformance", hasDateFilter: false, hasPropertyFilter: false },
];

type Column<T> = {
  key: string;
  label: string;
  cell: (row: T) => React.ReactNode;
};

function getRentalHistoryColumns(t: Translations): Column<RentalHistoryRow>[] {
  const rc = t.dashboard.admin.reports.reportColumns;
  return [
    { key: "Property", label: t.dashboard.table.property, cell: (r) => r.Property },
    { key: "Address", label: rc.address, cell: (r) => r.Address },
    { key: "RentAmount", label: t.dashboard.table.rentRwf, cell: (r) => formatMoney(Number(r.RentAmount)) },
    { key: "StartDate", label: t.dashboard.table.start, cell: (r) => r.StartDate },
    { key: "EndDate", label: t.dashboard.table.end, cell: (r) => r.EndDate ?? rc.openEnded },
    { key: "Status", label: t.dashboard.table.status, cell: (r) => r.Status },
  ];
}

function getPaymentHistoryColumns(t: Translations): Column<PaymentHistoryRow>[] {
  const rc = t.dashboard.admin.reports.reportColumns;
  return [
    { key: "Date", label: t.dashboard.table.date, cell: (r) => r.Date },
    { key: "Amount", label: t.dashboard.table.amountRwf, cell: (r) => formatMoney(Number(r.Amount)) },
    { key: "Method", label: t.dashboard.table.method, cell: (r) => r.Method },
    { key: "Status", label: t.dashboard.table.status, cell: (r) => r.Status },
    { key: "Reference", label: rc.reference, cell: (r) => r.Reference },
  ];
}

function getOccupancyColumns(t: Translations): Column<OccupancyRow>[] {
  const rc = t.dashboard.admin.reports.reportColumns;
  return [
    { key: "Property", label: t.dashboard.table.property, cell: (r) => r.Property },
    { key: "Status", label: t.dashboard.table.status, cell: (r) => r.Status },
    { key: "LeaseCount", label: rc.leaseCount, cell: (r) => r.LeaseCount },
    { key: "OccupiedDays", label: rc.occupiedDays, cell: (r) => r.OccupiedDays },
    { key: "PeriodDays", label: rc.periodDays, cell: (r) => r.PeriodDays },
    { key: "OccupancyRatePercent", label: rc.occupancyRate, cell: (r) => `${r.OccupancyRatePercent}%` },
  ];
}

function getMaintenanceColumns(t: Translations): Column<MaintenanceActivityRow>[] {
  const rc = t.dashboard.admin.reports.reportColumns;
  return [
    { key: "Property", label: t.dashboard.table.property, cell: (r) => r.Property },
    { key: "Title", label: rc.title, cell: (r) => r.Title },
    { key: "Status", label: t.dashboard.table.status, cell: (r) => r.Status },
    { key: "ItemsCost", label: t.dashboard.table.amountRwf, cell: (r) => formatMoney(Number(r.ItemsCost)) },
    { key: "LaborCost", label: rc.revenueRwf, cell: (r) => formatMoney(Number(r.LaborCost)) },
    { key: "CreatedAt", label: rc.createdDate, cell: (r) => r.CreatedAt },
    { key: "CompletedAt", label: rc.completedDate, cell: (r) => r.CompletedAt || "—" },
  ];
}

function getRevenueColumns(t: Translations): Column<RevenuePerformanceRow>[] {
  const rc = t.dashboard.admin.reports.reportColumns;
  return [
    { key: "Month", label: rc.month, cell: (r) => r.Month },
    { key: "Revenue", label: rc.revenueRwf, cell: (r) => formatMoney(Number(r.Revenue)) },
  ];
}

function getAgentColumns(t: Translations): Column<AgentPerformanceRow>[] {
  const rc = t.dashboard.admin.reports.reportColumns;
  return [
    { key: "Agent", label: rc.agent, cell: (r) => r.Agent },
    { key: "PropertiesManaged", label: rc.propertiesManaged, cell: (r) => r.PropertiesManaged },
    { key: "ApprovedListings", label: rc.approvedListings, cell: (r) => r.ApprovedListings },
    { key: "RejectedListings", label: rc.rejectedListings, cell: (r) => r.RejectedListings },
    { key: "PendingListings", label: rc.pendingListings, cell: (r) => r.PendingListings },
    { key: "ActiveLeases", label: rc.activeLeases, cell: (r) => r.ActiveLeases },
  ];
}

function getLandlordColumns(t: Translations): Column<LandlordPerformanceRow>[] {
  return [
    { key: "Name", label: t.dashboard.table.name, cell: (r) => r.Name },
    { key: "Email", label: t.dashboard.table.email, cell: (r) => r.Email },
    { key: "Phone", label: t.dashboard.table.phone, cell: (r) => r.Phone },
    { key: "Properties", label: t.dashboard.table.properties, cell: (r) => r.Properties },
    { key: "Status", label: t.dashboard.table.status, cell: (r) => r.Status },
    { key: "Registered", label: t.dashboard.table.registered, cell: (r) => r.Registered },
  ];
}

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
              <Td key={col.key} className={`px-6 py-3 ${j === 0 ? "font-medium text-navy" : "text-slate-500"}`}>
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

export default function AdminReportsPage() {
  const { t } = useLanguage();
  const c = t.dashboard.admin.reports;
  const [reportId, setReportId] = useState<ReportId>("rental-history");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");
  const [propertyFilter, setPropertyFilter] = useState(c.allProperties);
  const [notice, setNotice] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [properties, setProperties] = useState<Property[]>([]);

  const emptyHidden = (): Record<ReportId, Set<string>> => ({
    "rental-history": new Set(),
    "payment-history": new Set(),
    occupancy: new Set(),
    "maintenance-activity": new Set(),
    "revenue-performance": new Set(),
    "agent-performance": new Set(),
    "landlord-performance": new Set(),
  });
  const [hiddenColumns, setHiddenColumns] = useState<Record<ReportId, Set<string>>>(emptyHidden());
  const [columnsMenuOpen, setColumnsMenuOpen] = useState(false);
  const columnsMenuRef = useRef<HTMLDivElement>(null);

  const [isLoading, setLoading] = useState(true);
  const [rows, setRows] = useState<unknown[]>([]);
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

  // Property list for the filter dropdown — platform-wide, not owner-scoped.
  useEffect(() => {
    listProperties({ limit: 100 })
      .then((res) => setProperties(res.data))
      .catch((err) => setError(err instanceof ApiError ? err.message : "Failed to load properties."));
  }, []);

  const activeReport = REPORT_TYPES.find((r) => r.id === reportId)!;
  const range = { from: dateFrom || undefined, to: dateTo || undefined };

  useEffect(() => {
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
        case "agent-performance": {
          const res = await getAgentPerformanceReport(range);
          setRows(res.rows);
          setReportSummary(res.summary ?? {});
          break;
        }
        case "landlord-performance": {
          const res = await getLandlordPerformanceReport();
          setRows(res.rows);
          setReportSummary(res.summary ?? {});
          break;
        }
      }
    };
    loadReport()
      .catch((err) => setError(err instanceof ApiError ? err.message : "Failed to load report."))
      .finally(() => setLoading(false));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [reportId, dateFrom, dateTo]);

  const propertyOptions = [c.allProperties, ...properties.map((p) => p.title)];

  const hasPropertyField = (row: unknown): row is { Property: string } =>
    typeof row === "object" && row !== null && "Property" in row;

  const filteredRows =
    activeReport.hasPropertyFilter && propertyFilter !== c.allProperties
      ? rows.filter((row) => hasPropertyField(row) && row.Property === propertyFilter)
      : rows;

  const [page, setPage] = useState(1);
  const totalPages = Math.max(1, Math.ceil(filteredRows.length / DEFAULT_PAGE_SIZE));
  useEffect(() => {
    if (page > totalPages) setPage(totalPages);
  }, [page, totalPages]);
  const pagedRows = filteredRows.slice((page - 1) * DEFAULT_PAGE_SIZE, page * DEFAULT_PAGE_SIZE);

  const COLUMNS_BY_REPORT: Record<ReportId, Column<never>[]> = {
    "rental-history": getRentalHistoryColumns(t) as Column<never>[],
    "payment-history": getPaymentHistoryColumns(t) as Column<never>[],
    occupancy: getOccupancyColumns(t) as Column<never>[],
    "maintenance-activity": getMaintenanceColumns(t) as Column<never>[],
    "revenue-performance": getRevenueColumns(t) as Column<never>[],
    "agent-performance": getAgentColumns(t) as Column<never>[],
    "landlord-performance": getLandlordColumns(t) as Column<never>[],
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

  const activeColumns = COLUMNS_BY_REPORT[reportId].filter((col) => !hiddenColumns[reportId].has(col.key));

  const handleExport = async () => {
    setError(null);
    try {
      await exportReport(reportId, range);
      setNotice(c.downloadedNotice.replace("{filename}", `${reportId}.xlsx`));
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Failed to export report.");
    }
  };

  const summaryEntries = Object.entries(reportSummary).filter(([, v]) => typeof v !== "object");

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-bold text-navy">{c.title}</h1>
        <p className="mt-1 text-sm text-slate-500">{c.subtitle}</p>
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

      <div className="flex flex-wrap items-end gap-4 rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
        <label className="flex flex-col gap-1.5 text-sm font-medium text-slate-700">
          {c.reportTypeLabel}
          <select
            value={reportId}
            onChange={(e) => {
              setReportId(e.target.value as ReportId);
              setPropertyFilter(c.allProperties);
              setPage(1);
            }}
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

      {summaryEntries.length > 0 && (
        <div className="flex flex-wrap gap-5 rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
          {summaryEntries.map(([key, value]) => (
            <div key={key} className="flex flex-col">
              <span className="text-xs font-medium uppercase tracking-wide text-slate-400">
                {key.replace(/([a-z])([A-Z])/g, "$1 $2")}
              </span>
              <span className="text-lg font-bold text-navy">{String(value)}</span>
            </div>
          ))}
        </div>
      )}

      <div className="overflow-x-auto rounded-xl border border-slate-200 bg-white shadow-sm">
        {isLoading ? (
          <div className="px-6 py-10 text-center text-sm text-slate-500">{c.reportColumns.loadingReport}</div>
        ) : (
          <ReportTable
            columns={activeColumns as Column<unknown>[]}
            rows={pagedRows}
            emptyMessage={c.reportColumns.noRowsMatch}
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
