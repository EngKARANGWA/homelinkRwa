import type { PropertyType } from "@/lib/api/types";

export function formatPropertyType(type: PropertyType): string {
  return type
    .split("_")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
}

// Suggestions for a unit's free-text `unitType` field, which is what we have
// instead of a hard-coded enum — commercial units describe the space, not a
// bedroom count, which is also why bedrooms/bathrooms are hidden entirely
// for commercial properties rather than just left optional.
export function unitTypeSuggestions(propertyType: PropertyType): string[] {
  return propertyType === "commercial"
    ? ["Shop", "Office", "Warehouse", "Restaurant Space", "Retail"]
    : ["Studio", "1 Bedroom", "2 Bedroom", "3 Bedroom", "4+ Bedroom"];
}
