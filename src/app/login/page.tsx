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
import { login, verifyLogin } from "@/lib/api/auth";
import { ApiError } from "@/lib/api/client";
import { isLoginChallenge } from "@/lib/api/types";
import { ROLE_ROUTES } from "@/lib/api/roleRoute";
import { useAuth } from "@/components/auth/AuthContext";
import { useLanguage } from "@/lib/i18n/LanguageContext";
import { LanguageSwitcher } from "@/components/shared/LanguageSwitcher";

export default function LoginPage() {
  const router = useRouter();
  const { refreshUser } = useAuth();
  const { t } = useLanguage();
  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [code, setCode] = useState("");
  const [challengeId, setChallengeId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setSubmitting] = useState(false);

  const routeAfterLogin = async () => {
    const me = await refreshUser();
    if (!me) {
      setError("Signed in, but we couldn't load your account. Please try again.");
      return;
    }
    const route = ROLE_ROUTES[me.role];
    if (!route) {
      setError(
        `Signed in as ${me.role}, but this role doesn't have a dashboard here yet.`,
      );
      return;
    }
    router.push(route);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSubmitting(true);
    try {
      const result = await login({ email: email.trim(), password });
      if (isLoginChallenge(result)) {
        setChallengeId(result.challengeId);
      } else {
        await routeAfterLogin();
      }
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Something went wrong.");
    } finally {
      setSubmitting(false);
    }
  };

  const handleVerify = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!challengeId) return;
    setError(null);
    setSubmitting(true);
    try {
      await verifyLogin({ challengeId, code: code.trim() });
      await routeAfterLogin();
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Something went wrong.");
    } finally {
      setSubmitting(false);
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

        {challengeId ? (
          <form className="mt-8 flex flex-col gap-4" onSubmit={handleVerify}>
            <p className="text-center text-sm text-slate-500">
              We sent a verification code to {email}. Enter it below to finish
              signing in.
            </p>
            <label className="flex flex-col gap-1.5 text-sm font-medium text-slate-700">
              Verification code
              <div className="flex items-center gap-2 rounded-lg border border-slate-300 px-3 py-2.5 focus-within:border-gold">
                <Lock className="h-4 w-4 text-slate-400" />
                <input
                  type="text"
                  inputMode="numeric"
                  required
                  autoFocus
                  value={code}
                  onChange={(e) => setCode(e.target.value)}
                  placeholder="123456"
                  className="w-full bg-transparent text-navy placeholder:text-slate-400 focus:outline-none"
                />
              </div>
            </label>

            <button
              type="submit"
              disabled={isSubmitting}
              className="mt-2 rounded-lg bg-gold px-6 py-3 font-semibold text-white transition-colors hover:bg-gold/90 disabled:opacity-60"
            >
              {isSubmitting ? "Verifying..." : "Verify"}
            </button>

            <button
              type="button"
              onClick={() => {
                setChallengeId(null);
                setCode("");
                setError(null);
              }}
              className="text-sm font-medium text-slate-500 hover:text-navy"
            >
              Back to login
            </button>
          </form>
        ) : (
          <>
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
                disabled={isSubmitting}
                className="mt-2 rounded-lg bg-gold px-6 py-3 font-semibold text-white transition-colors hover:bg-gold/90 disabled:opacity-60"
              >
                {isSubmitting ? "Logging in..." : t.loginPage.logIn}
              </button>
            </form>

            <p className="mt-6 text-center text-sm text-slate-500">
              Don&apos;t have an account?{" "}
              <Link href="/get-started" className="font-medium text-gold hover:underline">
                Get started
              </Link>
            </p>
          </>
        )}
      </div>
    </div>
  );
}
