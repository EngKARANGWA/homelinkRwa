"use client";

import { Printer } from "lucide-react";
import { type Payment } from "@/lib/mock-admin-data";
import { getTenantUnitNumber } from "@/lib/units";
import { formatMoney } from "@/lib/money";

function formatDate(dateStr: string) {
  return new Date(dateStr).toLocaleDateString("en-GB", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

export function PaymentReceipt({ payment }: { payment: Payment }) {
  const unitNumber = getTenantUnitNumber(payment.property, payment.tenant);

  return (
    <div>
      <div className="flex justify-end">
        <button
          type="button"
          onClick={() => window.print()}
          className="inline-flex items-center gap-2 rounded-lg border border-slate-300 px-4 py-2 text-sm font-semibold text-slate-600 transition-colors hover:bg-slate-50"
        >
          <Printer className="h-4 w-4" />
          Print / Download
        </button>
      </div>

      <div className="mt-4 rounded-lg border border-slate-200 bg-white p-10 font-serif text-slate-800 shadow-inner">
        <div className="text-center">
          <p className="text-xs uppercase tracking-[0.3em] text-slate-400">
            HomeLink Rwanda
          </p>
          <h3 className="mt-2 text-2xl font-bold uppercase tracking-wide text-navy">
            {payment.status === "Paid" ? "Payment Receipt" : "Invoice"}
          </h3>
          <p className="mt-1 text-xs text-slate-400">
            Invoice No: INV-{payment.id.padStart(4, "0")}
          </p>
        </div>

        <div className="mx-auto mt-6 h-px w-full bg-slate-200" />

        <div className="mt-6 grid grid-cols-2 gap-6 text-sm">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
              Billed To
            </p>
            <p className="mt-1 font-medium text-navy">{payment.tenant}</p>
          </div>
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
              Payable To
            </p>
            <p className="mt-1 font-medium text-navy">{payment.owner}</p>
          </div>
        </div>

        <div className="mt-6">
          <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
            Property
          </p>
          <p className="mt-1 font-medium text-navy">
            {payment.property}
            {unitNumber ? ` · Unit ${unitNumber}` : ""}
          </p>
        </div>

        <div className="mt-6 grid grid-cols-3 gap-6 text-sm">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
              Due Date
            </p>
            <p className="mt-1 font-medium text-navy">
              {formatDate(payment.dueDate)}
            </p>
          </div>
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
              Payment Method
            </p>
            <p className="mt-1 font-medium text-navy">{payment.method}</p>
          </div>
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
              Amount
            </p>
            <p className="mt-1 font-medium text-navy">
              {formatMoney(payment.amount)} RWF
            </p>
          </div>
        </div>

        <div className="mx-auto mt-8 h-px w-full bg-slate-200" />

        <p className="mt-6 text-center text-sm">
          {payment.status === "Paid"
            ? `Paid in full on ${formatDate(payment.paidDate!)} via ${payment.method}.`
            : payment.status === "Late"
              ? "This payment is overdue. Please settle as soon as possible."
              : "This payment has not yet been received."}
        </p>
      </div>
    </div>
  );
}
