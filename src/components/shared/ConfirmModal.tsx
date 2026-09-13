"use client";

import { useState } from "react";
import { AlertTriangle, HelpCircle } from "lucide-react";
import { Modal } from "@/components/admin/Modal";

type ConfirmTone = "default" | "danger";

/**
 * Replaces window.confirm() with a modal that matches the app's own design
 * — supports an async onConfirm (shows a working state and surfaces any
 * thrown error) instead of just firing a callback and hoping for the best.
 */
export function ConfirmModal({
  title,
  description,
  confirmLabel = "Confirm",
  cancelLabel = "Cancel",
  tone = "default",
  onConfirm,
  onCancel,
}: {
  title: string;
  description: string;
  confirmLabel?: string;
  cancelLabel?: string;
  tone?: ConfirmTone;
  onConfirm: () => void | Promise<void>;
  onCancel: () => void;
}) {
  const [isSubmitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const isDanger = tone === "danger";

  const handleConfirm = async () => {
    setError(null);
    setSubmitting(true);
    try {
      await onConfirm();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong. Please try again.");
      setSubmitting(false);
    }
  };

  return (
    <Modal title={title} onClose={onCancel} maxWidthClassName="max-w-md">
      <div className="flex items-start gap-3">
        <span
          className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full ${
            isDanger ? "bg-red-50 text-red-600" : "bg-sky-50 text-sky-600"
          }`}
        >
          {isDanger ? <AlertTriangle className="h-5 w-5" /> : <HelpCircle className="h-5 w-5" />}
        </span>
        <p className="pt-2 text-sm text-slate-600">{description}</p>
      </div>

      {error && (
        <p className="mt-4 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
          {error}
        </p>
      )}

      <div className="mt-6 flex justify-end gap-3">
        <button
          type="button"
          onClick={onCancel}
          disabled={isSubmitting}
          className="rounded-lg border border-slate-300 px-5 py-2.5 text-sm font-semibold text-slate-600 transition-colors hover:bg-slate-50 disabled:opacity-60"
        >
          {cancelLabel}
        </button>
        <button
          type="button"
          onClick={handleConfirm}
          disabled={isSubmitting}
          className={`rounded-lg px-5 py-2.5 text-sm font-semibold text-white transition-colors disabled:opacity-60 ${
            isDanger ? "bg-red-600 hover:bg-red-700" : "bg-gold hover:bg-gold/90"
          }`}
        >
          {isSubmitting ? "Working..." : confirmLabel}
        </button>
      </div>
    </Modal>
  );
}
