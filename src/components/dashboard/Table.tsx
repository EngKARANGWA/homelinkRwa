import type { ReactNode } from "react";

type TableVariant = "standalone" | "card" | "plain" | "bare";

const WRAPPER_VARIANT: Record<TableVariant, string> = {
  standalone: "overflow-x-auto rounded-xl border border-slate-200 bg-white shadow-sm",
  card: "-mx-6 mt-4 overflow-x-auto border-t border-slate-200",
  plain: "overflow-x-auto",
  bare: "",
};

export function Table({
  children,
  variant = "standalone",
  className = "",
}: {
  children: ReactNode;
  variant?: TableVariant;
  className?: string;
}) {
  if (variant === "bare") {
    return <table className={`w-full border-collapse text-left text-sm ${className}`}>{children}</table>;
  }
  return (
    <div className={`${WRAPPER_VARIANT[variant]} ${className}`}>
      <table className="w-full border-collapse text-left text-sm">{children}</table>
    </div>
  );
}

export function THead({ children }: { children: ReactNode }) {
  return <thead>{children}</thead>;
}

export function TBody({ children }: { children: ReactNode }) {
  return <tbody>{children}</tbody>;
}

export function Tr({
  children,
  className = "",
}: {
  children: ReactNode;
  className?: string;
}) {
  return <tr className={`border-t border-slate-200 first:border-t-0 ${className}`}>{children}</tr>;
}

export function Th({
  children,
  className = "",
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <th
      className={`border-r border-b border-slate-200 font-medium text-xs uppercase tracking-wide text-slate-400 last:border-r-0 ${className}`}
    >
      {children}
    </th>
  );
}

export function Td({
  children,
  className = "",
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <td className={`border-r border-slate-200 last:border-r-0 ${className}`}>{children}</td>
  );
}

export function EmptyRow({ colSpan, children }: { colSpan: number; children: ReactNode }) {
  return (
    <tr>
      <td colSpan={colSpan} className="px-6 py-8 text-center text-slate-400">
        {children}
      </td>
    </tr>
  );
}
