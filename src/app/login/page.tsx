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
import { login } from "@/lib/api/auth";
import { ApiError } from "@/lib/api/client";
import { ROLE_ROUTES } from "@/lib/api/roleRoute";
import { useAuth } from "@/components/auth/AuthContext";

export default function LoginPage() {
  const router = useRouter();
  const { refreshUser } = useAuth();
  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
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
      await login({ email: email.trim(), password });
      await routeAfterLogin();
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Something went wrong.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-navy px-6 py-16">
      <div className="mb-6 w-full max-w-md">
        <Link
          href="/"
          className="inline-flex items-center gap-1.5 text-sm font-medium text-white/70 hover:text-white"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to home
        </Link>
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
          Welcome back
        </h1>
        <p className="mt-2 text-center text-sm text-slate-500">
          Log in to manage your properties and tenants.
        </p>

        {error && (
          <div className="mt-6 flex items-center gap-2 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-700">
            <AlertCircle className="h-4 w-4 shrink-0" />
            {error}
          </div>
        )}

        <form className="mt-8 flex flex-col gap-4" onSubmit={handleSubmit}>
          <label className="flex flex-col gap-1.5 text-sm font-medium text-slate-700">
            Email address
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
            Password
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
                aria-label={showPassword ? "Hide password" : "Show password"}
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

          <button
            type="submit"
            disabled={isSubmitting}
            className="mt-2 rounded-lg bg-gold px-6 py-3 font-semibold text-white transition-colors hover:bg-gold/90 disabled:opacity-60"
          >
            {isSubmitting ? "Logging in..." : "Log In"}
          </button>
        </form>

        <p className="mt-6 text-center text-sm text-slate-500">
          Don&apos;t have an account?{" "}
          <Link href="/get-started" className="font-medium text-gold hover:underline">
            Get started
          </Link>
        </p>
      </div>
    </div>
  );
}
