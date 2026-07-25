"use client";

import { useState } from "react";
import type { Payment } from "@/lib/mock-admin-data";
import { formatMoney } from "@/lib/money";

const METHODS: Payment["method"][] = [
  "MTN Mobile Money",
  "Airtel Money",
  "Bank Transfer",
  "Card / PayPal",
  "Cash",
];

export function PayNowForm({
  amount,
  onSuccess,
  onCancel,
}: {
  amount: number;
  onSuccess: (method: Payment["method"]) => void;
  onCancel: () => void;
}) {
  const [method, setMethod] = useState<Payment["method"]>(METHODS[0]);
  const isMobileMoney = method === "MTN Mobile Money" || method === "Airtel Money";
  const isBankTransfer = method === "Bank Transfer";
  const isCard = method === "Card / PayPal";
  const isCash = method === "Cash";
  const needsApproval = isBankTransfer || isCash;

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        onSuccess(method);
      }}
    >
      <div className="flex flex-col gap-5">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
            Amount due
          </p>
          <p className="mt-1 text-2xl font-bold text-navy">
            {formatMoney(amount)} RWF
          </p>
        </div>

        <label className="flex flex-col gap-1.5 text-sm font-medium text-slate-700">
          Payment method
          <select
            name="method"
            value={method}
            onChange={(e) => setMethod(e.target.value as Payment["method"])}
            className="rounded-lg border border-slate-300 px-3 py-2.5 text-sm text-navy focus:border-gold focus:outline-none"
          >
            {METHODS.map((m) => (
              <option key={m}>{m}</option>
            ))}
          </select>
        </label>

        {isMobileMoney && (
          <label className="flex flex-col gap-1.5 text-sm font-medium text-slate-700">
            Phone number
            <input
              type="tel"
              required
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
              required
              placeholder="e.g. 000123456789"
              className="rounded-lg border border-slate-300 px-3 py-2.5 text-sm text-navy placeholder:text-slate-400 focus:border-gold focus:outline-none"
            />
          </label>
        )}

        {isCard && (
          <>
            <label className="flex flex-col gap-1.5 text-sm font-medium text-slate-700">
              Card number
              <input
                type="text"
                required
                inputMode="numeric"
                maxLength={19}
                placeholder="1234 5678 9012 3456"
                className="rounded-lg border border-slate-300 px-3 py-2.5 text-sm text-navy placeholder:text-slate-400 focus:border-gold focus:outline-none"
              />
            </label>

            <div className="grid grid-cols-2 gap-4">
              <label className="flex flex-col gap-1.5 text-sm font-medium text-slate-700">
                Expiry date
                <input
                  type="text"
                  required
                  inputMode="numeric"
                  maxLength={5}
                  placeholder="MM/YY"
                  className="rounded-lg border border-slate-300 px-3 py-2.5 text-sm text-navy placeholder:text-slate-400 focus:border-gold focus:outline-none"
                />
              </label>

              <label className="flex flex-col gap-1.5 text-sm font-medium text-slate-700">
                CVV
                <input
                  type="text"
                  required
                  inputMode="numeric"
                  maxLength={4}
                  placeholder="123"
                  className="rounded-lg border border-slate-300 px-3 py-2.5 text-sm text-navy placeholder:text-slate-400 focus:border-gold focus:outline-none"
                />
              </label>
            </div>
          </>
        )}

        {needsApproval && (
          <p className="rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-sm text-amber-700">
            {isCash
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
