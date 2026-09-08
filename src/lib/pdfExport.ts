const NAVY: [number, number, number] = [10, 22, 40];
const GOLD: [number, number, number] = [37, 99, 235];
const SLATE_500: [number, number, number] = [100, 116, 139];
const SLATE_400: [number, number, number] = [148, 163, 184];
const SLATE_600: [number, number, number] = [71, 85, 105];

export type PdfColumn = {
  header: string;
  width?: number;
  align?: "left" | "right" | "center";
};

/**
 * Generic HomeLink-branded table PDF — header brand mark, title/subtitle,
 * an autoTable, and a footer. Built client-side (jsPDF + autoTable, loaded
 * on demand) so any list (invoices, payments, ...) can become a real,
 * one-click PDF download without a backend endpoint.
 */
export async function downloadTablePdf(options: {
  title: string;
  subtitle?: string;
  /** Label/value pairs shown in a shaded box under the header — e.g. Property,
   * Tenant. Wraps to two columns once there are more than 2 entries. */
  meta?: { label: string; value: string }[];
  filename: string;
  columns: PdfColumn[];
  rows: (string | number)[][];
  orientation?: "portrait" | "landscape";
}): Promise<void> {
  const [{ jsPDF }, { default: autoTable }] = await Promise.all([
    import("jspdf"),
    import("jspdf-autotable"),
  ]);

  const doc = new jsPDF({ unit: "pt", format: "a4", orientation: options.orientation ?? "portrait" });
  const pageWidth = doc.internal.pageSize.getWidth();
  const marginX = 40;
  const y = 50;

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
  doc.text(options.title, pageWidth - marginX, y, { align: "right" });
  if (options.subtitle) {
    doc.setFont("helvetica", "normal");
    doc.setFontSize(9);
    doc.setTextColor(...SLATE_500);
    doc.text(options.subtitle, pageWidth - marginX, y + 14, { align: "right" });
  }

  let tableStartY = y + 40;
  const meta = options.meta ?? [];
  if (meta.length > 0) {
    const boxTop = y + 26;
    const rowsCount = Math.ceil(meta.length / 2);
    const boxHeight = rowsCount * 16 + 12;
    doc.setFillColor(248, 250, 252);
    doc.rect(marginX, boxTop, pageWidth - marginX * 2, boxHeight, "F");

    const leftX = marginX + 12;
    const rightX = pageWidth / 2 + 10;
    meta.forEach((item, i) => {
      const col = i % 2;
      const row = Math.floor(i / 2);
      const x = col === 0 ? leftX : rightX;
      const lineY = boxTop + 18 + row * 16;
      doc.setFont("helvetica", "bold");
      doc.setFontSize(9);
      doc.setTextColor(...NAVY);
      const label = `${item.label}:`;
      doc.text(label, x, lineY);
      doc.setFont("helvetica", "normal");
      doc.setTextColor(...SLATE_600);
      doc.text(item.value, x + doc.getTextWidth(label) + 4, lineY);
    });

    tableStartY = boxTop + boxHeight + 16;
  }

  autoTable(doc, {
    startY: tableStartY,
    margin: { left: marginX, right: marginX },
    head: [options.columns.map((c) => c.header)],
    body: options.rows.length ? options.rows : [["No data to display.", ...Array(options.columns.length - 1).fill("")]],
    styles: { fontSize: 9, cellPadding: 6, textColor: SLATE_600 },
    headStyles: { fillColor: NAVY, textColor: 255, fontStyle: "bold" },
    bodyStyles: { lineColor: [226, 232, 240], lineWidth: 0.5 },
    alternateRowStyles: { fillColor: [255, 255, 255] },
    columnStyles: Object.fromEntries(
      options.columns.map((c, i) => [i, { cellWidth: c.width, halign: c.align ?? "left" }]),
    ),
  });

  const finalY =
    (doc as unknown as { lastAutoTable?: { finalY: number } }).lastAutoTable?.finalY ?? y + 60;

  doc.setFont("helvetica", "bold");
  doc.setFontSize(8);
  doc.setTextColor(...NAVY);
  doc.text("Powered by HomeLink", marginX, finalY + 30);
  doc.setFont("helvetica", "normal");
  doc.setTextColor(...SLATE_400);
  doc.text(`Generated: ${new Date().toLocaleString()}`, pageWidth - marginX, finalY + 30, {
    align: "right",
  });

  doc.save(options.filename);
}
