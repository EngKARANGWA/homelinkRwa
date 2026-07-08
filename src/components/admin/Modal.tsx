"use client";

import { useEffect } from "react";
import { X } from "lucide-react";

export function Modal({
  title,
  description,
  onClose,
  children,
  maxWidthClassName = "max-w-2xl",
}: {
  title: string;
  description?: string;
  onClose: () => void;
  children: React.ReactNode;
  maxWidthClassName?: string;
}) {
  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, [onClose]);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto bg-navy/50 px-4 py-8">
      <button
        type="button"
        aria-label="Close"
        onClick={onClose}
        className="fixed inset-0 cursor-default"
      />

      <div
        className={`relative w-full ${maxWidthClassName} rounded-xl bg-white p-6 shadow-2xl`}
      >
        <div className="flex items-start justify-between">
          <div>
            <h2 className="text-xl font-bold text-navy">{title}</h2>
            {description && (
              <p className="mt-1 text-sm text-slate-500">{description}</p>
            )}
          </div>
          <button
            type="button"
            aria-label="Close"
            onClick={onClose}
            className="rounded-full p-1.5 text-slate-400 hover:bg-slate-100 hover:text-navy"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="mt-6">{children}</div>
      </div>
    </div>
  );
}
