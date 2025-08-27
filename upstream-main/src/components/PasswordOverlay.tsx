import { useState, useEffect } from 'react'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'

const CORRECT_PASSWORD = '0584444595'
const STORAGE_KEY = 'app-password-authenticated'

interface PasswordOverlayProps {
  children: React.ReactNode
}

export function PasswordOverlay({ children }: PasswordOverlayProps) {
  // TEMP: bypass — הסר/י שתי השורות הבאות כדי להחזיר את ההגנה
  return <>{children}</>;

  // ----- הקוד המקורי (לא ירוץ בזמן העקיפה) -----
  const [password, setPassword] = useState('')
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [error, setError] = useState('')
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    // Check if user was already authenticated
    const stored = localStorage.getItem(STORAGE_KEY)
    if (stored === 'true') {
      setIsAuthenticated(true)
    }
    setIsLoading(false)
  }, [])
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    
    if (password === CORRECT_PASSWORD) {
      setIsAuthenticated(true)
      localStorage.setItem(STORAGE_KEY, 'true')
      setError('')
    } else {
      setError('סיסמה שגויה')
      setPassword('')
    }
  }

  // Show loading state briefly
  if (isLoading) {
    return (
      <div className="fixed inset-0 bg-background/50 flex items-center justify-center z-50">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
      </div>
    )
  }

  // If authenticated, show the app
  if (isAuthenticated) {
    return <>{children}</>
  }

  // Show password overlay
  return (
    <div className="fixed inset-0 bg-background/95 backdrop-blur-sm flex items-center justify-center z-50">
      <div className="bg-card border border-border rounded-lg p-8 shadow-lg w-full max-w-md mx-4">
        <div className="text-center mb-6">
          <h2 className="text-2xl font-semibold text-foreground mb-2">
            גישה מוגבלת
          </h2>
          <p className="text-muted-foreground">
            אנא הזן את הסיסמה כדי להמשיך
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Input
              type="password"
              placeholder="הזן סיסמה"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="text-center"
              autoFocus
            />
            {error && (
              <p className="text-destructive text-sm mt-2 text-center">
                {error}
              </p>
            )}
          </div>

          <Button type="submit" className="w-full">
            כניסה
          </Button>
        </form>

        <div className="mt-4 text-center">
          <button
            type="button"
            onClick={() => {
              localStorage.removeItem(STORAGE_KEY)
              window.location.reload()
            }}
            className="text-xs text-muted-foreground hover:text-foreground transition-colors"
          >
            איפוס אישורים
          </button>
        </div>
      </div>
    </div>
  )
}