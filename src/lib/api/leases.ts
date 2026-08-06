import { apiFetch, apiFetchBlob } from "./client";
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

/**
 * Signed leases have a stored PDF and the backend returns a JSON
 * `{ url }` pointing at it. Anything else (no signatures yet) gets
 * rendered live server-side and comes back as a raw `application/pdf`
 * body instead — turn that into a local blob URL so callers always
 * get a URL to open, regardless of which path the backend took.
 */
export async function getLeaseDocument(id: string): Promise<LeaseDocumentUrl> {
  const blob = await apiFetchBlob(`/leases/${id}/document`);
  if (blob.type.includes("json")) {
    const body = JSON.parse(await blob.text()) as SuccessResponse<LeaseDocumentUrl>;
    return body.data;
  }
  return { url: URL.createObjectURL(blob) };
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

export async function uploadLeaseDocuments(
  leaseId: string,
  files: File[],
): Promise<LeaseDocument[]> {
  const formData = new FormData();
  files.forEach((file) => formData.append("documents", file));
  const res = await apiFetch<SuccessResponse<LeaseDocument[]>>(
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
