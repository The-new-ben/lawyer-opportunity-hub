import { Navigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";

const Index = () => {
  const { user } = useAuth();
  
  // If user is authenticated, redirect to dashboard
  // Otherwise, redirect to landing page
  return <Navigate to={user ? "/dashboard" : "/landing"} replace />;
};

export default Index;
