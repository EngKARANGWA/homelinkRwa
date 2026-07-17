export type Landlord = {
  id: string;
  name: string;
  email: string;
  phone: string;
  properties: number;
  status: "Active" | "Pending" | "Suspended";
  registeredAt: string;
};

export const LANDLORDS: Landlord[] = [
  {
    id: "1",
    name: "Jean Claude Uwimana",
    email: "jc.uwimana@example.com",
    phone: "+250 788 123 456",
    properties: 4,
    status: "Active",
    registeredAt: "2026-05-12",
  },
  {
    id: "2",
    name: "Aline Mukamana",
    email: "aline.mukamana@example.com",
    phone: "+250 788 234 567",
    properties: 2,
    status: "Active",
    registeredAt: "2026-05-28",
  },
  {
    id: "3",
    name: "Eric Niyonsenga",
    email: "eric.niyonsenga@example.com",
    phone: "+250 788 345 678",
    properties: 1,
    status: "Pending",
    registeredAt: "2026-06-10",
  },
  {
    id: "4",
    name: "Divine Ingabire",
    email: "divine.ingabire@example.com",
    phone: "+250 788 456 789",
    properties: 6,
    status: "Active",
    registeredAt: "2026-06-18",
  },
  {
    id: "5",
    name: "Patrick Habimana",
    email: "patrick.habimana@example.com",
    phone: "+250 788 567 890",
    properties: 0,
    status: "Suspended",
    registeredAt: "2026-06-25",
  },
];

export type BuildingType = "Residential" | "Commercial";

export type PropertyType = "House" | "Apartment" | "Unit (Door)" | "Unit";

export const PROPERTY_TYPES_BY_BUILDING: Record<BuildingType, PropertyType[]> = {
  Residential: ["House", "Apartment", "Unit (Door)"],
  Commercial: ["Unit"],
};

export type PropertyAttribute = { label: string; value: string };

export type Property = {
  id: string;
  name: string;
  address: string;
  upi: string;
  buildingType: BuildingType;
  type: PropertyType;
  size: string | null;
  owner: string;
  rent: number;
  terms: string[];
  attributes: PropertyAttribute[];
  documentName: string | null;
  availability: "Available" | "Occupied";
  vacantSince: string | null;
  approval: "Pending" | "Approved" | "Rejected";
};

export const PROPERTIES: Property[] = [
  {
    id: "1",
    name: "Kigali Heights Apartment 4B",
    address: "KG 7 Ave, Nyarutarama, Kigali",
    upi: "1/01/03/02/1156",
    buildingType: "Residential",
    type: "Apartment",
    size: null,
    owner: "Jean Claude Uwimana",
    rent: 450000,
    terms: ["12-month lease", "2 months deposit"],
    attributes: [
      { label: "Floor", value: "3rd Floor" },
      { label: "Entrance", value: "Shared corridor, no street access" },
    ],
    documentName: null,
    availability: "Occupied",
    vacantSince: null,
    approval: "Approved",
  },
  {
    id: "2",
    name: "Kimihurura Family House",
    address: "KG 213 St, Kimihurura, Kigali",
    upi: "1/01/04/01/0872",
    buildingType: "Residential",
    type: "House",
    size: null,
    owner: "Jean Claude Uwimana",
    rent: 800000,
    terms: ["12-month lease", "1 month deposit"],
    attributes: [],
    documentName: null,
    availability: "Available",
    vacantSince: "2026-06-20",
    approval: "Approved",
  },
  {
    id: "3",
    name: "Remera Studio 12",
    address: "KG 11 Ave, Remera, Kigali",
    upi: "1/01/02/05/0341",
    buildingType: "Residential",
    type: "Unit (Door)",
    size: null,
    owner: "Aline Mukamana",
    rent: 180000,
    terms: ["6-month lease", "1 month deposit"],
    attributes: [{ label: "Floor", value: "Ground Floor" }],
    documentName: null,
    availability: "Available",
    vacantSince: "2026-05-15",
    approval: "Pending",
  },
  {
    id: "4",
    name: "Kacyiru Office Suite",
    address: "KG 5 Ave, Kacyiru, Kigali",
    upi: "1/01/01/03/0459",
    buildingType: "Commercial",
    type: "Unit",
    size: "85 sqm",
    owner: "Divine Ingabire",
    rent: 1200000,
    terms: ["24-month lease", "3 months deposit"],
    attributes: [
      { label: "Floor", value: "Ground Floor" },
      { label: "Street Frontage", value: "Direct entrance facing main road" },
    ],
    documentName: null,
    availability: "Occupied",
    vacantSince: null,
    approval: "Approved",
  },
  {
    id: "5",
    name: "Kibagabaga Apartment 2A",
    address: "KG 63 St, Kibagabaga, Kigali",
    upi: "1/01/05/02/0217",
    buildingType: "Residential",
    type: "Apartment",
    size: null,
    owner: "Divine Ingabire",
    rent: 320000,
    terms: ["12-month lease", "2 months deposit"],
    attributes: [{ label: "Floor", value: "1st Floor" }],
    documentName: null,
    availability: "Available",
    vacantSince: "2026-07-01",
    approval: "Pending",
  },
  {
    id: "6",
    name: "Nyamirambo Family House",
    address: "KG 2 St, Nyamirambo, Kigali",
    upi: "1/02/02/04/0688",
    buildingType: "Residential",
    type: "House",
    size: null,
    owner: "Eric Niyonsenga",
    rent: 260000,
    terms: ["12-month lease", "1 month deposit"],
    attributes: [],
    documentName: null,
    availability: "Available",
    vacantSince: "2026-04-10",
    approval: "Rejected",
  },
];

export const TODAY = "2026-07-10";

export function daysVacant(vacantSince: string | null): number | null {
  if (!vacantSince) return null;
  const diffMs = new Date(TODAY).getTime() - new Date(vacantSince).getTime();
  return Math.max(0, Math.floor(diffMs / (1000 * 60 * 60 * 24)));
}

export type Lease = {
  id: string;
  tenant: string;
  property: string;
  owner: string;
  rent: number;
  deposit: number;
  momoNumber: string;
  startDate: string;
  endDate: string | null;
  paymentDate: string | null;
  leasePeriodNote: string | null;
  documentName: string | null;
  status:
    | "Active"
    | "Renewal Requested"
    | "Termination Requested"
    | "Terminated"
    | "Expired";
};

export const LEASES: Lease[] = [
  {
    id: "1",
    tenant: "Claudine Uwase",
    property: "Kigali Heights Apartment 4B",
    owner: "Jean Claude Uwimana",
    rent: 450000,
    deposit: 900000,
    momoNumber: "+250 788 111 222",
    startDate: "2025-08-01",
    endDate: "2026-07-31",
    paymentDate: "2025-08-01",
    leasePeriodNote: "12-month renewable lease",
    documentName: null,
    status: "Renewal Requested",
  },
  {
    id: "2",
    tenant: "Emmanuel Byiringiro",
    property: "Kacyiru Office Suite",
    owner: "Divine Ingabire",
    rent: 1200000,
    deposit: 3600000,
    momoNumber: "+250 788 222 333",
    startDate: "2025-01-15",
    endDate: "2027-01-14",
    paymentDate: "2025-01-15",
    leasePeriodNote: "24-month commercial lease",
    documentName: null,
    status: "Active",
  },
  {
    id: "3",
    tenant: "Solange Umutoni",
    property: "Kigali Heights Apartment 4B",
    owner: "Jean Claude Uwimana",
    rent: 450000,
    deposit: 450000,
    momoNumber: "+250 788 333 444",
    startDate: "2024-03-01",
    endDate: "2025-02-28",
    paymentDate: "2024-03-01",
    leasePeriodNote: "12-month lease",
    documentName: null,
    status: "Expired",
  },
  {
    id: "4",
    tenant: "David Mugisha",
    property: "Kacyiru Office Suite",
    owner: "Divine Ingabire",
    rent: 1200000,
    deposit: 1200000,
    momoNumber: "+250 788 444 555",
    startDate: "2024-06-01",
    endDate: "2026-05-31",
    paymentDate: "2024-06-01",
    leasePeriodNote: "24-month lease",
    documentName: null,
    status: "Termination Requested",
  },
];

export type Tenant = {
  id: string;
  name: string;
  email: string;
  phone: string;
  property: string;
  status: "Active" | "Pending" | "Inactive";
  registeredAt: string;
};

export const TENANTS: Tenant[] = [
  {
    id: "1",
    name: "Claudine Uwase",
    email: "claudine.uwase@example.com",
    phone: "+250 788 111 222",
    property: "Kigali Heights Apartment 4B",
    status: "Active",
    registeredAt: "2025-07-20",
  },
  {
    id: "2",
    name: "Emmanuel Byiringiro",
    email: "emmanuel.byiringiro@example.com",
    phone: "+250 788 222 333",
    property: "Kacyiru Office Suite",
    status: "Active",
    registeredAt: "2024-12-05",
  },
  {
    id: "3",
    name: "Solange Umutoni",
    email: "solange.umutoni@example.com",
    phone: "+250 788 333 444",
    property: "—",
    status: "Inactive",
    registeredAt: "2024-02-15",
  },
  {
    id: "4",
    name: "David Mugisha",
    email: "david.mugisha@example.com",
    phone: "+250 788 444 555",
    property: "Kacyiru Office Suite",
    status: "Active",
    registeredAt: "2024-05-20",
  },
  {
    id: "5",
    name: "Grace Keza",
    email: "grace.keza@example.com",
    phone: "+250 788 555 666",
    property: "—",
    status: "Pending",
    registeredAt: "2026-06-30",
  },
  {
    id: "6",
    name: "Olivier Ndayisenga",
    email: "olivier.ndayisenga@example.com",
    phone: "+250 788 666 777",
    property: "—",
    status: "Pending",
    registeredAt: "2026-07-02",
  },
];

export type Laborer = {
  name: string;
  role: string;
  contact: string;
  amount: number;
};

export type MaintenanceRequest = {
  id: string;
  tenant: string;
  property: string;
  issue: string[];
  priority: "Low" | "Medium" | "High";
  status: "Submitted" | "Assigned" | "In Progress" | "Completed";
  laborers: Laborer[];
  workDone: string | null;
  laborCost: number | null;
  itemCost: number | null;
  feedback: string | null;
  submittedAt: string;
};

export const MAINTENANCE_HANDLERS = [
  "Innocent Habyarimana",
  "Vestine Mutesi",
  "Faustin Gasana",
];

export const MAINTENANCE_REQUESTS: MaintenanceRequest[] = [
  {
    id: "1",
    tenant: "Claudine Uwase",
    property: "Kigali Heights Apartment 4B",
    issue: ["Kitchen sink is leaking under the cabinet."],
    priority: "Medium",
    status: "Submitted",
    laborers: [],
    workDone: null,
    laborCost: null,
    itemCost: null,
    feedback: null,
    submittedAt: "2026-07-01",
  },
  {
    id: "2",
    tenant: "Emmanuel Byiringiro",
    property: "Kacyiru Office Suite",
    issue: ["Air conditioning unit not cooling on the 2nd floor."],
    priority: "High",
    status: "Assigned",
    laborers: [
      {
        name: "Faustin Gasana",
        role: "HVAC Technician",
        contact: "+250 788 111 222",
        amount: 25000,
      },
    ],
    workDone: null,
    laborCost: 25000,
    itemCost: null,
    feedback: null,
    submittedAt: "2026-06-28",
  },
  {
    id: "3",
    tenant: "David Mugisha",
    property: "Kacyiru Office Suite",
    issue: ["Main entrance door lock is jammed."],
    priority: "High",
    status: "In Progress",
    laborers: [
      {
        name: "Innocent Habyarimana",
        role: "Locksmith",
        contact: "+250 788 222 333",
        amount: 10000,
      },
    ],
    workDone: null,
    laborCost: 10000,
    itemCost: null,
    feedback: null,
    submittedAt: "2026-06-20",
  },
  {
    id: "4",
    tenant: "Claudine Uwase",
    property: "Kigali Heights Apartment 4B",
    issue: ["Bedroom light fixture flickering."],
    priority: "Low",
    status: "Completed",
    laborers: [
      {
        name: "Vestine Mutesi",
        role: "Electrician",
        contact: "+250 788 333 444",
        amount: 15000,
      },
    ],
    workDone: "Replaced faulty ballast and light switch.",
    laborCost: 15000,
    itemCost: 5000,
    feedback: "Fixed quickly, very professional.",
    submittedAt: "2026-06-05",
  },
];

export type Payment = {
  id: string;
  tenant: string;
  property: string;
  owner: string;
  amount: number;
  method:
    | "MTN Mobile Money"
    | "Airtel Money"
    | "Bank Transfer"
    | "Card / PayPal"
    | "Cash";
  status: "Paid" | "Late" | "Pending" | "Pending Approval";
  dueDate: string;
  paidDate: string | null;
};

export const PAYMENTS: Payment[] = [
  {
    id: "1",
    tenant: "Claudine Uwase",
    property: "Kigali Heights Apartment 4B",
    owner: "Jean Claude Uwimana",
    amount: 450000,
    method: "MTN Mobile Money",
    status: "Paid",
    dueDate: "2026-06-01",
    paidDate: "2026-06-01",
  },
  {
    id: "2",
    tenant: "Emmanuel Byiringiro",
    property: "Kacyiru Office Suite",
    owner: "Divine Ingabire",
    amount: 1200000,
    method: "Bank Transfer",
    status: "Paid",
    dueDate: "2026-06-01",
    paidDate: "2026-06-03",
  },
  {
    id: "3",
    tenant: "David Mugisha",
    property: "Kacyiru Office Suite",
    owner: "Divine Ingabire",
    amount: 1200000,
    method: "MTN Mobile Money",
    status: "Late",
    dueDate: "2026-06-01",
    paidDate: null,
  },
  {
    id: "4",
    tenant: "Claudine Uwase",
    property: "Kigali Heights Apartment 4B",
    owner: "Jean Claude Uwimana",
    amount: 450000,
    method: "Airtel Money",
    status: "Pending",
    dueDate: "2026-07-01",
    paidDate: null,
  },
  {
    id: "5",
    tenant: "Solange Umutoni",
    property: "Kimihurura Family House",
    owner: "Jean Claude Uwimana",
    amount: 800000,
    method: "Cash",
    status: "Pending Approval",
    dueDate: "2026-07-01",
    paidDate: null,
  },
];

export const ADMIN_STATS = [
  { label: "Registered Landlords", value: LANDLORDS.length },
  {
    label: "Managed Properties",
    value: PROPERTIES.length,
  },
  {
    label: "Active Tenants",
    value: TENANTS.filter((t) => t.status === "Active").length,
  },
  { label: "Revenue this month", value: "2,450,000 RWF" },
];
