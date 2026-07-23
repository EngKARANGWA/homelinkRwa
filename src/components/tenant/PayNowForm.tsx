"use client";

import { useState } from "react";
import type { PayInvoiceInput, PaymentMethod } from "@/lib/api/types";

const METHOD_LABELS: Record<PaymentMethod, string> = {
  mobile_money: "Mobile Money",
  bank_transfer: "Bank Transfer",
  cash: "Cash",
};

export function PayNowForm({
  amount,
  onSuccess,
  onCancel,
}: {
  amount: number;
  onSuccess: (values: PayInvoiceInput) => void;
  onCancel: () => void;
}) {
  const [method, setMethod] = useState<PaymentMethod>("mobile_money");
  const [payerPhone, setPayerPhone] = useState("");
  const [payerAccount, setPayerAccount] = useState("");
  const [error, setError] = useState<string | null>(null);

  const isMobileMoney = method === "mobile_money";
  const isBankTransfer = method === "bank_transfer";
  const needsApproval = isBankTransfer || method === "cash";

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        if (isMobileMoney && !payerPhone.trim()) {
          setError("Please enter the phone number to pay from.");
          return;
        }
        if (isBankTransfer && !payerAccount.trim()) {
          setError("Please enter the account number the transfer was made from.");
          return;
        }
        setError(null);
        onSuccess({
          method,
          payerPhone: isMobileMoney ? payerPhone.trim() : undefined,
          payerAccount: isBankTransfer ? payerAccount.trim() : undefined,
        });
      }}
    >
      <div className="flex flex-col gap-5">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
            Amount due
          </p>
          <p className="mt-1 text-2xl font-bold text-navy">
            {amount.toLocaleString()} RWF
          </p>
        </div>

        {error && (
          <p className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
            {error}
          </p>
        )}

        <label className="flex flex-col gap-1.5 text-sm font-medium text-slate-700">
          Payment method
          <select
            value={method}
            onChange={(e) => setMethod(e.target.value as PaymentMethod)}
            className="rounded-lg border border-slate-300 px-3 py-2.5 text-sm text-navy focus:border-gold focus:outline-none"
          >
            {(Object.keys(METHOD_LABELS) as PaymentMethod[]).map((m) => (
              <option key={m} value={m}>
                {METHOD_LABELS[m]}
              </option>
            ))}
          </select>
        </label>

        {isMobileMoney && (
          <label className="flex flex-col gap-1.5 text-sm font-medium text-slate-700">
            Phone number
            <input
              type="tel"
              value={payerPhone}
              onChange={(e) => setPayerPhone(e.target.value)}
              placeholder="+250 7XX XXX XXX"
              className="rounded-lg border border-slate-300 px-3 py-2.5 text-sm text-navy placeholder:text-slate-400 focus:border-gold focus:outline-none"
            />
          </label>
        )}

        {isBankTransfer && (
          <label className="flex flex-col gap-1.5 text-sm font-medium text-slate-700">
            Account number
            <input
              type="text"
              value={payerAccount}
              onChange={(e) => setPayerAccount(e.target.value)}
              placeholder="e.g. 000123456789"
              className="rounded-lg border border-slate-300 px-3 py-2.5 text-sm text-navy placeholder:text-slate-400 focus:border-gold focus:outline-none"
            />
          </label>
        )}

        {needsApproval && (
          <p className="rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-sm text-amber-700">
            {method === "cash"
              ? "Pay your landlord directly in cash, then submit this to notify them. They'll confirm receipt before it's marked paid."
              : "Bank transfers are confirmed manually. Your landlord will approve this once they've verified receipt."}
          </p>
        )}
      </div>

      <div className="mt-6 flex justify-end gap-3">
        <button
          type="button"
          onClick={onCancel}
          className="rounded-lg border border-slate-300 px-5 py-2.5 text-sm font-semibold text-slate-600 transition-colors hover:bg-slate-50"
        >
          Cancel
        </button>
        <button
          type="submit"
          className="rounded-lg bg-gold px-6 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-gold/90"
        >
          {needsApproval ? "Submit for Approval" : "Pay Now"}
        </button>
      </div>
    </form>
  );
}
