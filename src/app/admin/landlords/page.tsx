"use client";

import { useEffect, useState } from "react";
import { AlertCircle, CheckCircle2, Plus } from "lucide-react";
import {
  countPropertiesForOwner,
  createHouseOwner,
  listUsers,
  type CreateHouseOwnerInput,
} from "@/lib/api/admin";
import { ApiError } from "@/lib/api/client";
import type { User } from "@/lib/api/types";
import { Modal } from "@/components/admin/Modal";
import { LandlordForm } from "@/components/admin/LandlordForm";

const STATUS_STYLES: Record<string, string> = {
  Active: "bg-emerald-50 text-emerald-700",
  Pending: "bg-amber-50 text-amber-700",
  Suspended: "bg-red-50 text-red-700",
};

function statusFor(user: User): "Active" | "Pending" | "Suspended" {
  if (!user.isApproved) return "Pending";
  if (!user.isActive) return "Suspended";
  return "Active";
}

export default function LandlordsPage() {
  const [landlords, setLandlords] = useState<User[]>([]);
  const [propertyCounts, setPropertyCounts] = useState<Record<string, number>>({});
  const [isLoading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isModalOpen, setModalOpen] = useState(false);
  const [isSubmitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [justRegistered, setJustRegistered] = useState(false);

  const load = () => {
    setLoading(true);
    setError(null);
    listUsers({ role: "owner", limit: 100 })
      .then(async (res) => {
        setLandlords(res.data);
        const counts = await Promise.all(
          res.data.map((u) => countPropertiesForOwner(u.id)),
        );
        setPropertyCounts(
          Object.fromEntries(res.data.map((u, i) => [u.id, counts[i]])),
        );
      })
      .catch((err) =>
        setError(err instanceof ApiError ? err.message : "Failed to load landlords."),
      )
      .finally(() => setLoading(false));
  };

  useEffect(load, []);

  const registerLandlord = async (values: CreateHouseOwnerInput) => {
    setSubmitting(true);
    setFormError(null);
    try {
      await createHouseOwner(values);
      setModalOpen(false);
      setJustRegistered(true);
      load();
    } catch (err) {
      setFormError(err instanceof ApiError ? err.message : "Failed to register landlord.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-navy">Landlords</h1>
          <p className="mt-1 text-sm text-slate-500">Property owners registered on the platform.</p>
        </div>
        <button
          type="button"
          onClick={() => setModalOpen(true)}
          className="inline-flex items-center gap-2 rounded-lg bg-gold px-5 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-gold/90"
        >
          <Plus className="h-4 w-4" />
          Register Landlord
        </button>
      </div>

      {justRegistered && (
        <div className="flex items-center gap-2 rounded-lg border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm font-medium text-emerald-700">
          <CheckCircle2 className="h-4 w-4" />
          Landlord registered successfully.
        </div>
      )}

      {error && (
        <div className="flex items-center justify-between gap-3 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-700">
          <span className="flex items-center gap-2">
            <AlertCircle className="h-4 w-4" />
            {error}
          </span>
          <button type="button" onClick={load} className="underline hover:no-underline">
            Retry
          </button>
        </div>
      )}

      <div className="overflow-x-auto rounded-xl border border-slate-200 bg-white shadow-sm">
        <table className="w-full text-left text-sm">
          <thead>
            <tr className="text-xs uppercase tracking-wide text-slate-400">
              <th className="px-6 py-3 font-medium">Name</th>
              <th className="px-6 py-3 font-medium">Email</th>
              <th className="px-6 py-3 font-medium">Phone</th>
              <th className="px-6 py-3 font-medium">Properties</th>
              <th className="px-6 py-3 font-medium">Status</th>
              <th className="px-6 py-3 font-medium">Registered</th>
            </tr>
          </thead>
          <tbody>
            {isLoading ? (
              <tr>
                <td colSpan={6} className="px-6 py-8 text-center text-slate-400">
                  Loading landlords...
                </td>
              </tr>
            ) : landlords.length === 0 ? (
              <tr>
                <td colSpan={6} className="px-6 py-8 text-center text-slate-400">
                  No landlords registered yet.
                </td>
              </tr>
            ) : (
              landlords.map((landlord) => (
                <tr key={landlord.id} className="border-t border-slate-100">
                  <td className="px-6 py-3 font-medium text-navy">{landlord.firstName} {landlord.lastName}</td>
                  <td className="px-6 py-3 text-slate-500">{landlord.email}</td>
                  <td className="px-6 py-3 text-slate-500">{landlord.phone}</td>
                  <td className="px-6 py-3 text-slate-500">{propertyCounts[landlord.id] ?? "—"}</td>
                  <td className="px-6 py-3">
                    <span className={`rounded-full px-2.5 py-1 text-xs font-medium ${STATUS_STYLES[statusFor(landlord)]}`}>
                      {statusFor(landlord)}
                    </span>
                  </td>
                  <td className="px-6 py-3 text-slate-500">{landlord.createdAt?.slice(0, 10)}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {isModalOpen && (
        <Modal title="Register Landlord" description="Add a new property owner to the platform." onClose={() => setModalOpen(false)}>
          {formError && <p className="mb-4 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">{formError}</p>}
          <fieldset disabled={isSubmitting}>
            <LandlordForm onCancel={() => setModalOpen(false)} onSuccess={registerLandlord} />
          </fieldset>
        </Modal>
      )}
    </div>
  );
}
