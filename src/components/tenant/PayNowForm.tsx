"use client";

import { useState } from "react";
import {
  AlertTriangle,
  Banknote,
  Building2,
  Loader2,
  Send,
  Smartphone,
} from "lucide-react";
import type { PayInvoiceInput, PaymentMethod } from "@/lib/api/types";
import { useLanguage } from "@/lib/i18n/LanguageContext";
import { ApiError } from "@/lib/api/client";

/** Exact, unabbreviated amount — a payment confirmation must never show a
 * rounded "1.5M" in place of the real figure the tenant is expected to pay. */
function exactAmount(n: number) {
  return n.toLocaleString();
}

type TenantPaymentMethod = Extract<PaymentMethod, "mobile_money" | "cash">;

export function PayNowForm({
  invoiceNumber,
  period,
  dueDateLabel,
  propertyTitle,
  amount,
  overdueAmount,
  overdueCount,
  defaultPhone,
  onSuccess,
  onCancel,
}: {
  invoiceNumber?: string;
  period: string;
  dueDateLabel: string;
  propertyTitle?: string;
  /** This invoice's own amount due — the only amount this submission actually pays. */
  amount: number;
  /** Sum of other, earlier invoices still outstanding — shown for awareness only. */
  overdueAmount: number;
  /** Omit when the exact count isn't known (e.g. a dashboard summary that only has a total). */
  overdueCount?: number;
  defaultPhone?: string;
  onSuccess: (values: PayInvoiceInput) => Promise<void>;
  onCancel: () => void;
}) {
  const { t } = useLanguage();
  const c = t.dashboard.tenant.payNowForm;
  const [method, setMethod] = useState<TenantPaymentMethod>("mobile_money");
  const [payerPhone, setPayerPhone] = useState(defaultPhone ?? "");
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const isMobileMoney = method === "mobile_money";
  const totalOwed = amount + overdueAmount;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isMobileMoney && !payerPhone.trim()) {
      setError(c.phoneRequiredError);
      return;
    }
    setError(null);
    setSubmitting(true);
    try {
      await onSuccess({
        method,
        carrier: isMobileMoney ? "mtn" : undefined,
        payerPhone: isMobileMoney ? payerPhone.trim() : undefined,
      });
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Failed to submit payment.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-5">
      {error && (
        <p className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
          {error}
        </p>
      )}

      <div className="flex flex-col gap-3 rounded-xl border border-slate-200 bg-slate-50 p-4">
        <div className="flex items-center gap-2 text-sm font-semibold text-navy">
          <Building2 className="h-4 w-4 text-slate-400" />
          {c.summaryTitle}
        </div>

        <div className="grid grid-cols-2 gap-x-4 gap-y-2 text-sm">
          {propertyTitle && (
            <div className="col-span-2">
              <p className="text-xs text-slate-400">{c.property}</p>
              <p className="font-medium text-navy">{propertyTitle}</p>
            </div>
          )}
          {invoiceNumber && (
            <div>
              <p className="text-xs text-slate-400">{c.invoice}</p>
              <p className="font-medium text-navy">{invoiceNumber}</p>
            </div>
          )}
          <div>
            <p className="text-xs text-slate-400">{c.period}</p>
            <p className="font-medium text-navy">{period}</p>
          </div>
          <div className="col-span-2">
            <p className="text-xs text-slate-400">{c.dueDate}</p>
            <p className="font-medium text-navy">{dueDateLabel}</p>
          </div>
        </div>

        <div className="border-t border-slate-200 pt-3">
          <div className="flex items-center justify-between text-sm">
            <span className="text-slate-500">{c.rentAmount}</span>
            <span className="font-medium text-navy">{exactAmount(amount)} RWF</span>
          </div>

          {overdueAmount > 0 && (
            <div className="mt-1.5 flex items-center justify-between text-sm">
              <span className="text-red-600">
                {overdueCount
                  ? c.previousOverdueTemplate.replace("{count}", String(overdueCount))
                  : c.previousOverdueLabel}
              </span>
              <span className="font-medium text-red-600">
                {exactAmount(overdueAmount)} RWF
              </span>
            </div>
          )}

          <div className="mt-2 flex items-center justify-between border-t border-slate-200 pt-2">
            <span className="text-sm font-semibold text-navy">{c.totalPayable}</span>
            <span className="text-xl font-bold text-navy">{exactAmount(totalOwed)} RWF</span>
          </div>
        </div>

        {overdueAmount > 0 && (
          <p className="flex items-start gap-1.5 text-xs text-slate-500">
            <AlertTriangle className="h-3.5 w-3.5 shrink-0 text-amber-500" />
            {c.settlesNoteTemplate.replace("{period}", period)}
          </p>
        )}
      </div>

      <div className="flex flex-col gap-2">
        <p className="text-sm font-medium text-slate-700">{c.paymentMethod}</p>
        <div className="grid grid-cols-2 gap-3">
          <button
            type="button"
            onClick={() => setMethod("mobile_money")}
            className={`flex items-center gap-2.5 rounded-lg border-2 px-4 py-3 text-left transition-colors ${
              isMobileMoney
                ? "border-gold bg-gold/5"
                : "border-slate-200 hover:border-slate-300"
            }`}
          >
            <span
              className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full ${
                isMobileMoney ? "bg-gold text-white" : "bg-slate-100 text-slate-500"
              }`}
            >
              <Smartphone className="h-4 w-4" />
            </span>
            <span className="text-sm font-semibold text-navy">{c.mtnMomo}</span>
          </button>

          <button
            type="button"
            onClick={() => setMethod("cash")}
            className={`flex items-center gap-2.5 rounded-lg border-2 px-4 py-3 text-left transition-colors ${
              !isMobileMoney
                ? "border-gold bg-gold/5"
                : "border-slate-200 hover:border-slate-300"
            }`}
          >
            <span
              className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full ${
                !isMobileMoney ? "bg-gold text-white" : "bg-slate-100 text-slate-500"
              }`}
            >
              <Banknote className="h-4 w-4" />
            </span>
            <span className="text-sm font-semibold text-navy">
              {t.dashboard.landlord.paymentMethods.cash}
            </span>
          </button>
        </div>
      </div>

      {isMobileMoney ? (
        <div className="flex flex-col gap-2">
          <label className="flex flex-col gap-1.5 text-sm font-medium text-slate-700">
            {c.phoneNumber}
            <input
              type="tel"
              value={payerPhone}
              onChange={(e) => setPayerPhone(e.target.value)}
              placeholder="+250 7XX XXX XXX"
              className="rounded-lg border border-slate-300 px-3 py-2.5 text-sm text-navy placeholder:text-slate-400 focus:border-gold focus:outline-none"
            />
          </label>
          <p className="text-xs text-slate-400">{c.momoHint}</p>
        </div>
      ) : (
        <p className="rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-sm text-amber-700">
          {c.cashHint}
        </p>
      )}

      <div className="mt-1 flex justify-end gap-3">
        <button
          type="button"
          onClick={onCancel}
          disabled={submitting}
          className="rounded-lg border border-slate-300 px-5 py-2.5 text-sm font-semibold text-slate-600 transition-colors hover:bg-slate-50 disabled:opacity-60"
        >
          {t.dashboard.actions.cancel}
        </button>
        <button
          type="submit"
          disabled={submitting}
          className="inline-flex items-center gap-2 rounded-lg bg-gold px-6 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-gold/90 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {submitting ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : isMobileMoney ? (
            <Send className="h-4 w-4" />
          ) : null}
          {isMobileMoney
            ? submitting
              ? c.sending
              : c.sendPrompt
            : submitting
              ? c.submitting
              : c.submitForApproval}
        </button>
      </div>
    </form>
  );
}
