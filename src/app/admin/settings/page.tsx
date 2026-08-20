"use client";

import { Settings } from "lucide-react";
import { ComingSoon } from "@/components/admin/ComingSoon";
import { useLanguage } from "@/lib/i18n/LanguageContext";

export default function SettingsPage() {
  const { t } = useLanguage();
  const c = t.dashboard.admin.settings;

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-bold text-navy">{c.title}</h1>
        <p className="mt-1 text-sm text-slate-500">
          {c.subtitle}
        </p>
      </div>
      <ComingSoon
        icon={Settings}
        title={c.comingSoonTitle}
        description={c.comingSoonDescription}
      />
    </div>
  );
}
