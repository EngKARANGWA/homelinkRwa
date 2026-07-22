"use client";

import { useMemo, useState } from "react";
import {
  CheckCircle2,
  Download,
  FileBadge,
  FileText,
  Folder,
  Plus,
  Search,
  Trash2,
} from "lucide-react";
import { PROPERTIES } from "@/lib/mock-admin-data";
import { getBaseDocuments, type DocumentCategory, type LandlordDocument } from "@/lib/documents";
import { useLandlord } from "@/components/landlord/LandlordContext";
import { Modal } from "@/components/admin/Modal";
import { UploadDocumentForm } from "@/components/landlord/UploadDocumentForm";
import { SummaryCard } from "@/components/dashboard/SummaryCard";

const CATEGORY_STYLES: Record<DocumentCategory, string> = {
  "Property Document": "bg-blue-50 text-blue-700",
  "Lease Agreement": "bg-emerald-50 text-emerald-700",
  "ID Verification": "bg-amber-50 text-amber-700",
  Other: "bg-slate-100 text-slate-600",
};

const CATEGORY_ICONS: Record<DocumentCategory, typeof FileText> = {
  "Property Document": Folder,
  "Lease Agreement": FileText,
  "ID Verification": FileBadge,
  Other: FileText,
};

export default function LandlordDocumentsPage() {
  const { landlordName, unitOverrides, documents, addDocument, removeDocument } = useLandlord();
  const [search, setSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState<"All" | DocumentCategory>("All");
  const [propertyFilter, setPropertyFilter] = useState("All Properties");
  const [isUploading, setUploading] = useState(false);
  const [notice, setNotice] = useState<string | null>(null);

  const myProperties = PROPERTIES.filter((p) => p.owner === landlordName);
  const propertyOptions = ["All Properties", ...myProperties.map((p) => p.name)];

  const allDocuments: LandlordDocument[] = useMemo(() => {
    const base = getBaseDocuments(myProperties);
    const uploaded = documents.filter((d) =>
      myProperties.some((p) => p.id === d.propertyId),
    );
    return [...uploaded, ...base];
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [landlordName, documents]);

  const filteredDocuments = allDocuments.filter((doc) => {
    const matchesSearch =
      doc.name.toLowerCase().includes(search.toLowerCase()) ||
      (doc.tenant?.toLowerCase().includes(search.toLowerCase()) ?? false);
    const matchesCategory = categoryFilter === "All" || doc.category === categoryFilter;
    const matchesProperty =
      propertyFilter === "All Properties" || doc.propertyName === propertyFilter;
    return matchesSearch && matchesCategory && matchesProperty;
  });

  const counts = {
    total: allDocuments.length,
    property: allDocuments.filter((d) => d.category === "Property Document").length,
    lease: allDocuments.filter((d) => d.category === "Lease Agreement").length,
    id: allDocuments.filter((d) => d.category === "ID Verification").length,
  };

  const handleUpload = (doc: LandlordDocument) => {
    addDocument(doc);
    setUploading(false);
    setNotice(`${doc.name} uploaded successfully.`);
  };

  const handleDownload = (doc: LandlordDocument) => {
    setNotice(`Downloading ${doc.name}…`);
  };

  const handleDelete = (doc: LandlordDocument) => {
    removeDocument(doc.id);
    setNotice(`${doc.name} deleted.`);
  };

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-navy">Documents</h1>
          <p className="mt-1 text-sm text-slate-500">
            Lease agreements, property paperwork, and tenant documents.
          </p>
        </div>
        <button
          type="button"
          onClick={() => setUploading(true)}
          className="inline-flex items-center gap-2 rounded-lg bg-gold px-5 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-gold/90"
        >
          <Plus className="h-4 w-4" />
          Upload Document
        </button>
      </div>

      {notice && (
        <div className="flex items-center gap-2 rounded-lg border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm font-medium text-emerald-700">
          <CheckCircle2 className="h-4 w-4" />
          {notice}
        </div>
      )}

      <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
        <SummaryCard label="Total Documents" value={counts.total} />
        <SummaryCard label="Property Documents" value={counts.property} accent="blue" />
        <SummaryCard label="Lease Agreements" value={counts.lease} accent="emerald" />
        <SummaryCard label="ID Verifications" value={counts.id} accent="amber" />
      </div>

      <div className="flex flex-wrap items-end gap-4 rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
        <label className="flex flex-1 min-w-[200px] flex-col gap-1.5 text-sm font-medium text-slate-700">
          Search
          <div className="flex items-center gap-2 rounded-lg border border-slate-300 px-3 py-2.5 focus-within:border-gold">
            <Search className="h-4 w-4 text-slate-400" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by document or tenant name"
              className="w-full bg-transparent text-sm text-navy placeholder:text-slate-400 focus:outline-none"
            />
          </div>
        </label>

        <label className="flex flex-col gap-1.5 text-sm font-medium text-slate-700">
          Category
          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value as typeof categoryFilter)}
            className="rounded-lg border border-slate-300 px-3 py-2.5 text-sm text-navy focus:border-gold focus:outline-none"
          >
            <option value="All">All</option>
            <option value="Property Document">Property Document</option>
            <option value="Lease Agreement">Lease Agreement</option>
            <option value="ID Verification">ID Verification</option>
            <option value="Other">Other</option>
          </select>
        </label>

        <label className="flex flex-col gap-1.5 text-sm font-medium text-slate-700">
          Property
          <select
            value={propertyFilter}
            onChange={(e) => setPropertyFilter(e.target.value)}
            className="rounded-lg border border-slate-300 px-3 py-2.5 text-sm text-navy focus:border-gold focus:outline-none"
          >
            {propertyOptions.map((name) => (
              <option key={name}>{name}</option>
            ))}
          </select>
        </label>
      </div>

      <div className="overflow-x-auto rounded-xl border border-slate-200 bg-white shadow-sm">
        <table className="w-full text-left text-sm">
          <thead>
            <tr className="text-xs uppercase tracking-wide text-slate-400">
              <th className="max-w-[12rem] px-4 py-3 font-medium sm:px-6">Document</th>
              <th className="hidden px-6 py-3 font-medium sm:table-cell">Category</th>
              <th className="hidden px-6 py-3 font-medium md:table-cell">Property</th>
              <th className="hidden px-6 py-3 font-medium md:table-cell">Unit / Tenant</th>
              <th className="hidden px-6 py-3 font-medium lg:table-cell">Uploaded</th>
              <th className="px-4 py-3 text-right font-medium sm:px-6">Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredDocuments.map((doc) => {
              const Icon = CATEGORY_ICONS[doc.category];
              return (
                <tr key={doc.id} className="border-t border-slate-100">
                  <td className="max-w-[12rem] px-4 py-3 sm:max-w-none sm:px-6">
                    <div className="flex items-center gap-2">
                      <Icon className="h-4 w-4 shrink-0 text-slate-400" />
                      <p className="truncate font-medium text-navy sm:overflow-visible sm:whitespace-normal">
                        {doc.name}
                      </p>
                    </div>
                    <p className="truncate pl-6 text-xs text-slate-400 sm:hidden">
                      {doc.category} · {doc.propertyName}
                    </p>
                  </td>
                  <td className="hidden px-6 py-3 sm:table-cell">
                    <span
                      className={`rounded-full px-2.5 py-1 text-xs font-medium ${CATEGORY_STYLES[doc.category]}`}
                    >
                      {doc.category}
                    </span>
                  </td>
                  <td className="hidden px-6 py-3 text-slate-500 md:table-cell">
                    {doc.propertyName}
                  </td>
                  <td className="hidden px-6 py-3 text-slate-500 md:table-cell">
                    {doc.unitNumber ? `${doc.unitNumber} · ${doc.tenant}` : "Property-wide"}
                  </td>
                  <td className="hidden px-6 py-3 text-slate-500 lg:table-cell">
                    {doc.uploadedAt}
                  </td>
                  <td className="max-w-[6.5rem] px-4 py-3 sm:max-w-none sm:whitespace-nowrap sm:px-6">
                    <div className="flex flex-wrap items-center justify-end gap-2">
                      <button
                        type="button"
                        onClick={() => handleDownload(doc)}
                        aria-label={`Download ${doc.name}`}
                        className="inline-flex items-center gap-1.5 rounded-lg border border-slate-300 px-2.5 py-1 text-xs font-medium text-slate-600 hover:bg-slate-50"
                      >
                        <Download className="h-3.5 w-3.5" />
                        <span className="hidden sm:inline">Download</span>
                      </button>
                      {doc.isUploaded && (
                        <button
                          type="button"
                          onClick={() => handleDelete(doc)}
                          aria-label={`Delete ${doc.name}`}
                          className="flex h-7 w-7 items-center justify-center rounded-full bg-red-50 text-red-700 hover:bg-red-100"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              );
            })}
            {filteredDocuments.length === 0 && (
              <tr>
                <td colSpan={6} className="px-6 py-8 text-center text-slate-400">
                  No documents match these filters.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {isUploading && (
        <Modal
          title="Upload Document"
          description="Attach a document to a property or a specific tenant's unit."
          onClose={() => setUploading(false)}
        >
          <UploadDocumentForm
            properties={myProperties}
            unitOverrides={unitOverrides}
            onCancel={() => setUploading(false)}
            onSuccess={handleUpload}
          />
        </Modal>
      )}
    </div>
  );
}
