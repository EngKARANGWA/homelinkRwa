"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { AlertCircle, CheckCircle2, Home } from "lucide-react";
import { register } from "@/lib/api/auth";
import { ApiError } from "@/lib/api/client";
import type { RegisterInput } from "@/lib/api/types";
import { ROLE_ROUTES } from "@/lib/api/roleRoute";
import { useAuth } from "@/components/auth/AuthContext";
import { useLanguage } from "@/lib/i18n/LanguageContext";
import { LanguageSwitcher } from "@/components/shared/LanguageSwitcher";

export default function GetStartedPage() {
  const router = useRouter();
  const { refreshUser } = useAuth();
  const { t } = useLanguage();
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setSubmitting] = useState(false);

  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState<RegisterInput["role"]>("owner");

  const ROLE_OPTIONS: { label: string; value: RegisterInput["role"] }[] = [
    { label: t.getStartedPage.form.optionLandlord, value: "owner" },
    { label: t.getStartedPage.form.optionManager, value: "agent" },
    { label: t.getStartedPage.form.optionTenant, value: "tenant" },
  ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSubmitting(true);
    try {
      await register({
        firstName: firstName.trim(),
        lastName: lastName.trim(),
        email: email.trim(),
        phone: phone.trim(),
        password,
        role,
      });
      setSubmitted(true);
      const me = await refreshUser();
      const route = me ? ROLE_ROUTES[me.role] : undefined;
      if (route) {
        router.push(route);
      }
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Something went wrong.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-navy px-6 py-16">
      <div className="w-full max-w-lg rounded-2xl bg-white p-8 shadow-2xl">
        <div className="flex justify-end">
          <LanguageSwitcher />
        </div>
        <Link href="/" className="flex items-center justify-center gap-2">
          <Home className="h-7 w-7 text-gold" strokeWidth={2.2} />
          <span className="leading-tight">
            <span className="block text-lg font-bold text-navy">
              HomeLink
            </span>
            <span className="block text-[11px] font-semibold tracking-[0.2em] text-gold">
              RWANDA
            </span>
          </span>
        </Link>

        <h1 className="mt-6 text-center text-2xl font-bold text-navy">
          {t.getStartedPage.title}
        </h1>
        <p className="mt-2 text-center text-sm text-slate-500">
          Create your account to manage properties, leases, and payments.
        </p>

        {submitted ? (
          <div className="mt-8 flex flex-col items-center gap-3 rounded-lg border border-emerald-200 bg-emerald-50 px-6 py-8 text-center">
            <CheckCircle2 className="h-8 w-8 text-emerald-600" />
            <p className="font-semibold text-emerald-800">Account created!</p>
            <p className="text-sm text-emerald-700">
              You can now log in. Some accounts may need a brief approval
              before full access is granted.
            </p>
            <Link
              href="/login"
              className="mt-2 rounded-lg bg-gold px-5 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-gold/90"
            >
              Go to login
            </Link>
          </div>
        ) : (
          <form className="mt-8 flex flex-col gap-4" onSubmit={handleSubmit}>
            {error && (
              <div className="flex items-center gap-2 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-700">
                <AlertCircle className="h-4 w-4 shrink-0" />
                {error}
              </div>
            )}

            <div className="grid gap-4 sm:grid-cols-2">
              <label className="flex flex-col gap-1.5 text-sm font-medium text-slate-700">
                First name
                <input
                  type="text"
                  required
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                  placeholder="Jean Claude"
                  className="rounded-lg border border-slate-300 px-3 py-2.5 text-sm text-navy placeholder:text-slate-400 focus:border-gold focus:outline-none"
                />
              </label>

              <label className="flex flex-col gap-1.5 text-sm font-medium text-slate-700">
                Last name
                <input
                  type="text"
                  required
                  value={lastName}
                  onChange={(e) => setLastName(e.target.value)}
                  placeholder="Uwimana"
                  className="rounded-lg border border-slate-300 px-3 py-2.5 text-sm text-navy placeholder:text-slate-400 focus:border-gold focus:outline-none"
                />
              </label>
            </div>

            <label className="flex flex-col gap-1.5 text-sm font-medium text-slate-700">
              {t.getStartedPage.form.emailAddress}
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                className="rounded-lg border border-slate-300 px-3 py-2.5 text-sm text-navy placeholder:text-slate-400 focus:border-gold focus:outline-none"
              />
            </label>

            <label className="flex flex-col gap-1.5 text-sm font-medium text-slate-700">
              {t.getStartedPage.form.phoneNumber}
              <input
                type="tel"
                required
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="+250 7XX XXX XXX"
                className="rounded-lg border border-slate-300 px-3 py-2.5 text-sm text-navy placeholder:text-slate-400 focus:border-gold focus:outline-none"
              />
            </label>

            <label className="flex flex-col gap-1.5 text-sm font-medium text-slate-700">
              Password
              <input
                type="password"
                required
                minLength={8}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="At least 8 characters"
                className="rounded-lg border border-slate-300 px-3 py-2.5 text-sm text-navy placeholder:text-slate-400 focus:border-gold focus:outline-none"
              />
            </label>

            <label className="flex flex-col gap-1.5 text-sm font-medium text-slate-700">
              {t.getStartedPage.form.iAmA}
              <select
                value={role}
                onChange={(e) => setRole(e.target.value as RegisterInput["role"])}
                className="rounded-lg border border-slate-300 px-3 py-2.5 text-sm text-navy focus:border-gold focus:outline-none"
              >
                {ROLE_OPTIONS.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </label>

            <button
              type="submit"
              disabled={isSubmitting}
              className="mt-2 rounded-lg bg-gold px-6 py-3 font-semibold text-white transition-colors hover:bg-gold/90 disabled:opacity-60"
            >
              {isSubmitting ? "Creating account..." : "Create Account"}
            </button>
          </form>
        )}

        <p className="mt-6 text-center text-sm text-slate-500">
          {t.getStartedPage.alreadyHaveAccount}{" "}
          <Link
            href="/login"
            className="font-semibold text-gold hover:underline"
          >
            {t.getStartedPage.logIn}
          </Link>
        </p>
      </div>
    </div>
  );
}
