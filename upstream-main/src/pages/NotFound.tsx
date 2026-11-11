import { useLocation } from "react-router-dom";
import { useEffect } from "react";
import { toast } from "@/components/ui/use-toast";

const NotFound = () => {
  const location = useLocation();

  useEffect(() => {
    toast({
      title: '404 Error',
      description: location.pathname,
      variant: 'destructive'
    });
  }, [location.pathname]);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-100 overflow-x-hidden">
      <div className="text-center">
        <h1 className="text-4xl font-bold mb-4">404</h1>
        <p className="text-xl text-gray-600 mb-4">Oops! Page not found</p>
        <a href="/" className="text-blue-500 hover:text-blue-700 underline">
          Return to Home
        </a>
      </div>
    </div>
  );
};

export default NotFound;
