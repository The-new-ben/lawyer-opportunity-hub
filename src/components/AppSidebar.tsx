import { 
  Users, 
  UserPlus, 
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
  Package
} from "lucide-react"
import { NavLink } from "react-router-dom"
import { useIsMobile } from "@/hooks/use-mobile"
import { useRole } from "@/hooks/useRole"

import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "@/components/ui/sidebar"

// Define menu items by role
const getMenuItems = (role: string | null) => {
  const baseItems = [
    { title: "דשבורד", url: "/dashboard", icon: Home, roles: ['admin', 'lawyer', 'customer', 'lead_provider'] },
  ];

  const customerItems = [
    { title: "התיקים שלי", url: "/cases", icon: FileText, roles: ['customer'] },
    { title: "לוח זמנים", url: "/calendar", icon: Calendar, roles: ['customer'] },
  ];

  const lawyerItems = [
    { title: "לידים", url: "/leads", icon: Target, roles: ['lawyer', 'admin'] },
    { title: "לקוחות", url: "/clients", icon: Users, roles: ['lawyer', 'admin'] },
    { title: "תיקים", url: "/cases", icon: FileText, roles: ['lawyer', 'admin'] },
    { title: "התאמות", url: "/matching", icon: Search, roles: ['lawyer', 'admin'] },
    { title: "לוח זמנים", url: "/calendar", icon: Calendar, roles: ['lawyer', 'admin'] },
  ];

  const leadProviderItems = [
    { title: "לידים", url: "/leads", icon: Target, roles: ['lead_provider', 'admin'] },
    { title: "פורטל לידים", url: "/leads-portal", icon: Package, roles: ['lead_provider', 'admin'] },
  ];

  const adminItems = [
    { title: "לידים", url: "/leads", icon: Target, roles: ['admin'] },
    { title: "לקוחות", url: "/clients", icon: Users, roles: ['admin'] },
    { title: "תיקים", url: "/cases", icon: FileText, roles: ['admin'] },
    { title: "התאמות", url: "/matching", icon: Search, roles: ['admin'] },
    { title: "לוח זמנים", url: "/calendar", icon: Calendar, roles: ['admin'] },
    { title: "ניהול מערכת", url: "/admin", icon: Shield, roles: ['admin'] },
  ];

  const businessItems = [
    { title: "תשלומים", url: "/payments", icon: CreditCard, roles: ['lawyer', 'admin', 'customer'] },
    { title: "עמלות", url: "/commissions", icon: DollarSign, roles: ['lawyer', 'admin'] },
    { title: "דוחות", url: "/reports", icon: BarChart3, roles: ['lawyer', 'admin'] },
    { title: "פיצ'רים", url: "/features", icon: FileText, roles: ['admin'] },
  ];

  // Filter items based on user role
  const filteredItems = [...baseItems, ...customerItems, ...lawyerItems, ...leadProviderItems, ...adminItems]
    .filter(item => !role || item.roles.includes(role));

  const filteredBusinessItems = businessItems
    .filter(item => !role || item.roles.includes(role));

  return { mainItems: filteredItems, businessItems: filteredBusinessItems };
};

export function AppSidebar() {
  const { state } = useSidebar()
  const isMobile = useIsMobile()
  const { role } = useRole()
  const isCollapsed = state === "collapsed"
  
  const { mainItems, businessItems } = getMenuItems(role);

  const getNavCls = ({ isActive }: { isActive: boolean }) =>
    `transition-all duration-200 hover-scale ${
      isActive
        ? "bg-sidebar-accent text-sidebar-accent-foreground font-medium animate-scale-in"
        : "hover:bg-sidebar-accent/50"
    }`

  return (
    <Sidebar
      className={`${isCollapsed ? "w-14" : "w-64"} transition-all duration-300 animate-slide-in-right`}
      collapsible="icon"
      side="right"
    >
      <SidebarContent className="bg-sidebar animate-fade-in">
        {/* Main Navigation */}
        <SidebarGroup className="animate-fade-in">
          <SidebarGroupLabel className="text-sidebar-foreground font-semibold text-right">
            ניהול ראשי
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu className="space-y-1">
              {mainItems.map((item, index) => (
                <SidebarMenuItem 
                  key={item.title}
                  className="animate-fade-in"
                  style={{ animationDelay: `${index * 50}ms` }}
                >
                  <SidebarMenuButton asChild className="w-full">
                    <NavLink to={item.url} end className={getNavCls}>
                      <item.icon className={`h-4 w-4 md:h-5 md:w-5 ${!isCollapsed && !isMobile ? 'ml-2' : ''}`} />
                      {!isCollapsed && (
                        <span className="text-right flex-1 animate-fade-in">{item.title}</span>
                      )}
                    </NavLink>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        {/* Business & Finance */}
        <SidebarGroup className="animate-fade-in" style={{ animationDelay: '200ms' }}>
          <SidebarGroupLabel className="text-sidebar-foreground font-semibold text-right">
            עסקי ופיננסי
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu className="space-y-1">
              {businessItems.map((item, index) => (
                <SidebarMenuItem 
                  key={item.title}
                  className="animate-fade-in"
                  style={{ animationDelay: `${(index + mainItems.length) * 50}ms` }}
                >
                  <SidebarMenuButton asChild className="w-full">
                    <NavLink to={item.url} className={getNavCls}>
                      <item.icon className={`h-4 w-4 md:h-5 md:w-5 ${!isCollapsed && !isMobile ? 'ml-2' : ''}`} />
                      {!isCollapsed && (
                        <span className="text-right flex-1 animate-fade-in">{item.title}</span>
                      )}
                    </NavLink>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        {/* Settings */}
        <SidebarGroup className="animate-fade-in" style={{ animationDelay: '400ms' }}>
          <SidebarGroupContent>
            <SidebarMenu>
              <SidebarMenuItem className="animate-fade-in">
                <SidebarMenuButton asChild className="w-full">
                  <NavLink to="/settings" className={getNavCls}>
                    <Settings className={`h-4 w-4 md:h-5 md:w-5 ${!isCollapsed && !isMobile ? 'ml-2' : ''}`} />
                    {!isCollapsed && (
                      <span className="text-right flex-1 animate-fade-in">הגדרות</span>
                    )}
                  </NavLink>
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  )
}