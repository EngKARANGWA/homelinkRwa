"use client";

import NextLink from "next/link";
import { useSearchParams } from "next/navigation";
import type { ComponentProps } from "react";

type AppLinkProps = ComponentProps<typeof NextLink>;

function withPersistedId(href: string, id: string | null): string {
  if (!id) return href;
  if (!href.startsWith("/landlord") && !href.startsWith("/tenant")) return href;
  if (href.includes("id=")) return href;

  const [path, hash] = href.split("#");
  const separator = path.includes("?") ? "&" : "?";
  const withParam = `${path}${separator}id=${id}`;
  return hash ? `${withParam}#${hash}` : withParam;
}

/**
 * Wraps next/link so the `?id=` query param (which LandlordContext/TenantContext
 * use to identify the current mock landlord/tenant) survives internal navigation.
 * Without this, clicking any link drops the param and silently resets the
 * "logged in as" identity to the first mock record, breaking detail pages that
 * filter by owner/tenant name.
 */
export function AppLink({ href, ...props }: AppLinkProps) {
  const searchParams = useSearchParams();
  const id = searchParams.get("id");
  const finalHref = typeof href === "string" ? withPersistedId(href, id) : href;

  return <NextLink href={finalHref} {...props} />;
}
