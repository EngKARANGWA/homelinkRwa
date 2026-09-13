"use client";

import { useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { AlertCircle, CheckCircle2, Eye, EyeOff, Lock } from "lucide-react";
import { ApiError } from "@/lib/api/client";

type Copy = {
  newPassword: string;
  confirmPassword: string;
  submit: string;
  submitting: string;
  success: string;
  goToLogin: string;
  errorMismatch: string;
  errorMissingToken: string;
};

export function TokenPasswordForm({
  copy,
  onSubmit,
}: {
  copy: Copy;
  onSubmit: (token: string, password: string) => Promise<void>;
}) {
  const searchParams = useSearchParams();
  const token = searchParams.get("token") ?? "";

  const [showPassword, setShowPassword] = useState(false);
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [isSubmitting, setSubmitting] = useState(false);

  if (!token) {
    return (
      <div className="mt-6 flex items-center gap-2 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-700">
        <AlertCircle className="h-4 w-4 shrink-0" />
        {copy.errorMissingToken}
      </div>
    );
  }

  if (success) {
    return (
      <div className="mt-8 flex flex-col items-center gap-3 text-center">
        <CheckCircle2 className="h-10 w-10 text-emerald-500" />
        <p className="text-sm font-medium text-slate-600">{copy.success}</p>
        <Link href="/login" className="mt-2 font-medium text-gold hover:underline">
          {copy.goToLogin}
        </Link>
      </div>
    );
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (password !== confirmPassword) {
      setError(copy.errorMismatch);
      return;
    }
    setSubmitting(true);
    try {
      await onSubmit(token, password);
      setSuccess(true);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Something went wrong.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <>
      {error && (
        <div className="mt-6 flex items-center gap-2 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-700">
          <AlertCircle className="h-4 w-4 shrink-0" />
          {error}
        </div>
      )}

      <form className="mt-8 flex flex-col gap-4" onSubmit={handleSubmit}>
        <label className="flex flex-col gap-1.5 text-sm font-medium text-slate-700">
          {copy.newPassword}
          <div className="flex items-center gap-2 rounded-lg border border-slate-300 px-3 py-2.5 focus-within:border-gold">
            <Lock className="h-4 w-4 text-slate-400" />
            <input
              type={showPassword ? "text" : "password"}
              required
              minLength={8}
              autoFocus
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              className="w-full bg-transparent text-navy placeholder:text-slate-400 focus:outline-none"
            />
            <button
              type="button"
              onClick={() => setShowPassword((v) => !v)}
              className="text-slate-400 hover:text-navy"
            >
              {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            </button>
          </div>
        </label>

        <label className="flex flex-col gap-1.5 text-sm font-medium text-slate-700">
          {copy.confirmPassword}
          <div className="flex items-center gap-2 rounded-lg border border-slate-300 px-3 py-2.5 focus-within:border-gold">
            <Lock className="h-4 w-4 text-slate-400" />
            <input
              type={showPassword ? "text" : "password"}
              required
              minLength={8}
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="••••••••"
              className="w-full bg-transparent text-navy placeholder:text-slate-400 focus:outline-none"
            />
          </div>
        </label>

        <button
          type="submit"
          disabled={isSubmitting}
          className="mt-2 rounded-lg bg-gold px-6 py-3 font-semibold text-white transition-colors hover:bg-gold/90 disabled:opacity-60"
        >
          {isSubmitting ? copy.submitting : copy.submit}
        </button>
      </form>
    </>
  );
}
