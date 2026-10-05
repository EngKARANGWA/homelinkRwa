import type { PropertyType } from "@/lib/api/types";

export function formatPropertyType(type: PropertyType): string {
  return type
    .split("_")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
}
