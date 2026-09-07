"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "./AuthContext";
import type { Role } from "@/lib/api/types";

export function RequireRole({
  role,
  children,
}: {
  role: Role | Role[];
  children: React.ReactNode;
}) {
  const { user, isLoading } = useAuth();
  const router = useRouter();
  const allowedRoles = Array.isArray(role) ? role : [role];
  const isAllowed = !!user && allowedRoles.includes(user.role);

  useEffect(() => {
    if (!isLoading && !isAllowed) {
      router.replace("/login");
    }
  }, [isLoading, isAllowed, router]);

  if (isLoading || !isAllowed) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-50">
        <p className="text-sm text-slate-400">Loading…</p>
      </div>
    );
  }

  return <>{children}</>;
}
