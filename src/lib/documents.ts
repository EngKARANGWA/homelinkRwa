import { LEASES, type Property } from "./mock-admin-data";

export type DocumentCategory =
  | "Property Document"
  | "Lease Agreement"
  | "ID Verification"
  | "Other";

export type LandlordDocument = {
  id: string;
  name: string;
  category: DocumentCategory;
  propertyId: string;
  propertyName: string;
  unitNumber: string | null;
  tenant: string | null;
  uploadedAt: string;
  isUploaded: boolean;
};

/**
 * Documents already attached to properties/leases in the base mock data
 * (via Property.documentName / Lease.documentName). Currently always empty
 * in the seed data, but derived properly so real records would surface here.
 */
export function getBaseDocuments(properties: Property[]): LandlordDocument[] {
  const docs: LandlordDocument[] = [];

  properties.forEach((property) => {
    if (property.documentName) {
      docs.push({
        id: `prop-doc-${property.id}`,
        name: property.documentName,
        category: "Property Document",
        propertyId: property.id,
        propertyName: property.name,
        unitNumber: null,
        tenant: null,
        uploadedAt: property.vacantSince ?? "—",
        isUploaded: false,
      });
    }
  });

  const propertyNames = new Set(properties.map((p) => p.name));
  LEASES.filter((l) => propertyNames.has(l.property) && l.documentName).forEach((lease) => {
    const property = properties.find((p) => p.name === lease.property);
    if (!property) return;
    docs.push({
      id: `lease-doc-${lease.id}`,
      name: lease.documentName as string,
      category: "Lease Agreement",
      propertyId: property.id,
      propertyName: property.name,
      unitNumber: null,
      tenant: lease.tenant,
      uploadedAt: lease.startDate,
      isUploaded: false,
    });
  });

  return docs;
}
