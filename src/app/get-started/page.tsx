"use client";

import { useState } from "react";
import Link from "next/link";
import { CheckCircle2, Home } from "lucide-react";

export default function GetStartedPage() {
  const [submitted, setSubmitted] = useState(false);

  return (
    <div className="flex min-h-screen items-center justify-center bg-navy px-6 py-16">
      <div className="w-full max-w-lg rounded-2xl bg-white p-8 shadow-2xl">
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
          Get started with HomeLink
        </h1>
        <p className="mt-2 text-center text-sm text-slate-500">
          Tell us a bit about you and we&apos;ll set up your account.
        </p>

        {submitted ? (
          <div className="mt-8 flex flex-col items-center gap-3 rounded-lg border border-emerald-200 bg-emerald-50 px-6 py-8 text-center">
            <CheckCircle2 className="h-8 w-8 text-emerald-600" />
            <p className="font-semibold text-emerald-800">
              Request received!
            </p>
            <p className="text-sm text-emerald-700">
              Our team will reach out to set up your account shortly.
            </p>
          </div>
        ) : (
          <form
            className="mt-8 flex flex-col gap-4"
            onSubmit={(e) => {
              e.preventDefault();
              setSubmitted(true);
            }}
          >
            <label className="flex flex-col gap-1.5 text-sm font-medium text-slate-700">
              Full name
              <input
                type="text"
                required
                placeholder="e.g. Jean Claude Uwimana"
                className="rounded-lg border border-slate-300 px-3 py-2.5 text-sm text-navy placeholder:text-slate-400 focus:border-gold focus:outline-none"
              />
            </label>

            <label className="flex flex-col gap-1.5 text-sm font-medium text-slate-700">
              Email address
              <input
                type="email"
                required
                placeholder="you@example.com"
                className="rounded-lg border border-slate-300 px-3 py-2.5 text-sm text-navy placeholder:text-slate-400 focus:border-gold focus:outline-none"
              />
            </label>

            <label className="flex flex-col gap-1.5 text-sm font-medium text-slate-700">
              Phone number
              <input
                type="tel"
                required
                placeholder="+250 7XX XXX XXX"
                className="rounded-lg border border-slate-300 px-3 py-2.5 text-sm text-navy placeholder:text-slate-400 focus:border-gold focus:outline-none"
              />
            </label>

            <label className="flex flex-col gap-1.5 text-sm font-medium text-slate-700">
              I am a...
              <select className="rounded-lg border border-slate-300 px-3 py-2.5 text-sm text-navy focus:border-gold focus:outline-none">
                <option>Landlord / Property Owner</option>
                <option>Property Manager / Agent</option>
                <option>Tenant</option>
              </select>
            </label>

            <label className="flex flex-col gap-1.5 text-sm font-medium text-slate-700">
              Number of properties (if applicable)
              <input
                type="number"
                min={0}
                placeholder="e.g. 3"
                className="rounded-lg border border-slate-300 px-3 py-2.5 text-sm text-navy placeholder:text-slate-400 focus:border-gold focus:outline-none"
              />
            </label>

            <label className="flex flex-col gap-1.5 text-sm font-medium text-slate-700">
              Anything else we should know?
              <textarea
                rows={3}
                placeholder="Optional message"
                className="rounded-lg border border-slate-300 px-3 py-2.5 text-sm text-navy placeholder:text-slate-400 focus:border-gold focus:outline-none"
              />
            </label>

            <button
              type="submit"
              className="mt-2 rounded-lg bg-gold px-6 py-3 font-semibold text-white transition-colors hover:bg-gold/90"
            >
              Request Access
            </button>
          </form>
        )}

        <p className="mt-6 text-center text-sm text-slate-500">
          Already have an account?{" "}
          <Link
            href="/login"
            className="font-semibold text-gold hover:underline"
          >
            Log in
          </Link>
        </p>
      </div>
    </div>
  );
}
