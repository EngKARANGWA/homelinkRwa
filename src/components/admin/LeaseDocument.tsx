"use client";

import { Printer } from "lucide-react";
import { type Lease, PROPERTIES } from "@/lib/mock-admin-data";
import { getTenantUnitNumber } from "@/lib/units";
import { formatMoney } from "@/lib/money";
import { useLanguage } from "@/lib/i18n/LanguageContext";

function formatDate(dateStr: string | null) {
  if (!dateStr) return "—";
  return new Date(dateStr).toLocaleDateString("en-GB", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

export function LeaseDocument({ lease }: { lease: Lease }) {
  const { t } = useLanguage();
  const c = t.dashboard.admin.leaseDocument;
  const property = PROPERTIES.find((p) => p.name === lease.property);
  const unitNumber = getTenantUnitNumber(lease.property, lease.tenant);
  const isSigned = lease.status !== "Renewal Requested";

  return (
    <div>
      <div className="flex justify-end">
        <button
          type="button"
          onClick={() => window.print()}
          className="inline-flex items-center gap-2 rounded-lg border border-slate-300 px-4 py-2 text-sm font-semibold text-slate-600 transition-colors hover:bg-slate-50"
        >
          <Printer className="h-4 w-4" />
          {c.printDownload}
        </button>
      </div>

      <div className="mt-4 rounded-lg border border-slate-200 bg-white p-10 font-serif text-slate-800 shadow-inner">
        <div className="text-center">
          <p className="text-xs uppercase tracking-[0.3em] text-slate-400">
            HomeLink Rwanda
          </p>
          <h3 className="mt-2 text-2xl font-bold uppercase tracking-wide text-navy">
            {c.title}
          </h3>
          <p className="mt-1 text-xs text-slate-400">{c.leaseIdTemplate.replace("{id}", lease.id.padStart(4, "0"))}</p>
        </div>

        <div className="mx-auto mt-6 h-px w-full bg-slate-200" />

        <p className="mt-6 text-sm leading-relaxed">
          {c.intro}
        </p>

        <div className="mt-6 grid grid-cols-2 gap-6 text-sm">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
              {c.landlord}
            </p>
            <p className="mt-1 font-medium text-navy">{lease.owner}</p>
          </div>
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
              {c.tenant}
            </p>
            <p className="mt-1 font-medium text-navy">{lease.tenant}</p>
          </div>
        </div>

        <div className="mt-6">
          <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
            {c.property}
          </p>
          <p className="mt-1 font-medium text-navy">
            {lease.property}
            {unitNumber ? c.unitTemplate.replace("{unit}", unitNumber) : ""}
          </p>
          {property && (
            <p className="text-sm text-slate-500">{property.address}</p>
          )}
        </div>

        <div className="mt-6 grid grid-cols-3 gap-6 text-sm">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
              {c.leaseStart}
            </p>
            <p className="mt-1 font-medium text-navy">
              {formatDate(lease.startDate)}
            </p>
          </div>
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
              {c.leaseEnd}
            </p>
            <p className="mt-1 font-medium text-navy">
              {lease.endDate ? formatDate(lease.endDate) : c.openEnded}
            </p>
          </div>
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
              {c.paymentDate}
            </p>
            <p className="mt-1 font-medium text-navy">
              {formatDate(lease.paymentDate)}
            </p>
          </div>
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
              {c.monthlyRent}
            </p>
            <p className="mt-1 font-medium text-navy">
              {formatMoney(lease.rent)} RWF
            </p>
          </div>
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
              {c.securityDeposit}
            </p>
            <p className="mt-1 font-medium text-navy">
              {formatMoney(lease.deposit)} RWF
            </p>
          </div>
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
              {c.rentMomoNumber}
            </p>
            <p className="mt-1 font-medium text-navy">{lease.momoNumber}</p>
          </div>
        </div>

        {lease.leasePeriodNote && (
          <div className="mt-6">
            <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
              {c.leasePeriod}
            </p>
            <p className="mt-1 text-sm text-slate-600">{lease.leasePeriodNote}</p>
          </div>
        )}

        {property && property.terms.length > 0 && (
          <div className="mt-6">
            <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
              {c.termsAndConditions}
            </p>
            <ul className="mt-1 list-disc pl-5 text-sm text-slate-600">
              {property.terms.map((term) => (
                <li key={term}>{term}</li>
              ))}
            </ul>
          </div>
        )}

        <div className="mt-10 grid grid-cols-2 gap-10 text-sm">
          <div>
            <div className="h-10 border-b border-slate-300" />
            <p className="mt-2 text-xs text-slate-400">
              {c.landlordSignatureTemplate.replace("{name}", lease.owner)}
            </p>
          </div>
          <div>
            <div className="h-10 border-b border-slate-300" />
            <p className="mt-2 text-xs text-slate-400">
              {c.tenantSignatureTemplate.replace("{name}", lease.tenant)}
            </p>
          </div>
        </div>

        <p className="mt-6 text-center text-xs text-slate-400">
          {isSigned ? c.signedMessage : c.awaitingSignature}
        </p>
      </div>
    </div>
  );
}
