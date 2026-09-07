"use client";

import { useEffect, useState } from "react";
import {
  AlertCircle,
  CheckCircle2,
  Loader2,
  LogOut,
  Monitor,
  RefreshCw,
  ScrollText,
  Smartphone,
  Tablet,
  UserCog,
} from "lucide-react";
import {
  getUser,
  listActiveSessions,
  listAuditLogs,
  revokeSession,
  setUserStatus,
  updateUserRole,
  type ActiveSession,
  type AuditLogEntry,
} from "@/lib/api/admin";
import { ApiError } from "@/lib/api/client";
import type { Role, User } from "@/lib/api/types";
import { Modal } from "@/components/admin/Modal";
import { EmptyRow, Table, TBody, Td, Th, THead, Tr } from "@/components/dashboard/Table";
import { DEFAULT_PAGE_SIZE, Pagination } from "@/components/dashboard/Pagination";
import { useLanguage } from "@/lib/i18n/LanguageContext";

const DEVICE_ICONS: Record<string, typeof Monitor> = {
  mobile: Smartphone,
  tablet: Tablet,
};

const ASSIGNABLE_ROLES: Role[] = ["tenant", "owner", "agent", "admin"];

function formatLabel(value: string, unknownLabel: string) {
  if (value === "unknown") return unknownLabel;
  return value.charAt(0).toUpperCase() + value.slice(1);
}

type Tab = "sessions" | "auditLog";

export default function SettingsPage() {
  const { t } = useLanguage();
  const c = t.dashboard.admin.settings;
  const [tab, setTab] = useState<Tab>("sessions");
  const [notice, setNotice] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Sessions
  const [sessions, setSessions] = useState<ActiveSession[]>([]);
  const [sessionsTotal, setSessionsTotal] = useState(0);
  const [sessionsPage, setSessionsPage] = useState(1);
  const [sessionsLoading, setSessionsLoading] = useState(true);
  const [revokingId, setRevokingId] = useState<string | null>(null);

  const loadSessions = () => {
    setSessionsLoading(true);
    setError(null);
    listActiveSessions({ page: sessionsPage, limit: DEFAULT_PAGE_SIZE })
      .then((res) => {
        setSessions(res.data);
        setSessionsTotal(res.meta.total);
      })
      .catch((err) => setError(err instanceof ApiError ? err.message : "Failed to load active sessions."))
      .finally(() => setSessionsLoading(false));
  };

  useEffect(() => {
    if (tab === "sessions") loadSessions();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tab, sessionsPage]);

  const handleRevoke = async (session: ActiveSession) => {
    if (!window.confirm(c.sessions.confirmRevoke)) return;
    setRevokingId(session.id);
    setError(null);
    try {
      await revokeSession(session.id);
      setNotice(c.sessions.revokedNotice);
      loadSessions();
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Failed to revoke session.");
    } finally {
      setRevokingId(null);
    }
  };

  // Manage user (from a session row)
  const [manageUserId, setManageUserId] = useState<string | null>(null);
  const [manageUser, setManageUser] = useState<User | null>(null);
  const [manageLoading, setManageLoading] = useState(false);
  const [manageSaving, setManageSaving] = useState(false);
  const [manageError, setManageError] = useState<string | null>(null);

  const openManage = (session: ActiveSession) => {
    setManageUserId(session.userId);
    setManageUser(null);
    setManageError(null);
    setManageLoading(true);
    getUser(session.userId)
      .then(setManageUser)
      .catch((err) => setManageError(err instanceof ApiError ? err.message : "Failed to load user."))
      .finally(() => setManageLoading(false));
  };

  const closeManage = () => {
    setManageUserId(null);
    setManageUser(null);
    setManageError(null);
  };

  const handleToggleStatus = async () => {
    if (!manageUser) return;
    const nextActive = !manageUser.isActive;
    if (!window.confirm(nextActive ? c.sessions.confirmActivate : c.sessions.confirmDeactivate)) return;
    setManageSaving(true);
    setManageError(null);
    try {
      const updated = await setUserStatus(manageUser.id, nextActive);
      setManageUser(updated);
      setNotice(c.sessions.statusUpdated);
      loadSessions();
    } catch (err) {
      setManageError(err instanceof ApiError ? err.message : "Failed to update account status.");
    } finally {
      setManageSaving(false);
    }
  };

  const handleChangeRole = async (role: Role) => {
    if (!manageUser || role === manageUser.role) return;
    setManageSaving(true);
    setManageError(null);
    try {
      const updated = await updateUserRole(manageUser.id, role);
      setManageUser(updated);
      setNotice(c.sessions.roleUpdated);
      loadSessions();
    } catch (err) {
      setManageError(err instanceof ApiError ? err.message : "Failed to update role.");
    } finally {
      setManageSaving(false);
    }
  };

  // Audit log
  const [logs, setLogs] = useState<AuditLogEntry[]>([]);
  const [logsTotal, setLogsTotal] = useState(0);
  const [logsPage, setLogsPage] = useState(1);
  const [logsLoading, setLogsLoading] = useState(true);
  const [actionFilter, setActionFilter] = useState("");
  const [entityFilter, setEntityFilter] = useState("");

  const loadLogs = () => {
    setLogsLoading(true);
    setError(null);
    listAuditLogs({
      page: logsPage,
      limit: DEFAULT_PAGE_SIZE,
      action: actionFilter || undefined,
      entity: entityFilter || undefined,
    })
      .then((res) => {
        setLogs(res.data);
        setLogsTotal(res.meta.total);
      })
      .catch((err) => setError(err instanceof ApiError ? err.message : "Failed to load activity."))
      .finally(() => setLogsLoading(false));
  };

  useEffect(() => {
    if (tab === "auditLog") loadLogs();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tab, logsPage, actionFilter, entityFilter]);

  const sessionsTotalPages = Math.max(1, Math.ceil(sessionsTotal / DEFAULT_PAGE_SIZE));
  const logsTotalPages = Math.max(1, Math.ceil(logsTotal / DEFAULT_PAGE_SIZE));

  const refresh = () => (tab === "sessions" ? loadSessions() : loadLogs());

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-bold text-navy">{c.title}</h1>
        <p className="mt-1 text-sm text-slate-500">{c.subtitle}</p>
      </div>

      {notice && (
        <div className="flex items-center gap-2 rounded-lg border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm font-medium text-emerald-700">
          <CheckCircle2 className="h-4 w-4" />
          {notice}
        </div>
      )}

      {error && (
        <div className="flex items-center gap-2 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-700">
          <AlertCircle className="h-4 w-4" />
          {error}
        </div>
      )}

      <div className="flex items-center justify-between">
        <div className="flex gap-1 rounded-lg border border-slate-200 bg-white p-1">
          <button
            type="button"
            onClick={() => setTab("sessions")}
            className={`inline-flex items-center gap-2 rounded-md px-4 py-2 text-sm font-semibold transition-colors ${
              tab === "sessions" ? "bg-gold text-white" : "text-slate-500 hover:bg-slate-50"
            }`}
          >
            <Monitor className="h-4 w-4" />
            {c.sessionsTab}
          </button>
          <button
            type="button"
            onClick={() => setTab("auditLog")}
            className={`inline-flex items-center gap-2 rounded-md px-4 py-2 text-sm font-semibold transition-colors ${
              tab === "auditLog" ? "bg-gold text-white" : "text-slate-500 hover:bg-slate-50"
            }`}
          >
            <ScrollText className="h-4 w-4" />
            {c.auditLogTab}
          </button>
        </div>

        <button
          type="button"
          onClick={refresh}
          className="inline-flex items-center gap-2 rounded-lg border border-slate-300 px-4 py-2 text-sm font-semibold text-slate-600 transition-colors hover:bg-slate-50"
        >
          <RefreshCw className="h-4 w-4" />
          {c.refresh}
        </button>
      </div>

      {tab === "sessions" && (
        <div className="overflow-x-auto rounded-xl border border-slate-200 bg-white shadow-sm">
          {sessionsLoading ? (
            <div className="px-6 py-10 text-center text-sm text-slate-500">{c.sessions.loading}</div>
          ) : (
            <Table variant="bare">
              <THead>
                <Tr>
                  <Th className="px-6 py-3">{c.sessions.user}</Th>
                  <Th className="px-6 py-3">{c.sessions.role}</Th>
                  <Th className="px-6 py-3">{c.sessions.device}</Th>
                  <Th className="px-6 py-3">{c.sessions.browser}</Th>
                  <Th className="px-6 py-3">{c.sessions.os}</Th>
                  <Th className="px-6 py-3">{c.sessions.ipAddress}</Th>
                  <Th className="px-6 py-3">{c.sessions.lastActive}</Th>
                  <Th className="px-6 py-3">{c.sessions.expires}</Th>
                  <Th className="px-6 py-3">{" "}</Th>
                </Tr>
              </THead>
              <TBody>
                {sessions.map((s) => {
                  const DeviceIcon = DEVICE_ICONS[s.deviceType] ?? Monitor;
                  return (
                    <Tr key={s.id}>
                      <Td className="px-6 py-3">
                        <div className="font-medium text-navy">{s.userName}</div>
                        <div className="text-xs text-slate-400">{s.userEmail}</div>
                      </Td>
                      <Td className="px-6 py-3 text-slate-500">{s.userRole}</Td>
                      <Td className="px-6 py-3">
                        <span className="inline-flex items-center gap-1.5 text-slate-500">
                          <DeviceIcon className="h-4 w-4 text-slate-400" />
                          {formatLabel(s.deviceType, c.sessions.unknown)}
                        </span>
                      </Td>
                      <Td className="px-6 py-3">
                        {s.browser === "unknown" ? (
                          <span className="italic text-slate-400">{c.sessions.unknown}</span>
                        ) : (
                          <span className="text-slate-500">{s.browser}</span>
                        )}
                      </Td>
                      <Td className="px-6 py-3">
                        {s.os === "unknown" ? (
                          <span className="italic text-slate-400">{c.sessions.unknown}</span>
                        ) : (
                          <span className="text-slate-500">{s.os}</span>
                        )}
                      </Td>
                      <Td className="px-6 py-3 text-slate-500">{s.ipAddress ?? "—"}</Td>
                      <Td className="px-6 py-3 text-slate-500">{new Date(s.lastUsedAt).toLocaleString()}</Td>
                      <Td className="px-6 py-3 text-slate-500">{new Date(s.expiresAt).toLocaleString()}</Td>
                      <Td className="px-6 py-3">
                        <div className="flex items-center gap-2">
                          <button
                            type="button"
                            onClick={() => openManage(s)}
                            className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 px-3 py-1.5 text-xs font-semibold text-slate-600 transition-colors hover:bg-slate-50"
                          >
                            <UserCog className="h-3.5 w-3.5" />
                            {c.sessions.manage}
                          </button>
                          <button
                            type="button"
                            onClick={() => handleRevoke(s)}
                            disabled={revokingId === s.id}
                            className="inline-flex items-center gap-1.5 rounded-lg border border-red-200 px-3 py-1.5 text-xs font-semibold text-red-600 transition-colors hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-50"
                          >
                            <LogOut className="h-3.5 w-3.5" />
                            {c.sessions.revoke}
                          </button>
                        </div>
                      </Td>
                    </Tr>
                  );
                })}
                {sessions.length === 0 && <EmptyRow colSpan={9}>{c.sessions.empty}</EmptyRow>}
              </TBody>
            </Table>
          )}

          <Pagination
            page={sessionsPage}
            totalPages={sessionsTotalPages}
            totalItems={sessionsTotal}
            pageSize={DEFAULT_PAGE_SIZE}
            onPageChange={setSessionsPage}
          />
        </div>
      )}

      {tab === "auditLog" && (
        <>
          <div className="flex flex-wrap items-end gap-4 rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
            <label className="flex flex-col gap-1.5 text-sm font-medium text-slate-700">
              {c.auditLog.filterByAction}
              <input
                type="text"
                value={actionFilter}
                onChange={(e) => {
                  setActionFilter(e.target.value);
                  setLogsPage(1);
                }}
                placeholder="e.g. lease.create"
                className="rounded-lg border border-slate-300 px-3 py-2.5 text-sm text-navy focus:border-gold focus:outline-none"
              />
            </label>
            <label className="flex flex-col gap-1.5 text-sm font-medium text-slate-700">
              {c.auditLog.filterByEntity}
              <input
                type="text"
                value={entityFilter}
                onChange={(e) => {
                  setEntityFilter(e.target.value);
                  setLogsPage(1);
                }}
                placeholder="e.g. lease"
                className="rounded-lg border border-slate-300 px-3 py-2.5 text-sm text-navy focus:border-gold focus:outline-none"
              />
            </label>
          </div>

          <div className="overflow-x-auto rounded-xl border border-slate-200 bg-white shadow-sm">
            {logsLoading ? (
              <div className="px-6 py-10 text-center text-sm text-slate-500">{c.auditLog.loading}</div>
            ) : (
              <Table variant="bare">
                <THead>
                  <Tr>
                    <Th className="px-6 py-3">{c.auditLog.actor}</Th>
                    <Th className="px-6 py-3">{c.auditLog.action}</Th>
                    <Th className="px-6 py-3">{c.auditLog.entity}</Th>
                    <Th className="px-6 py-3">{c.auditLog.date}</Th>
                  </Tr>
                </THead>
                <TBody>
                  {logs.map((log) => (
                    <Tr key={log.id}>
                      <Td className="px-6 py-3">
                        {log.actor ? (
                          <>
                            <div className="font-medium text-navy">
                              {log.actor.firstName} {log.actor.lastName}
                            </div>
                            <div className="text-xs text-slate-400">{log.actor.email}</div>
                          </>
                        ) : (
                          <span className="text-slate-400">{c.auditLog.system}</span>
                        )}
                      </Td>
                      <Td className="px-6 py-3 font-mono text-xs text-slate-600">{log.action}</Td>
                      <Td className="px-6 py-3 text-slate-500">{log.entity}</Td>
                      <Td className="px-6 py-3 text-slate-500">{new Date(log.createdAt).toLocaleString()}</Td>
                    </Tr>
                  ))}
                  {logs.length === 0 && <EmptyRow colSpan={4}>{c.auditLog.empty}</EmptyRow>}
                </TBody>
              </Table>
            )}

            <Pagination
              page={logsPage}
              totalPages={logsTotalPages}
              totalItems={logsTotal}
              pageSize={DEFAULT_PAGE_SIZE}
              onPageChange={setLogsPage}
            />
          </div>
        </>
      )}

      {manageUserId && (
        <Modal title={c.sessions.manageTitle} onClose={closeManage} maxWidthClassName="max-w-md">
          {manageLoading ? (
            <div className="flex items-center justify-center gap-2 py-8 text-sm text-slate-500">
              <Loader2 className="h-4 w-4 animate-spin" />
              {c.sessions.loadingUser}
            </div>
          ) : manageUser ? (
            <div className="flex flex-col gap-5">
              <div>
                <div className="font-medium text-navy">
                  {manageUser.firstName} {manageUser.lastName}
                </div>
                <div className="text-sm text-slate-500">{manageUser.email}</div>
              </div>

              {manageError && (
                <div className="flex items-center gap-2 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-xs font-medium text-red-700">
                  <AlertCircle className="h-4 w-4 shrink-0" />
                  {manageError}
                </div>
              )}

              <div>
                <div className="mb-2 flex items-center justify-between">
                  <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                    {c.sessions.status}
                  </span>
                  <span
                    className={`rounded-full border px-2.5 py-0.5 text-xs font-semibold ${
                      manageUser.isActive
                        ? "border-emerald-200 bg-emerald-50 text-emerald-700"
                        : "border-red-200 bg-red-50 text-red-700"
                    }`}
                  >
                    {manageUser.isActive ? c.sessions.active : c.sessions.inactive}
                  </span>
                </div>
                <button
                  type="button"
                  onClick={handleToggleStatus}
                  disabled={manageSaving}
                  className={`w-full rounded-lg border px-3 py-2 text-sm font-semibold transition-colors disabled:cursor-not-allowed disabled:opacity-50 ${
                    manageUser.isActive
                      ? "border-red-200 text-red-600 hover:bg-red-50"
                      : "border-emerald-200 text-emerald-700 hover:bg-emerald-50"
                  }`}
                >
                  {manageUser.isActive ? c.sessions.deactivateAction : c.sessions.activateAction}
                </button>
              </div>

              <div>
                <div className="mb-2 flex items-center justify-between">
                  <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                    {c.sessions.role}
                  </span>
                  <span className="rounded-full border border-slate-200 bg-slate-50 px-2.5 py-0.5 text-xs font-semibold text-slate-600">
                    {manageUser.role}
                  </span>
                </div>
                {ASSIGNABLE_ROLES.includes(manageUser.role) ? (
                  <div className="flex flex-wrap gap-2">
                    {ASSIGNABLE_ROLES.map((role) => (
                      <button
                        key={role}
                        type="button"
                        onClick={() => handleChangeRole(role)}
                        disabled={manageSaving || role === manageUser.role}
                        className={`rounded-lg border px-3 py-1.5 text-xs font-semibold transition-colors disabled:cursor-not-allowed ${
                          role === manageUser.role
                            ? "border-navy bg-navy text-white opacity-100"
                            : "border-slate-200 text-slate-600 hover:bg-slate-50 disabled:opacity-50"
                        }`}
                      >
                        {role}
                      </button>
                    ))}
                  </div>
                ) : (
                  <p className="text-xs text-slate-400">{c.sessions.roleNotEditable}</p>
                )}
              </div>
            </div>
          ) : null}
        </Modal>
      )}
    </div>
  );
}
