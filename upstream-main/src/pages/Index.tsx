import { Navigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";

const Index = () => {
  const { user, loading } = useAuth();
  
  // מציג מסך טעינה במקום להעביר מיד
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
      </div>
    );
  }
  
  // If user is authenticated, redirect to dashboard
  // Otherwise, show the landing page
  return <Navigate to={user ? "/dashboard" : "/landing"} replace />;
};

export default Index;
