"use client";

import { useState } from "react";
import { Download, Eye } from "lucide-react";
import { PAYMENTS, type Payment } from "@/lib/mock-admin-data";
import { useLandlord } from "@/components/landlord/LandlordContext";
import { Modal } from "@/components/admin/Modal";
import { PaymentReceipt } from "@/components/admin/PaymentReceipt";
import { downloadCSV } from "@/lib/csv";

const STATUS_STYLES: Record<Payment["status"], string> = {
  Paid: "bg-emerald-50 text-emerald-700",
  Late: "bg-red-50 text-red-700",
  Pending: "bg-amber-50 text-amber-700",
};

export default function LandlordPaymentsPage() {
  const { landlordName } = useLandlord();
  const [viewingPayment, setViewingPayment] = useState<Payment | null>(null);

  const myPayments = PAYMENTS.filter((p) => p.owner === landlordName);
  const outstanding = myPayments
    .filter((p) => p.status !== "Paid")
    .reduce((sum, p) => sum + p.amount, 0);

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
  };

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-navy">Payments</h1>
          <p className="mt-1 text-sm text-slate-500">
            Rent payments across your properties.
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

      <div className="grid gap-5 sm:grid-cols-2">
        <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
          <p className="text-sm text-slate-500">Outstanding rent (arrears)</p>
          <p className="mt-2 text-2xl font-bold text-navy">
            {outstanding.toLocaleString()} RWF
          </p>
        </div>
        <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
          <p className="text-sm text-slate-500">Properties in arrears</p>
          <p className="mt-2 text-2xl font-bold text-navy">
            {myPayments.filter((p) => p.status === "Late").length}
          </p>
        </div>
      </div>

      <div className="overflow-x-auto rounded-xl border border-slate-200 bg-white shadow-sm">
        <table className="w-full text-left text-sm">
          <thead>
            <tr className="text-xs uppercase tracking-wide text-slate-400">
              <th className="px-6 py-3 font-medium">Tenant</th>
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
                  {payment.tenant}
                </td>
                <td className="px-6 py-3 text-slate-500">
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
                  <button
                    type="button"
                    onClick={() => setViewingPayment(payment)}
                    className="inline-flex items-center gap-1.5 rounded-lg border border-slate-300 px-2.5 py-1 text-xs font-medium text-slate-600 hover:bg-slate-50"
                  >
                    <Eye className="h-3.5 w-3.5" />
                    View
                  </button>
                </td>
              </tr>
            ))}
            {myPayments.length === 0 && (
              <tr>
                <td colSpan={7} className="px-6 py-8 text-center text-slate-400">
                  No payments on your properties yet.
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
    </div>
  );
}
