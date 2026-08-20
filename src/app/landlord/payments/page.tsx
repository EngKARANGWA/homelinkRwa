"use client";

import { Suspense, useEffect, useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import { AppLink as Link } from "@/components/shared/AppLink";
import {
  AlertCircle,
  Bell,
  Check,
  CheckCircle2,
  Download,
  Eye,
  Plus,
  Wallet,
  X,
} from "lucide-react";
import { PAYMENTS, PROPERTIES, TODAY, type Payment } from "@/lib/mock-admin-data";
import { getUnitsForProperty, type Unit } from "@/lib/units";
import { useLandlord } from "@/components/landlord/LandlordContext";
import { Modal } from "@/components/admin/Modal";
import { PaymentReceipt } from "@/components/admin/PaymentReceipt";
import { RecordPaymentForm } from "@/components/landlord/RecordPaymentForm";
import { IconStatCard } from "@/components/dashboard/IconStatCard";
import { AlertBanner } from "@/components/dashboard/AlertBanner";
import { Card } from "@/components/dashboard/Card";
import { EmptyRow, Table, TBody, Td, Th, THead, Tr } from "@/components/dashboard/Table";
import { DEFAULT_PAGE_SIZE, Pagination } from "@/components/dashboard/Pagination";
import { downloadCSV } from "@/lib/csv";
import { formatMoney } from "@/lib/money";
import { useLanguage } from "@/lib/i18n/LanguageContext";
import type { Translations } from "@/lib/i18n/translations";

type RowStatus = Payment["status"] | "Overdue" | "Arrears";

const VALID_STATUS_FILTERS: ("All" | RowStatus)[] = [
  "All",
  "Overdue",
  "Arrears",
  "Paid",
  "Late",
  "Pending",
  "Pending Approval",
];

function isValidStatusFilter(value: string | null): value is "All" | RowStatus {
  return VALID_STATUS_FILTERS.includes(value as "All" | RowStatus);
}

const STATUS_STYLES: Record<RowStatus, string> = {
  Paid: "bg-emerald-50 text-emerald-700",
  Late: "bg-red-50 text-red-700",
  Pending: "bg-amber-50 text-amber-700",
  "Pending Approval": "bg-sky-50 text-sky-700",
  Overdue: "bg-amber-50 text-amber-700",
  Arrears: "bg-red-50 text-red-700",
};

const STATUS_KEY: Record<RowStatus, keyof Translations["dashboard"]["status"]> = {
  Paid: "paid",
  Late: "late",
  Pending: "pending",
  "Pending Approval": "pendingApproval",
  Overdue: "overdue",
  Arrears: "arrears",
};

const STATUS_PRIORITY: Record<RowStatus, number> = {
  Arrears: 0,
  Overdue: 1,
  Late: 2,
  "Pending Approval": 3,
  Pending: 4,
  Paid: 5,
};

type PaymentRow = {
  id: string;
  tenant: string;
  property: string;
  unit: string;
  amount: number;
  method: string;
  dueDate: string;
  dueDateSubtext?: string;
  status: RowStatus;
  actions:
    | { type: "unit"; propertyId: string; unitId: string }
    | { type: "payment"; payment: Payment };
};

function daysBetween(from: string, to: string): number {
  const ms = new Date(to).getTime() - new Date(from).getTime();
  return Math.max(0, Math.floor(ms / (1000 * 60 * 60 * 24)));
}

function arrearsPeriodLabel(
  unit: Unit,
  t: Translations,
): { lastPaymentDate: string | null; period: string } {
  const ov = t.dashboard.landlord.overview;
  const paidEntries = unit.paymentHistory.filter((p) => p.status === "Paid" && p.paidDate);
  if (paidEntries.length === 0) {
    return { lastPaymentDate: null, period: ov.noPaymentsOnFile };
  }
  const last = paidEntries[paidEntries.length - 1];
  const days = daysBetween(last.paidDate as string, TODAY);
  const period =
    days < 60
      ? ov.overdueDaysTemplate.replace("{value}", String(days))
      : ov.overdueMonthsTemplate.replace("{value}", String(Math.round(days / 30)));
  return { lastPaymentDate: last.paidDate, period };
}

function LandlordPaymentsPageContent() {
  const { t } = useLanguage();
  const c = t.dashboard.landlord.payments;
  const { landlordName, unitOverrides, recordPayment } = useLandlord();
  const searchParams = useSearchParams();
  const statusParam = searchParams.get("status");
  const [payments, setPayments] = useState(PAYMENTS);
  const [viewingPayment, setViewingPayment] = useState<Payment | null>(null);
  const [isRecording, setRecording] = useState(false);
  const [notice, setNotice] = useState<string | null>(null);
  const [propertyFilter, setPropertyFilter] = useState(c.allProperties);
  const [statusFilter, setStatusFilter] = useState<"All" | RowStatus>(
    isValidStatusFilter(statusParam) ? statusParam : "All",
  );
  const [methodFilter, setMethodFilter] = useState<"All" | Payment["method"]>("All");
  const [page, setPage] = useState(1);

  const myProperties = PROPERTIES.filter((p) => p.owner === landlordName);
  const propertyOptions = [c.allProperties, ...myProperties.map((p) => p.name)];

  const myPayments = payments.filter((p) => p.owner === landlordName);
  const collected = myPayments
    .filter((p) => p.status === "Paid")
    .reduce((sum, p) => sum + p.amount, 0);
  const outstanding = myPayments
    .filter((p) => p.status !== "Paid")
    .reduce((sum, p) => sum + p.amount, 0);
  const propertyMethodFilteredPayments = myPayments.filter((p) => {
    const matchesProperty = propertyFilter === c.allProperties || p.property === propertyFilter;
    const matchesMethod = methodFilter === "All" || p.method === methodFilter;
    return matchesProperty && matchesMethod;
  });

  const filteredPayments = propertyMethodFilteredPayments.filter(
    (p) => statusFilter === "All" || p.status === statusFilter,
  );

  const allUnits: Unit[] = useMemo(
    () =>
      myProperties.flatMap((property) =>
        getUnitsForProperty(property, unitOverrides).filter(
          (u) => u.occupancyStatus === "Occupied",
        ),
      ),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [landlordName, unitOverrides],
  );
  const overdueUnits = allUnits.filter(
    (u) => u.currentPaymentStatus === "Overdue" || u.currentPaymentStatus === "Arrears",
  );
  const totalInArrears = overdueUnits.reduce((sum, u) => sum + u.monthlyRent, 0);

  const propertyFilteredArrearsUnits = overdueUnits.filter(
    (u) => propertyFilter === c.allProperties || u.propertyName === propertyFilter,
  );

  const filteredArrearsUnits =
    methodFilter === "All" &&
    (statusFilter === "All" || statusFilter === "Overdue" || statusFilter === "Arrears")
      ? propertyFilteredArrearsUnits.filter(
          (u) => statusFilter === "All" || u.currentPaymentStatus === statusFilter,
        )
      : [];

  const TABS: {
    key: "All" | "Pending Approval" | "Overdue" | "Arrears";
    labelKey: keyof Translations["dashboard"]["landlord"]["overview"]["tabs"];
  }[] = [
    { key: "All", labelKey: "all" },
    { key: "Pending Approval", labelKey: "pendingApproval" },
    { key: "Overdue", labelKey: "overdue" },
    { key: "Arrears", labelKey: "arrears" },
  ];
  const tabCounts: Record<(typeof TABS)[number]["key"], number> = {
    All: propertyMethodFilteredPayments.length + propertyFilteredArrearsUnits.length,
    "Pending Approval": propertyMethodFilteredPayments.filter(
      (p) => p.status === "Pending Approval",
    ).length,
    Overdue: propertyFilteredArrearsUnits.filter((u) => u.currentPaymentStatus === "Overdue")
      .length,
    Arrears: propertyFilteredArrearsUnits.filter((u) => u.currentPaymentStatus === "Arrears")
      .length,
  };

  const rows: PaymentRow[] = [
    ...filteredArrearsUnits.map((unit): PaymentRow => {
      const { lastPaymentDate, period } = arrearsPeriodLabel(unit, t);
      return {
        id: `unit-${unit.id}`,
        tenant: unit.tenant ?? t.dashboard.landlord.overview.unknownTenant,
        property: unit.propertyName,
        unit: unit.unitNumber,
        amount: unit.monthlyRent,
        method: "—",
        dueDate: period,
        dueDateSubtext: lastPaymentDate ? c.lastPaidTemplate.replace("{date}", lastPaymentDate) : undefined,
        status: unit.currentPaymentStatus === "Arrears" ? "Arrears" : "Overdue",
        actions: { type: "unit", propertyId: unit.propertyId, unitId: unit.id },
      };
    }),
    ...filteredPayments.map(
      (payment): PaymentRow => ({
        id: `payment-${payment.id}`,
        tenant: payment.tenant,
        property: payment.property,
        unit: "—",
        amount: payment.amount,
        method: payment.method,
        dueDate: payment.dueDate,
        status: payment.status,
        actions: { type: "payment", payment },
      }),
    ),
  ].sort((a, b) => STATUS_PRIORITY[a.status] - STATUS_PRIORITY[b.status]);

  const totalPages = Math.max(1, Math.ceil(rows.length / DEFAULT_PAGE_SIZE));
  useEffect(() => {
    if (page > totalPages) setPage(totalPages);
  }, [page, totalPages]);
  const pagedRows = rows.slice((page - 1) * DEFAULT_PAGE_SIZE, page * DEFAULT_PAGE_SIZE);

  const resolvePayment = (id: string, approve: boolean) => {
    setPayments((prev) =>
      prev.map((p) =>
        p.id === id
          ? {
              ...p,
              status: approve ? "Paid" : "Pending",
              paidDate: approve ? TODAY : null,
            }
          : p,
      ),
    );
    setNotice(approve ? c.approvedNotice : c.backToPendingNotice);
  };

  const handleRecordPayment = (
    unit: Unit,
    values: { amount: number; method: string; paidDate: string },
  ) => {
    recordPayment(unit, values);
    const newPayment: Payment = {
      id: String(Date.now()),
      tenant: unit.tenant ?? t.dashboard.landlord.overview.unknownTenant,
      property: unit.propertyName,
      owner: landlordName,
      amount: values.amount,
      method: values.method as Payment["method"],
      status: "Paid",
      dueDate: TODAY,
      paidDate: values.paidDate,
    };
    setPayments((prev) => [newPayment, ...prev]);
    setRecording(false);
    setNotice(
      c.recordedPaymentTemplate
        .replace("{amount}", formatMoney(values.amount))
        .replace("{tenant}", unit.tenant ?? ""),
    );
  };

  const handleSendArrearsReminder = () => {
    setNotice(
      overdueUnits.length > 0
        ? c.reminderSentArrearsTemplate
            .replace("{count}", String(overdueUnits.length))
            .replace("{plural}", overdueUnits.length === 1 ? "" : "s")
        : c.noArrearsTenants,
    );
  };

  const handleDownloadStatement = () => {
    downloadCSV(
      "rent-statement.csv",
      ["Tenant", "Property", "Amount", "Method", "Due Date", "Status"],
      myPayments.map((p) => [
        p.tenant,
        p.property,
        p.amount,
        p.method,
        p.dueDate,
        p.status,
      ]),
    );
    setNotice(c.statementDownloadedNotice);
  };

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-navy">{c.title}</h1>
          <p className="mt-1 text-sm text-slate-500">
            {c.subtitle}
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <button
            type="button"
            onClick={handleDownloadStatement}
            className="inline-flex items-center gap-2 rounded-lg border border-slate-300 px-5 py-2.5 text-sm font-semibold text-slate-600 transition-colors hover:bg-slate-50"
          >
            <Download className="h-4 w-4" />
            {c.downloadStatement}
          </button>
          <button
            type="button"
            onClick={() => setRecording(true)}
            className="inline-flex items-center gap-2 rounded-lg bg-gold px-5 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-gold/90"
          >
            <Plus className="h-4 w-4" />
            {c.recordPaymentCash}
          </button>
        </div>
      </div>

      {notice && (
        <div className="flex items-center gap-2 rounded-lg border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm font-medium text-emerald-700">
          <CheckCircle2 className="h-4 w-4" />
          {notice}
        </div>
      )}

      <div className="grid grid-cols-2 gap-5">
        <IconStatCard
          icon={Wallet}
          label={c.statCollected}
          value={`${formatMoney(collected)} RWF`}
          accent="emerald"
        />
        <IconStatCard
          icon={AlertCircle}
          label={c.statOutstanding}
          value={`${formatMoney(outstanding)} RWF`}
          accent="red"
        />
      </div>

      <AlertBanner
        isAlert={overdueUnits.length > 0}
        stats={[
          { label: c.alertTotalInArrears, value: `${formatMoney(totalInArrears)} RWF` },
          { label: c.alertUnitsTenants, value: overdueUnits.length },
        ]}
      >
        <button
          type="button"
          onClick={handleSendArrearsReminder}
          className="inline-flex items-center gap-2 rounded-lg bg-gold px-5 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-gold/90"
        >
          <Bell className="h-4 w-4" />
          {t.dashboard.landlord.overview.sendReminder}
        </button>
      </AlertBanner>

      <div className="flex flex-col gap-4 rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
        <label className="flex flex-col gap-1.5 text-sm font-medium text-slate-700">
          {c.filterProperty}
          <select
            value={propertyFilter}
            onChange={(e) => setPropertyFilter(e.target.value)}
            className="rounded-lg border border-slate-300 px-3 py-2.5 text-sm text-navy focus:border-gold focus:outline-none"
          >
            {propertyOptions.map((name) => (
              <option key={name}>{name}</option>
            ))}
          </select>
        </label>

        <div className="grid grid-cols-2 gap-4">
          <label className="flex flex-col gap-1.5 text-sm font-medium text-slate-700">
            {c.filterStatus}
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value as typeof statusFilter)}
              className="rounded-lg border border-slate-300 px-3 py-2.5 text-sm text-navy focus:border-gold focus:outline-none"
            >
              <option value="All">{t.dashboard.actions.all}</option>
              <option value="Overdue">{t.dashboard.status.overdue}</option>
              <option value="Arrears">{t.dashboard.status.arrears}</option>
              <option value="Paid">{t.dashboard.status.paid}</option>
              <option value="Late">{t.dashboard.status.late}</option>
              <option value="Pending">{t.dashboard.status.pending}</option>
              <option value="Pending Approval">{t.dashboard.status.pendingApproval}</option>
            </select>
          </label>

          <label className="flex flex-col gap-1.5 text-sm font-medium text-slate-700">
            {c.filterMethod}
            <select
              value={methodFilter}
              onChange={(e) => setMethodFilter(e.target.value as typeof methodFilter)}
              className="rounded-lg border border-slate-300 px-3 py-2.5 text-sm text-navy focus:border-gold focus:outline-none"
            >
              <option value="All">{t.dashboard.actions.all}</option>
              <option value="MTN Mobile Money">{t.dashboard.landlord.paymentMethods.mtnMobileMoney}</option>
              <option value="Airtel Money">{t.dashboard.landlord.paymentMethods.airtelMoney}</option>
              <option value="Bank Transfer">{t.dashboard.landlord.paymentMethods.bankTransfer}</option>
              <option value="Card / PayPal">{c.methodCardPaypal}</option>
              <option value="Cash">{t.dashboard.landlord.paymentMethods.cash}</option>
            </select>
          </label>
        </div>
      </div>

      <Card title={c.transactionsTitle}>
        <p className="mt-1 text-sm text-slate-500">
          {c.transactionsSubtitle}
        </p>

        <div className="mt-4 flex items-center gap-6 overflow-x-auto border-b border-slate-200">
          {TABS.map((tab) => {
            const isActive = statusFilter === tab.key;
            return (
              <button
                key={tab.key}
                type="button"
                onClick={() => setStatusFilter(tab.key)}
                className={`flex shrink-0 items-center gap-2 border-b-2 pb-3 text-sm font-medium transition-colors ${
                  isActive
                    ? "border-gold text-navy"
                    : "border-transparent text-slate-500 hover:text-navy"
                }`}
              >
                {t.dashboard.landlord.overview.tabs[tab.labelKey]}
                <span
                  className={`rounded-full px-2 py-0.5 text-xs font-semibold ${
                    isActive ? "bg-gold/10 text-gold" : "bg-slate-100 text-slate-500"
                  }`}
                >
                  {tabCounts[tab.key]}
                </span>
              </button>
            );
          })}
        </div>

        <Table variant="card">
          <THead>
            <Tr>
              <Th className="max-w-[10rem] px-4 py-3 sm:px-6">{t.dashboard.table.tenant}</Th>
              <Th className="hidden px-6 py-3 md:table-cell">{t.dashboard.table.property}</Th>
              <Th className="hidden px-6 py-3 lg:table-cell">{t.dashboard.table.unit}</Th>
              <Th className="hidden px-6 py-3 sm:table-cell">{t.dashboard.table.amountRwf}</Th>
              <Th className="hidden px-6 py-3 lg:table-cell">{t.dashboard.table.method}</Th>
              <Th className="hidden px-6 py-3 md:table-cell">{t.dashboard.table.dueDate}</Th>
              <Th className="px-4 py-3 sm:px-6">{t.dashboard.table.status}</Th>
              <Th className="px-4 py-3 sm:px-6">{t.dashboard.table.actions}</Th>
            </Tr>
          </THead>
          <TBody>
            {pagedRows.map((row) => (
              <Tr key={row.id}>
                <Td className="max-w-[10rem] px-4 py-3 sm:max-w-none sm:px-6">
                  <p className="truncate font-medium text-navy sm:overflow-visible sm:whitespace-normal">
                    {row.tenant}
                  </p>
                  <p className="truncate text-xs text-slate-400 md:hidden">{row.property}</p>
                  <p className="text-xs text-slate-400 sm:hidden">
                    {formatMoney(row.amount)} RWF
                  </p>
                </Td>
                <Td className="hidden px-6 py-3 text-slate-500 md:table-cell">
                  {row.property}
                </Td>
                <Td className="hidden px-6 py-3 text-slate-500 lg:table-cell">{row.unit}</Td>
                <Td
                  className={`hidden px-6 py-3 sm:table-cell ${
                    row.status === "Overdue" || row.status === "Arrears" || row.status === "Late"
                      ? "font-medium text-red-600"
                      : "text-slate-500"
                  }`}
                >
                  {formatMoney(row.amount)}
                </Td>
                <Td className="hidden px-6 py-3 text-slate-500 lg:table-cell">{row.method}</Td>
                <Td className="hidden px-6 py-3 text-slate-500 md:table-cell">
                  <p>{row.dueDate}</p>
                  {row.dueDateSubtext && (
                    <p className="text-xs text-slate-400">{row.dueDateSubtext}</p>
                  )}
                </Td>
                <Td className="px-4 py-3 sm:px-6">
                  <span
                    className={`rounded-full px-2.5 py-1 text-xs font-medium ${STATUS_STYLES[row.status]}`}
                  >
                    {t.dashboard.status[STATUS_KEY[row.status]]}
                  </span>
                </Td>
                <Td className="max-w-[6.5rem] px-4 py-3 sm:max-w-none sm:whitespace-nowrap sm:px-6">
                  <div className="flex flex-wrap items-center gap-2">
                    {row.actions.type === "unit" ? (
                      <Link
                        href={`/landlord/properties/${row.actions.propertyId}/units/${row.actions.unitId}`}
                        className="inline-flex items-center gap-1.5 rounded-lg border border-slate-300 px-2.5 py-1 text-xs font-medium text-slate-600 hover:bg-slate-50"
                      >
                        <Eye className="h-3.5 w-3.5" />
                        {t.dashboard.actions.view}
                      </Link>
                    ) : (
                      (() => {
                        const payment = row.actions.payment;
                        return (
                          <>
                            <button
                              type="button"
                              onClick={() => setViewingPayment(payment)}
                              className="inline-flex items-center gap-1.5 rounded-lg border border-slate-300 px-2.5 py-1 text-xs font-medium text-slate-600 hover:bg-slate-50"
                            >
                              <Eye className="h-3.5 w-3.5" />
                              {t.dashboard.actions.view}
                            </button>
                            {payment.status === "Pending Approval" && (
                              <>
                                <button
                                  type="button"
                                  onClick={() => resolvePayment(payment.id, true)}
                                  aria-label={c.approvePaymentAriaTemplate.replace("{name}", row.tenant)}
                                  className="flex h-7 w-7 items-center justify-center rounded-full bg-emerald-50 text-emerald-700 hover:bg-emerald-100"
                                >
                                  <Check className="h-4 w-4" />
                                </button>
                                <button
                                  type="button"
                                  onClick={() => resolvePayment(payment.id, false)}
                                  aria-label={c.rejectPaymentAriaTemplate.replace("{name}", row.tenant)}
                                  className="flex h-7 w-7 items-center justify-center rounded-full bg-red-50 text-red-700 hover:bg-red-100"
                                >
                                  <X className="h-4 w-4" />
                                </button>
                              </>
                            )}
                          </>
                        );
                      })()
                    )}
                  </div>
                </Td>
              </Tr>
            ))}
            {pagedRows.length === 0 && <EmptyRow colSpan={8}>{c.noPaymentsMatch}</EmptyRow>}
          </TBody>
        </Table>
        <Pagination
          page={page}
          totalPages={totalPages}
          totalItems={rows.length}
          pageSize={DEFAULT_PAGE_SIZE}
          onPageChange={setPage}
        />
      </Card>

      {viewingPayment && (
        <Modal
          title={viewingPayment.status === "Paid" ? t.dashboard.admin.payments.receiptTitle : t.dashboard.admin.payments.invoiceTitle}
          description={`${viewingPayment.tenant} · ${viewingPayment.property}`}
          onClose={() => setViewingPayment(null)}
          maxWidthClassName="max-w-3xl"
        >
          <PaymentReceipt payment={viewingPayment} />
        </Modal>
      )}

      {isRecording && (
        <Modal
          title={c.recordPaymentTitle}
          description={c.recordPaymentDescription}
          onClose={() => setRecording(false)}
        >
          <RecordPaymentForm
            properties={myProperties}
            unitOverrides={unitOverrides}
            onCancel={() => setRecording(false)}
            onSuccess={handleRecordPayment}
          />
        </Modal>
      )}
    </div>
  );
}

export default function LandlordPaymentsPage() {
  return (
    <Suspense fallback={null}>
      <LandlordPaymentsPageContent />
    </Suspense>
  );
}
