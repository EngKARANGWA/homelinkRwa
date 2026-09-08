"use client";

import { useEffect, useState } from "react";
import { AlertCircle, Download, Home, Loader2 } from "lucide-react";
import { ApiError } from "@/lib/api/client";
import type { LeaseStatement } from "@/lib/api/types";
import { Modal } from "@/components/admin/Modal";
import { useAuth } from "@/components/auth/AuthContext";
import { buildLeaseStatement, downloadStatementPdf } from "@/lib/leaseStatement";

/** Exact, unabbreviated amount — a financial statement must never round a
 * balance to "1.5M" in place of the real figure. */
function exactAmount(n: number) {
  return n.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

function formatDisplayDate(dateStr: string) {
  const [year, month, day] = dateStr.split("-");
  return `${day}-${month}-${year}`;
}

export function LeaseStatementModal({
  leaseId,
  onClose,
}: {
  leaseId: string;
  onClose: () => void;
}) {
  const { user } = useAuth();
  const [statement, setStatement] = useState<LeaseStatement | null>(null);
  const [isLoading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isDownloading, setDownloading] = useState(false);

  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");
  const [appliedRange, setAppliedRange] = useState<{ from?: string; to?: string }>({});

  const load = (range: { from?: string; to?: string }) => {
    if (!user) return;
    setLoading(true);
    setError(null);
    buildLeaseStatement(leaseId, range, user)
      .then((data) => {
        setStatement(data);
        // Seed the date inputs from the resolved range on first load, so
        // "Apply" round-trips the resolved defaults rather than blanks.
        setFrom((prev) => prev || data.periodFrom);
        setTo((prev) => prev || data.periodTo);
      })
      .catch((err) =>
        setError(err instanceof ApiError ? err.message : "Failed to load the statement."),
      )
      .finally(() => setLoading(false));
  };

  useEffect(() => load(appliedRange), [leaseId, appliedRange, user]); // eslint-disable-line react-hooks/exhaustive-deps

  const applyRange = () => {
    setAppliedRange({ from: from || undefined, to: to || undefined });
  };

  const handleDownload = async () => {
    if (!statement) return;
    setError(null);
    setDownloading(true);
    try {
      // Built and saved entirely client-side (jsPDF) — a real one-click
      // file download, no PDF-generation endpoint needed.
      await downloadStatementPdf(statement);
    } catch {
      setError("Failed to generate the PDF. Please try again.");
    } finally {
      setDownloading(false);
    }
  };

  return (
    <Modal
      title="Statement of Account"
      description={statement ? `${statement.property.title} — Unit ${statement.unit.label}` : undefined}
      onClose={onClose}
      maxWidthClassName="max-w-5xl"
    >
      <div className="flex flex-col gap-5">
        <div className="flex flex-wrap items-end justify-between gap-3">
          <div className="flex flex-wrap items-end gap-2">
            <label className="flex flex-col gap-1 text-xs font-medium text-slate-500">
              From
              <input
                type="date"
                value={from}
                onChange={(e) => setFrom(e.target.value)}
                className="rounded-lg border border-slate-300 px-2.5 py-1.5 text-sm text-navy focus:border-gold focus:outline-none"
              />
            </label>
            <label className="flex flex-col gap-1 text-xs font-medium text-slate-500">
              To
              <input
                type="date"
                value={to}
                onChange={(e) => setTo(e.target.value)}
                className="rounded-lg border border-slate-300 px-2.5 py-1.5 text-sm text-navy focus:border-gold focus:outline-none"
              />
            </label>
            <button
              type="button"
              onClick={applyRange}
              className="rounded-lg border border-slate-300 px-3 py-1.5 text-sm font-medium text-slate-600 hover:bg-slate-50"
            >
              Apply
            </button>
          </div>
          <button
            type="button"
            onClick={handleDownload}
            disabled={!statement || isDownloading}
            className="inline-flex items-center gap-2 rounded-lg bg-gold px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-gold/90 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {isDownloading ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Download className="h-4 w-4" />
            )}
            {isDownloading ? "Preparing..." : "Download PDF"}
          </button>
        </div>

        {error && (
          <p className="flex items-center gap-2 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
            <AlertCircle className="h-4 w-4 shrink-0" />
            {error}
          </p>
        )}

        {isLoading ? (
          <div className="flex items-center justify-center py-16 text-slate-400">
            <Loader2 className="h-5 w-5 animate-spin" />
          </div>
        ) : statement ? (
          <div className="rounded-xl border border-slate-200 bg-white">
            <div className="flex items-start justify-between border-b border-slate-100 p-5">
              <div className="flex items-center gap-2.5">
                <Home className="h-7 w-7 text-gold" strokeWidth={2.2} />
                <span className="leading-tight">
                  <span className="block text-base font-bold text-navy">HomeLink</span>
                  <span className="block text-[10px] font-semibold tracking-[0.2em] text-gold">
                    RWANDA
                  </span>
                </span>
              </div>
              <div className="text-right">
                <p className="text-lg font-bold text-navy">Statement of Account</p>
                <p className="text-xs text-slate-500">
                  {formatDisplayDate(statement.periodFrom)} to {formatDisplayDate(statement.periodTo)}
                </p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3 border-b border-slate-100 bg-slate-50 p-5 text-sm">
              <div>
                <p>
                  <span className="font-semibold text-navy">Property:</span> {statement.property.title}{" "}
                  — {statement.property.addressLine}, {statement.property.city}
                </p>
                <p className="mt-1">
                  <span className="font-semibold text-navy">Unit:</span> {statement.unit.label}
                </p>
              </div>
              <div>
                <p>
                  <span className="font-semibold text-navy">Tenant:</span> {statement.tenant.firstName}{" "}
                  {statement.tenant.lastName}
                </p>
                <p className="mt-1">
                  <span className="font-semibold text-navy">Landlord:</span> {statement.owner.firstName}{" "}
                  {statement.owner.lastName}
                </p>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full border-collapse text-left text-sm">
                <colgroup>
                  <col className="w-[110px]" />
                  <col className="w-[130px]" />
                  <col />
                  <col className="w-[130px]" />
                  <col className="w-[130px]" />
                  <col className="w-[130px]" />
                </colgroup>
                <thead>
                  <tr className="bg-navy text-xs uppercase tracking-wide text-white">
                    <th className="px-4 py-2.5 font-medium whitespace-nowrap">Date</th>
                    <th className="px-4 py-2.5 font-medium whitespace-nowrap">Reference</th>
                    <th className="px-4 py-2.5 font-medium">Remarks</th>
                    <th className="px-4 py-2.5 text-right font-medium whitespace-nowrap">Debit</th>
                    <th className="px-4 py-2.5 text-right font-medium whitespace-nowrap">Credit</th>
                    <th className="px-4 py-2.5 text-right font-medium whitespace-nowrap">Balance</th>
                  </tr>
                </thead>
                <tbody>
                  <tr className="bg-slate-50">
                    <td colSpan={3} className="px-4 py-2.5 text-slate-500">
                      Opening Balance
                    </td>
                    <td className="px-4 py-2.5 text-right text-slate-500 whitespace-nowrap">RWF 0.00</td>
                    <td className="px-4 py-2.5 text-right text-slate-500 whitespace-nowrap">RWF 0.00</td>
                    <td className="px-4 py-2.5 text-right font-medium text-navy whitespace-nowrap">
                      RWF {exactAmount(statement.openingBalance)}
                    </td>
                  </tr>
                  {statement.rows.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="px-4 py-8 text-center text-slate-400">
                        No transactions in this period.
                      </td>
                    </tr>
                  ) : (
                    statement.rows.map((row, i) => (
                      <tr key={i} className="border-t border-slate-100">
                        <td className="px-4 py-2.5 text-slate-600 whitespace-nowrap">
                          {formatDisplayDate(row.date)}
                        </td>
                        <td className="px-4 py-2.5 text-slate-600 whitespace-nowrap">{row.reference}</td>
                        <td className="px-4 py-2.5 text-slate-600">{row.remarks}</td>
                        <td className="px-4 py-2.5 text-right text-slate-600 whitespace-nowrap">
                          {row.debit ? `RWF ${exactAmount(row.debit)}` : ""}
                        </td>
                        <td className="px-4 py-2.5 text-right text-slate-600 whitespace-nowrap">
                          {row.credit ? `RWF ${exactAmount(row.credit)}` : ""}
                        </td>
                        <td className="px-4 py-2.5 text-right font-medium text-navy whitespace-nowrap">
                          RWF {exactAmount(row.balance)}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
                <tfoot>
                  <tr className="border-t-2 border-navy font-semibold text-navy">
                    <td colSpan={3} className="px-4 py-3">
                      Total
                    </td>
                    <td className="px-4 py-3 text-right whitespace-nowrap">
                      RWF {exactAmount(statement.totalDebit)}
                    </td>
                    <td className="px-4 py-3 text-right whitespace-nowrap">
                      RWF {exactAmount(statement.totalCredit)}
                    </td>
                    <td className="px-4 py-3 text-right whitespace-nowrap">
                      RWF {exactAmount(statement.closingBalance)}
                    </td>
                  </tr>
                </tfoot>
              </table>
            </div>

            <div className="flex items-center justify-between border-t border-slate-100 px-5 py-3 text-xs text-slate-400">
              <span className="font-semibold text-navy">
                Powered by <span className="text-gold">HomeLink</span>
              </span>
              <span>Generated: {new Date(statement.generatedAt).toLocaleString()}</span>
            </div>
          </div>
        ) : null}
      </div>
    </Modal>
  );
}
