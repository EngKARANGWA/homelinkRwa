"use client";

import { useEffect, useState } from "react";
import { Plus, Users, Shield, CheckCircle2, Clock, XCircle, LayoutGrid, Table as TableIcon } from "lucide-react";
import { Modal } from "@/components/admin/Modal";
import { AddUserForm } from "@/components/landlord/AddUserForm";
import { StatCard } from "@/components/dashboard/StatCard";
import { Table, TBody, Td, Th, THead, Tr, EmptyRow } from "@/components/dashboard/Table";
import { Pagination, DEFAULT_PAGE_SIZE } from "@/components/dashboard/Pagination";
import { listInvites, type Invite } from "@/lib/api/iam";

const STATUS_STYLES: Record<string, string> = {
  pending: "bg-amber-50 text-amber-700",
  accepted: "bg-emerald-50 text-emerald-700",
  revoked: "bg-red-50 text-red-700",
  expired: "bg-slate-50 text-slate-700",
};

export default function LandlordTeamPage() {
  const [isAdding, setIsAdding] = useState(false);
  const [view, setView] = useState<"cards" | "table">("table");
  const [notification, setNotification] = useState<string | null>(null);
  
  const [invites, setInvites] = useState<Invite[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [isLoading, setIsLoading] = useState(true);

  const fetchInvites = async () => {
    setIsLoading(true);
    try {
      const data = await listInvites(page, DEFAULT_PAGE_SIZE);
      setInvites(data);
      // The API returns a flat page of invites with no total count, so we
      // estimate: a full page means there's likely at least one more.
      const isLastPage = data.length < DEFAULT_PAGE_SIZE;
      setTotal(isLastPage ? (page - 1) * DEFAULT_PAGE_SIZE + data.length : page * DEFAULT_PAGE_SIZE + 1);
      setTotalPages(isLastPage ? page : page + 1);
    } catch (err) {
      console.error("Failed to load invites:", err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchInvites();
  }, [page]);

  const handleAddSuccess = (msg: string) => {
    setIsAdding(false);
    setNotification(msg);
    setPage(1);
    fetchInvites();
    setTimeout(() => setNotification(null), 5000);
  };

  const activeInvitesCount = (invites || []).filter(i => i.status === "pending" || i.status === "accepted").length;

  return (
    <div className="mx-auto max-w-6xl">
      <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-navy">Team & Users</h1>
          <p className="mt-1 text-sm text-slate-500">
            Manage your property staff and invite tenants.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex items-center rounded-lg border border-slate-300 bg-white p-1">
            <button
              type="button"
              onClick={() => setView("cards")}
              aria-label="Card view"
              className={`flex items-center gap-1.5 rounded-md px-3 py-1.5 text-xs font-medium transition-colors ${
                view === "cards"
                  ? "bg-navy text-white"
                  : "text-slate-500 hover:bg-slate-50"
              }`}
            >
              <LayoutGrid className="h-3.5 w-3.5" />
              Cards
            </button>
            <button
              type="button"
              onClick={() => setView("table")}
              aria-label="Table view"
              className={`flex items-center gap-1.5 rounded-md px-3 py-1.5 text-xs font-medium transition-colors ${
                view === "table"
                  ? "bg-navy text-white"
                  : "text-slate-500 hover:bg-slate-50"
              }`}
            >
              <TableIcon className="h-3.5 w-3.5" />
              Table
            </button>
          </div>
          <button
            onClick={() => setIsAdding(true)}
            className="flex items-center justify-center gap-2 rounded-lg bg-gold px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-gold/90"
          >
            <Plus className="h-4 w-4" />
            Invite User
          </button>
        </div>
      </div>

      {notification && (
        <div className="mb-6 flex items-center gap-3 rounded-xl bg-emerald-50 p-4 text-emerald-800">
          <CheckCircle2 className="h-5 w-5 text-emerald-600" />
          <p className="text-sm font-medium">{notification}</p>
        </div>
      )}

      <div className="mb-8 grid grid-cols-2 gap-5">
        <StatCard
          label="Total Users Invited"
          value={total}
          subtitle="All invites sent"
          href="/landlord/team"
          icon={Users}
          accent="blue"
        />
        <StatCard
          label="Active Members"
          value={activeInvitesCount}
          subtitle="Pending & accepted"
          href="/landlord/team"
          icon={Shield}
          accent="emerald"
        />
      </div>

      {view === "cards" ? (
        <div className="mb-6 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {isLoading ? (
            <div className="col-span-full rounded-xl border border-dashed border-slate-300 bg-white py-16 text-center text-slate-400">
              Loading users...
            </div>
          ) : (invites || []).length === 0 ? (
            <div className="col-span-full rounded-xl border border-dashed border-slate-300 bg-white py-16 text-center text-slate-400">
              No users or invites found.
            </div>
          ) : (
            invites.map((invite) => (
              <div
                key={invite.id}
                className="group relative overflow-hidden rounded-xl border border-slate-200 bg-white p-5 shadow-sm transition-all hover:-translate-y-0.5 hover:shadow-md"
              >
                <div className="flex items-start justify-between">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-slate-100 text-slate-500">
                    <Users className="h-5 w-5" />
                  </div>
                  <span
                    className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-medium ${
                      STATUS_STYLES[invite.status]
                    }`}
                  >
                    {invite.status === "pending" && <Clock className="h-3.5 w-3.5" />}
                    {invite.status === "accepted" && <CheckCircle2 className="h-3.5 w-3.5" />}
                    {invite.status === "revoked" && <XCircle className="h-3.5 w-3.5" />}
                    {invite.status.charAt(0).toUpperCase() + invite.status.slice(1)}
                  </span>
                </div>
                <div className="mt-4 min-w-0">
                  <p className="truncate font-medium text-navy">{invite.email}</p>
                  <p className="mt-1 flex items-center gap-2 text-xs text-slate-500">
                    <span className="inline-flex items-center rounded-full bg-slate-100 px-2 py-0.5 font-medium text-slate-800">
                      {invite.role.replace("_", " ")}
                    </span>
                    &middot;
                    <span>
                      {new Date(invite.createdAt).toLocaleDateString("en-US", {
                        month: "short",
                        day: "numeric",
                        year: "numeric",
                      })}
                    </span>
                  </p>
                </div>
              </div>
            ))
          )}
        </div>
      ) : (
        <div className="mb-6 rounded-xl border border-slate-200 bg-white shadow-sm">
          <div className="border-b border-slate-100 px-6 py-5">
            <h3 className="font-semibold text-navy">Invitations & Team</h3>
          </div>

          <div className="overflow-x-auto">
            <Table variant="bare">
              <THead>
                <Tr>
                  <Th className="px-4 py-3 sm:px-6">Email</Th>
                  <Th className="px-4 py-3 sm:px-6">Role</Th>
                  <Th className="px-4 py-3 sm:px-6">Status</Th>
                  <Th className="px-4 py-3 sm:px-6">Date</Th>
                </Tr>
              </THead>
              <TBody>
                {isLoading ? (
                  <EmptyRow colSpan={4}>Loading users...</EmptyRow>
                ) : (invites || []).length === 0 ? (
                  <EmptyRow colSpan={4}>No users or invites found.</EmptyRow>
                ) : (
                  invites.map((invite) => (
                    <Tr key={invite.id}>
                      <Td className="px-4 py-3 font-medium text-navy sm:px-6">
                        {invite.email}
                      </Td>
                      <Td className="px-4 py-3 sm:px-6">
                        <span className="inline-flex items-center rounded-full bg-slate-100 px-2.5 py-0.5 text-xs font-medium text-slate-800">
                          {invite.role.replace("_", " ")}
                        </span>
                      </Td>
                      <Td className="px-4 py-3 sm:px-6">
                        <span
                          className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-medium ${
                            STATUS_STYLES[invite.status]
                          }`}
                        >
                          {invite.status === "pending" && <Clock className="h-3.5 w-3.5" />}
                          {invite.status === "accepted" && <CheckCircle2 className="h-3.5 w-3.5" />}
                          {invite.status === "revoked" && <XCircle className="h-3.5 w-3.5" />}
                          {invite.status.charAt(0).toUpperCase() + invite.status.slice(1)}
                        </span>
                      </Td>
                      <Td className="px-4 py-3 text-slate-500 sm:px-6">
                        {new Date(invite.createdAt).toLocaleDateString("en-US", {
                          month: "short",
                          day: "numeric",
                          year: "numeric",
                        })}
                      </Td>
                    </Tr>
                  ))
                )}
              </TBody>
            </Table>
          </div>
        </div>
      )}

      {!isLoading && total > 0 && (
          <div className={view === "table" ? "border-t border-slate-100 px-6 pb-5 rounded-xl border border-slate-200 bg-white" : ""}>
            <Pagination
              page={page}
              totalPages={totalPages}
              totalItems={total}
              pageSize={DEFAULT_PAGE_SIZE}
              onPageChange={setPage}
            />
          </div>
        )}

      {isAdding && (
        <Modal title="Invite Team Member" onClose={() => setIsAdding(false)}>
          <AddUserForm
            onSuccess={handleAddSuccess}
            onCancel={() => setIsAdding(false)}
          />
        </Modal>
      )}
    </div>
  );
}
