import { useRole, type UserRole } from "@/hooks/useRole";
import { Navigate } from "react-router-dom";
import { Card, CardContent } from "@/components/ui/card";
import { Loader2 } from "lucide-react";

interface RoleBasedRouteProps {
  children: React.ReactNode;
  allowedRoles: UserRole[];
  fallbackPath?: string;
}

export function RoleBasedRoute({ 
  children, 
  allowedRoles, 
  fallbackPath = "/dashboard" 
}: RoleBasedRouteProps) {
  const { role, loading } = useRole();

  if (loading) {
    return (
      <div className="min-h-[400px] flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardContent className="flex flex-col items-center justify-center p-8 space-y-4">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
            <p className="text-muted-foreground">בודק הרשאות...</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!role || !allowedRoles.includes(role)) {
    return <Navigate to={fallbackPath} replace />;
  }

  return <>{children}</>;
}