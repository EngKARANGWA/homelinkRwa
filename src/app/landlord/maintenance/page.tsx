"use client";

import { useState } from "react";
import { Eye, PlayCircle, UserPlus, Wrench } from "lucide-react";
import {
  MAINTENANCE_REQUESTS,
  PROPERTIES,
  type Laborer,
  type MaintenanceRequest,
} from "@/lib/mock-admin-data";
import { useLandlord } from "@/components/landlord/LandlordContext";
import { Modal } from "@/components/admin/Modal";
import { AssignHandlerForm } from "@/components/admin/AssignHandlerForm";
import { CompleteRequestForm } from "@/components/admin/CompleteRequestForm";
import { MaintenanceDetail } from "@/components/admin/MaintenanceDetail";
import { Card } from "@/components/dashboard/Card";
import { EmptyRow, Table, TBody, Td, Th, THead, Tr } from "@/components/dashboard/Table";

const STATUS_STYLES: Record<MaintenanceRequest["status"], string> = {
  Submitted: "bg-amber-50 text-amber-700",
  Assigned: "bg-sky-50 text-sky-700",
  "In Progress": "bg-sky-50 text-sky-700",
  Completed: "bg-emerald-50 text-emerald-700",
};

const PRIORITY_STYLES: Record<MaintenanceRequest["priority"], string> = {
  Low: "bg-slate-100 text-slate-600",
  Medium: "bg-amber-50 text-amber-700",
  High: "bg-red-50 text-red-700",
};

export default function LandlordMaintenancePage() {
  const { landlordName } = useLandlord();
  const [requests, setRequests] = useState(MAINTENANCE_REQUESTS);
  const [assigningId, setAssigningId] = useState<string | null>(null);
  const [completingId, setCompletingId] = useState<string | null>(null);
  const [viewingRequest, setViewingRequest] = useState<MaintenanceRequest | null>(null);
  const [propertyFilter, setPropertyFilter] = useState("All Properties");
  const [statusFilter, setStatusFilter] = useState<"All" | MaintenanceRequest["status"]>("All");
  const [priorityFilter, setPriorityFilter] = useState<"All" | MaintenanceRequest["priority"]>(
    "All",
  );
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");

  const myPropertyNames = PROPERTIES.filter(
    (p) => p.owner === landlordName,
  ).map((p) => p.name);
  const propertyOptions = ["All Properties", ...myPropertyNames];
  const myRequests = requests
    .filter((r) => myPropertyNames.includes(r.property))
    .filter((r) => propertyFilter === "All Properties" || r.property === propertyFilter)
    .filter((r) => statusFilter === "All" || r.status === statusFilter)
    .filter((r) => priorityFilter === "All" || r.priority === priorityFilter)
    .filter((r) => !dateFrom || r.submittedAt >= dateFrom)
    .filter((r) => !dateTo || r.submittedAt <= dateTo);

  const startProgress = (id: string) => {
    setRequests((prev) =>
      prev.map((r) => (r.id === id ? { ...r, status: "In Progress" } : r)),
    );
  };

  const assignHandler = (id: string, laborers: Laborer[]) => {
    const laborCost = laborers.reduce((sum, l) => sum + l.amount, 0);
    setRequests((prev) =>
      prev.map((r) =>
        r.id === id ? { ...r, status: "Assigned", laborers, laborCost } : r,
      ),
    );
    setAssigningId(null);
  };

  const completeRequest = (id: string, workDone: string, itemCost: number) => {
    setRequests((prev) =>
      prev.map((r) =>
        r.id === id ? { ...r, status: "Completed", workDone, itemCost } : r,
      ),
    );
    setCompletingId(null);
  };

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-bold text-navy">Maintenance</h1>
        <p className="mt-1 text-sm text-slate-500">
          Maintenance and repair requests on your properties.
        </p>
      </div>

      <div className="flex flex-wrap items-end gap-4 rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
        <label className="flex flex-col gap-1.5 text-sm font-medium text-slate-700">
          Property
          <select
            value={propertyFilter}
            onChange={(e) => setPropertyFilter(e.target.value)}
            className="rounded-lg border border-slate-300 px-3 py-2.5 text-sm text-navy focus:border-gold focus:outline-none"
          >
            {propertyOptions.map((name) => (
              <option key={name}>{name}</option>
            ))}
          </select>
        </label>

        <label className="flex flex-col gap-1.5 text-sm font-medium text-slate-700">
          Status
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value as typeof statusFilter)}
            className="rounded-lg border border-slate-300 px-3 py-2.5 text-sm text-navy focus:border-gold focus:outline-none"
          >
            <option value="All">All</option>
            <option value="Submitted">Submitted</option>
            <option value="Assigned">Assigned</option>
            <option value="In Progress">In Progress</option>
            <option value="Completed">Completed</option>
          </select>
        </label>

        <label className="flex flex-col gap-1.5 text-sm font-medium text-slate-700">
          Priority
          <select
            value={priorityFilter}
            onChange={(e) => setPriorityFilter(e.target.value as typeof priorityFilter)}
            className="rounded-lg border border-slate-300 px-3 py-2.5 text-sm text-navy focus:border-gold focus:outline-none"
          >
            <option value="All">All</option>
            <option value="Low">Low</option>
            <option value="Medium">Medium</option>
            <option value="High">High</option>
          </select>
        </label>

        <label className="flex flex-col gap-1.5 text-sm font-medium text-slate-700">
          From
          <input
            type="date"
            value={dateFrom}
            max={dateTo || undefined}
            onChange={(e) => setDateFrom(e.target.value)}
            className="rounded-lg border border-slate-300 px-3 py-2 text-sm text-navy focus:border-gold focus:outline-none"
          />
        </label>

        <label className="flex flex-col gap-1.5 text-sm font-medium text-slate-700">
          To
          <input
            type="date"
            value={dateTo}
            min={dateFrom || undefined}
            onChange={(e) => setDateTo(e.target.value)}
            className="rounded-lg border border-slate-300 px-3 py-2 text-sm text-navy focus:border-gold focus:outline-none"
          />
        </label>

        {(propertyFilter !== "All Properties" ||
          statusFilter !== "All" ||
          priorityFilter !== "All" ||
          dateFrom ||
          dateTo) && (
          <button
            type="button"
            onClick={() => {
              setPropertyFilter("All Properties");
              setStatusFilter("All");
              setPriorityFilter("All");
              setDateFrom("");
              setDateTo("");
            }}
            className="text-sm font-medium text-slate-500 hover:text-navy"
          >
            Clear filters
          </button>
        )}
      </div>

      <Card title="Requests">
        <p className="mt-1 text-sm text-slate-500">
          Maintenance requests raised by tenants across your properties.
        </p>
        <Table variant="card">
          <THead>
            <Tr>
              <Th className="max-w-[10rem] px-4 py-3 sm:px-6">Tenant</Th>
              <Th className="hidden px-6 py-3 md:table-cell">Property</Th>
              <Th className="hidden px-6 py-3 lg:table-cell">Issue</Th>
              <Th className="hidden px-6 py-3 sm:table-cell">Priority</Th>
              <Th className="hidden px-6 py-3 lg:table-cell">Assigned To</Th>
              <Th className="hidden px-6 py-3 md:table-cell">Submitted</Th>
              <Th className="px-4 py-3 sm:px-6">Status</Th>
              <Th className="px-4 py-3 sm:px-6">Actions</Th>
            </Tr>
          </THead>
          <TBody>
            {myRequests.map((request) => (
              <Tr key={request.id}>
                <Td className="max-w-[10rem] px-4 py-3 sm:max-w-none sm:px-6">
                  <p className="truncate font-medium text-navy sm:overflow-visible sm:whitespace-normal">
                    {request.tenant}
                  </p>
                  <p className="truncate text-xs text-slate-400 md:hidden">
                    {request.property}
                  </p>
                  <p className="text-xs text-slate-400 sm:hidden">
                    {request.priority} priority
                  </p>
                </Td>
                <Td className="hidden px-6 py-3 text-slate-500 md:table-cell">
                  {request.property}
                </Td>
                <Td className="hidden max-w-xs px-6 py-3 text-slate-500 lg:table-cell">
                  {request.issue.join("; ")}
                </Td>
                <Td className="hidden px-6 py-3 sm:table-cell">
                  <span
                    className={`rounded-full px-2.5 py-1 text-xs font-medium ${PRIORITY_STYLES[request.priority]}`}
                  >
                    {request.priority}
                  </span>
                </Td>
                <Td className="hidden px-6 py-3 text-slate-500 lg:table-cell">
                  {request.laborers.length > 0
                    ? `${request.laborers.length} worker${request.laborers.length === 1 ? "" : "s"}`
                    : "—"}
                </Td>
                <Td className="hidden px-6 py-3 text-slate-500 md:table-cell">
                  {request.submittedAt}
                </Td>
                <Td className="px-4 py-3 sm:px-6">
                  <span
                    className={`rounded-full px-2.5 py-1 text-xs font-medium ${STATUS_STYLES[request.status]}`}
                  >
                    {request.status}
                  </span>
                </Td>
                <Td className="max-w-[6.5rem] px-4 py-3 sm:max-w-none sm:whitespace-nowrap sm:px-6">
                  <div className="flex flex-wrap items-center gap-2">
                    <button
                      type="button"
                      onClick={() => setViewingRequest(request)}
                      className="inline-flex items-center gap-1.5 rounded-lg border border-slate-300 px-2.5 py-1 text-xs font-medium text-slate-600 hover:bg-slate-50"
                    >
                      <Eye className="h-3.5 w-3.5" />
                      View
                    </button>
                    {request.status === "Submitted" && (
                      <button
                        type="button"
                        onClick={() => setAssigningId(request.id)}
                        aria-label={`Assign handler for ${request.tenant}`}
                        className="inline-flex items-center gap-1.5 rounded-lg border border-slate-300 px-2.5 py-1 text-xs font-medium text-slate-600 hover:bg-slate-50"
                      >
                        <UserPlus className="h-3.5 w-3.5" />
                        <span className="hidden sm:inline">Assign</span>
                      </button>
                    )}
                    {request.status === "Assigned" && (
                      <button
                        type="button"
                        onClick={() => startProgress(request.id)}
                        aria-label={`Start progress for ${request.tenant}`}
                        className="inline-flex items-center gap-1.5 rounded-lg border border-slate-300 px-2.5 py-1 text-xs font-medium text-slate-600 hover:bg-slate-50"
                      >
                        <PlayCircle className="h-3.5 w-3.5" />
                        <span className="hidden sm:inline">Start</span>
                      </button>
                    )}
                    {request.status === "In Progress" && (
                      <button
                        type="button"
                        onClick={() => setCompletingId(request.id)}
                        aria-label={`Mark completed for ${request.tenant}`}
                        className="inline-flex items-center gap-1.5 rounded-lg border border-emerald-200 bg-emerald-50 px-2.5 py-1 text-xs font-medium text-emerald-700 hover:bg-emerald-100"
                      >
                        <Wrench className="h-3.5 w-3.5" />
                        <span className="hidden sm:inline">Mark Completed</span>
                      </button>
                    )}
                  </div>
                </Td>
              </Tr>
            ))}
            {myRequests.length === 0 && (
              <EmptyRow colSpan={8}>No maintenance requests match these filters.</EmptyRow>
            )}
          </TBody>
        </Table>
      </Card>

      {viewingRequest && (
        <Modal
          title="Maintenance Request"
          description={`${viewingRequest.tenant} · ${viewingRequest.property}`}
          onClose={() => setViewingRequest(null)}
        >
          <MaintenanceDetail request={viewingRequest} />
        </Modal>
      )}

      {assigningId && (
        <Modal
          title="Assign Handler"
          description="Add the laborers who will handle this request and what each will be paid."
          onClose={() => setAssigningId(null)}
        >
          <AssignHandlerForm
            onCancel={() => setAssigningId(null)}
            onSuccess={(laborers) => assignHandler(assigningId, laborers)}
          />
        </Modal>
      )}

      {completingId && (
        <Modal
          title="Complete Request"
          description="Confirm the work that was done."
          onClose={() => setCompletingId(null)}
        >
          <CompleteRequestForm
            onCancel={() => setCompletingId(null)}
            onSuccess={(workDone, itemCost) =>
              completeRequest(completingId, workDone, itemCost)
            }
          />
        </Modal>
      )}
    </div>
  );
}
