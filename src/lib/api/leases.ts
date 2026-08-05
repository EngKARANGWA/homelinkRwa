import { apiFetch } from "./client";
import type {
  CreateLeaseInput,
  CreateMoveRequestInput,
  InspectMoveRequestInput,
  Lease,
  LeaseChangeRequest,
  LeaseDocument,
  LeaseDocumentUrl,
  MoveRequest,
  PaginatedResponse,
  SuccessResponse,
  UpdateMoveRequestChecklistInput,
} from "./types";

export type ListLeasesParams = {
  status?: string;
  propertyId?: string;
  page?: number;
  limit?: number;
};

export async function listLeases(
  params: ListLeasesParams = {},
): Promise<PaginatedResponse<Lease>> {
  return apiFetch<PaginatedResponse<Lease>>("/leases", { query: params });
}

export async function getLease(id: string): Promise<Lease> {
  const res = await apiFetch<SuccessResponse<Lease>>(`/leases/${id}`);
  return res.data;
}

export async function createLease(input: CreateLeaseInput): Promise<Lease> {
  const res = await apiFetch<SuccessResponse<Lease>>("/leases", {
    method: "POST",
    body: input,
  });
  return res.data;
}

export async function signLease(id: string): Promise<Lease> {
  const res = await apiFetch<SuccessResponse<Lease>>(`/leases/${id}/sign`, {
    method: "POST",
  });
  return res.data;
}

export async function getLeaseDocument(id: string): Promise<LeaseDocumentUrl> {
  const res = await apiFetch<SuccessResponse<LeaseDocumentUrl>>(
    `/leases/${id}/document`,
  );
  return res.data;
}

export type RequestLeaseRenewalInput = {
  proposedRent?: number;
  proposedEndDate?: string;
  reason?: string;
};

export async function requestLeaseRenewal(
  id: string,
  input: RequestLeaseRenewalInput,
): Promise<LeaseChangeRequest> {
  const res = await apiFetch<SuccessResponse<LeaseChangeRequest>>(
    `/leases/${id}/renewal-requests`,
    { method: "POST", body: input },
  );
  return res.data;
}

export async function requestLeaseTermination(
  id: string,
  reason?: string,
): Promise<LeaseChangeRequest> {
  const res = await apiFetch<SuccessResponse<LeaseChangeRequest>>(
    `/leases/${id}/termination-requests`,
    { method: "POST", body: reason ? { reason } : undefined },
  );
  return res.data;
}

export async function listLeaseChangeRequests(
  leaseId: string,
): Promise<LeaseChangeRequest[]> {
  const res = await apiFetch<SuccessResponse<LeaseChangeRequest[]>>(
    `/leases/${leaseId}/change-requests`,
  );
  return res.data;
}

export async function approveLeaseChangeRequest(
  id: string,
): Promise<LeaseChangeRequest> {
  const res = await apiFetch<SuccessResponse<LeaseChangeRequest>>(
    `/leases/change-requests/${id}/approve`,
    { method: "PATCH" },
  );
  return res.data;
}

export async function rejectLeaseChangeRequest(
  id: string,
  decisionNotes: string,
): Promise<LeaseChangeRequest> {
  const res = await apiFetch<SuccessResponse<LeaseChangeRequest>>(
    `/leases/change-requests/${id}/reject`,
    { method: "PATCH", body: { decisionNotes } },
  );
  return res.data;
}

export async function createMoveRequest(
  leaseId: string,
  input: CreateMoveRequestInput,
): Promise<MoveRequest> {
  const res = await apiFetch<SuccessResponse<MoveRequest>>(
    `/leases/${leaseId}/move-requests`,
    { method: "POST", body: input },
  );
  return res.data;
}

export async function listMoveRequests(leaseId: string): Promise<MoveRequest[]> {
  const res = await apiFetch<SuccessResponse<MoveRequest[]>>(
    `/leases/${leaseId}/move-requests`,
  );
  return res.data;
}

export async function updateMoveRequestChecklist(
  id: string,
  input: UpdateMoveRequestChecklistInput,
): Promise<MoveRequest> {
  const res = await apiFetch<SuccessResponse<MoveRequest>>(
    `/leases/move-requests/${id}/checklist`,
    { method: "PATCH", body: input },
  );
  return res.data;
}

export async function inspectMoveRequest(
  id: string,
  input: InspectMoveRequestInput,
): Promise<MoveRequest> {
  const res = await apiFetch<SuccessResponse<MoveRequest>>(
    `/leases/move-requests/${id}/inspect`,
    { method: "PATCH", body: input },
  );
  return res.data;
}

export async function uploadLeaseDocument(
  leaseId: string,
  file: File,
): Promise<LeaseDocument> {
  const formData = new FormData();
  formData.append("document", file);
  const res = await apiFetch<SuccessResponse<LeaseDocument>>(
    `/leases/${leaseId}/documents`,
    { method: "POST", body: formData },
  );
  return res.data;
}

export async function listLeaseDocuments(leaseId: string): Promise<LeaseDocument[]> {
  const res = await apiFetch<SuccessResponse<LeaseDocument[]>>(
    `/leases/${leaseId}/documents`,
  );
  return res.data;
}

export async function deleteLeaseDocument(
  leaseId: string,
  documentId: string,
): Promise<void> {
  await apiFetch<SuccessResponse<null>>(
    `/leases/${leaseId}/documents/${documentId}`,
    { method: "DELETE" },
  );
}

export async function confirmLeaseDocuments(leaseId: string): Promise<Lease> {
  const res = await apiFetch<SuccessResponse<Lease>>(
    `/leases/${leaseId}/documents/confirm`,
    { method: "PATCH" },
  );
  return res.data;
}
