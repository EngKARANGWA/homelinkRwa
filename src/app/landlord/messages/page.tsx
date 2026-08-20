"use client";

import { MessageSquare } from "lucide-react";
import { ComingSoon } from "@/components/admin/ComingSoon";
import { useLanguage } from "@/lib/i18n/LanguageContext";

export default function LandlordMessagesPage() {
  const { t } = useLanguage();
  const c = t.dashboard.landlord.messages;

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-bold text-navy">{c.title}</h1>
        <p className="mt-1 text-sm text-slate-500">
          {c.subtitle}
        </p>
      </div>
      <ComingSoon
        icon={MessageSquare}
        title={c.comingSoonTitle}
        description={c.comingSoonDescription}
      />
    </div>
  );
}
