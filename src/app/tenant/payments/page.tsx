"use client";

import { useEffect, useState } from "react";
import { CheckCircle2, Download, Eye, Wallet } from "lucide-react";
import { LEASES, PROPERTIES, PAYMENTS, type Payment } from "@/lib/mock-admin-data";
import { useTenant } from "@/components/tenant/TenantContext";
import { getTenantUnitNumber } from "@/lib/units";
import { Modal } from "@/components/admin/Modal";
import { PaymentReceipt } from "@/components/admin/PaymentReceipt";
import { PayNowForm } from "@/components/tenant/PayNowForm";
import { downloadCSV } from "@/lib/csv";
import { AlertBanner } from "@/components/dashboard/AlertBanner";
import { EmptyRow, Table, TBody, Td, Th, THead, Tr } from "@/components/dashboard/Table";
import { DEFAULT_PAGE_SIZE, Pagination } from "@/components/dashboard/Pagination";
import { formatMoney } from "@/lib/money";
import { useLanguage } from "@/lib/i18n/LanguageContext";
import type { Translations } from "@/lib/i18n/translations";

const STATUS_STYLES: Record<Payment["status"], string> = {
  Paid: "bg-emerald-50 text-emerald-700",
  Late: "bg-red-50 text-red-700",
  Pending: "bg-amber-50 text-amber-700",
  "Pending Approval": "bg-sky-50 text-sky-700",
};

const STATUS_KEY: Record<Payment["status"], keyof Translations["dashboard"]["status"]> = {
  Paid: "paid",
  Late: "late",
  Pending: "pending",
  "Pending Approval": "pendingApproval",
};

const METHOD_CODES: Record<Payment["method"], string> = {
  "MTN Mobile Money": "MTN",
  "Airtel Money": "ATL",
  "Bank Transfer": "BNK",
  "Card / PayPal": "CRD",
  Cash: "CSH",
};

const TABS = [
  { id: "invoices", labelKey: "tabInvoices" },
  { id: "payments", labelKey: "tabPayments" },
] as const satisfies readonly {
  id: string;
  labelKey: keyof Translations["dashboard"]["tenant"]["payments"];
}[];

type TabId = (typeof TABS)[number]["id"];

const TODAY = "2026-07-08";

function formatDate(dateStr: string) {
  return new Date(dateStr).toLocaleDateString("en-GB", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

function monthLabel(dateStr: string) {
  return new Date(dateStr).toLocaleDateString("en-US", {
    month: "long",
    year: "numeric",
  });
}

function invoiceNumber(payment: Payment) {
  return `INV-${payment.id.padStart(4, "0")}`;
}

function paymentId(payment: Payment) {
  return `PMT-${payment.id.padStart(4, "0")}`;
}

function paymentReference(payment: Payment) {
  const datePart = (payment.paidDate ?? payment.dueDate).replaceAll("-", "");
  return `${METHOD_CODES[payment.method]}-${datePart}-${payment.id.padStart(4, "0")}`;
}

export default function TenantPaymentsPage() {
  const { t } = useLanguage();
  const c = t.dashboard.tenant.payments;
  const { tenantName } = useTenant();
  const [payments, setPayments] = useState(PAYMENTS);
  const [tab, setTab] = useState<TabId>("invoices");
  const [viewingPayment, setViewingPayment] = useState<Payment | null>(null);
  const [payingId, setPayingId] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);

  const myPayments = payments.filter((p) => p.tenant === tenantName);
  const payingPayment = myPayments.find((p) => p.id === payingId);

  const currentLease = LEASES.find(
    (l) =>
      l.tenant === tenantName &&
      (l.status === "Active" ||
        l.status === "Renewal Requested" ||
        l.status === "Termination Requested"),
  );
  const property = currentLease
    ? PROPERTIES.find((p) => p.name === currentLease.property)
    : undefined;
  const unitNumber = currentLease
    ? getTenantUnitNumber(currentLease.property, tenantName)
    : undefined;

  const unpaidPayments = myPayments
    .filter((p) => p.status !== "Paid")
    .sort((a, b) => a.dueDate.localeCompare(b.dueDate));
  const pendingPayment = unpaidPayments[0] ?? null;
  const otherPendingCount = Math.max(unpaidPayments.length - 1, 0);

  const confirmedPayments = myPayments.filter((p) => p.status === "Paid");

  const [invoicePage, setInvoicePage] = useState(1);
  const invoiceTotalPages = Math.max(1, Math.ceil(myPayments.length / DEFAULT_PAGE_SIZE));
  useEffect(() => {
    if (invoicePage > invoiceTotalPages) setInvoicePage(invoiceTotalPages);
  }, [invoicePage, invoiceTotalPages]);
  const pagedInvoices = myPayments.slice(
    (invoicePage - 1) * DEFAULT_PAGE_SIZE,
    invoicePage * DEFAULT_PAGE_SIZE,
  );

  const [paymentPage, setPaymentPage] = useState(1);
  const paymentTotalPages = Math.max(
    1,
    Math.ceil(confirmedPayments.length / DEFAULT_PAGE_SIZE),
  );
  useEffect(() => {
    if (paymentPage > paymentTotalPages) setPaymentPage(paymentTotalPages);
  }, [paymentPage, paymentTotalPages]);
  const pagedConfirmedPayments = confirmedPayments.slice(
    (paymentPage - 1) * DEFAULT_PAGE_SIZE,
    paymentPage * DEFAULT_PAGE_SIZE,
  );

  const payNow = (id: string, method: Payment["method"]) => {
    const needsApproval = method === "Cash" || method === "Bank Transfer";
    setPayments((prev) =>
      prev.map((p) =>
        p.id === id
          ? {
              ...p,
              status: needsApproval ? "Pending Approval" : "Paid",
              method,
              paidDate: needsApproval ? null : TODAY,
            }
          : p,
      ),
    );
    setPayingId(null);
    setNotice(needsApproval ? c.paymentSubmittedNotice : c.paymentSuccessfulNotice);
  };

  const handleDownloadInvoices = () => {
    downloadCSV(
      "my-invoices.csv",
      ["Sn#", "Invoice #", "Month", "Date Due", "Total Amount", "Status"],
      myPayments.map((p, i) => [
        i + 1,
        invoiceNumber(p),
        monthLabel(p.dueDate),
        p.dueDate,
        p.amount,
        p.status,
      ]),
    );
    setNotice(c.invoicesDownloadedNotice);
  };

  const handleDownloadPayments = () => {
    downloadCSV(
      "my-payments.csv",
      ["No#", "Payment ID", "Amount Paid", "Reference", "Payment Date", "Payment Method", "Status"],
      confirmedPayments.map((p, i) => [
        i + 1,
        paymentId(p),
        p.amount,
        paymentReference(p),
        p.paidDate ?? "—",
        p.method,
        p.status,
      ]),
    );
    setNotice(c.paymentsDownloadedNotice);
  };

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-navy">{c.title}</h1>
          <p className="mt-1 text-sm text-slate-500">
            {property
              ? `${property.name}${unitNumber ? c.unitTemplate.replace("{unit}", unitNumber) : ""} · ${property.address}`
              : c.subtitleFallback}
          </p>
        </div>
        <button
          type="button"
          onClick={tab === "invoices" ? handleDownloadInvoices : handleDownloadPayments}
          className="inline-flex items-center gap-2 rounded-lg border border-slate-300 px-5 py-2.5 text-sm font-semibold text-slate-600 transition-colors hover:bg-slate-50"
        >
          <Download className="h-4 w-4" />
          {tab === "invoices" ? c.downloadInvoices : c.downloadStatement}
        </button>
      </div>

      {notice && (
        <div className="flex items-center gap-2 rounded-lg border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm font-medium text-emerald-700">
          <CheckCircle2 className="h-4 w-4" />
          {notice}
        </div>
      )}

      <div className="flex items-center gap-6 overflow-x-auto border-b border-slate-200">
        {TABS.map((tabItem) => {
          const isActive = tab === tabItem.id;
          return (
            <button
              key={tabItem.id}
              type="button"
              onClick={() => setTab(tabItem.id)}
              className={`flex shrink-0 items-center gap-2 border-b-2 pb-3 text-sm font-medium transition-colors ${
                isActive
                  ? "border-gold text-navy"
                  : "border-transparent text-slate-500 hover:text-navy"
              }`}
            >
              {c[tabItem.labelKey]}
            </button>
          );
        })}
      </div>

      {tab === "invoices" && (
        <>
          <Table variant="standalone">
            <THead>
              <Tr>
                <Th className="px-4 py-3 text-center sm:px-6">{c.snNumber}</Th>
                <Th className="max-w-[8rem] px-4 py-3 sm:px-6">{c.invoiceNumber}</Th>
                <Th className="hidden px-6 py-3 sm:table-cell">{c.month}</Th>
                <Th className="hidden px-6 py-3 md:table-cell">{c.dateDue}</Th>
                <Th className="hidden px-6 py-3 sm:table-cell">{c.totalAmountRwf}</Th>
                <Th className="px-4 py-3 sm:px-6">{t.dashboard.table.status}</Th>
                <Th className="px-4 py-3 sm:px-6">{t.dashboard.table.actions}</Th>
              </Tr>
            </THead>
            <TBody>
              {pagedInvoices.map((payment, i) => (
                <Tr key={payment.id}>
                  <Td className="px-4 py-3 text-center text-slate-500 sm:px-6">
                    {(invoicePage - 1) * DEFAULT_PAGE_SIZE + i + 1}
                  </Td>
                  <Td className="max-w-[8rem] px-4 py-3 sm:max-w-none sm:px-6">
                    <p className="truncate font-medium text-navy sm:overflow-visible sm:whitespace-normal">
                      {invoiceNumber(payment)}
                    </p>
                    <p className="truncate text-xs text-slate-400 sm:hidden">
                      {monthLabel(payment.dueDate)} · {formatMoney(payment.amount)} RWF
                    </p>
                  </Td>
                  <Td className="hidden px-6 py-3 text-slate-500 sm:table-cell">
                    {monthLabel(payment.dueDate)}
                  </Td>
                  <Td className="hidden px-6 py-3 text-slate-500 md:table-cell">
                    {formatDate(payment.dueDate)}
                  </Td>
                  <Td className="hidden px-6 py-3 text-slate-500 sm:table-cell">
                    {formatMoney(payment.amount)}
                  </Td>
                  <Td className="px-4 py-3 sm:px-6">
                    <span
                      className={`rounded-full px-2.5 py-1 text-xs font-medium ${STATUS_STYLES[payment.status]}`}
                    >
                      {t.dashboard.status[STATUS_KEY[payment.status]]}
                    </span>
                  </Td>
                  <Td className="px-4 py-3 sm:px-6">
                    <button
                      type="button"
                      onClick={() => setViewingPayment(payment)}
                      className="inline-flex items-center gap-1.5 rounded-lg border border-slate-300 px-2.5 py-1 text-xs font-medium text-slate-600 hover:bg-slate-50"
                    >
                      <Eye className="h-3.5 w-3.5" />
                      <span className="hidden sm:inline">{t.dashboard.actions.view}</span>
                    </button>
                  </Td>
                </Tr>
              ))}
              {pagedInvoices.length === 0 && (
                <EmptyRow colSpan={7}>{c.noInvoices}</EmptyRow>
              )}
            </TBody>
          </Table>

          <Pagination
            page={invoicePage}
            totalPages={invoiceTotalPages}
            totalItems={myPayments.length}
            pageSize={DEFAULT_PAGE_SIZE}
            onPageChange={setInvoicePage}
          />
        </>
      )}

      {tab === "payments" && (
        <>
          {pendingPayment ? (
            <AlertBanner
              isAlert
              stats={[
                { label: c.amountDue, value: `${formatMoney(pendingPayment.amount)} RWF` },
                { label: c.dueDate, value: formatDate(pendingPayment.dueDate) },
                { label: t.dashboard.table.status, value: t.dashboard.status[STATUS_KEY[pendingPayment.status]] },
              ]}
              message={
                pendingPayment.status === "Pending Approval"
                  ? c.awaitingApproval
                  : pendingPayment.status === "Late"
                    ? c.overdueMessage
                    : c.rentDueTemplate
                        .replace("{property}", pendingPayment.property)
                        .replace("{date}", formatDate(pendingPayment.dueDate))
              }
            >
              {pendingPayment.status !== "Pending Approval" && (
                <button
                  type="button"
                  onClick={() => setPayingId(pendingPayment.id)}
                  className="inline-flex items-center gap-2 rounded-lg bg-gold px-5 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-gold/90"
                >
                  <Wallet className="h-4 w-4" />
                  {c.payNow}
                </button>
              )}
              <button
                type="button"
                onClick={() => setViewingPayment(pendingPayment)}
                className="inline-flex items-center gap-2 rounded-lg border border-slate-300 bg-white px-5 py-2.5 text-sm font-semibold text-slate-600 transition-colors hover:bg-slate-50"
              >
                <Eye className="h-4 w-4" />
                {c.viewInvoice}
              </button>
              {otherPendingCount > 0 && (
                <span className="text-sm text-slate-500">
                  {c.moreInvoicesDueTemplate
                    .replaceAll("{count}", String(otherPendingCount))
                    .replaceAll("{plural}", otherPendingCount === 1 ? "" : "s")}
                </span>
              )}
            </AlertBanner>
          ) : (
            <AlertBanner
              isAlert={false}
              stats={[]}
              message={c.allCaughtUp}
            />
          )}

          <Table variant="standalone">
            <THead>
              <Tr>
                <Th className="px-4 py-3 text-center sm:px-6">{c.noNumber}</Th>
                <Th className="max-w-[8rem] px-4 py-3 sm:px-6">{c.paymentId}</Th>
                <Th className="hidden px-6 py-3 sm:table-cell">{c.amountPaidRwf}</Th>
                <Th className="hidden px-6 py-3 lg:table-cell">{c.reference}</Th>
                <Th className="hidden px-6 py-3 md:table-cell">{c.paymentDate}</Th>
                <Th className="hidden px-6 py-3 lg:table-cell">{c.paymentMethod}</Th>
                <Th className="px-4 py-3 sm:px-6">{t.dashboard.table.status}</Th>
                <Th className="px-4 py-3 sm:px-6">{t.dashboard.table.actions}</Th>
              </Tr>
            </THead>
            <TBody>
              {pagedConfirmedPayments.map((payment, i) => (
                <Tr key={payment.id}>
                  <Td className="px-4 py-3 text-center text-slate-500 sm:px-6">
                    {(paymentPage - 1) * DEFAULT_PAGE_SIZE + i + 1}
                  </Td>
                  <Td className="max-w-[8rem] px-4 py-3 sm:max-w-none sm:px-6">
                    <p className="truncate font-medium text-navy sm:overflow-visible sm:whitespace-normal">
                      {paymentId(payment)}
                    </p>
                    <p className="truncate text-xs text-slate-400 sm:hidden">
                      {formatMoney(payment.amount)} RWF · {payment.paidDate}
                    </p>
                  </Td>
                  <Td className="hidden px-6 py-3 text-slate-500 sm:table-cell">
                    {formatMoney(payment.amount)}
                  </Td>
                  <Td className="hidden px-6 py-3 text-slate-500 lg:table-cell">
                    {paymentReference(payment)}
                  </Td>
                  <Td className="hidden px-6 py-3 text-slate-500 md:table-cell">
                    {payment.paidDate ? formatDate(payment.paidDate) : "—"}
                  </Td>
                  <Td className="hidden px-6 py-3 text-slate-500 lg:table-cell">
                    {payment.method}
                  </Td>
                  <Td className="px-4 py-3 sm:px-6">
                    <span
                      className={`rounded-full px-2.5 py-1 text-xs font-medium ${STATUS_STYLES[payment.status]}`}
                    >
                      {t.dashboard.status[STATUS_KEY[payment.status]]}
                    </span>
                  </Td>
                  <Td className="px-4 py-3 sm:px-6">
                    <button
                      type="button"
                      onClick={() => setViewingPayment(payment)}
                      className="inline-flex items-center gap-1.5 rounded-lg border border-slate-300 px-2.5 py-1 text-xs font-medium text-slate-600 hover:bg-slate-50"
                    >
                      <Eye className="h-3.5 w-3.5" />
                      <span className="hidden sm:inline">{t.dashboard.actions.view}</span>
                    </button>
                  </Td>
                </Tr>
              ))}
              {pagedConfirmedPayments.length === 0 && (
                <EmptyRow colSpan={8}>{c.noConfirmedPayments}</EmptyRow>
              )}
            </TBody>
          </Table>

          <Pagination
            page={paymentPage}
            totalPages={paymentTotalPages}
            totalItems={confirmedPayments.length}
            pageSize={DEFAULT_PAGE_SIZE}
            onPageChange={setPaymentPage}
          />
        </>
      )}

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

      {payingPayment && (
        <Modal
          title={c.payRentTitle}
          description={`${payingPayment.property}`}
          onClose={() => setPayingId(null)}
        >
          <PayNowForm
            amount={payingPayment.amount}
            onCancel={() => setPayingId(null)}
            onSuccess={(method) => payNow(payingPayment.id, method)}
          />
        </Modal>
      )}
    </div>
  );
}
