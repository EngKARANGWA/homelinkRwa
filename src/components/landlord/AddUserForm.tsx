"use client";

import { useState } from "react";
import { type InviteRole, inviteManager, inviteTenant } from "@/lib/api/iam";
import { Loader2 } from "lucide-react";

export function AddUserForm({
  onSuccess,
  onCancel,
}: {
  onSuccess: (message: string) => void;
  onCancel: () => void;
}) {
  const [email, setEmail] = useState("");
  const [role, setRole] = useState<InviteRole>("house_manager");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) {
      setError("Email is required");
      return;
    }
    setError(null);
    setIsSubmitting(true);

    try {
      if (role === "house_manager") {
        await inviteManager(email);
        onSuccess(`Invitation sent to ${email} as House Manager.`);
      } else {
        await inviteTenant(email);
        onSuccess(`Invitation sent to ${email} as Tenant.`);
      }
    } catch (err: any) {
      setError(err.message || "Failed to send invitation.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="mt-4">
      {error && (
        <div className="mb-4 rounded-lg bg-red-50 p-3 text-sm font-medium text-red-700">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="mb-1.5 block text-sm font-medium text-slate-700">
            Email Address
          </label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full rounded-lg border-slate-300 shadow-sm focus:border-gold focus:ring-gold sm:text-sm"
            placeholder="member@example.com"
            disabled={isSubmitting}
            required
          />
        </div>

        <div>
          <label className="mb-1.5 block text-sm font-medium text-slate-700">
            Role
          </label>
          <select
            value={role}
            onChange={(e) => setRole(e.target.value as InviteRole)}
            className="w-full rounded-lg border-slate-300 shadow-sm focus:border-gold focus:ring-gold sm:text-sm"
            disabled={isSubmitting}
          >
            <option value="house_manager">House Manager</option>
            <option value="tenant">Tenant</option>
          </select>
        </div>

        <div className="flex gap-3 pt-4">
          <button
            type="submit"
            disabled={isSubmitting}
            className="flex flex-1 items-center justify-center gap-2 rounded-lg bg-gold px-4 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-gold/90 disabled:opacity-50"
          >
            {isSubmitting ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : null}
            Send Invitation
          </button>
          <button
            type="button"
            onClick={onCancel}
            disabled={isSubmitting}
            className="rounded-lg border border-slate-300 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-50 disabled:opacity-50"
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
}
