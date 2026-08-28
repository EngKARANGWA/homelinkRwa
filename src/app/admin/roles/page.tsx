"use client";

import { useEffect, useRef, useState } from "react";
import {
  AlertCircle,
  CheckCircle2,
  ChevronDown,
  Loader2,
  RefreshCw,
  Search,
  ShieldCheck,
  XCircle,
} from "lucide-react";
import { listUsers, updateUserRole } from "@/lib/api/admin";
import { ApiError } from "@/lib/api/client";
import type { Role, User } from "@/lib/api/types";

// ── Types ──────────────────────────────────────────────────────────────────
type AssignableRole = "tenant" | "owner" | "agent" | "admin";

const ROLES: AssignableRole[] = ["tenant", "owner", "agent", "admin"];

const ROLE_META: Record<
  AssignableRole,
  { label: string; color: string; bg: string }
> = {
  tenant: {
    label: "Tenant",
    color: "text-sky-700",
    bg: "bg-sky-50 border-sky-200",
  },
  owner: {
    label: "Owner",
    color: "text-amber-700",
    bg: "bg-amber-50 border-amber-200",
  },
  agent: {
    label: "Agent",
    color: "text-violet-700",
    bg: "bg-violet-50 border-violet-200",
  },
  admin: {
    label: "Admin",
    color: "text-rose-700",
    bg: "bg-rose-50 border-rose-200",
  },
};

// ── Toast ──────────────────────────────────────────────────────────────────
type Toast = { id: number; type: "success" | "error"; message: string };

function ToastContainer({ toasts }: { toasts: Toast[] }) {
  return (
    <div className="fixed bottom-6 right-6 z-50 flex flex-col gap-2">
      {toasts.map((t) => (
        <div
          key={t.id}
          className={`flex items-center gap-2 rounded-xl px-4 py-3 text-sm font-medium shadow-lg ring-1 transition-all ${
            t.type === "success"
              ? "bg-emerald-600 text-white ring-emerald-500/40"
              : "bg-red-600 text-white ring-red-500/40"
          }`}
        >
          {t.type === "success" ? (
            <CheckCircle2 className="h-4 w-4 shrink-0" />
          ) : (
            <XCircle className="h-4 w-4 shrink-0" />
          )}
          {t.message}
        </div>
      ))}
    </div>
  );
}

// ── Role Badge ─────────────────────────────────────────────────────────────
function RoleBadge({ role }: { role: Role }) {
  const meta = ROLE_META[role as AssignableRole];
  if (!meta) {
    return (
      <span className="rounded-full border border-slate-200 bg-slate-50 px-2.5 py-1 text-xs font-semibold text-slate-600">
        {role}
      </span>
    );
  }
  return (
    <span
      className={`rounded-full border px-2.5 py-1 text-xs font-semibold ${meta.bg} ${meta.color}`}
    >
      {meta.label}
    </span>
  );
}

// ── Role Dropdown ──────────────────────────────────────────────────────────
function RoleDropdown({
  userId,
  currentRole,
  onRoleChanged,
  onError,
}: {
  userId: string;
  currentRole: Role;
  onRoleChanged: (userId: string, newRole: AssignableRole) => void;
  onError: (message: string) => void;
}) {
  const [open, setOpen] = useState(false);
  const [pendingRole, setPendingRole] = useState<AssignableRole | null>(null);
  const [saving, setSaving] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  // Close on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
        setPendingRole(null);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const confirm = async () => {
    if (!pendingRole) return;
    setSaving(true);
    try {
      await updateUserRole(userId, pendingRole);
      onRoleChanged(userId, pendingRole);
      setOpen(false);
      setPendingRole(null);
    } catch (err) {
      onError(err instanceof ApiError ? err.message : "Failed to update role.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        id={`role-btn-${userId}`}
        onClick={() => {
          setOpen((o) => !o);
          setPendingRole(null);
        }}
        className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs font-medium text-slate-600 shadow-sm transition-colors hover:border-slate-300 hover:bg-slate-50"
      >
        Change role
        <ChevronDown className="h-3 w-3" />
      </button>

      {open && (
        <div className="absolute right-0 top-full z-40 mt-1.5 w-56 rounded-xl border border-slate-200 bg-white shadow-xl">
          {pendingRole === null ? (
            <>
              <p className="border-b border-slate-100 px-4 py-2.5 text-[11px] font-semibold uppercase tracking-wider text-slate-400">
                Assign role
              </p>
              {ROLES.map((role) => {
                const meta = ROLE_META[role];
                const isCurrentRole = role === currentRole;
                return (
                  <button
                    key={role}
                    type="button"
                    disabled={isCurrentRole}
                    onClick={() => setPendingRole(role)}
                    className={`flex w-full items-center gap-2.5 px-4 py-2.5 text-sm transition-colors ${
                      isCurrentRole
                        ? "cursor-not-allowed opacity-40"
                        : "hover:bg-slate-50"
                    }`}
                  >
                    <span
                      className={`rounded-full border px-2 py-0.5 text-xs font-semibold ${meta.bg} ${meta.color}`}
                    >
                      {meta.label}
                    </span>
                    {isCurrentRole && (
                      <span className="ml-auto text-[11px] text-slate-400">
                        current
                      </span>
                    )}
                  </button>
                );
              })}
            </>
          ) : (
            <div className="p-4">
              <p className="text-sm font-medium text-slate-700">
                Assign{" "}
                <span
                  className={`font-bold ${ROLE_META[pendingRole].color}`}
                >
                  {ROLE_META[pendingRole].label}
                </span>{" "}
                role?
              </p>
              <p className="mt-1 text-xs text-slate-500">
                This will update the user's permissions immediately.
              </p>
              <div className="mt-3 flex gap-2">
                <button
                  type="button"
                  onClick={confirm}
                  disabled={saving}
                  id={`confirm-role-${userId}`}
                  className="inline-flex flex-1 items-center justify-center gap-1.5 rounded-lg bg-navy py-1.5 text-xs font-semibold text-white transition-colors hover:bg-navy/90 disabled:opacity-60"
                >
                  {saving ? (
                    <Loader2 className="h-3 w-3 animate-spin" />
                  ) : (
                    "Confirm"
                  )}
                </button>
                <button
                  type="button"
                  onClick={() => setPendingRole(null)}
                  disabled={saving}
                  className="flex-1 rounded-lg border border-slate-200 py-1.5 text-xs font-medium text-slate-600 hover:bg-slate-50 disabled:opacity-60"
                >
                  Cancel
                </button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

// ── Main Page ──────────────────────────────────────────────────────────────
export default function RoleManagementPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [isLoading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [filterRole, setFilterRole] = useState<AssignableRole | "all">("all");
  const [toasts, setToasts] = useState<Toast[]>([]);
  let nextToastId = useRef(0);

  const addToast = (type: "success" | "error", message: string) => {
    const id = ++nextToastId.current;
    setToasts((prev) => [...prev, { id, type, message }]);
    setTimeout(() => setToasts((prev) => prev.filter((t) => t.id !== id)), 4000);
  };

  const load = () => {
    setLoading(true);
    setError(null);
    listUsers({ limit: 200 })
      .then((res) => setUsers(res.data))
      .catch((err) =>
        setError(err instanceof ApiError ? err.message : "Failed to load users.")
      )
      .finally(() => setLoading(false));
  };

  useEffect(load, []);

  const handleRoleChanged = (userId: string, newRole: AssignableRole) => {
    setUsers((prev) =>
      prev.map((u) => (u.id === userId ? { ...u, role: newRole } : u))
    );
    addToast("success", `Role updated to "${ROLE_META[newRole].label}" successfully.`);
  };

  const handleError = (message: string) => {
    addToast("error", message);
  };

  // Filter + search
  const filtered = users.filter((u) => {
    const matchRole = filterRole === "all" || u.role === filterRole;
    const term = search.toLowerCase();
    const matchSearch =
      !term ||
      u.firstName.toLowerCase().includes(term) ||
      u.lastName.toLowerCase().includes(term) ||
      u.email.toLowerCase().includes(term);
    return matchRole && matchSearch;
  });

  const roleCounts = ROLES.reduce(
    (acc, r) => {
      acc[r] = users.filter((u) => u.role === r).length;
      return acc;
    },
    {} as Record<AssignableRole, number>
  );

  return (
    <>
      <div className="flex flex-col gap-6">
        {/* Header */}
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-navy/10">
              <ShieldCheck className="h-5 w-5 text-navy" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-navy">Role Management</h1>
              <p className="mt-0.5 text-sm text-slate-500">
                View and assign roles to platform users.
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={load}
            disabled={isLoading}
            className="inline-flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-600 shadow-sm transition-colors hover:bg-slate-50 disabled:opacity-50"
          >
            <RefreshCw
              className={`h-4 w-4 ${isLoading ? "animate-spin" : ""}`}
            />
            Refresh
          </button>
        </div>

        {/* Stats row */}
        {!isLoading && !error && (
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
            {ROLES.map((role) => {
              const meta = ROLE_META[role];
              return (
                <button
                  key={role}
                  type="button"
                  id={`filter-${role}`}
                  onClick={() =>
                    setFilterRole((prev) => (prev === role ? "all" : role))
                  }
                  className={`rounded-xl border p-4 text-left transition-all hover:shadow-md ${
                    filterRole === role
                      ? `${meta.bg} ${meta.color} border-current shadow-sm`
                      : "border-slate-200 bg-white text-slate-600 hover:border-slate-300"
                  }`}
                >
                  <p className="text-xs font-semibold uppercase tracking-wider opacity-70">
                    {meta.label}s
                  </p>
                  <p className="mt-1 text-2xl font-bold">{roleCounts[role]}</p>
                </button>
              );
            })}
          </div>
        )}

        {/* Error state */}
        {error && (
          <div className="flex items-center justify-between gap-3 rounded-xl border border-red-200 bg-red-50 px-5 py-4 text-sm font-medium text-red-700">
            <span className="flex items-center gap-2">
              <AlertCircle className="h-4 w-4" />
              {error}
            </span>
            <button
              type="button"
              onClick={load}
              className="rounded-lg border border-red-300 px-3 py-1.5 text-xs font-semibold hover:bg-red-100"
            >
              Retry
            </button>
          </div>
        )}

        {/* Search + filter bar */}
        <div className="flex flex-wrap items-center gap-3">
          <div className="relative flex-1 min-w-[220px]">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <input
              id="role-search"
              type="text"
              placeholder="Search by name or email…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full rounded-lg border border-slate-200 bg-white py-2.5 pl-9 pr-4 text-sm text-slate-700 placeholder:text-slate-400 focus:border-navy focus:outline-none focus:ring-2 focus:ring-navy/10"
            />
          </div>
          {filterRole !== "all" && (
            <button
              type="button"
              onClick={() => setFilterRole("all")}
              className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3 py-2.5 text-sm font-medium text-slate-600 hover:bg-slate-50"
            >
              <XCircle className="h-4 w-4" />
              Clear filter
            </button>
          )}
        </div>

        {/* Table */}
        <div className="overflow-x-auto rounded-xl border border-slate-200 bg-white shadow-sm">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="border-b border-slate-100 text-xs uppercase tracking-wide text-slate-400">
                <th className="px-6 py-3.5 font-medium">User</th>
                <th className="px-6 py-3.5 font-medium">Email</th>
                <th className="px-6 py-3.5 font-medium">Phone</th>
                <th className="px-6 py-3.5 font-medium">Current Role</th>
                <th className="px-6 py-3.5 font-medium">Status</th>
                <th className="px-6 py-3.5 font-medium">Actions</th>
              </tr>
            </thead>
            <tbody>
              {isLoading ? (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center">
                    <div className="flex flex-col items-center gap-2 text-slate-400">
                      <Loader2 className="h-5 w-5 animate-spin" />
                      <span className="text-sm">Loading users…</span>
                    </div>
                  </td>
                </tr>
              ) : filtered.length === 0 ? (
                <tr>
                  <td
                    colSpan={6}
                    className="px-6 py-12 text-center text-sm text-slate-400"
                  >
                    {search || filterRole !== "all"
                      ? "No users match your search."
                      : "No users found."}
                  </td>
                </tr>
              ) : (
                filtered.map((user) => (
                  <tr
                    key={user.id}
                    className="border-t border-slate-100 transition-colors hover:bg-slate-50/60"
                  >
                    {/* Name + Avatar */}
                    <td className="px-6 py-3.5">
                      <div className="flex items-center gap-3">
                        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-navy/10 text-xs font-bold text-navy">
                          {user.firstName[0]}
                          {user.lastName[0]}
                        </div>
                        <span className="font-medium text-navy">
                          {user.firstName} {user.lastName}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-3.5 text-slate-500">{user.email}</td>
                    <td className="px-6 py-3.5 text-slate-500">
                      {user.phone ?? "—"}
                    </td>
                    <td className="px-6 py-3.5">
                      <RoleBadge role={user.role} />
                    </td>
                    <td className="px-6 py-3.5">
                      <span
                        className={`rounded-full px-2.5 py-1 text-xs font-medium ${
                          user.isActive
                            ? "bg-emerald-50 text-emerald-700"
                            : "bg-slate-100 text-slate-500"
                        }`}
                      >
                        {user.isActive ? "Active" : "Inactive"}
                      </span>
                    </td>
                    <td className="px-6 py-3.5">
                      <RoleDropdown
                        userId={user.id}
                        currentRole={user.role}
                        onRoleChanged={handleRoleChanged}
                        onError={handleError}
                      />
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>

          {/* Footer count */}
          {!isLoading && filtered.length > 0 && (
            <div className="border-t border-slate-100 px-6 py-3 text-right text-xs text-slate-400">
              Showing {filtered.length} of {users.length} users
            </div>
          )}
        </div>
      </div>

      <ToastContainer toasts={toasts} />
    </>
  );
}
