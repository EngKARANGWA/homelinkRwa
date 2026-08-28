import { apiFetch } from "./client";
import { clearTokens, getRefreshToken, setTokens } from "./tokens";
import type {
  AuthTokens,
  LoginInput,
  LoginResult,
  LoginVerifyInput,
  RegisterInput,
  SuccessResponse,
  User,
} from "./types";

export async function register(input: RegisterInput): Promise<User> {
  const res = await apiFetch<SuccessResponse<AuthTokens>>("/auth/register", {
    method: "POST",
    body: input,
    auth: false,
  });
  if (res.data.accessToken) {
    setTokens(res.data.accessToken, res.data.refreshToken);
  }
  return res.data.user;
}

export async function login(input: LoginInput): Promise<LoginResult> {
  const res = await apiFetch<SuccessResponse<LoginResult>>("/auth/login", {
    method: "POST",
    body: input,
    auth: false,
  });
  if ("accessToken" in res.data) {
    setTokens(res.data.accessToken, res.data.refreshToken);
  }
  return res.data;
}

export async function verifyLogin(input: LoginVerifyInput): Promise<AuthTokens> {
  const res = await apiFetch<SuccessResponse<AuthTokens>>("/auth/login/verify", {
    method: "POST",
    body: input,
    auth: false,
  });
  setTokens(res.data.accessToken, res.data.refreshToken);
  return res.data;
}

export async function logout(): Promise<void> {
  const refreshToken = getRefreshToken();
  clearTokens();
  if (!refreshToken) return;
  try {
    await apiFetch("/auth/logout", {
      method: "POST",
      body: { refreshToken },
      auth: false,
    });
  } catch {
    // Token already cleared locally; ignore network/server errors on logout.
  }
}

export async function forgotPassword(email: string): Promise<void> {
  await apiFetch("/auth/forgot-password", {
    method: "POST",
    body: { email },
    auth: false,
  });
}

export async function getMe(): Promise<User> {
  const res = await apiFetch<SuccessResponse<User>>("/users/me");
  return res.data;
}
