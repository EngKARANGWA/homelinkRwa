"use client";

import { useEffect, useRef, useState } from "react";
import { CheckCircle2, FileText, Trash2, Upload } from "lucide-react";
import {
  confirmLeaseDocuments,
  deleteLeaseDocument,
  listLeaseDocuments,
  uploadLeaseDocuments,
} from "@/lib/api/leases";
import { ApiError } from "@/lib/api/client";
import type { LeaseDocument } from "@/lib/api/types";

export function LeaseDocumentsPanel({
  leaseId,
  documentsConfirmed,
  onConfirmed,
}: {
  leaseId: string;
  documentsConfirmed: boolean;
  onConfirmed?: () => void;
}) {
  const [documents, setDocuments] = useState<LeaseDocument[]>([]);
  const [confirmed, setConfirmed] = useState(documentsConfirmed);
  const [isLoading, setLoading] = useState(true);
  const [isUploading, setUploading] = useState(false);
  const [isConfirming, setConfirming] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const load = () => {
    setLoading(true);
    setError(null);
    listLeaseDocuments(leaseId)
      .then(setDocuments)
      .catch((err) =>
        setError(err instanceof ApiError ? err.message : "Failed to load documents."),
      )
      .finally(() => setLoading(false));
  };

  useEffect(load, [leaseId]);

  const handleUpload = async (files: FileList | null) => {
    if (!files || files.length === 0) return;
    setError(null);
    setUploading(true);
    try {
      await uploadLeaseDocuments(leaseId, Array.from(files));
      load();
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Failed to upload documents.");
    } finally {
      setUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  const handleDelete = async (documentId: string) => {
    setError(null);
    setDeletingId(documentId);
    try {
      await deleteLeaseDocument(leaseId, documentId);
      load();
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Failed to delete document.");
    } finally {
      setDeletingId(null);
    }
  };

  const handleConfirm = async () => {
    setError(null);
    setConfirming(true);
    try {
      await confirmLeaseDocuments(leaseId);
      setConfirmed(true);
      onConfirmed?.();
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Failed to confirm documents.");
    } finally {
      setConfirming(false);
    }
  };

  return (
    <div className="flex flex-col gap-4">
      <p className="text-sm text-slate-500">
        Scanned or physical copies of this lease. Optional — the platform-generated PDF
        (via &ldquo;View&rdquo;) is separate from these.
      </p>

      {error && (
        <p className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
          {error}
        </p>
      )}

      <div className="flex flex-col gap-2">
        {isLoading ? (
          <p className="text-sm text-slate-400">Loading documents...</p>
        ) : documents.length === 0 ? (
          <p className="text-sm text-slate-400">No documents uploaded yet.</p>
        ) : (
          documents.map((doc) => (
            <div
              key={doc.id}
              className="flex items-center justify-between gap-3 rounded-lg border border-slate-200 px-3 py-2"
            >
              <a
                href={doc.url}
                target="_blank"
                rel="noopener noreferrer"
                className="flex min-w-0 items-center gap-2 text-sm font-medium text-navy hover:underline"
              >
                <FileText className="h-4 w-4 shrink-0 text-slate-400" />
                <span className="truncate">{doc.url.split("/").pop() ?? "Document"}</span>
              </a>
              <button
                type="button"
                onClick={() => handleDelete(doc.id)}
                disabled={deletingId === doc.id}
                aria-label="Delete document"
                className="shrink-0 rounded-lg p-1.5 text-slate-400 hover:bg-red-50 hover:text-red-600 disabled:opacity-50"
              >
                <Trash2 className="h-4 w-4" />
              </button>
            </div>
          ))
        )}
      </div>

      <label className="flex w-fit cursor-pointer items-center gap-2 rounded-lg border border-slate-300 px-4 py-2 text-sm font-semibold text-slate-600 hover:bg-slate-50">
        <Upload className="h-4 w-4" />
        {isUploading ? "Uploading..." : "Upload documents"}
        <input
          ref={fileInputRef}
          type="file"
          multiple
          disabled={isUploading}
          onChange={(e) => handleUpload(e.target.files)}
          className="hidden"
        />
      </label>

      <div className="flex items-center justify-between border-t border-slate-100 pt-4">
        {confirmed ? (
          <p className="flex items-center gap-1.5 text-sm font-medium text-emerald-700">
            <CheckCircle2 className="h-4 w-4" />
            Documents confirmed accurate and received.
          </p>
        ) : (
          <>
            <p className="text-sm text-slate-500">Once reviewed, confirm these are correct.</p>
            <button
              type="button"
              onClick={handleConfirm}
              disabled={isConfirming}
              className="rounded-lg bg-gold px-4 py-2 text-sm font-semibold text-white hover:bg-gold/90 disabled:opacity-50"
            >
              {isConfirming ? "Confirming..." : "Confirm Documents"}
            </button>
          </>
        )}
      </div>
    </div>
  );
}
