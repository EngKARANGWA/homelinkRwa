export type Role = "tenant" | "owner" | "agent" | "admin" | "superadmin" | "house_manager";

export type User = {
  id: string;
  email: string;
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
  role: "tenant" | "owner" | "agent";
};

export type LoginInput = {
  email: string;
  password: string;
};

export type LoginVerifyInput = {
  challengeId: string;
  code: string;
};

export type PropertyCategory = "residential" | "commercial";

export type PropertyType =
  | "apartment"
  | "house"
  | "studio"
  | "condo"
  | "commercial"
  | "other";

export type CreatePropertyInput = {
  title: string;
  description?: string;
  type: PropertyType;
  category: PropertyCategory;
  sizeSqm?: number;
  unitsCount?: number;
  addressLine: string;
  city: string;
  state?: string;
  country: string;
  postalCode?: string;
  bedrooms?: number;
  bathrooms?: number;
  rentAmount: number;
  rentConditions?: string;
  ownerId?: string;
};

export type UpdatePropertyInput = {
  title?: string;
  description?: string;
  type?: PropertyType;
  category?: PropertyCategory;
  sizeSqm?: number;
  unitsCount?: number;
  addressLine?: string;
  city?: string;
  state?: string;
  country?: string;
  postalCode?: string;
  bedrooms?: number;
  bathrooms?: number;
  rentAmount?: number;
  rentConditions?: string;
  ownerId?: string;
};

export type PropertyStatus = "available" | "occupied";
export type ApprovalStatus = "pending" | "approved" | "rejected";

export type Property = {
  id: string;
  ownerId: string;
  agentId: string | null;
  title: string;
  description: string | null;
  type: PropertyType;
  category: PropertyCategory;
  sizeSqm: number | null;
  unitsCount: number | null;
  addressLine: string;
  city: string;
  state: string | null;
  country: string;
  postalCode: string | null;
  bedrooms: number | null;
  bathrooms: number | null;
  rentAmount: string;
  rentConditions: string | null;
  status: PropertyStatus;
  approvalStatus: ApprovalStatus;
  isActive: boolean;
  approvedBy: string | null;
  approvedAt: string | null;
  rejectionReason: string | null;
  createdAt: string;
  updatedAt: string;
};

export type PropertyUnit = {
  id: string;
  propertyId: string;
  label: string;
  bedrooms: number | null;
  bathrooms: number | null;
  rentAmount: string;
  status: PropertyStatus;
  createdAt: string;
  updatedAt: string;
};

export type CreateUnitInput = {
  label: string;
  bedrooms?: number;
  bathrooms?: number;
  rentAmount: number;
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
};

export type CreateLeaseInput = {
  propertyId: string;
  unitId: string;
  tenantId: string;
  startDate: string;
  endDate?: string;
  paymentDate?: string;
  rentAmount: number;
  deposit?: number;
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

export type TenantDashboard = {
  activeLease: {
    id: string;
    propertyTitle: string;
    addressLine: string;
    city: string;
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
