import { getLease } from "@/lib/api/leases";
import { getProperty, listUnits } from "@/lib/api/properties";
import { listInvoices, listPayments } from "@/lib/api/payments";
import type { LeaseStatement, LeaseStatementRow } from "@/lib/api/types";
import { formatStatusLabel } from "@/lib/paymentStatus";

/** "2026-08" -> "August 2026" */
function periodLabel(period: string): string {
  const [year, month] = period.split("-");
  return new Date(Number(year), Number(month) - 1, 1).toLocaleDateString("en-US", {
    month: "long",
    year: "numeric",
  });
}

/**
 * Builds the same ledger shape the backend's GET /leases/:id/statement
 * returns, but entirely client-side from endpoints that are already live —
 * so the statement works today without that (not-yet-deployed) endpoint.
 * Kept in one place so both call sites (and the eventual server endpoint,
 * once deployed) stay in sync on the balance math.
 */
export async function buildLeaseStatement(
  leaseId: string,
  params: { from?: string; to?: string },
  viewer: { id: string; firstName: string; lastName: string; email: string },
): Promise<LeaseStatement> {
  const lease = await getLease(leaseId);
  const [property, units, invoicesRes] = await Promise.all([
    getProperty(lease.propertyId),
    listUnits(lease.propertyId),
    listInvoices({ leaseId, limit: 100 }),
  ]);
  const unit = units.find((u) => u.id === lease.unitId);
  const leaseInvoices = invoicesRes.data;

  const paymentsByInvoice = await Promise.all(
    leaseInvoices.map((invoice) =>
      listPayments({ invoiceId: invoice.id, status: "success", limit: 100 }),
    ),
  );
  const leasePayments = paymentsByInvoice.flatMap((res) => res.data);

  type Entry = { date: Date; reference: string; remarks: string; debit: number; credit: number };
  const entries: Entry[] = [
    ...leaseInvoices.map(
      (invoice): Entry => ({
        date: new Date(invoice.dueDate),
        reference: invoice.invoiceNumber,
        remarks: `Rent invoice for ${periodLabel(invoice.period)}`,
        debit: Number(invoice.amountDue),
        credit: 0,
      }),
    ),
    ...leasePayments.map(
      (payment): Entry => ({
        date: new Date(payment.paidAt ?? payment.createdAt),
        reference: payment.paymentNumber,
        remarks: `Payment via ${formatStatusLabel(payment.method)}`,
        debit: 0,
        credit: Number(payment.amount),
      }),
    ),
  ].sort((a, b) => a.date.getTime() - b.date.getTime());

  const from = params.from ? new Date(params.from) : new Date(lease.startDate);
  const to = params.to ? new Date(params.to) : new Date();

  let openingBalance = 0;
  const rows: LeaseStatementRow[] = [];

  for (const entry of entries) {
    if (entry.date < from) {
      openingBalance += entry.debit - entry.credit;
      continue;
    }
    if (entry.date > to) continue;
    const previousBalance = rows.length ? rows[rows.length - 1]!.balance : openingBalance;
    rows.push({
      date: entry.date.toISOString().slice(0, 10),
      reference: entry.reference,
      remarks: entry.remarks,
      debit: entry.debit,
      credit: entry.credit,
      balance: previousBalance + entry.debit - entry.credit,
    });
  }

  const totalDebit = rows.reduce((sum, row) => sum + row.debit, 0);
  const totalCredit = rows.reduce((sum, row) => sum + row.credit, 0);

  // GET /leases/:id resolves both parties' real names server-side
  // (tenantName/ownerName) — use those. Only fall back to "our own name on
  // whichever side that is, placeholder on the other" if an older backend
  // build hasn't deployed that enrichment yet.
  const shortId = (id: string) => id.slice(0, 8).toUpperCase();
  const splitName = (fullName: string) => {
    const [firstName, ...rest] = fullName.split(" ");
    return { firstName: firstName || fullName, lastName: rest.join(" ") };
  };
  const tenant = lease.tenantName
    ? splitName(lease.tenantName)
    : viewer.id === lease.tenantId
      ? { firstName: viewer.firstName, lastName: viewer.lastName }
      : { firstName: "Tenant", lastName: shortId(lease.tenantId) };
  const owner = lease.ownerName
    ? splitName(lease.ownerName)
    : viewer.id === lease.ownerId
      ? { firstName: viewer.firstName, lastName: viewer.lastName }
      : { firstName: "Landlord", lastName: shortId(lease.ownerId) };

  return {
    property: { title: property.title, addressLine: property.addressLine, city: property.city },
    unit: { label: unit?.label ?? "—" },
    tenant: { ...tenant, email: viewer.id === lease.tenantId ? viewer.email : "" },
    owner,
    periodFrom: from.toISOString().slice(0, 10),
    periodTo: to.toISOString().slice(0, 10),
    openingBalance,
    rows,
    totalDebit,
    totalCredit,
    closingBalance: openingBalance + totalDebit - totalCredit,
    generatedAt: new Date().toISOString(),
  };
}

function money(amount: number): string {
  return amount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

function displayDate(dateStr: string): string {
  const [year, month, day] = dateStr.split("-");
  return `${day}-${month}-${year}`;
}

const NAVY: [number, number, number] = [10, 22, 40];
const GOLD: [number, number, number] = [37, 99, 235];
const SLATE_500: [number, number, number] = [100, 116, 139];
const SLATE_400: [number, number, number] = [148, 163, 184];
const SLATE_600: [number, number, number] = [71, 85, 105];
const SLATE_50: [number, number, number] = [248, 250, 252];

/** Builds a real PDF file client-side (jsPDF + autoTable) and triggers a
 * one-click browser download — no print dialog, no PDF-generation endpoint
 * needed. */
export async function downloadStatementPdf(statement: LeaseStatement): Promise<void> {
  const [{ jsPDF }, { default: autoTable }] = await Promise.all([
    import("jspdf"),
    import("jspdf-autotable"),
  ]);

  // Landscape gives the 6-column table (with real invoice/payment IDs in
  // the Reference column) enough width that nothing wraps to a second line.
  const doc = new jsPDF({ unit: "pt", format: "a4", orientation: "landscape" });
  const pageWidth = doc.internal.pageSize.getWidth();
  const marginX = 40;
  let y = 50;

  doc.setFont("helvetica", "bold");
  doc.setFontSize(16);
  doc.setTextColor(...NAVY);
  doc.text("HomeLink", marginX, y);
  doc.setFontSize(8);
  doc.setTextColor(...GOLD);
  doc.text("RWANDA", marginX, y + 13);

  doc.setFont("helvetica", "bold");
  doc.setFontSize(16);
  doc.setTextColor(...NAVY);
  doc.text("Statement of Account", pageWidth - marginX, y, { align: "right" });
  doc.setFont("helvetica", "normal");
  doc.setFontSize(9);
  doc.setTextColor(...SLATE_500);
  doc.text(
    `${displayDate(statement.periodFrom)} to ${displayDate(statement.periodTo)}`,
    pageWidth - marginX,
    y + 14,
    { align: "right" },
  );

  y += 36;
  const metaHeight = 52;
  doc.setFillColor(...SLATE_50);
  doc.rect(marginX, y, pageWidth - marginX * 2, metaHeight, "F");

  const metaLine = (label: string, value: string, x: number, lineY: number) => {
    doc.setFont("helvetica", "bold");
    doc.setFontSize(9);
    doc.setTextColor(...NAVY);
    doc.text(label, x, lineY);
    doc.setFont("helvetica", "normal");
    doc.setTextColor(...SLATE_600);
    doc.text(value, x + doc.getTextWidth(label) + 4, lineY);
  };
  const leftX = marginX + 12;
  const rightX = pageWidth / 2 + 10;
  metaLine(
    "Property:",
    `${statement.property.title} — ${statement.property.addressLine}, ${statement.property.city}`,
    leftX,
    y + 20,
  );
  metaLine("Unit:", statement.unit.label, leftX, y + 38);
  metaLine("Tenant:", `${statement.tenant.firstName} ${statement.tenant.lastName}`, rightX, y + 20);
  metaLine("Landlord:", `${statement.owner.firstName} ${statement.owner.lastName}`, rightX, y + 38);

  y += metaHeight + 16;

  autoTable(doc, {
    startY: y,
    margin: { left: marginX, right: marginX },
    head: [["Date", "Reference", "Remarks", "Debit", "Credit", "Balance"]],
    body: [
      [
        { content: "Opening Balance", colSpan: 3 },
        "RWF 0.00",
        "RWF 0.00",
        `RWF ${money(statement.openingBalance)}`,
      ],
      ...(statement.rows.length
        ? statement.rows.map((row) => [
            displayDate(row.date),
            row.reference,
            row.remarks,
            row.debit ? `RWF ${money(row.debit)}` : "",
            row.credit ? `RWF ${money(row.credit)}` : "",
            `RWF ${money(row.balance)}`,
          ])
        : [[{ content: "No transactions in this period.", colSpan: 6, styles: { halign: "center" as const } }]]),
    ],
    foot: [
      [
        { content: "Total", colSpan: 3 },
        `RWF ${money(statement.totalDebit)}`,
        `RWF ${money(statement.totalCredit)}`,
        `RWF ${money(statement.closingBalance)}`,
      ],
    ],
    styles: { fontSize: 9, cellPadding: 6, textColor: SLATE_600 },
    headStyles: { fillColor: NAVY, textColor: 255, fontStyle: "bold" },
    footStyles: {
      fillColor: 255,
      textColor: NAVY,
      fontStyle: "bold",
      lineWidth: { top: 1.2 },
      lineColor: NAVY,
    },
    bodyStyles: { lineColor: [226, 232, 240], lineWidth: 0.5 },
    alternateRowStyles: { fillColor: [255, 255, 255] },
    columnStyles: {
      0: { cellWidth: 70 },
      1: { cellWidth: 110 },
      // column 2 (Remarks) is left flexible — it absorbs whatever width
      // the fixed columns don't need.
      3: { cellWidth: 95, halign: "right" },
      4: { cellWidth: 95, halign: "right" },
      5: { cellWidth: 100, halign: "right", fontStyle: "bold", textColor: NAVY },
    },
  });

  const finalY = (doc as unknown as { lastAutoTable?: { finalY: number } }).lastAutoTable?.finalY ?? y + 40;

  doc.setFont("helvetica", "bold");
  doc.setFontSize(8);
  doc.setTextColor(...NAVY);
  doc.text("Powered by HomeLink", marginX, finalY + 30);
  doc.setFont("helvetica", "normal");
  doc.setTextColor(...SLATE_400);
  doc.text(`Generated: ${new Date(statement.generatedAt).toLocaleString()}`, pageWidth - marginX, finalY + 30, {
    align: "right",
  });

  doc.save(`statement-${statement.periodFrom}-to-${statement.periodTo}.pdf`);
}
