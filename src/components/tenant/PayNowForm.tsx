"use client";

import { useState } from "react";
import type { Payment } from "@/lib/mock-admin-data";
import { formatMoney } from "@/lib/money";
import { useLanguage } from "@/lib/i18n/LanguageContext";

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
  const { t } = useLanguage();
  const c = t.dashboard.tenant.payNowForm;
  const methodLabel: Record<Payment["method"], string> = {
    "MTN Mobile Money": t.dashboard.landlord.paymentMethods.mtnMobileMoney,
    "Airtel Money": t.dashboard.landlord.paymentMethods.airtelMoney,
    "Bank Transfer": t.dashboard.landlord.paymentMethods.bankTransfer,
    "Card / PayPal": c.methodCardPaypal,
    Cash: t.dashboard.landlord.paymentMethods.cash,
  };
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
            {c.amountDue}
          </p>
          <p className="mt-1 text-2xl font-bold text-navy">
            {formatMoney(amount)} RWF
          </p>
        </div>

        <label className="flex flex-col gap-1.5 text-sm font-medium text-slate-700">
          {c.paymentMethod}
          <select
            name="method"
            value={method}
            onChange={(e) => setMethod(e.target.value as Payment["method"])}
            className="rounded-lg border border-slate-300 px-3 py-2.5 text-sm text-navy focus:border-gold focus:outline-none"
          >
            {METHODS.map((m) => (
              <option key={m} value={m}>{methodLabel[m]}</option>
            ))}
          </select>
        </label>

        {isMobileMoney && (
          <label className="flex flex-col gap-1.5 text-sm font-medium text-slate-700">
            {c.phoneNumber}
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
            {c.accountNumber}
            <input
              type="text"
              required
              placeholder={c.accountNumberPlaceholder}
              className="rounded-lg border border-slate-300 px-3 py-2.5 text-sm text-navy placeholder:text-slate-400 focus:border-gold focus:outline-none"
            />
          </label>
        )}

        {isCard && (
          <>
            <label className="flex flex-col gap-1.5 text-sm font-medium text-slate-700">
              {c.cardNumber}
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
                {c.expiryDate}
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
                {c.cvv}
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
            {isCash ? c.cashHint : c.bankTransferHint}
          </p>
        )}
      </div>

      <div className="mt-6 flex justify-end gap-3">
        <button
          type="button"
          onClick={onCancel}
          className="rounded-lg border border-slate-300 px-5 py-2.5 text-sm font-semibold text-slate-600 transition-colors hover:bg-slate-50"
        >
          {t.dashboard.actions.cancel}
        </button>
        <button
          type="submit"
          className="rounded-lg bg-gold px-6 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-gold/90"
        >
          {needsApproval ? c.submitForApproval : c.payNow}
        </button>
      </div>
    </form>
  );
}
