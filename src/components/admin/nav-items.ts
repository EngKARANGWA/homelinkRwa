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
  { label: "Overview", href: "/admin", icon: LayoutDashboard },
  { label: "Landlords", href: "/admin/landlords", icon: UserCircle },
  { label: "Properties", href: "/admin/properties", icon: Building2 },
  { label: "Leases", href: "/admin/leases", icon: FileText },
  { label: "Tenants", href: "/admin/tenants", icon: Users },
  { label: "Maintenance", href: "/admin/maintenance", icon: Wrench },
  { label: "Payments", href: "/admin/payments", icon: CreditCard },
  { label: "Reports", href: "/admin/reports", icon: BarChart3 },
  { label: "Settings", href: "/admin/settings", icon: Settings },
];
