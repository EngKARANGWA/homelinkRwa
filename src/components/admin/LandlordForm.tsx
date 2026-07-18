"use client";

import type { CreateHouseOwnerInput } from "@/lib/api/admin";

export function LandlordForm({
  onSuccess,
  onCancel,
}: {
  onSuccess: (values: CreateHouseOwnerInput) => void;
  onCancel: () => void;
}) {
  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        const formData = new FormData(e.currentTarget);
        onSuccess({
          firstName: String(formData.get("firstName")).trim(),
          lastName: String(formData.get("lastName")).trim(),
          email: String(formData.get("email")).trim(),
          phone: String(formData.get("phone")).trim(),
        });
      }}
    >
      <div className="grid gap-5 sm:grid-cols-2">
        <label className="flex flex-col gap-1.5 text-sm font-medium text-slate-700">
          First name
          <input
            name="firstName"
            type="text"
            required
            placeholder="e.g. Jean Claude"
            className="rounded-lg border border-slate-300 px-3 py-2.5 text-sm text-navy placeholder:text-slate-400 focus:border-gold focus:outline-none"
          />
        </label>

        <label className="flex flex-col gap-1.5 text-sm font-medium text-slate-700">
          Last name
          <input
            name="lastName"
            type="text"
            required
            placeholder="e.g. Uwimana"
            className="rounded-lg border border-slate-300 px-3 py-2.5 text-sm text-navy placeholder:text-slate-400 focus:border-gold focus:outline-none"
          />
        </label>

        <label className="flex flex-col gap-1.5 text-sm font-medium text-slate-700 sm:col-span-2">
          Email address
          <input
            name="email"
            type="email"
            required
            placeholder="landlord@example.com"
            className="rounded-lg border border-slate-300 px-3 py-2.5 text-sm text-navy placeholder:text-slate-400 focus:border-gold focus:outline-none"
          />
        </label>

        <label className="flex flex-col gap-1.5 text-sm font-medium text-slate-700 sm:col-span-2">
          Phone number
          <input
            name="phone"
            type="tel"
            required
            placeholder="+250 7XX XXX XXX"
            className="rounded-lg border border-slate-300 px-3 py-2.5 text-sm text-navy placeholder:text-slate-400 focus:border-gold focus:outline-none"
          />
        </label>
      </div>

      <div className="mt-6 flex justify-end gap-3">
        <button
          type="button"
          onClick={onCancel}
          className="rounded-lg border border-slate-300 px-5 py-2.5 text-sm font-semibold text-slate-600 transition-colors hover:bg-slate-50"
        >
          Cancel
        </button>
        <button
          type="submit"
          className="rounded-lg bg-gold px-6 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-gold/90"
        >
          Register Landlord
        </button>
      </div>
    </form>
  );
}
