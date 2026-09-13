import { Home } from "lucide-react";
import Link from "next/link";
import { LanguageSwitcher } from "@/components/shared/LanguageSwitcher";

export function AuthCardShell({
  title,
  subtitle,
  children,
}: {
  title: string;
  subtitle: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-navy px-6 py-16">
      <div className="mb-6 flex w-full max-w-md items-center justify-end">
        <LanguageSwitcher variant="dark" />
      </div>

      <div className="w-full max-w-md rounded-2xl bg-white p-8 shadow-2xl">
        <Link href="/" className="flex items-center justify-center gap-2">
          <Home className="h-7 w-7 text-gold" strokeWidth={2.2} />
          <span className="leading-tight">
            <span className="block text-lg font-bold text-navy">HomeLink</span>
            <span className="block text-[11px] font-semibold tracking-[0.2em] text-gold">
              RWANDA
            </span>
          </span>
        </Link>

        <h1 className="mt-6 text-center text-2xl font-bold text-navy">{title}</h1>
        <p className="mt-2 text-center text-sm text-slate-500">{subtitle}</p>

        {children}
      </div>
    </div>
  );
}
