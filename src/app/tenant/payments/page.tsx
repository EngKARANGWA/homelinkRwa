"use client";

import { useState } from "react";
import { CheckCircle2, Download, Eye, Wallet } from "lucide-react";
import { PAYMENTS, type Payment } from "@/lib/mock-admin-data";
import { useTenant } from "@/components/tenant/TenantContext";
import { Modal } from "@/components/admin/Modal";
import { PaymentReceipt } from "@/components/admin/PaymentReceipt";
import { PayNowForm } from "@/components/tenant/PayNowForm";
import { downloadCSV } from "@/lib/csv";

const STATUS_STYLES: Record<Payment["status"], string> = {
  Paid: "bg-emerald-50 text-emerald-700",
  Late: "bg-red-50 text-red-700",
  Pending: "bg-amber-50 text-amber-700",
  "Pending Approval": "bg-sky-50 text-sky-700",
};

const TODAY = "2026-07-08";

export default function TenantPaymentsPage() {
  const { tenantName } = useTenant();
  const [payments, setPayments] = useState(PAYMENTS);
  const [viewingPayment, setViewingPayment] = useState<Payment | null>(null);
  const [payingId, setPayingId] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);

  const myPayments = payments.filter((p) => p.tenant === tenantName);
  const payingPayment = myPayments.find((p) => p.id === payingId);

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
    setNotice(
      needsApproval
        ? "Payment submitted. Awaiting your landlord's approval."
        : "Payment successful. Your receipt is ready to view.",
    );
  };

  const handleDownloadStatement = () => {
    downloadCSV(
      "my-rent-statement.csv",
      ["Property", "Amount", "Method", "Due Date", "Status"],
      myPayments.map((p) => [
        p.property,
        p.amount,
        p.method,
        p.dueDate,
        p.status,
      ]),
    );
  };

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-navy">Payments</h1>
          <p className="mt-1 text-sm text-slate-500">
            Your rent payment history.
          </p>
        </div>
        <button
          type="button"
          onClick={handleDownloadStatement}
          className="inline-flex items-center gap-2 rounded-lg border border-slate-300 px-5 py-2.5 text-sm font-semibold text-slate-600 transition-colors hover:bg-slate-50"
        >
          <Download className="h-4 w-4" />
          Download Statement
        </button>
      </div>

      {notice && (
        <div className="flex items-center gap-2 rounded-lg border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm font-medium text-emerald-700">
          <CheckCircle2 className="h-4 w-4" />
          {notice}
        </div>
      )}

      <div className="overflow-x-auto rounded-xl border border-slate-200 bg-white shadow-sm">
        <table className="w-full text-left text-sm">
          <thead>
            <tr className="text-xs uppercase tracking-wide text-slate-400">
              <th className="max-w-[9rem] px-4 py-3 font-medium sm:px-6">Property</th>
              <th className="hidden px-6 py-3 font-medium sm:table-cell">Amount (RWF)</th>
              <th className="hidden px-6 py-3 font-medium lg:table-cell">Method</th>
              <th className="hidden px-6 py-3 font-medium md:table-cell">Due Date</th>
              <th className="px-4 py-3 font-medium sm:px-6">Status</th>
              <th className="px-4 py-3 font-medium sm:px-6">Actions</th>
            </tr>
          </thead>
          <tbody>
            {myPayments.map((payment) => (
              <tr key={payment.id} className="border-t border-slate-100">
                <td className="max-w-[9rem] px-4 py-3 sm:max-w-none sm:px-6">
                  <p className="truncate font-medium text-navy sm:overflow-visible sm:whitespace-normal">
                    {payment.property}
                  </p>
                  <p className="text-xs text-slate-400 sm:hidden">
                    {payment.amount.toLocaleString()} RWF
                  </p>
                </td>
                <td className="hidden px-6 py-3 text-slate-500 sm:table-cell">
                  {payment.amount.toLocaleString()}
                </td>
                <td className="hidden px-6 py-3 text-slate-500 lg:table-cell">
                  {payment.method}
                </td>
                <td className="hidden px-6 py-3 text-slate-500 md:table-cell">
                  {payment.dueDate}
                </td>
                <td className="px-4 py-3 sm:px-6">
                  <span
                    className={`rounded-full px-2.5 py-1 text-xs font-medium ${STATUS_STYLES[payment.status]}`}
                  >
                    {payment.status}
                  </span>
                </td>
                <td className="max-w-[6.5rem] px-4 py-3 sm:max-w-none sm:whitespace-nowrap sm:px-6">
                  <div className="flex flex-wrap items-center gap-2">
                    <button
                      type="button"
                      onClick={() => setViewingPayment(payment)}
                      className="inline-flex items-center gap-1.5 rounded-lg border border-slate-300 px-2.5 py-1 text-xs font-medium text-slate-600 hover:bg-slate-50"
                    >
                      <Eye className="h-3.5 w-3.5" />
                      View
                    </button>
                    {payment.status !== "Paid" &&
                      payment.status !== "Pending Approval" && (
                      <button
                        type="button"
                        onClick={() => setPayingId(payment.id)}
                        aria-label={`Pay now for ${payment.property}`}
                        className="inline-flex items-center gap-1.5 rounded-lg bg-gold px-2.5 py-1 text-xs font-semibold text-white hover:bg-gold/90"
                      >
                        <Wallet className="h-3.5 w-3.5" />
                        <span className="hidden sm:inline">Pay Now</span>
                      </button>
                    )}
                  </div>
                </td>
              </tr>
            ))}
            {myPayments.length === 0 && (
              <tr>
                <td colSpan={6} className="px-6 py-8 text-center text-slate-400">
                  No payments on file yet.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {viewingPayment && (
        <Modal
          title={viewingPayment.status === "Paid" ? "Payment Receipt" : "Invoice"}
          description={`${viewingPayment.tenant} · ${viewingPayment.property}`}
          onClose={() => setViewingPayment(null)}
          maxWidthClassName="max-w-3xl"
        >
          <PaymentReceipt payment={viewingPayment} />
        </Modal>
      )}

      {payingPayment && (
        <Modal
          title="Pay Rent"
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
