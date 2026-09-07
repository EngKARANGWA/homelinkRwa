"use client";

import { useEffect, useState } from "react";
import {
  AlertCircle,
  Building2,
  CheckCircle2,
  ClipboardList,
  FileText,
  Send,
  Wrench,
} from "lucide-react";
import { useAuth } from "@/components/auth/AuthContext";
import { getAgentDashboard } from "@/lib/api/dashboard";
import { inviteLandlord, listInvites, type Invite } from "@/lib/api/iam";
import { ApiError } from "@/lib/api/client";
import type { AgentDashboard } from "@/lib/api/types";
import { StatCard, type StatAccent } from "@/components/dashboard/StatCard";
import { EmptyRow, Table, TBody, Td, Th, THead, Tr } from "@/components/dashboard/Table";
import { useLanguage } from "@/lib/i18n/LanguageContext";
import type { Translations } from "@/lib/i18n/translations";

const INVITE_STATUS_STYLES: Record<Invite["status"], string> = {
  pending: "bg-amber-50 text-amber-700",
  accepted: "bg-emerald-50 text-emerald-700",
  revoked: "bg-slate-100 text-slate-500",
  expired: "bg-red-50 text-red-700",
};

function formatDate(dateStr: string) {
  return new Date(dateStr).toLocaleDateString("en-GB", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

export default function AgentOverviewPage() {
  const { user } = useAuth();
  const { t } = useLanguage();
  const c = t.dashboard.agent.overview;

  const [dashboard, setDashboard] = useState<AgentDashboard | null>(null);
  const [invites, setInvites] = useState<Invite[]>([]);
  const [isLoading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [invitesLoading, setInvitesLoading] = useState(true);
  const [invitesError, setInvitesError] = useState<string | null>(null);

  const [email, setEmail] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [inviteError, setInviteError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);

  // Two independent widgets — the invites list failing (e.g. a permission
  // hiccup) shouldn't blank out stats that already loaded fine, or vice versa.
  const loadDashboard = () => {
    if (!user) return;
    setLoading(true);
    setError(null);
    getAgentDashboard()
      .then(setDashboard)
      .catch((err) =>
        setError(err instanceof ApiError ? err.message : "Failed to load your dashboard."),
      )
      .finally(() => setLoading(false));
  };

  const loadInvites = () => {
    if (!user) return;
    setInvitesLoading(true);
    setInvitesError(null);
    listInvites()
      .then(setInvites)
      .catch((err) =>
        setInvitesError(err instanceof ApiError ? err.message : "Failed to load invites."),
      )
      .finally(() => setInvitesLoading(false));
  };

  useEffect(loadDashboard, [user]);
  useEffect(loadInvites, [user]);

  const handleInvite = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) {
      setInviteError(c.emailPlaceholder);
      return;
    }
    setInviteError(null);
    setSubmitting(true);
    try {
      await inviteLandlord(email.trim());
      setNotice(c.inviteSentTemplate.replace("{email}", email.trim()));
      setEmail("");
      loadInvites();
    } catch (err) {
      setInviteError(err instanceof ApiError ? err.message : "Failed to send invite.");
    } finally {
      setSubmitting(false);
    }
  };

  const stats: { label: string; value: string | number; subtitle?: string; icon: typeof Building2; accent: StatAccent }[] = [
    {
      label: c.statLabels.totalProperties,
      value: isLoading ? "…" : (dashboard?.properties.total ?? 0),
      subtitle: dashboard
        ? c.statSubtitles.occupancyTemplate
            .replace("{occupied}", String(dashboard.properties.occupied))
            .replace("{available}", String(dashboard.properties.available))
        : undefined,
      icon: Building2,
      accent: "blue",
    },
    {
      label: c.statLabels.activeLeases,
      value: isLoading ? "…" : (dashboard?.activeLeases ?? 0),
      subtitle: c.statSubtitles.currentlyActive,
      icon: FileText,
      accent: "emerald",
    },
    {
      label: c.statLabels.assignedToMe,
      value: isLoading ? "…" : (dashboard?.maintenanceRequests.assignedToMe ?? 0),
      subtitle: c.statSubtitles.maintenanceTasks,
      icon: Wrench,
      accent: "amber",
    },
    {
      label: c.statLabels.pendingApproval,
      value: isLoading ? "…" : (dashboard?.properties.pendingApproval ?? 0),
      subtitle: c.statSubtitles.awaitingAdminReview,
      icon: ClipboardList,
      accent: "teal",
    },
  ];

  const inviteStatusLabel = (status: Invite["status"]) =>
    c.inviteStatus[status as keyof Translations["dashboard"]["agent"]["overview"]["inviteStatus"]];

  return (
    <div className="flex flex-col gap-8">
      <div>
        <h1 className="text-2xl font-bold text-navy">{c.title}</h1>
        <p className="mt-1 text-sm text-slate-500">{c.subtitle}</p>
      </div>

      {error && (
        <div className="flex items-center justify-between gap-3 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-700">
          <span className="flex items-center gap-2">
            <AlertCircle className="h-4 w-4" />
            {error}
          </span>
        </div>
      )}

      <div className="grid grid-cols-2 gap-5 lg:grid-cols-4">
        {stats.map((stat) => (
          <StatCard key={stat.label} href="/agent" {...stat} />
        ))}
      </div>

      <div className="grid gap-5 lg:grid-cols-2">
        <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
          <h2 className="font-semibold text-navy">{c.inviteLandlordTitle}</h2>
          <p className="mt-1 text-sm text-slate-500">{c.inviteLandlordDescription}</p>

          {user?.isApproved === false ? (
            <p className="mt-4 rounded-lg border border-amber-200 bg-amber-50 px-3 py-2.5 text-sm text-amber-700">
              {c.notApprovedNotice}
            </p>
          ) : (
            <form onSubmit={handleInvite} className="mt-4 flex flex-col gap-3">
              {inviteError && (
                <p className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
                  {inviteError}
                </p>
              )}
              <div className="flex flex-col gap-2 sm:flex-row">
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder={c.emailPlaceholder}
                  className="flex-1 rounded-lg border border-slate-300 px-3 py-2.5 text-sm text-navy placeholder:text-slate-400 focus:border-gold focus:outline-none"
                />
                <button
                  type="submit"
                  disabled={submitting}
                  className="inline-flex items-center justify-center gap-2 rounded-lg bg-gold px-5 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-gold/90 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  <Send className="h-4 w-4" />
                  {submitting ? c.sending : c.sendInvite}
                </button>
              </div>
            </form>
          )}

          {notice && (
            <div className="mt-3 flex items-center gap-2 rounded-lg border border-emerald-200 bg-emerald-50 px-3 py-2.5 text-sm font-medium text-emerald-700">
              <CheckCircle2 className="h-4 w-4 shrink-0" />
              {notice}
            </div>
          )}
        </div>

        <div className="rounded-xl border border-slate-200 bg-white shadow-sm">
          <div className="border-b border-slate-100 px-5 py-4">
            <h2 className="font-semibold text-navy">{c.recentInvitesTitle}</h2>
          </div>
          {invitesError && (
            <p className="mx-5 mt-4 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
              {invitesError}
            </p>
          )}
          <Table variant="plain">
            <THead>
              <Tr>
                <Th className="px-5 py-3">Email</Th>
                <Th className="hidden px-5 py-3 sm:table-cell">{t.dashboard.table.date}</Th>
                <Th className="px-5 py-3">{t.dashboard.table.status}</Th>
              </Tr>
            </THead>
            <TBody>
              {invitesLoading ? (
                <EmptyRow colSpan={3}>{c.loadingInvites}</EmptyRow>
              ) : invites.length === 0 ? (
                <EmptyRow colSpan={3}>{c.noInvites}</EmptyRow>
              ) : (
                invites.slice(0, 5).map((invite) => (
                  <Tr key={invite.id}>
                    <Td className="px-5 py-3 font-medium text-navy">{invite.email}</Td>
                    <Td className="hidden px-5 py-3 text-slate-500 sm:table-cell">
                      {formatDate(invite.createdAt)}
                    </Td>
                    <Td className="px-5 py-3">
                      <span
                        className={`rounded-full px-2.5 py-1 text-xs font-medium ${INVITE_STATUS_STYLES[invite.status]}`}
                      >
                        {inviteStatusLabel(invite.status)}
                      </span>
                    </Td>
                  </Tr>
                ))
              )}
            </TBody>
          </Table>
        </div>
      </div>
    </div>
  );
}
