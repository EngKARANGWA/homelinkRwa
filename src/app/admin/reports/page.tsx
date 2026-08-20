"use client";

import { useEffect, useState } from "react";
import { CheckCircle2, Download } from "lucide-react";
import {
  LANDLORDS,
  LEASES,
  MAINTENANCE_REQUESTS,
  PAYMENTS,
  PROPERTIES,
} from "@/lib/mock-admin-data";
import { downloadCSV } from "@/lib/csv";
import { EmptyRow, Table, TBody, Td, Th, THead, Tr } from "@/components/dashboard/Table";
import { DEFAULT_PAGE_SIZE, Pagination } from "@/components/dashboard/Pagination";
import { formatMoney } from "@/lib/money";
import { useLanguage } from "@/lib/i18n/LanguageContext";
import type { Translations } from "@/lib/i18n/translations";

const REPORT_TYPES = [
  {
    id: "rental-history",
    labelKey: "rentalHistory",
    hasDateFilter: true,
    hasPropertyFilter: true,
  },
  {
    id: "payment-history",
    labelKey: "paymentHistory",
    hasDateFilter: true,
    hasPropertyFilter: true,
  },
  {
    id: "occupancy",
    labelKey: "occupancy",
    hasDateFilter: false,
    hasPropertyFilter: true,
  },
  {
    id: "maintenance-activity",
    labelKey: "maintenanceActivity",
    hasDateFilter: true,
    hasPropertyFilter: true,
  },
  {
    id: "revenue-performance",
    labelKey: "revenuePerformance",
    hasDateFilter: true,
    hasPropertyFilter: true,
  },
  {
    id: "landlord-performance",
    labelKey: "landlordPerformance",
    hasDateFilter: false,
    hasPropertyFilter: false,
  },
] as const satisfies readonly {
  id: string;
  labelKey: keyof Translations["dashboard"]["admin"]["reports"]["reportTypes"];
  hasDateFilter: boolean;
  hasPropertyFilter: boolean;
}[];

type ReportId = (typeof REPORT_TYPES)[number]["id"];

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

const LANDLORD_STATUS_KEY: Record<string, keyof Translations["dashboard"]["status"]> = {
  Active: "active",
  Pending: "pending",
  Suspended: "suspended",
};

export default function ReportsPage() {
  const { t } = useLanguage();
  const c = t.dashboard.admin.reports;
  const PROPERTY_OPTIONS = [c.allProperties, ...PROPERTIES.map((p) => p.name)];
  const [reportId, setReportId] = useState<ReportId>("rental-history");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");
  const [propertyFilter, setPropertyFilter] = useState(c.allProperties);
  const [notice, setNotice] = useState<string | null>(null);

  const activeReport = REPORT_TYPES.find((r) => r.id === reportId)!;

  const inRange = (date: string) =>
    (!dateFrom || date >= dateFrom) && (!dateTo || date <= dateTo);
  const matchesProperty = (propertyName: string) =>
    propertyFilter === c.allProperties || propertyName === propertyFilter;

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

  const activeReportRows: unknown[] =
    reportId === "rental-history"
      ? rentalHistory
      : reportId === "payment-history"
        ? paymentHistory
        : reportId === "occupancy"
          ? occupancy
          : reportId === "maintenance-activity"
            ? maintenanceActivity
            : reportId === "revenue-performance"
              ? revenuePerformance
              : LANDLORDS;

  const [page, setPage] = useState(1);
  const totalPages = Math.max(1, Math.ceil(activeReportRows.length / DEFAULT_PAGE_SIZE));
  useEffect(() => {
    if (page > totalPages) setPage(totalPages);
  }, [page, totalPages]);
  const paginate = <T,>(rows: T[]): T[] =>
    rows.slice((page - 1) * DEFAULT_PAGE_SIZE, page * DEFAULT_PAGE_SIZE);

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
            l.endDate ?? "Open-ended",
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
            m.laborers.map((l) => l.name).join("; ") || "—",
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
    setNotice(c.downloadedNotice);
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
            {PROPERTY_OPTIONS.map((name) => (
              <option key={name}>{name}</option>
            ))}
          </select>
        </label>

        <button
          type="button"
          onClick={handleExport}
          className="ml-auto inline-flex items-center gap-2 rounded-lg bg-gold px-5 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-gold/90"
        >
          <Download className="h-4 w-4" />
          {c.exportCsv}
        </button>
      </div>

      <div className="overflow-x-auto rounded-xl border border-slate-200 bg-white shadow-sm">
        {reportId === "rental-history" && (
          <Table variant="bare">
            <THead>
              <Tr>
                <Th className="px-6 py-3">{t.dashboard.table.tenant}</Th>
                <Th className="px-6 py-3">{t.dashboard.table.property}</Th>
                <Th className="px-6 py-3">{t.dashboard.table.owner}</Th>
                <Th className="px-6 py-3">{t.dashboard.table.rentRwf}</Th>
                <Th className="px-6 py-3">{t.dashboard.table.start}</Th>
                <Th className="px-6 py-3">{t.dashboard.table.end}</Th>
                <Th className="px-6 py-3">{t.dashboard.table.status}</Th>
              </Tr>
            </THead>
            <TBody>
              {paginate(rentalHistory).map((l) => (
                <Tr key={l.id}>
                  <Td className="px-6 py-3 font-medium text-navy">{l.tenant}</Td>
                  <Td className="px-6 py-3 text-slate-500">{l.property}</Td>
                  <Td className="px-6 py-3 text-slate-500">{l.owner}</Td>
                  <Td className="px-6 py-3 text-slate-500">
                    {formatMoney(l.rent)}
                  </Td>
                  <Td className="px-6 py-3 text-slate-500">{l.startDate}</Td>
                  <Td className="px-6 py-3 text-slate-500">
                    {l.endDate ?? t.dashboard.admin.leases.openEnded}
                  </Td>
                  <Td className="px-6 py-3 text-slate-500">{t.dashboard.status[LEASE_STATUS_KEY[l.status]]}</Td>
                </Tr>
              ))}
              {rentalHistory.length === 0 && (
                <EmptyRow colSpan={7}>{c.empty.leases}</EmptyRow>
              )}
            </TBody>
          </Table>
        )}

        {reportId === "payment-history" && (
          <Table variant="bare">
            <THead>
              <Tr>
                <Th className="px-6 py-3">{t.dashboard.table.tenant}</Th>
                <Th className="px-6 py-3">{t.dashboard.table.property}</Th>
                <Th className="px-6 py-3">{t.dashboard.table.amountRwf}</Th>
                <Th className="px-6 py-3">{t.dashboard.table.method}</Th>
                <Th className="px-6 py-3">{t.dashboard.table.dueDate}</Th>
                <Th className="px-6 py-3">{t.dashboard.table.paidDate}</Th>
                <Th className="px-6 py-3">{t.dashboard.table.status}</Th>
              </Tr>
            </THead>
            <TBody>
              {paginate(paymentHistory).map((p) => (
                <Tr key={p.id}>
                  <Td className="px-6 py-3 font-medium text-navy">{p.tenant}</Td>
                  <Td className="px-6 py-3 text-slate-500">{p.property}</Td>
                  <Td className="px-6 py-3 text-slate-500">
                    {formatMoney(p.amount)}
                  </Td>
                  <Td className="px-6 py-3 text-slate-500">{p.method}</Td>
                  <Td className="px-6 py-3 text-slate-500">{p.dueDate}</Td>
                  <Td className="px-6 py-3 text-slate-500">
                    {p.paidDate ?? "—"}
                  </Td>
                  <Td className="px-6 py-3 text-slate-500">{t.dashboard.status[PAYMENT_STATUS_KEY[p.status]]}</Td>
                </Tr>
              ))}
              {paymentHistory.length === 0 && (
                <EmptyRow colSpan={7}>{c.empty.payments}</EmptyRow>
              )}
            </TBody>
          </Table>
        )}

        {reportId === "occupancy" && (
          <Table variant="bare">
            <THead>
              <Tr>
                <Th className="px-6 py-3">{t.dashboard.table.property}</Th>
                <Th className="px-6 py-3">{t.dashboard.table.owner}</Th>
                <Th className="px-6 py-3">{t.dashboard.table.type}</Th>
                <Th className="px-6 py-3">{t.dashboard.table.availability}</Th>
                <Th className="px-6 py-3">{t.dashboard.table.approval}</Th>
              </Tr>
            </THead>
            <TBody>
              {paginate(occupancy).map((p) => (
                <Tr key={p.id}>
                  <Td className="px-6 py-3 font-medium text-navy">{p.name}</Td>
                  <Td className="px-6 py-3 text-slate-500">{p.owner}</Td>
                  <Td className="px-6 py-3 text-slate-500">{t.dashboard.status[PROPERTY_TYPE_KEY[p.type] ?? "unit"]}</Td>
                  <Td className="px-6 py-3 text-slate-500">
                    {t.dashboard.status[AVAILABILITY_KEY[p.availability]]}
                  </Td>
                  <Td className="px-6 py-3 text-slate-500">{t.dashboard.status[APPROVAL_KEY[p.approval]]}</Td>
                </Tr>
              ))}
              {occupancy.length === 0 && (
                <EmptyRow colSpan={5}>{c.empty.properties}</EmptyRow>
              )}
            </TBody>
          </Table>
        )}

        {reportId === "maintenance-activity" && (
          <Table variant="bare">
            <THead>
              <Tr>
                <Th className="px-6 py-3">{t.dashboard.table.tenant}</Th>
                <Th className="px-6 py-3">{t.dashboard.table.property}</Th>
                <Th className="px-6 py-3">{t.dashboard.table.issue}</Th>
                <Th className="px-6 py-3">{t.dashboard.table.priority}</Th>
                <Th className="px-6 py-3">{t.dashboard.table.status}</Th>
                <Th className="px-6 py-3">{t.dashboard.table.assignedTo}</Th>
                <Th className="px-6 py-3">{t.dashboard.table.submitted}</Th>
              </Tr>
            </THead>
            <TBody>
              {paginate(maintenanceActivity).map((m) => (
                <Tr key={m.id}>
                  <Td className="px-6 py-3 font-medium text-navy">{m.tenant}</Td>
                  <Td className="px-6 py-3 text-slate-500">{m.property}</Td>
                  <Td className="max-w-xs px-6 py-3 text-slate-500">
                    {m.issue.join("; ")}
                  </Td>
                  <Td className="px-6 py-3 text-slate-500">{t.dashboard.status[PRIORITY_KEY[m.priority]]}</Td>
                  <Td className="px-6 py-3 text-slate-500">{t.dashboard.status[MAINTENANCE_STATUS_KEY[m.status]]}</Td>
                  <Td className="px-6 py-3 text-slate-500">
                    {m.laborers.length > 0
                      ? t.dashboard.admin.maintenance.workerCountTemplate
                          .replace("{count}", String(m.laborers.length))
                          .replace("{plural}", m.laborers.length === 1 ? "" : "s")
                      : "—"}
                  </Td>
                  <Td className="px-6 py-3 text-slate-500">
                    {m.submittedAt}
                  </Td>
                </Tr>
              ))}
              {maintenanceActivity.length === 0 && (
                <EmptyRow colSpan={7}>{c.empty.requests}</EmptyRow>
              )}
            </TBody>
          </Table>
        )}

        {reportId === "revenue-performance" && (
          <>
            <div className="flex items-center justify-between border-b border-slate-100 px-6 py-4">
              <p className="text-sm font-medium text-slate-500">
                {c.totalCollected}
              </p>
              <p className="text-lg font-bold text-navy">
                {formatMoney(revenueTotal)} RWF
              </p>
            </div>
            <Table variant="bare">
              <THead>
                <Tr>
                  <Th className="px-6 py-3">{t.dashboard.table.tenant}</Th>
                  <Th className="px-6 py-3">{t.dashboard.table.property}</Th>
                  <Th className="px-6 py-3">{t.dashboard.table.amountRwf}</Th>
                  <Th className="px-6 py-3">{t.dashboard.table.method}</Th>
                  <Th className="px-6 py-3">{t.dashboard.table.paidDate}</Th>
                </Tr>
              </THead>
              <TBody>
                {paginate(revenuePerformance).map((p) => (
                  <Tr key={p.id}>
                    <Td className="px-6 py-3 font-medium text-navy">
                      {p.tenant}
                    </Td>
                    <Td className="px-6 py-3 text-slate-500">
                      {p.property}
                    </Td>
                    <Td className="px-6 py-3 text-slate-500">
                      {formatMoney(p.amount)}
                    </Td>
                    <Td className="px-6 py-3 text-slate-500">{p.method}</Td>
                    <Td className="px-6 py-3 text-slate-500">
                      {p.paidDate ?? "—"}
                    </Td>
                  </Tr>
                ))}
                {revenuePerformance.length === 0 && (
                  <EmptyRow colSpan={5}>{c.empty.revenue}</EmptyRow>
                )}
              </TBody>
            </Table>
          </>
        )}

        {reportId === "landlord-performance" && (
          <Table variant="bare">
            <THead>
              <Tr>
                <Th className="px-6 py-3">{t.dashboard.table.name}</Th>
                <Th className="px-6 py-3">{t.dashboard.table.email}</Th>
                <Th className="px-6 py-3">{t.dashboard.table.phone}</Th>
                <Th className="px-6 py-3">{t.dashboard.table.properties}</Th>
                <Th className="px-6 py-3">{t.dashboard.table.status}</Th>
                <Th className="px-6 py-3">{t.dashboard.table.registered}</Th>
              </Tr>
            </THead>
            <TBody>
              {paginate(LANDLORDS).map((l) => (
                <Tr key={l.id}>
                  <Td className="px-6 py-3 font-medium text-navy">{l.name}</Td>
                  <Td className="px-6 py-3 text-slate-500">{l.email}</Td>
                  <Td className="px-6 py-3 text-slate-500">{l.phone}</Td>
                  <Td className="px-6 py-3 text-slate-500">
                    {l.properties}
                  </Td>
                  <Td className="px-6 py-3 text-slate-500">{t.dashboard.status[LANDLORD_STATUS_KEY[l.status]]}</Td>
                  <Td className="px-6 py-3 text-slate-500">
                    {l.registeredAt}
                  </Td>
                </Tr>
              ))}
            </TBody>
          </Table>
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
