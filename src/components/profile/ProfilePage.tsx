"use client";

import { useEffect, useState } from "react";
import { AlertCircle, CheckCircle2, ShieldCheck, Upload } from "lucide-react";
import { useAuth } from "@/components/auth/AuthContext";
import { ApiError } from "@/lib/api/client";
import {
  listIdentityVerifications,
  submitIdentityVerification,
  updateProfile,
} from "@/lib/api/users";
import type { IdentityVerification } from "@/lib/api/types";

const STATUS_STYLES: Record<string, string> = {
  pending: "bg-amber-50 text-amber-700",
  approved: "bg-emerald-50 text-emerald-700",
  rejected: "bg-red-50 text-red-700",
};

export function ProfilePage() {
  const { user, refreshUser } = useAuth();

  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [phone, setPhone] = useState("");
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);

  const [verifications, setVerifications] = useState<IdentityVerification[]>([]);
  const [loadingVerifications, setLoadingVerifications] = useState(true);
  const [file, setFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [uploaded, setUploaded] = useState(false);

  useEffect(() => {
    if (user) {
      setFirstName(user.firstName);
      setLastName(user.lastName);
      setPhone(user.phone);
    }
  }, [user]);

  const loadVerifications = () => {
    setLoadingVerifications(true);
    listIdentityVerifications()
      .then(setVerifications)
      .catch(() => setVerifications([]))
      .finally(() => setLoadingVerifications(false));
  };

  useEffect(() => {
    loadVerifications();
  }, []);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setSaveError(null);
    setSaved(false);
    try {
      await updateProfile({ firstName, lastName, phone });
      await refreshUser();
      setSaved(true);
    } catch (err) {
      setSaveError(
        err instanceof ApiError ? err.message : "Failed to update profile.",
      );
    } finally {
      setSaving(false);
    }
  };

  const handleUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!file) return;
    setUploading(true);
    setUploadError(null);
    setUploaded(false);
    try {
      await submitIdentityVerification(file);
      setUploaded(true);
      setFile(null);
      loadVerifications();
    } catch (err) {
      setUploadError(
        err instanceof ApiError ? err.message : "Failed to submit document.",
      );
    } finally {
      setUploading(false);
    }
  };

  if (!user) return null;

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-bold text-navy">My Profile</h1>
        <p className="mt-1 text-sm text-slate-500">
          Manage your account details and identity verification.
        </p>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="flex items-center gap-4">
            <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full bg-navy/5 text-lg font-bold text-navy">
              {user.firstName[0]}
              {user.lastName[0]}
            </div>
            <div className="min-w-0">
              <p className="truncate font-semibold text-navy">
                {user.firstName} {user.lastName}
              </p>
              <p className="truncate text-sm text-slate-500">{user.email}</p>
            </div>
            {user.isVerified ? (
              <span className="ml-auto inline-flex shrink-0 items-center gap-1 rounded-full bg-emerald-50 px-2.5 py-1 text-xs font-medium text-emerald-700">
                <ShieldCheck className="h-3.5 w-3.5" />
                Verified
              </span>
            ) : (
              <span className="ml-auto inline-flex shrink-0 items-center gap-1 rounded-full bg-amber-50 px-2.5 py-1 text-xs font-medium text-amber-700">
                Unverified
              </span>
            )}
          </div>

          <form onSubmit={handleSave} className="mt-6 flex flex-col gap-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <label className="flex flex-col gap-1.5 text-sm font-medium text-slate-700">
                First name
                <input
                  type="text"
                  required
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                  className="rounded-lg border border-slate-300 px-3 py-2.5 text-sm text-navy focus:border-gold focus:outline-none"
                />
              </label>
              <label className="flex flex-col gap-1.5 text-sm font-medium text-slate-700">
                Last name
                <input
                  type="text"
                  required
                  value={lastName}
                  onChange={(e) => setLastName(e.target.value)}
                  className="rounded-lg border border-slate-300 px-3 py-2.5 text-sm text-navy focus:border-gold focus:outline-none"
                />
              </label>
            </div>
            <label className="flex flex-col gap-1.5 text-sm font-medium text-slate-700">
              Phone number
              <input
                type="tel"
                required
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="rounded-lg border border-slate-300 px-3 py-2.5 text-sm text-navy focus:border-gold focus:outline-none"
              />
            </label>

            {saveError && (
              <div className="flex items-center gap-2 rounded-lg border border-red-200 bg-red-50 px-4 py-2.5 text-sm font-medium text-red-700">
                <AlertCircle className="h-4 w-4" />
                {saveError}
              </div>
            )}
            {saved && (
              <div className="flex items-center gap-2 rounded-lg border border-emerald-200 bg-emerald-50 px-4 py-2.5 text-sm font-medium text-emerald-700">
                <CheckCircle2 className="h-4 w-4" />
                Profile updated successfully.
              </div>
            )}

            <button
              type="submit"
              disabled={saving}
              className="self-start rounded-lg bg-gold px-6 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-gold/90 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {saving ? "Saving…" : "Save changes"}
            </button>
          </form>
        </div>

        <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
          <p className="font-semibold text-navy">Identity Verification</p>
          <p className="mt-1 text-sm text-slate-500">
            Upload a national ID, passport, or driver&apos;s license for review.
          </p>

          <form
            onSubmit={handleUpload}
            className="mt-4 flex flex-wrap items-center gap-3"
          >
            <label className="flex-1 cursor-pointer rounded-lg border border-dashed border-slate-300 px-4 py-3 text-sm text-slate-500 hover:border-gold/50">
              <input
                type="file"
                accept="image/*,application/pdf"
                className="hidden"
                onChange={(e) => setFile(e.target.files?.[0] ?? null)}
              />
              <span className="truncate">
                {file ? file.name : "Choose a file to upload"}
              </span>
            </label>
            <button
              type="submit"
              disabled={!file || uploading}
              className="inline-flex items-center gap-2 rounded-lg bg-gold px-5 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-gold/90 disabled:cursor-not-allowed disabled:opacity-50"
            >
              <Upload className="h-4 w-4" />
              {uploading ? "Submitting…" : "Submit"}
            </button>
          </form>

          {uploadError && (
            <div className="mt-3 flex items-center gap-2 rounded-lg border border-red-200 bg-red-50 px-4 py-2.5 text-sm font-medium text-red-700">
              <AlertCircle className="h-4 w-4" />
              {uploadError}
            </div>
          )}
          {uploaded && (
            <div className="mt-3 flex items-center gap-2 rounded-lg border border-emerald-200 bg-emerald-50 px-4 py-2.5 text-sm font-medium text-emerald-700">
              <CheckCircle2 className="h-4 w-4" />
              Document submitted for review.
            </div>
          )}

          <div className="mt-6">
            <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
              Submission history
            </p>
            {loadingVerifications ? (
              <p className="mt-2 text-sm text-slate-400">Loading…</p>
            ) : verifications.length === 0 ? (
              <p className="mt-2 text-sm text-slate-400">No submissions yet.</p>
            ) : (
              <ul className="mt-3 flex flex-col gap-2">
                {verifications.map((v) => (
                  <li
                    key={v.id}
                    className="flex items-center justify-between rounded-lg border border-slate-100 px-3 py-2 text-sm"
                  >
                    <span className="text-slate-500">
                      {new Date(v.createdAt).toLocaleDateString()}
                    </span>
                    <span
                      className={`rounded-full px-2.5 py-1 text-xs font-medium capitalize ${
                        STATUS_STYLES[v.status] ?? "bg-slate-100 text-slate-600"
                      }`}
                    >
                      {v.status}
                    </span>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
