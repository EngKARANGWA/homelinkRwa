import { apiFetch, apiFetchBlob } from "./client";
import type { SuccessResponse } from "./types";

export type ReportRange = { from?: string; to?: string };

export type ReportId =
  | "rental-history"
  | "payment-history"
  | "occupancy"
  | "maintenance-activity"
  | "revenue-performance"
  | "agent-performance"
  | "landlord-performance";

export type RentalHistoryRow = {
  Property: string;
  Address: string;
  StartDate: string;
  EndDate: string | null;
  RentAmount: string;
  Status: string;
};

export type PaymentHistoryRow = {
  Date: string;
  Amount: string;
  Method: string;
  Status: string;
  Reference: string;
};

export type OccupancyRow = {
  Property: string;
  Status: string;
  LeaseCount: number;
  OccupiedDays: number;
  PeriodDays: number;
  OccupancyRatePercent: number;
};

export type MaintenanceActivityRow = {
  Property: string;
  Title: string;
  Status: string;
  ItemsCost: number;
  LaborCost: number;
  CreatedAt: string;
  CompletedAt: string;
};

export type RevenuePerformanceRow = {
  Month: string;
  Revenue: number;
};

export type AgentPerformanceRow = {
  Agent: string;
  PropertiesManaged: number;
  ApprovedListings: number;
  RejectedListings: number;
  PendingListings: number;
  ActiveLeases: number;
};

// Current-state directory, not date-ranged — see reports.service.ts.
export type LandlordPerformanceRow = {
  Name: string;
  Email: string;
  Phone: string;
  Properties: number;
  Status: string;
  Registered: string;
};

type ReportResponse<Row> = { summary?: Record<string, unknown>; rows: Row[] };

async function getReport<Row>(
  reportId: ReportId,
  range: ReportRange,
): Promise<ReportResponse<Row>> {
  const res = await apiFetch<SuccessResponse<ReportResponse<Row>>>(`/reports/${reportId}`, {
    query: { from: range.from, to: range.to },
  });
  return res.data;
}

export const getRentalHistoryReport = (range: ReportRange = {}) =>
  getReport<RentalHistoryRow>("rental-history", range);

export const getPaymentHistoryReport = (range: ReportRange = {}) =>
  getReport<PaymentHistoryRow>("payment-history", range);

export const getOccupancyReport = (range: ReportRange = {}) =>
  getReport<OccupancyRow>("occupancy", range);

export const getMaintenanceActivityReport = (range: ReportRange = {}) =>
  getReport<MaintenanceActivityRow>("maintenance-activity", range);

export const getRevenuePerformanceReport = (range: ReportRange = {}) =>
  getReport<RevenuePerformanceRow>("revenue-performance", range);

export const getAgentPerformanceReport = (range: ReportRange = {}) =>
  getReport<AgentPerformanceRow>("agent-performance", range);

// Takes no date range — the backend ignores it for this report (a current
// snapshot, not an activity log for a period).
export const getLandlordPerformanceReport = () => getReport<LandlordPerformanceRow>("landlord-performance", {});

export async function exportReport(reportId: ReportId, range: ReportRange = {}): Promise<void> {
  const blob = await apiFetchBlob(`/reports/${reportId}`, {
    query: { from: range.from, to: range.to, format: "excel" },
  });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = `${reportId}.xlsx`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  setTimeout(() => URL.revokeObjectURL(url), 0);
}
