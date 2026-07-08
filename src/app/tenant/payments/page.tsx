"use client";

import { useState } from "react";
import { CheckCircle2, Eye, Wallet } from "lucide-react";
import { PAYMENTS, type Payment } from "@/lib/mock-admin-data";
import { useTenant } from "@/components/tenant/TenantContext";
import { Modal } from "@/components/admin/Modal";
import { PaymentReceipt } from "@/components/admin/PaymentReceipt";
import { PayNowForm } from "@/components/tenant/PayNowForm";

const STATUS_STYLES: Record<Payment["status"], string> = {
  Paid: "bg-emerald-50 text-emerald-700",
  Late: "bg-red-50 text-red-700",
  Pending: "bg-amber-50 text-amber-700",
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
    setPayments((prev) =>
      prev.map((p) =>
        p.id === id ? { ...p, status: "Paid", method, paidDate: TODAY } : p,
      ),
    );
    setPayingId(null);
    setNotice("Payment successful. Your receipt is ready to view.");
  };

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-bold text-navy">Payments</h1>
        <p className="mt-1 text-sm text-slate-500">
          Your rent payment history.
        </p>
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
              <th className="px-6 py-3 font-medium">Property</th>
              <th className="px-6 py-3 font-medium">Amount (RWF)</th>
              <th className="px-6 py-3 font-medium">Method</th>
              <th className="px-6 py-3 font-medium">Due Date</th>
              <th className="px-6 py-3 font-medium">Status</th>
              <th className="px-6 py-3 font-medium">Actions</th>
            </tr>
          </thead>
          <tbody>
            {myPayments.map((payment) => (
              <tr key={payment.id} className="border-t border-slate-100">
                <td className="px-6 py-3 font-medium text-navy">
                  {payment.property}
                </td>
                <td className="px-6 py-3 text-slate-500">
                  {payment.amount.toLocaleString()}
                </td>
                <td className="px-6 py-3 text-slate-500">
                  {payment.method}
                </td>
                <td className="px-6 py-3 text-slate-500">
                  {payment.dueDate}
                </td>
                <td className="px-6 py-3">
                  <span
                    className={`rounded-full px-2.5 py-1 text-xs font-medium ${STATUS_STYLES[payment.status]}`}
                  >
                    {payment.status}
                  </span>
                </td>
                <td className="px-6 py-3">
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => setViewingPayment(payment)}
                      className="inline-flex items-center gap-1.5 rounded-lg border border-slate-300 px-2.5 py-1 text-xs font-medium text-slate-600 hover:bg-slate-50"
                    >
                      <Eye className="h-3.5 w-3.5" />
                      View
                    </button>
                    {payment.status !== "Paid" && (
                      <button
                        type="button"
                        onClick={() => setPayingId(payment.id)}
                        className="inline-flex items-center gap-1.5 rounded-lg bg-gold px-2.5 py-1 text-xs font-semibold text-navy hover:bg-gold/90"
                      >
                        <Wallet className="h-3.5 w-3.5" />
                        Pay Now
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
