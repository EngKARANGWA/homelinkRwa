export type Role = "tenant" | "owner" | "agent" | "admin" | "superadmin" | "house_manager";

export type User = {
  id: string;
  email: string;
  // Only set for tenants — their permanent login identifier in place of email.
  loginCode?: string | null;
  firstName: string;
  lastName: string;
  phone: string;
  role: Role;
  avatarUrl?: string | null;
  isVerified?: boolean;
  isApproved?: boolean;
  isActive?: boolean;
  createdAt?: string;
  updatedAt?: string;
};

export type UpdateProfileInput = {
  firstName?: string;
  lastName?: string;
  phone?: string;
  avatarUrl?: string;
};

export type VerificationStatus = "pending" | "approved" | "rejected";

export type IdentityVerification = {
  id: string;
  status: VerificationStatus;
  documentUrl?: string;
  rejectionReason?: string | null;
  createdAt: string;
};

export type AuthTokens = {
  accessToken: string;
  refreshToken: string;
  user: User;
};

export type LoginChallenge = {
  requiresVerification: true;
  challengeId: string;
};

export type LoginResult = AuthTokens | LoginChallenge;

export function isLoginChallenge(
  result: LoginResult,
): result is LoginChallenge {
  return "requiresVerification" in result;
}

export type RegisterInput = {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  phone: string;
  // Tenant self-registration is retired — tenant accounts are only ever
  // created by a landlord/agent (via createLease's newTenant), which hands
  // them a permanent login code instead of an email identity.
  role: "owner" | "agent";
};

export type LoginInput = {
  // An email (owner/agent/admin) or a tenant's permanent login code — the
  // backend tells them apart by whether it contains "@".
  identifier: string;
  password: string;
};

export type LoginVerifyInput = {
  challengeId: string;
  code: string;
};

// "house" | "studio" | "condo" | "other" are legacy values still readable on
// existing properties (the backend keeps them in its enum for that reason)
// but are no longer selectable when creating or editing a property — new
// properties are restricted to apartment/commercial/mixed_use.
export type PropertyType =
  | "apartment"
  | "house"
  | "studio"
  | "condo"
  | "commercial"
  | "mixed_use"
  | "other";

export const SELECTABLE_PROPERTY_TYPES: PropertyType[] = ["apartment", "commercial", "mixed_use"];

export type CreatePropertyInput = {
  title: string;
  type: PropertyType;
  location: string;
  numberOfFloors: number;
  // Not yet recognized by the backend — harmless to send (createPropertySchema
  // isn't .strict(), so an unknown field is just ignored) until basement
  // support lands there. 0 or undefined means no basement.
  numberOfBasementFloors?: number;
  ownerId?: string;
};

export type UpdatePropertyInput = {
  title?: string;
  type?: PropertyType;
  location?: string;
  status?: PropertyStatus;
};

export type PropertyStatus = "available" | "occupied";
export type ApprovalStatus = "pending" | "approved" | "rejected";
// A unit's own status is a separate, wider domain than a property's roll-up
// status — a unit can be pulled out of service (maintenance) or deliberately
// not offered (inactive) independent of the property as a whole.
export type UnitStatus = "available" | "occupied" | "maintenance" | "inactive";

export type Property = {
  id: string;
  ownerId: string;
  agentId: string | null;
  title: string;
  type: PropertyType;
  location: string;
  numberOfFloors: number;
  // Undefined until the backend adds basement support (see CreatePropertyInput).
  numberOfBasementFloors?: number | null;
  status: PropertyStatus;
  approvalStatus: ApprovalStatus;
  isActive: boolean;
  approvedBy: string | null;
  approvedAt: string | null;
  rejectionReason: string | null;
  createdAt: string;
  updatedAt: string;
  // Present only on GET /properties/:id, not on list rows.
  units?: PropertyUnit[];
  totalUnits?: number;
  occupiedUnits?: number;
  availableUnits?: number;
  maintenanceUnits?: number;
  inactiveUnits?: number;
};

// A property's floors are auto-created from numberOfFloors at registration
// (Ground, Floor 1, Floor 2, ...) — fetched separately via GET
// /properties/:id/floors, not embedded on Property.
export type Floor = {
  id: string;
  propertyId: string;
  name: string;
  scale: number | null;
  index: number;
  unitsCount: number;
  createdAt: string;
  updatedAt: string;
};

export type UpdateFloorInput = {
  name?: string;
  scale?: number;
};

export type PropertyUnit = {
  id: string;
  propertyId: string;
  label: string;
  unitType: string | null;
  description: string | null;
  floorId: string;
  bedrooms: number | null;
  bathrooms: number | null;
  rentAmount: string;
  deposit: string | null;
  status: UnitStatus;
  createdAt: string;
  updatedAt: string;
};

// Returned by GET /properties/:id/units/:unitId only.
export type UnitDetail = PropertyUnit & {
  floor: Floor | undefined;
  currentLease: {
    id: string;
    tenantId: string;
    status: LeaseStatus;
    startDate: string;
    endDate: string | null;
  } | null;
};

// Returned by GET /properties/units (search across a landlord's whole
// portfolio) — same fields as PropertyUnit plus the parent property's own
// title/location, for display in a unit picker.
export type AvailableUnit = PropertyUnit & {
  propertyTitle: string;
  propertyLocation: string;
};

export type CreateUnitInput = {
  label: string;
  floorId: string;
  unitType?: string;
  description?: string;
  bedrooms?: number;
  bathrooms?: number;
  rentAmount: number;
  deposit?: number;
};

export type ManualUnitStatus = Exclude<UnitStatus, "occupied">;

export type UpdateUnitInput = {
  label?: string;
  floorId?: string;
  unitType?: string;
  description?: string;
  bedrooms?: number;
  bathrooms?: number;
  rentAmount?: number;
  deposit?: number;
  status?: ManualUnitStatus;
};

export type GenerateUnitsInput = {
  floorId: string;
  count: number;
  unitType?: string;
  bedrooms?: number;
  bathrooms?: number;
  rentAmount: number;
  deposit?: number;
};

export type ImportUnitsRowError = { row: number; message: string };

export type ImportUnitsPreview = {
  values: CreateUnitInput[];
  errors: ImportUnitsRowError[];
};

export type ListAvailableUnitsParams = {
  search?: string;
  status?: UnitStatus;
  propertyId?: string;
};

export type LeaseStatus =
  | "draft"
  | "pending_signatures"
  | "active"
  | "pending_renewal"
  | "pending_termination"
  | "terminated"
  | "expired";

export type Lease = {
  id: string;
  propertyId: string;
  unitId: string;
  tenantId: string;
  ownerId: string;
  startDate: string;
  endDate: string | null;
  paymentDate: string | null;
  rentAmount: number;
  deposit: number | null;
  momoNumber: string | null;
  leasePeriodNote: string | null;
  status: LeaseStatus;
  documentUrl: string | null;
  documentsConfirmed: boolean;
  documentsConfirmedBy: string | null;
  documentsConfirmedAt: string | null;
  tenantSignedAt: string | null;
  ownerSignedAt: string | null;
  terminatedAt: string | null;
  createdAt: string;
  updatedAt: string;
  // Only present once, on the response to creating this lease with a brand-new
  // `newTenant` — a one-time temp password the landlord can hand to the
  // tenant directly (they're forced to change it on first login).
  temporaryPassword?: string;
  // Only present alongside temporaryPassword — the tenant's new permanent
  // login identifier (they log in with this + their password, not email).
  loginCode?: string;
  // Present on GET /leases/:id and on the response to createLease — the
  // backend resolves this from the tenant's user record since the requester
  // already has proven access to this specific lease. Absent on list
  // responses (those only ever show a placeholder tenant label).
  tenant?: TenantSummary;
  // Present on GET /leases/:id only (not on createLease's response, and not
  // on list responses).
  owner?: TenantSummary;
};

export type TenantSummary = {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
};

export type LeaseStatementRow = {
  date: string;
  reference: string;
  remarks: string;
  debit: number;
  credit: number;
  balance: number;
};

export type LeaseStatement = {
  property: { title: string; location: string };
  unit: { label: string };
  tenant: { firstName: string; lastName: string; email: string };
  owner: { firstName: string; lastName: string };
  periodFrom: string;
  periodTo: string;
  openingBalance: number;
  rows: LeaseStatementRow[];
  totalDebit: number;
  totalCredit: number;
  closingBalance: number;
  generatedAt: string;
};

export type NewTenantInput = {
  email: string;
  firstName: string;
  lastName: string;
  phone: string;
};

export type CreateLeaseInput = {
  propertyId: string;
  unitId: string;
  // Exactly one of these — assign an existing tenant, or register a
  // brand-new one (they get a "set your password" email) and assign them
  // in the same step.
  tenantId?: string;
  newTenant?: NewTenantInput;
  startDate: string;
  endDate?: string;
  paymentDate?: string;
  rentAmount: number;
  deposit?: number;
  momoNumber?: string;
  leasePeriodNote?: string;
};

export type LeaseChangeRequest = {
  id: string;
  leaseId: string;
  type: "renewal" | "termination";
  reason?: string;
  status: "pending" | "approved" | "rejected";
  createdAt: string;
  updatedAt: string;
};

export type LeaseDocumentUrl = {
  url: string;
  expiresAt?: string;
};

export type LeaseDocument = {
  id: string;
  leaseId: string;
  url: string;
  uploadedBy: string;
  createdAt: string;
};

export type MoveRequest = {
  id: string;
  leaseId: string;
  requestDate: string;
  proposedMoveDate: string;
  status: "pending" | "approved" | "rejected";
  reason?: string;
  createdAt: string;
  updatedAt: string;
};

export type CreateMoveRequestInput = {
  leaseId: string;
  proposedMoveDate: string;
  reason?: string;
};

export type InspectMoveRequestInput = {
  moveRequestId: string;
  inspectionDate: string;
  notes?: string;
};

export type UpdateMoveRequestChecklistInput = {
  moveRequestId: string;
  items: { description: string; checked: boolean }[];
};

export type CreateMaintenanceRequestInput = {
  propertyId: string;
  title: string;
  description: string;
};

export type InvoiceStatus = "unpaid" | "paid" | "overdue";

export type Invoice = {
  id: string;
  invoiceNumber: string;
  leaseId: string;
  period: string;
  amountDue: number;
  dueDate: string;
  status: InvoiceStatus;
  createdAt: string;
  updatedAt: string;
};

export type PaymentMethod = "mobile_money" | "bank_transfer" | "cash";
export type PaymentCarrier = "mtn" | "airtel";

export type PaymentStatus = "pending" | "success" | "failed";
export type PaymentApprovalStatus = "not_required" | "pending" | "approved" | "rejected";

export type Payment = {
  id: string;
  paymentNumber: string;
  invoiceId: string;
  tenantId: string;
  amount: number;
  method: PaymentMethod;
  provider: string;
  providerReference: string;
  status: PaymentStatus;
  approvalStatus: PaymentApprovalStatus;
  approvedBy: string | null;
  approvedAt: string | null;
  failureReason: string | null;
  receiptUrl: string | null;
  paidAt: string | null;
  createdAt: string;
};

export type PaymentReceiptUrl = {
  url: string;
  expiresAt?: string;
};

export type OwnerDashboard = {
  revenue: { thisMonth: number; thisYear: number };
  outstandingRent: number;
  occupancy: {
    totalProperties: number;
    occupiedProperties: number;
    vacantUnits: number;
    occupancyRatePercent: number;
  };
  maintenanceExpenses: { thisMonth: number; thisYear: number };
  netProfit: { thisMonth: number; thisYear: number };
};

export type AgentDashboard = {
  properties: { total: number; available: number; occupied: number; pendingApproval: number };
  activeLeases: number;
  maintenanceRequests: { assignedToMe: number; openAcrossManagedProperties: number };
  unreadNotifications: number;
};

export type TenantDashboard = {
  activeLease: {
    id: string;
    propertyTitle: string;
    location: string;
    rentAmount: number;
    startDate: string;
    endDate: string | null;
    status: string;
  } | null;
  outstandingBalance: number;
  nextDueInvoice: { id: string; period: string; amountDue: number; dueDate: string } | null;
  paymentsThisYear: number;
  maintenanceRequests: { open: number; inProgress: number; completed: number };
  unreadNotifications: number;
};

export type PayInvoiceInput = {
  method: PaymentMethod;
  carrier?: PaymentCarrier;
  payerPhone?: string;
  payerAccount?: string;
};
export type RecordPaymentInput = {
  method: Extract<PaymentMethod, "cash" | "bank_transfer">;
};
export type PaginationMeta = {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
};

export type PaginatedResponse<T> = {
  success: true;
  message: string;
  data: T[];
  meta: PaginationMeta;
};

export type SuccessResponse<T> = {
  success: true;
  message: string;
  data: T;
};

export type ApiErrorBody = {
  success: false;
  message: string;
  errors?: unknown[];
};

export type AdminDashboard = {
  totalPlatformRevenue: number;
  activeUsers: number;
  usersByRole: {
    tenant: number;
    owner: number;
    agent: number;
    admin: number;
    superadmin: number;
    house_manager: number;
  };
  properties: {
    total: number;
    newThisMonth: number;
  };
  payments: {
    total: number;
    successCount: number;
    failedCount: number;
    successRatePercent: number;
  };
  iam: {
    activeManagers: number;
    pendingInvites: number;
    pendingSuspensionRequests: number;
  };
};
