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
  LucideIcon,
} from "lucide-react"
import { NavLink } from "react-router-dom"
import { useIsMobile } from "@/hooks/use-mobile"
import { useRole } from "@/hooks/useRole"
import { Sheet, SheetContent } from "@/components/ui/sheet"

interface MenuItem {
  title: string
  url: string
  icon: LucideIcon
  roles: string[]
}

interface AppSidebarProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

// Define menu items per role - ensures unique keys
const getMenuItems = (role: string | null) => {
  // Unique keys with prefix for each category
  const allMenuItems: MenuItem[] = [
    { title: "Dashboard", url: "/dashboard", icon: Home, roles: ["admin", "lawyer", "customer", "supplier"] },
    { title: "Leads", url: "/leads", icon: Target, roles: ["lawyer", "admin"] },
    { title: "Leads", url: "/supplier/leads", icon: Target, roles: ["supplier", "admin"] },
    { title: "Clients", url: "/clients", icon: Users, roles: ["lawyer", "admin"] },
    { title: "Cases", url: "/cases", icon: FileText, roles: ["lawyer", "admin", "customer"] },
    { title: "Matching", url: "/matching", icon: Search, roles: ["lawyer", "admin"] },
    { title: "Calendar", url: "/calendar", icon: Calendar, roles: ["lawyer", "admin", "customer"] },
    { title: "Leads Portal", url: "/leads-portal", icon: Package, roles: ["supplier", "admin"] },
    { title: "System Management", url: "/admin", icon: Shield, roles: ["admin"] },
  ]

  const businessItems: MenuItem[] = [
    { title: "Payments", url: "/payments", icon: CreditCard, roles: ["lawyer", "admin", "customer"] },
    { title: "Commissions", url: "/commissions", icon: DollarSign, roles: ["lawyer", "admin"] },
    { title: "Reports", url: "/reports", icon: BarChart3, roles: ["lawyer", "admin"] },
    { title: "Features", url: "/features", icon: FileText, roles: ["admin"] },
  ]

  const mainItems = allMenuItems.filter((item) => !role || item.roles.includes(role))
  const filteredBusinessItems = businessItems.filter((item) => !role || item.roles.includes(role))

  return { mainItems, businessItems: filteredBusinessItems }
}

export const AppSidebar: React.FC<AppSidebarProps> = ({ open, onOpenChange }) => {
  const isMobile = useIsMobile()
  const { role } = useRole()
  const { mainItems, businessItems } = getMenuItems(role)

  const navCls = (active: boolean) =>
    `flex items-center gap-2 rounded-md p-2 text-left transition-colors ${
      active
        ? "bg-sidebar-accent text-sidebar-accent-foreground font-medium"
        : "hover:bg-sidebar-accent/50"
    }`

  const renderLinks = (items: MenuItem[]) =>
    items.map(({ title, url, icon: Icon }) => (
      <NavLink key={`${url}-${title}`} to={url} end className={({ isActive }) => navCls(isActive)}>
        <Icon className="h-4 w-4 md:h-5 md:w-5 mr-2" />
        <span className="flex-1">{title}</span>
      </NavLink>
    ))

  const content = (
    <div className="h-full w-64 bg-sidebar text-sidebar-foreground p-4 space-y-6">
      <div className="space-y-2">
        <h2 className="text-sm font-semibold">Main Management</h2>
        <nav className="space-y-1">{renderLinks(mainItems)}</nav>
      </div>

      <div className="space-y-2">
        <h2 className="text-sm font-semibold">Business & Finance</h2>
        <nav className="space-y-1">{renderLinks(businessItems)}</nav>
      </div>

      <div className="mt-auto space-y-1">
        <NavLink to="/settings" className={({ isActive }) => navCls(isActive)}>
          <Settings className="h-4 w-4 md:h-5 md:w-5 mr-2" />
          <span className="flex-1">Settings</span>
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
    <aside className="hidden md:block border-l">
      {content}
    </aside>
  )
}