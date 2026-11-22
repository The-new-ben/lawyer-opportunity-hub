import { useAuth } from "@/hooks/useAuth";
import { Navigate, useLocation } from "react-router-dom";
import { Card, CardContent } from "@/components/ui/card";
import { Loader2 } from "lucide-react";

interface ProtectedRouteProps {
  children: React.ReactNode;
}

export function ProtectedRoute({ children }: ProtectedRouteProps) {
  const { user, loading, session } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Card className="w-full max-w-md">
          <CardContent className="flex flex-col items-center justify-center p-8 space-y-4">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
            <p className="text-muted-foreground">טוען...</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Check if user is authenticated and has valid session
  if (!user || !session) {
    return <Navigate to="/auth" state={{ from: location }} replace />;
  }

  // Additional security check - ensure user has confirmed email (in production)
  if (user && !user.email_confirmed_at && process.env.NODE_ENV === 'production') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Card className="w-full max-w-md">
          <CardContent className="p-8 text-center space-y-4">
            <h2 className="text-xl font-semibold text-primary">אימות אימייל נדרש</h2>
            <p className="text-muted-foreground">
              אנא בדוק את האימייל שלך ולחץ על קישור האימות כדי להמשיך.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return <>{children}</>;
}