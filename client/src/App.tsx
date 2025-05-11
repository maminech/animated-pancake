import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AuthProvider } from "@/contexts/auth-context";
import NotFound from "@/pages/not-found";
import Login from "@/pages/login";
import Register from "@/pages/register";
import Dashboard from "@/pages/dashboard";
import Students from "@/pages/students";
import Reports from "@/pages/reports";
import Attendance from "@/pages/attendance";
import Messages from "@/pages/messages";
import Settings from "@/pages/settings";
import Admin from "@/pages/admin";
import Milestones from "@/pages/milestones";
import Badges from "@/pages/badges";
import StudentMilestones from "@/pages/student-milestones";
import { useAuth } from "@/hooks/use-auth";
import { useEffect } from "react";
import { useLocation } from "wouter";

function Router() {
  const { user, loading } = useAuth();
  const [location, setLocation] = useLocation();

  useEffect(() => {
    // Redirect to login if not authenticated and not on auth pages
    if (!loading && !user && !location.includes("/auth")) {
      setLocation("/auth/login");
    }
    
    // Redirect to dashboard if authenticated and on auth pages
    if (!loading && user && location.includes("/auth")) {
      setLocation("/");
    }
  }, [user, loading, location, setLocation]);

  if (loading) {
    return <div className="flex items-center justify-center min-h-screen">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
    </div>;
  }

  return (
    <Switch>
      <Route path="/auth/login" component={Login} />
      <Route path="/auth/register" component={Register} />
      
      <Route path="/" component={Dashboard} />
      <Route path="/students" component={Students} />
      <Route path="/reports" component={Reports} />
      <Route path="/attendance" component={Attendance} />
      <Route path="/messages" component={Messages} />
      <Route path="/settings" component={Settings} />
      
      {/* New routes for enhanced features */}
      <Route path="/admin" component={Admin} />
      <Route path="/milestones" component={Milestones} />
      <Route path="/badges" component={Badges} />
      <Route path="/students/:id/milestones" component={StudentMilestones} />
      
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <TooltipProvider>
          <Toaster />
          <div className="min-h-screen bg-background animate-gradient-x">
            <Router />
          </div>
        </TooltipProvider>
      </AuthProvider>
    </QueryClientProvider>
  );
}

export default App;
