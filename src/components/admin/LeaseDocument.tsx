"use client";

import { Printer } from "lucide-react";
import { type Lease, PROPERTIES } from "@/lib/mock-admin-data";

function formatDate(dateStr: string) {
  return new Date(dateStr).toLocaleDateString("en-GB", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

export function LeaseDocument({ lease }: { lease: Lease }) {
  const property = PROPERTIES.find((p) => p.name === lease.property);
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
          Print / Download
        </button>
      </div>

      <div className="mt-4 rounded-lg border border-slate-200 bg-white p-10 font-serif text-slate-800 shadow-inner">
        <div className="text-center">
          <p className="text-xs uppercase tracking-[0.3em] text-slate-400">
            HomeLink Rwanda
          </p>
          <h3 className="mt-2 text-2xl font-bold uppercase tracking-wide text-navy">
            Residential Lease Agreement
          </h3>
          <p className="mt-1 text-xs text-slate-400">Lease ID: LA-{lease.id.padStart(4, "0")}</p>
        </div>

        <div className="mx-auto mt-6 h-px w-full bg-slate-200" />

        <p className="mt-6 text-sm leading-relaxed">
          This Lease Agreement is entered into between the Landlord and the
          Tenant named below, for the rental of the property described
          herein, under the terms and conditions set out in this document.
        </p>

        <div className="mt-6 grid grid-cols-2 gap-6 text-sm">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
              Landlord
            </p>
            <p className="mt-1 font-medium text-navy">{lease.owner}</p>
          </div>
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
              Tenant
            </p>
            <p className="mt-1 font-medium text-navy">{lease.tenant}</p>
          </div>
        </div>

        <div className="mt-6">
          <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
            Property
          </p>
          <p className="mt-1 font-medium text-navy">{lease.property}</p>
          {property && (
            <p className="text-sm text-slate-500">{property.address}</p>
          )}
        </div>

        <div className="mt-6 grid grid-cols-3 gap-6 text-sm">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
              Lease Start
            </p>
            <p className="mt-1 font-medium text-navy">
              {formatDate(lease.startDate)}
            </p>
          </div>
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
              Lease End
            </p>
            <p className="mt-1 font-medium text-navy">
              {formatDate(lease.endDate)}
            </p>
          </div>
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
              Monthly Rent
            </p>
            <p className="mt-1 font-medium text-navy">
              {lease.rent.toLocaleString()} RWF
            </p>
          </div>
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
              Security Deposit
            </p>
            <p className="mt-1 font-medium text-navy">
              {lease.deposit.toLocaleString()} RWF
            </p>
          </div>
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
              Rent MoMo Number
            </p>
            <p className="mt-1 font-medium text-navy">{lease.momoNumber}</p>
          </div>
        </div>

        {property && property.terms.length > 0 && (
          <div className="mt-6">
            <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
              Terms &amp; Conditions
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
              Landlord signature — {lease.owner}
            </p>
          </div>
          <div>
            <div className="h-10 border-b border-slate-300" />
            <p className="mt-2 text-xs text-slate-400">
              Tenant signature — {lease.tenant}
            </p>
          </div>
        </div>

        <p className="mt-6 text-center text-xs text-slate-400">
          {isSigned
            ? "This document has been electronically signed by both parties."
            : "Awaiting electronic signature."}
        </p>
      </div>
    </div>
  );
}
