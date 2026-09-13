"use client";

import { Suspense } from "react";
import { resetPassword } from "@/lib/api/auth";
import { AuthCardShell } from "@/components/auth/AuthCardShell";
import { TokenPasswordForm } from "@/components/auth/TokenPasswordForm";
import { useLanguage } from "@/lib/i18n/LanguageContext";

export default function ResetPasswordPage() {
  const { t } = useLanguage();
  const c = t.resetPasswordPage;

  return (
    <AuthCardShell title={c.title} subtitle={c.subtitle}>
      <Suspense fallback={null}>
        <TokenPasswordForm copy={c} onSubmit={(token, password) => resetPassword(token, password)} />
      </Suspense>
    </AuthCardShell>
  );
}
