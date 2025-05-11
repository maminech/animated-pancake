import { useAuth } from "@/hooks/use-auth";
import { AdminDashboard } from "@/components/admin/admin-dashboard";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { ShieldAlertIcon } from "lucide-react";
import { motion } from "framer-motion";
import { useEffect } from "react";
import { useLocation } from "wouter";

export default function Admin() {
  const { user } = useAuth();
  const [, setLocation] = useLocation();
  
  // Check if user has admin or director role
  const isAuthorized = user?.role === "admin" || user?.role === "director";
  
  // Redirect if not authorized
  useEffect(() => {
    if (user && !isAuthorized) {
      setLocation("/dashboard");
    }
  }, [user, isAuthorized, setLocation]);
  
  if (!user) {
    return (
      <div className="container py-8">
        <p className="text-center">Loading...</p>
      </div>
    );
  }
  
  if (!isAuthorized) {
    return (
      <div className="container py-8">
        <Alert variant="destructive">
          <ShieldAlertIcon className="h-4 w-4" />
          <AlertTitle>Access Denied</AlertTitle>
          <AlertDescription>
            You do not have permission to access the admin dashboard.
          </AlertDescription>
        </Alert>
      </div>
    );
  }
  
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="container py-8"
    >
      <AdminDashboard />
    </motion.div>
  );
}