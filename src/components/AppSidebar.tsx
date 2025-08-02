import React from "react"
import {
  Users,
  FileText,
  DollarSign,
  BarChart3,
  Calendar,
  Settings,
  Home,
  Target,
  CreditCard,
  Search,
  Shield,
  Package,
} from "lucide-react"
import { NavLink, useLocation } from "react-router-dom"
import { useIsMobile } from "@/hooks/use-mobile"
import { useRole } from "@/hooks/useRole"
import { Sheet, SheetContent } from "@/components/ui/sheet"

interface AppSidebarProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

// Define menu items by role
const getMenuItems = (role: string | null) => {
  const baseItems = [
    { title: "דשבורד", url: "/dashboard", icon: Home, roles: ['admin', 'lawyer', 'customer', 'lead_provider'] },
  ]

  const customerItems = [
    { title: "התיקים שלי", url: "/cases", icon: FileText, roles: ['customer'] },
    { title: "לוח זמנים", url: "/calendar", icon: Calendar, roles: ['customer'] },
  ]

  const lawyerItems = [
    { title: "לידים", url: "/leads", icon: Target, roles: ['lawyer', 'admin'] },
    { title: "לקוחות", url: "/clients", icon: Users, roles: ['lawyer', 'admin'] },
    { title: "תיקים", url: "/cases", icon: FileText, roles: ['lawyer', 'admin'] },
    { title: "התאמות", url: "/matching", icon: Search, roles: ['lawyer', 'admin'] },
    { title: "לוח זמנים", url: "/calendar", icon: Calendar, roles: ['lawyer', 'admin'] },
  ]

  const leadProviderItems = [
    { title: "לידים", url: "/leads", icon: Target, roles: ['lead_provider', 'admin'] },
    { title: "פורטל לידים", url: "/leads-portal", icon: Package, roles: ['lead_provider', 'admin'] },
  ]

  const adminItems = [
    { title: "לידים", url: "/leads", icon: Target, roles: ['admin'] },
    { title: "לקוחות", url: "/clients", icon: Users, roles: ['admin'] },
    { title: "תיקים", url: "/cases", icon: FileText, roles: ['admin'] },
    { title: "התאמות", url: "/matching", icon: Search, roles: ['admin'] },
    { title: "לוח זמנים", url: "/calendar", icon: Calendar, roles: ['admin'] },
    { title: "ניהול מערכת", url: "/admin", icon: Shield, roles: ['admin'] },
  ]

  const businessItems = [
    { title: "תשלומים", url: "/payments", icon: CreditCard, roles: ['lawyer', 'admin', 'customer'] },
    { title: "עמלות", url: "/commissions", icon: DollarSign, roles: ['lawyer', 'admin'] },
    { title: "דוחות", url: "/reports", icon: BarChart3, roles: ['lawyer', 'admin'] },
    { title: "פיצ'רים", url: "/features", icon: FileText, roles: ['admin'] },
  ]

  // Filter items based on user role
  const filteredItems = [...baseItems, ...customerItems, ...lawyerItems, ...leadProviderItems, ...adminItems]
    .filter(item => !role || item.roles.includes(role))

  const filteredBusinessItems = businessItems
    .filter(item => !role || item.roles.includes(role))

  return { mainItems: filteredItems, businessItems: filteredBusinessItems }
}

export function AppSidebar({ open, onOpenChange }: AppSidebarProps) {
  const isMobile = useIsMobile()
  const location = useLocation()
  const { role } = useRole()
  const currentPath = location.pathname

  const { mainItems, businessItems } = getMenuItems(role)

  const isActive = (path: string) => currentPath === path
  const getNavCls = ({ isActive }: { isActive: boolean }) =>
    `flex items-center gap-2 rounded-md p-2 text-right transition-colors ${
      isActive
        ? "bg-sidebar-accent text-sidebar-accent-foreground font-medium"
        : "hover:bg-sidebar-accent/50"
    }`

  const content = (
    <div className="h-full w-64 bg-sidebar text-sidebar-foreground p-4 space-y-6" dir="rtl">
      <div className="space-y-2">
        <h2 className="text-sm font-semibold">ניהול ראשי</h2>
        <nav className="space-y-1">
          {mainItems.map(item => (
            <NavLink key={item.title} to={item.url} end className={({ isActive: active }) => getNavCls({ isActive: active })}>
              <item.icon className="h-4 w-4 md:h-5 md:w-5 ml-2" />
              <span className="flex-1">{item.title}</span>
            </NavLink>
          ))}
        </nav>
      </div>

      <div className="space-y-2">
        <h2 className="text-sm font-semibold">עסקי ופיננסי</h2>
        <nav className="space-y-1">
          {businessItems.map(item => (
            <NavLink key={item.title} to={item.url} className={({ isActive: active }) => getNavCls({ isActive: active })}>
              <item.icon className="h-4 w-4 md:h-5 md:w-5 ml-2" />
              <span className="flex-1">{item.title}</span>
            </NavLink>
          ))}
        </nav>
      </div>

      <div className="mt-auto space-y-1">
        <NavLink to="/settings" className={({ isActive: active }) => getNavCls({ isActive: active })}>
          <Settings className="h-4 w-4 md:h-5 md:w-5 ml-2" />
          <span className="flex-1">הגדרות</span>
        </NavLink>
      </div>
    </div>
  )

  if (isMobile) {
    return (
      <Sheet open={open} onOpenChange={onOpenChange}>
        <SheetContent side="right" className="p-0 w-64">
          {content}
        </SheetContent>
      </Sheet>
    )
  }

  return (
    <aside className="hidden md:block border-l" dir="rtl">
      {content}
    </aside>
  )
}

