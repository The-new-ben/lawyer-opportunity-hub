import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar"
import { AppSidebar } from "@/components/AppSidebar"
import { Button } from "@/components/ui/button"
import { Bell, Settings, User, LogOut } from "lucide-react"
import { ThemeToggle } from "@/components/ThemeToggle"
import { useAuth } from "@/hooks/useAuth"
import { useIsMobile } from "@/hooks/use-mobile"

interface LayoutProps {
  children: React.ReactNode
}

export function Layout({ children }: LayoutProps) {
  const { signOut } = useAuth();
  const isMobile = useIsMobile();

  const handleSignOut = async () => {
    await signOut();
  };

  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full">
        {/* Mobile-first layout */}
        <AppSidebar />
        
        <div className="flex-1 flex flex-col">
          {/* Header - Fixed position for mobile */}
          <header className="sticky top-0 z-50 h-14 md:h-16 flex items-center justify-between border-b bg-card/95 backdrop-blur supports-[backdrop-filter]:bg-card/60 px-4 shadow-sm animate-fade-in">
            <div className="flex items-center gap-2 md:gap-4">
              <SidebarTrigger className="animate-scale-in" />
              <div className="flex items-center gap-2">
                <h1 className="text-lg md:text-xl font-bold text-primary animate-slide-in-right">
                  LegalCRM Pro
                </h1>
                <span className="hidden sm:inline-flex text-xs bg-accent text-accent-foreground px-2 py-1 rounded-full animate-fade-in">
                  עברית
                </span>
              </div>
            </div>
            
            <div className="flex items-center gap-1 md:gap-2">
              {!isMobile && (
                <>
                  <Button variant="ghost" size="icon" className="hover-scale">
                    <Bell className="h-4 w-4 md:h-5 md:w-5" />
                  </Button>
                  <Button variant="ghost" size="icon" className="hover-scale">
                    <Settings className="h-4 w-4 md:h-5 md:w-5" />
                  </Button>
                  <Button variant="ghost" size="icon" className="hover-scale">
                    <User className="h-4 w-4 md:h-5 md:w-5" />
                  </Button>
                </>
              )}
              <Button variant="ghost" size="icon" onClick={handleSignOut} className="hover-scale">
                <LogOut className="h-4 w-4 md:h-5 md:w-5" />
              </Button>
              <ThemeToggle />
            </div>
          </header>

          {/* Main content area with proper spacing */}
          <main className="flex-1 bg-muted/20 overflow-x-hidden">
            <div className="w-full max-w-full animate-fade-in">
              {children}
            </div>
          </main>
        </div>
      </div>
    </SidebarProvider>
  )
}