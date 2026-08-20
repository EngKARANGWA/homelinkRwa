"use client";

import { useEffect, useState } from "react";
import { CheckCircle2, Eye } from "lucide-react";
import { PAYMENTS, type Payment } from "@/lib/mock-admin-data";
import { Modal } from "@/components/admin/Modal";
import { PaymentReceipt } from "@/components/admin/PaymentReceipt";
import { Table, TBody, Td, Th, THead, Tr } from "@/components/dashboard/Table";
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

const TODAY = "2026-07-08";

export default function PaymentsPage() {
  const { t } = useLanguage();
  const c = t.dashboard.admin.payments;
  const [payments, setPayments] = useState(PAYMENTS);
  const [viewingPayment, setViewingPayment] = useState<Payment | null>(null);
  const [page, setPage] = useState(1);

  const totalPages = Math.max(1, Math.ceil(payments.length / DEFAULT_PAGE_SIZE));
  useEffect(() => {
    if (page > totalPages) setPage(totalPages);
  }, [page, totalPages]);
  const pagedPayments = payments.slice(
    (page - 1) * DEFAULT_PAGE_SIZE,
    page * DEFAULT_PAGE_SIZE,
  );

  const markAsPaid = (id: string) => {
    setPayments((prev) =>
      prev.map((p) =>
        p.id === id ? { ...p, status: "Paid", paidDate: TODAY } : p,
      ),
    );
  };

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-bold text-navy">{c.title}</h1>
        <p className="mt-1 text-sm text-slate-500">
          {c.subtitle}
        </p>
      </div>

      <Table variant="standalone">
        <THead>
          <Tr>
            <Th className="px-6 py-3">{t.dashboard.table.tenant}</Th>
            <Th className="px-6 py-3">{t.dashboard.table.property}</Th>
            <Th className="px-6 py-3">{t.dashboard.table.amountRwf}</Th>
            <Th className="px-6 py-3">{t.dashboard.table.method}</Th>
            <Th className="px-6 py-3">{t.dashboard.table.dueDate}</Th>
            <Th className="px-6 py-3">{t.dashboard.table.status}</Th>
            <Th className="px-6 py-3">{t.dashboard.table.actions}</Th>
          </Tr>
        </THead>
        <TBody>
          {pagedPayments.map((payment) => (
            <Tr key={payment.id}>
              <Td className="px-6 py-3 font-medium text-navy">
                {payment.tenant}
              </Td>
              <Td className="px-6 py-3 text-slate-500">
                {payment.property}
              </Td>
              <Td className="px-6 py-3 text-slate-500">
                {formatMoney(payment.amount)}
              </Td>
              <Td className="px-6 py-3 text-slate-500">
                {payment.method}
              </Td>
              <Td className="px-6 py-3 text-slate-500">
                {payment.dueDate}
              </Td>
              <Td className="px-6 py-3">
                <span
                  className={`rounded-full px-2.5 py-1 text-xs font-medium ${STATUS_STYLES[payment.status]}`}
                >
                  {t.dashboard.status[STATUS_KEY[payment.status]]}
                </span>
              </Td>
              <Td className="px-6 py-3">
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setViewingPayment(payment)}
                    className="inline-flex items-center gap-1.5 rounded-lg border border-slate-300 px-2.5 py-1 text-xs font-medium text-slate-600 hover:bg-slate-50"
                  >
                    <Eye className="h-3.5 w-3.5" />
                    {t.dashboard.actions.view}
                  </button>
                  {payment.status !== "Paid" && (
                    <button
                      type="button"
                      onClick={() => markAsPaid(payment.id)}
                      className="inline-flex items-center gap-1.5 rounded-lg border border-emerald-200 bg-emerald-50 px-2.5 py-1 text-xs font-medium text-emerald-700 hover:bg-emerald-100"
                    >
                      <CheckCircle2 className="h-3.5 w-3.5" />
                      {c.markAsPaid}
                    </button>
                  )}
                </div>
              </Td>
            </Tr>
          ))}
        </TBody>
      </Table>

      <Pagination
        page={page}
        totalPages={totalPages}
        totalItems={payments.length}
        pageSize={DEFAULT_PAGE_SIZE}
        onPageChange={setPage}
      />

      {viewingPayment && (
        <Modal
          title={viewingPayment.status === "Paid" ? c.receiptTitle : c.invoiceTitle}
          description={`${viewingPayment.tenant} · ${viewingPayment.property}`}
          onClose={() => setViewingPayment(null)}
          maxWidthClassName="max-w-3xl"
        >
          <PaymentReceipt payment={viewingPayment} />
        </Modal>
      )}
    </div>
  );
}
