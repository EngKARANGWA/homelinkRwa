"use client";

import { useState } from "react";
import Link from "next/link";
import { Eye, EyeOff, Home, Lock, Mail } from "lucide-react";

export default function LoginPage() {
  const [showPassword, setShowPassword] = useState(false);

  return (
    <div className="flex min-h-screen items-center justify-center bg-navy px-6 py-16">
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

        <form
          className="mt-8 flex flex-col gap-4"
          onSubmit={(e) => e.preventDefault()}
        >
          <label className="flex flex-col gap-1.5 text-sm font-medium text-slate-700">
            Email address
            <div className="flex items-center gap-2 rounded-lg border border-slate-300 px-3 py-2.5 focus-within:border-gold">
              <Mail className="h-4 w-4 text-slate-400" />
              <input
                type="email"
                required
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

          <div className="flex items-center justify-between text-sm">
            <label className="flex items-center gap-2 text-slate-600">
              <input
                type="checkbox"
                className="h-4 w-4 rounded border-slate-300 accent-gold"
              />
              Remember me
            </label>
            <Link href="#" className="font-medium text-gold hover:underline">
              Forgot password?
            </Link>
          </div>

          <button
            type="submit"
            className="mt-2 rounded-lg bg-gold px-6 py-3 font-semibold text-navy transition-colors hover:bg-gold/90"
          >
            Log In
          </button>
        </form>
      </div>
    </div>
  );
}
