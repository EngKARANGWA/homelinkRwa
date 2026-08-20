import {
  BarChart3,
  Building2,
  CreditCard,
  FileText,
  LayoutDashboard,
  Settings,
  UserCircle,
  Users,
  Wrench,
} from "lucide-react";

export const ADMIN_NAV_ITEMS = [
  { key: "overview", href: "/admin", icon: LayoutDashboard },
  { key: "landlords", href: "/admin/landlords", icon: UserCircle },
  { key: "properties", href: "/admin/properties", icon: Building2 },
  { key: "leases", href: "/admin/leases", icon: FileText },
  { key: "tenants", href: "/admin/tenants", icon: Users },
  { key: "maintenance", href: "/admin/maintenance", icon: Wrench },
  { key: "payments", href: "/admin/payments", icon: CreditCard },
  { key: "reports", href: "/admin/reports", icon: BarChart3 },
  { key: "settings", href: "/admin/settings", icon: Settings },
] as const;
