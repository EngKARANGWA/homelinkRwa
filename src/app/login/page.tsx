"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  AlertCircle,
  ArrowLeft,
  Eye,
  EyeOff,
  Home,
  Lock,
  Mail,
} from "lucide-react";
import { LANDLORDS, TENANTS } from "@/lib/mock-admin-data";
import { useLanguage } from "@/lib/i18n/LanguageContext";
import { LanguageSwitcher } from "@/components/shared/LanguageSwitcher";

const ADMIN_EMAIL = "admin@gmail.com";
const DEMO_PASSWORD = "password123";

export default function LoginPage() {
  const router = useRouter();
  const { t } = useLanguage();
  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);

  const DEMO_ACCOUNTS = [
    { role: t.loginPage.roleAdmin, email: ADMIN_EMAIL },
    { role: t.loginPage.roleLandlord, email: LANDLORDS[0].email },
    { role: t.loginPage.roleTenant, email: TENANTS[0].email },
  ];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const normalized = email.trim().toLowerCase();

    const landlord = LANDLORDS.find(
      (l) => l.email.toLowerCase() === normalized,
    );
    const tenant = TENANTS.find((tn) => tn.email.toLowerCase() === normalized);
    const isAdmin = normalized === ADMIN_EMAIL;

    if (!isAdmin && !landlord && !tenant) {
      setError(t.loginPage.errorNoAccount);
      return;
    }

    if (password !== DEMO_PASSWORD) {
      setError(t.loginPage.errorIncorrectPassword);
      return;
    }

    if (isAdmin) {
      router.push("/admin");
    } else if (landlord) {
      router.push(`/landlord?id=${landlord.id}`);
    } else if (tenant) {
      router.push(`/tenant?id=${tenant.id}`);
    }
  };

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-navy px-6 py-16">
      <div className="mb-6 flex w-full max-w-md items-center justify-between">
        <Link
          href="/"
          className="inline-flex items-center gap-1.5 text-sm font-medium text-white/70 hover:text-white"
        >
          <ArrowLeft className="h-4 w-4" />
          {t.loginPage.backToHome}
        </Link>
        <LanguageSwitcher variant="dark" />
      </div>

      <div className="w-full max-w-md rounded-2xl bg-white p-8 shadow-2xl">
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
          {t.loginPage.welcomeBack}
        </h1>
        <p className="mt-2 text-center text-sm text-slate-500">
          {t.loginPage.subtitle}
        </p>

        {error && (
          <div className="mt-6 flex items-center gap-2 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-700">
            <AlertCircle className="h-4 w-4 shrink-0" />
            {error}
          </div>
        )}

        <form className="mt-8 flex flex-col gap-4" onSubmit={handleSubmit}>
          <label className="flex flex-col gap-1.5 text-sm font-medium text-slate-700">
            {t.loginPage.emailAddress}
            <div className="flex items-center gap-2 rounded-lg border border-slate-300 px-3 py-2.5 focus-within:border-gold">
              <Mail className="h-4 w-4 text-slate-400" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                className="w-full bg-transparent text-navy placeholder:text-slate-400 focus:outline-none"
              />
            </div>
          </label>

          <label className="flex flex-col gap-1.5 text-sm font-medium text-slate-700">
            {t.loginPage.password}
            <div className="flex items-center gap-2 rounded-lg border border-slate-300 px-3 py-2.5 focus-within:border-gold">
              <Lock className="h-4 w-4 text-slate-400" />
              <input
                type={showPassword ? "text" : "password"}
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full bg-transparent text-navy placeholder:text-slate-400 focus:outline-none"
              />
              <button
                type="button"
                onClick={() => setShowPassword((v) => !v)}
                aria-label={
                  showPassword
                    ? t.loginPage.hidePassword
                    : t.loginPage.showPassword
                }
                className="text-slate-400 hover:text-navy"
              >
                {showPassword ? (
                  <EyeOff className="h-4 w-4" />
                ) : (
                  <Eye className="h-4 w-4" />
                )}
              </button>
            </div>
          </label>

          <div className="flex items-center justify-between text-sm">
            <label className="flex items-center gap-2 text-slate-600">
              <input
                type="checkbox"
                className="h-4 w-4 rounded border-slate-300 accent-gold"
              />
              {t.loginPage.rememberMe}
            </label>
            <Link href="#" className="font-medium text-gold hover:underline">
              {t.loginPage.forgotPassword}
            </Link>
          </div>

          <button
            type="submit"
            className="mt-2 rounded-lg bg-gold px-6 py-3 font-semibold text-white transition-colors hover:bg-gold/90"
          >
            {t.loginPage.logIn}
          </button>
        </form>

        <div className="mt-6 rounded-lg border border-slate-200 bg-slate-50 p-4">
          <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
            {t.loginPage.demoAccounts}
          </p>
          <ul className="mt-2 flex flex-col gap-1 text-sm text-slate-600">
            {DEMO_ACCOUNTS.map(({ role, email: demoEmail }) => (
              <li key={role} className="flex justify-between gap-3">
                <span className="text-slate-400">{role}</span>
                <button
                  type="button"
                  onClick={() => {
                    setEmail(demoEmail);
                    setPassword(DEMO_PASSWORD);
                    setError(null);
                  }}
                  className="font-medium text-navy hover:text-gold"
                >
                  {demoEmail}
                </button>
              </li>
            ))}
          </ul>
          <p className="mt-2 text-xs text-slate-400">
            {t.loginPage.passwordFor} <strong>{DEMO_PASSWORD}</strong>
          </p>
        </div>
      </div>
    </div>
  );
}
