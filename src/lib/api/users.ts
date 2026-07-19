import { apiFetch } from "./client";
import type {
  IdentityVerification,
  SuccessResponse,
  UpdateProfileInput,
  User,
} from "./types";

export async function updateProfile(input: UpdateProfileInput): Promise<User> {
  const res = await apiFetch<SuccessResponse<User>>("/users/me", {
    method: "PATCH",
    body: input,
  });
  return res.data;
}

export async function submitIdentityVerification(
  document: File,
): Promise<IdentityVerification> {
  const formData = new FormData();
  formData.append("document", document);
  const res = await apiFetch<SuccessResponse<IdentityVerification>>(
    "/users/me/verify-identity",
    { method: "POST", body: formData },
  );
  return res.data;
}

export async function listIdentityVerifications(): Promise<
  IdentityVerification[]
> {
  const res = await apiFetch<SuccessResponse<IdentityVerification[]>>(
    "/users/me/verify-identity",
  );
  return res.data;
}
