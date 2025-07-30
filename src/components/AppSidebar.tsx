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
  Search
} from "lucide-react"
import { NavLink, useLocation } from "react-router-dom"
import { useIsMobile } from "@/hooks/use-mobile"

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

const mainItems = [
  { title: "דשבורד", url: "/dashboard", icon: Home },
  { title: "לידים", url: "/leads", icon: Target },
  { title: "לקוחות", url: "/clients", icon: Users },
  { title: "תיקים", url: "/cases", icon: FileText },
  { title: "התאמות", url: "/matching", icon: Search },
  { title: "לוח זמנים", url: "/calendar", icon: Calendar },
]

const businessItems = [
  { title: "תשלומים", url: "/payments", icon: CreditCard },
  { title: "עמלות", url: "/commissions", icon: DollarSign },
  { title: "דוחות", url: "/reports", icon: BarChart3 },
  { title: "פיצ'רים", url: "/features", icon: FileText },
]

export function AppSidebar() {
  const { state } = useSidebar()
  const isMobile = useIsMobile()
  const location = useLocation()
  const currentPath = location.pathname
  const isCollapsed = state === "collapsed"

  const isActive = (path: string) => currentPath === path
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