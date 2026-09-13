"use client";

import { Suspense, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { AlertCircle, CheckCircle2, Eye, EyeOff, Lock, Phone, User } from "lucide-react";
import { acceptInvite } from "@/lib/api/iam";
import { ApiError } from "@/lib/api/client";
import { AuthCardShell } from "@/components/auth/AuthCardShell";
import { useLanguage } from "@/lib/i18n/LanguageContext";

function JoinForm() {
  const { t } = useLanguage();
  const c = t.joinPage;
  const searchParams = useSearchParams();
  const token = searchParams.get("token") ?? "";

  const [showPassword, setShowPassword] = useState(false);
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [isSubmitting, setSubmitting] = useState(false);

  if (!token) {
    return (
      <div className="mt-6 flex items-center gap-2 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-700">
        <AlertCircle className="h-4 w-4 shrink-0" />
        {c.errorMissingToken}
      </div>
    );
  }

  if (success) {
    return (
      <div className="mt-8 flex flex-col items-center gap-3 text-center">
        <CheckCircle2 className="h-10 w-10 text-emerald-500" />
        <p className="text-sm font-medium text-slate-600">{c.success}</p>
        <Link href="/login" className="mt-2 font-medium text-gold hover:underline">
          {c.goToLogin}
        </Link>
      </div>
    );
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSubmitting(true);
    try {
      await acceptInvite({
        token,
        firstName: firstName.trim(),
        lastName: lastName.trim(),
        phone: phone.trim(),
        password,
      });
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
        <div className="grid grid-cols-2 gap-4">
          <label className="flex flex-col gap-1.5 text-sm font-medium text-slate-700">
            {c.firstName}
            <div className="flex items-center gap-2 rounded-lg border border-slate-300 px-3 py-2.5 focus-within:border-gold">
              <User className="h-4 w-4 text-slate-400" />
              <input
                type="text"
                required
                autoFocus
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
                className="w-full bg-transparent text-navy focus:outline-none"
              />
            </div>
          </label>

          <label className="flex flex-col gap-1.5 text-sm font-medium text-slate-700">
            {c.lastName}
            <div className="flex items-center gap-2 rounded-lg border border-slate-300 px-3 py-2.5 focus-within:border-gold">
              <User className="h-4 w-4 text-slate-400" />
              <input
                type="text"
                required
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
                className="w-full bg-transparent text-navy focus:outline-none"
              />
            </div>
          </label>
        </div>

        <label className="flex flex-col gap-1.5 text-sm font-medium text-slate-700">
          {c.phone}
          <div className="flex items-center gap-2 rounded-lg border border-slate-300 px-3 py-2.5 focus-within:border-gold">
            <Phone className="h-4 w-4 text-slate-400" />
            <input
              type="tel"
              required
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="07XXXXXXXX"
              className="w-full bg-transparent text-navy placeholder:text-slate-400 focus:outline-none"
            />
          </div>
        </label>

        <label className="flex flex-col gap-1.5 text-sm font-medium text-slate-700">
          {c.password}
          <div className="flex items-center gap-2 rounded-lg border border-slate-300 px-3 py-2.5 focus-within:border-gold">
            <Lock className="h-4 w-4 text-slate-400" />
            <input
              type={showPassword ? "text" : "password"}
              required
              minLength={8}
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

        <button
          type="submit"
          disabled={isSubmitting}
          className="mt-2 rounded-lg bg-gold px-6 py-3 font-semibold text-white transition-colors hover:bg-gold/90 disabled:opacity-60"
        >
          {isSubmitting ? c.submitting : c.submit}
        </button>
      </form>
    </>
  );
}

export default function JoinPage() {
  const { t } = useLanguage();
  const c = t.joinPage;

  return (
    <AuthCardShell title={c.title} subtitle={c.subtitle}>
      <Suspense fallback={null}>
        <JoinForm />
      </Suspense>
    </AuthCardShell>
  );
}
