import type { Invoice } from "@/lib/api/types";
import { INVOICE_STATUS_STYLES, formatStatusLabel } from "@/lib/paymentStatus";
import { formatMoney } from "@/lib/money";
import { useLanguage } from "@/lib/i18n/LanguageContext";
import type { Translations } from "@/lib/i18n/translations";

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">{label}</p>
      <div className="mt-1 text-sm font-medium text-navy">{children}</div>
    </div>
  );
}

function formatDate(dateStr: string) {
  return new Date(dateStr).toLocaleDateString("en-GB", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

function monthLabel(dateStr: string) {
  return new Date(dateStr).toLocaleDateString("en-US", { month: "long", year: "numeric" });
}

const INVOICE_STATUS_KEY: Partial<Record<Invoice["status"], keyof Translations["dashboard"]["status"]>> = {
  paid: "paid",
  overdue: "overdue",
};

export function InvoiceDetail({
  invoice,
  propertyLabel,
}: {
  invoice: Invoice;
  propertyLabel?: string;
}) {
  const { t } = useLanguage();
  const statusKey = INVOICE_STATUS_KEY[invoice.status];
  const statusLabel = statusKey ? t.dashboard.status[statusKey] : formatStatusLabel(invoice.status);

  return (
    <div className="flex flex-col gap-5">
      <div className="grid grid-cols-2 gap-5">
        {propertyLabel && (
          <div className="col-span-2">
            <Field label="Property">{propertyLabel}</Field>
          </div>
        )}
        <Field label="Invoice #">{invoice.invoiceNumber}</Field>
        <Field label="Billing period">{monthLabel(invoice.dueDate)}</Field>
        <Field label="Due date">{formatDate(invoice.dueDate)}</Field>
        <Field label="Status">
          <span
            className={`inline-block rounded-full px-2.5 py-1 text-xs font-medium ${INVOICE_STATUS_STYLES[invoice.status]}`}
          >
            {statusLabel}
          </span>
        </Field>
      </div>

      <div className="flex items-center justify-between border-t border-slate-100 pt-4">
        <span className="text-sm font-semibold text-navy">Amount due</span>
        <span className="text-xl font-bold text-navy">
          {formatMoney(Number(invoice.amountDue))} RWF
        </span>
      </div>

      <p className="text-xs text-slate-400">Issued {formatDate(invoice.createdAt)}</p>
    </div>
  );
}
