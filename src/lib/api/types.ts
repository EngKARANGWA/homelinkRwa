export type Role = "tenant" | "owner" | "agent" | "admin";

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

export type UpdatePropertyInput = Partial<CreatePropertyInput>;

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

export type CreateLeaseInput = {
  propertyId: string;
  tenantId: string;
  startDate: string;
  endDate?: string;
  paymentDate?: string;
  rentAmount: number;
};

export type LeaseStatus =
  | "pending_signatures"
  | "active"
  | "renewal_requested"
  | "termination_requested"
  | "terminated"
  | "expired";

export type Lease = {
  id: string;
  propertyId: string;
  tenantId: string;
  ownerId: string;
  startDate: string;
  endDate: string | null;
  paymentDate: string | null;
  rentAmount: string;
  status: LeaseStatus;
  signedByTenant: boolean;
  signedByOwner: boolean;
  createdAt: string;
  updatedAt: string;
};

export type LeaseChangeRequestType = "renewal" | "termination";
export type LeaseChangeRequestStatus = "pending" | "approved" | "rejected";

export type LeaseChangeRequest = {
  id: string;
  leaseId: string;
  type: LeaseChangeRequestType;
  status: LeaseChangeRequestStatus;
  requestedBy: string;
  reason: string | null;
  createdAt: string;
  updatedAt: string;
};

export type MoveRequestType = "move_in" | "move_out";
export type MoveRequestStatus =
  | "pending"
  | "checklist_submitted"
  | "inspected"
  | "completed";

export type MoveRequestChecklistItem = {
  label: string;
  checked: boolean;
  notes?: string | null;
};

export type MoveRequest = {
  id: string;
  leaseId: string;
  type: MoveRequestType;
  status: MoveRequestStatus;
  checklist: MoveRequestChecklistItem[];
  inspectionNotes: string | null;
  inspectedBy: string | null;
  inspectedAt: string | null;
  createdAt: string;
  updatedAt: string;
};

export type CreateMoveRequestInput = {
  type: MoveRequestType;
  notes?: string;
};

export type UpdateMoveRequestChecklistInput = {
  checklist: MoveRequestChecklistItem[];
};

export type InspectMoveRequestInput = {
  approved: boolean;
  notes?: string;
};

export type LeaseDocument = {
  id: string;
  leaseId: string;
  fileName: string;
  fileUrl: string;
  uploadedBy: string;
  createdAt: string;
};

export type LeaseDocumentUrl = {
  url: string;
};

export type CreateMaintenanceRequestInput = {
  propertyId: string;
  title: string;
  description: string;
};

export type PaymentMethod = "mobile_money" | "bank_transfer" | "cash";

export type PayInvoiceInput = {
  method: PaymentMethod;
  payerPhone?: string;
  payerAccount?: string;
};

export type InvoiceStatus = "pending" | "paid" | "overdue" | "cancelled";

export type Invoice = {
  id: string;
  leaseId: string;
  tenantId: string;
  ownerId: string;
  propertyId: string;
  amount: string;
  dueDate: string;
  status: InvoiceStatus;
  createdAt: string;
  updatedAt: string;
};

export type PaymentStatus = "successful" | "pending_approval" | "rejected" | "failed";

export type Payment = {
  id: string;
  invoiceId: string;
  tenantId: string;
  ownerId: string;
  propertyId: string;
  amount: string;
  method: PaymentMethod;
  status: PaymentStatus;
  payerPhone: string | null;
  payerAccount: string | null;
  paidAt: string | null;
  rejectionReason: string | null;
  createdAt: string;
  updatedAt: string;
};

export type PaymentReceiptUrl = {
  url: string;
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
