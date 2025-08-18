import { useState } from "react"
import { AppSidebar } from "@/components/AppSidebar"
import { Button } from "@/components/ui/button"
import { Bell, Settings, Menu } from "lucide-react"
import { ThemeToggle } from "@/components/ThemeToggle"
import { UserMenu } from "@/components/UserMenu"
import { useIsMobile } from "@/hooks/use-mobile"

interface LayoutProps {
  children: React.ReactNode
}

export function Layout({ children }: LayoutProps) {
  const isMobile = useIsMobile()
  const [open, setOpen] = useState(false)

  return (
    <div className="min-h-screen w-full flex flex-col md:flex-row overflow-x-hidden">
      <AppSidebar open={open} onOpenChange={setOpen} />

      <div className="flex-1 flex flex-col">
        {/* Header */}
        <header className="sticky top-0 z-50 h-14 md:h-16 flex items-center justify-between border-b bg-card/95 backdrop-blur supports-[backdrop-filter]:bg-card/60 px-4 shadow-sm animate-fade-in">
          <div className="flex items-center gap-2 md:gap-4">
            <Button
              variant="ghost"
              size="icon"
              className="md:hidden"
              onClick={() => setOpen(true)}
            >
              <Menu className="h-5 w-5" />
              <span className="sr-only">Open Menu</span>
            </Button>
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
              </>
            )}
            <UserMenu />
            <ThemeToggle />
          </div>
        </header>

        {/* Main content area */}
        <main className="flex-1 bg-muted/20 overflow-x-hidden">
          <div className="w-full max-w-full animate-fade-in">{children}</div>
        </main>
      </div>
    </div>
  )
}