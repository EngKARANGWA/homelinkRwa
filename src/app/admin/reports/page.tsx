"use client";

import { useEffect, useState } from "react";
import { Download } from "lucide-react";
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
          className="ml-auto inline-flex items-center gap-2 rounded-lg bg-gold px-5 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-gold/90"
        >
          <Download className="h-4 w-4" />
          Export CSV
        </button>
      </div>

      <div className="overflow-x-auto rounded-xl border border-slate-200 bg-white shadow-sm">
        {reportId === "rental-history" && (
          <Table variant="bare">
            <THead>
              <Tr>
                <Th className="px-6 py-3">Tenant</Th>
                <Th className="px-6 py-3">Property</Th>
                <Th className="px-6 py-3">Owner</Th>
                <Th className="px-6 py-3">Rent (RWF)</Th>
                <Th className="px-6 py-3">Start</Th>
                <Th className="px-6 py-3">End</Th>
                <Th className="px-6 py-3">Status</Th>
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
                    {l.endDate ?? "Open-ended"}
                  </Td>
                  <Td className="px-6 py-3 text-slate-500">{l.status}</Td>
                </Tr>
              ))}
              {rentalHistory.length === 0 && (
                <EmptyRow colSpan={7}>No leases match these filters.</EmptyRow>
              )}
            </TBody>
          </Table>
        )}

        {reportId === "payment-history" && (
          <Table variant="bare">
            <THead>
              <Tr>
                <Th className="px-6 py-3">Tenant</Th>
                <Th className="px-6 py-3">Property</Th>
                <Th className="px-6 py-3">Amount (RWF)</Th>
                <Th className="px-6 py-3">Method</Th>
                <Th className="px-6 py-3">Due Date</Th>
                <Th className="px-6 py-3">Paid Date</Th>
                <Th className="px-6 py-3">Status</Th>
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
                  <Td className="px-6 py-3 text-slate-500">{p.status}</Td>
                </Tr>
              ))}
              {paymentHistory.length === 0 && (
                <EmptyRow colSpan={7}>No payments match these filters.</EmptyRow>
              )}
            </TBody>
          </Table>
        )}

        {reportId === "occupancy" && (
          <Table variant="bare">
            <THead>
              <Tr>
                <Th className="px-6 py-3">Property</Th>
                <Th className="px-6 py-3">Owner</Th>
                <Th className="px-6 py-3">Type</Th>
                <Th className="px-6 py-3">Availability</Th>
                <Th className="px-6 py-3">Approval</Th>
              </Tr>
            </THead>
            <TBody>
              {paginate(occupancy).map((p) => (
                <Tr key={p.id}>
                  <Td className="px-6 py-3 font-medium text-navy">{p.name}</Td>
                  <Td className="px-6 py-3 text-slate-500">{p.owner}</Td>
                  <Td className="px-6 py-3 text-slate-500">{p.type}</Td>
                  <Td className="px-6 py-3 text-slate-500">
                    {p.availability}
                  </Td>
                  <Td className="px-6 py-3 text-slate-500">{p.approval}</Td>
                </Tr>
              ))}
              {occupancy.length === 0 && (
                <EmptyRow colSpan={5}>No properties match these filters.</EmptyRow>
              )}
            </TBody>
          </Table>
        )}

        {reportId === "maintenance-activity" && (
          <Table variant="bare">
            <THead>
              <Tr>
                <Th className="px-6 py-3">Tenant</Th>
                <Th className="px-6 py-3">Property</Th>
                <Th className="px-6 py-3">Issue</Th>
                <Th className="px-6 py-3">Priority</Th>
                <Th className="px-6 py-3">Status</Th>
                <Th className="px-6 py-3">Assigned To</Th>
                <Th className="px-6 py-3">Submitted</Th>
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
                  <Td className="px-6 py-3 text-slate-500">{m.priority}</Td>
                  <Td className="px-6 py-3 text-slate-500">{m.status}</Td>
                  <Td className="px-6 py-3 text-slate-500">
                    {m.laborers.length > 0
                      ? `${m.laborers.length} worker${m.laborers.length === 1 ? "" : "s"}`
                      : "—"}
                  </Td>
                  <Td className="px-6 py-3 text-slate-500">
                    {m.submittedAt}
                  </Td>
                </Tr>
              ))}
              {maintenanceActivity.length === 0 && (
                <EmptyRow colSpan={7}>No requests match these filters.</EmptyRow>
              )}
            </TBody>
          </Table>
        )}

        {reportId === "revenue-performance" && (
          <>
            <div className="flex items-center justify-between border-b border-slate-100 px-6 py-4">
              <p className="text-sm font-medium text-slate-500">
                Total collected
              </p>
              <p className="text-lg font-bold text-navy">
                {formatMoney(revenueTotal)} RWF
              </p>
            </div>
            <Table variant="bare">
              <THead>
                <Tr>
                  <Th className="px-6 py-3">Tenant</Th>
                  <Th className="px-6 py-3">Property</Th>
                  <Th className="px-6 py-3">Amount (RWF)</Th>
                  <Th className="px-6 py-3">Method</Th>
                  <Th className="px-6 py-3">Paid Date</Th>
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
                  <EmptyRow colSpan={5}>No revenue matches these filters.</EmptyRow>
                )}
              </TBody>
            </Table>
          </>
        )}

        {reportId === "landlord-performance" && (
          <Table variant="bare">
            <THead>
              <Tr>
                <Th className="px-6 py-3">Name</Th>
                <Th className="px-6 py-3">Email</Th>
                <Th className="px-6 py-3">Phone</Th>
                <Th className="px-6 py-3">Properties</Th>
                <Th className="px-6 py-3">Status</Th>
                <Th className="px-6 py-3">Registered</Th>
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
                  <Td className="px-6 py-3 text-slate-500">{l.status}</Td>
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
