import { Helmet } from "react-helmet";
import { Sidebar } from "@/components/layout/sidebar";
import { MobileNav } from "@/components/layout/mobile-nav";
import { useAuth } from "@/hooks/use-auth";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { MessageSquare } from "lucide-react";

export default function Messages() {
  const { user } = useAuth();

  return (
    <>
      <Helmet>
        <title>Messages - SmartKid Manager</title>
        <meta name="description" content="Communicate with teachers, parents and staff" />
      </Helmet>
      
      <div className="min-h-screen bg-background">
        <div className="md:flex h-screen overflow-hidden">
          <Sidebar />
          
          <div className="flex flex-col flex-1 overflow-hidden">
            <MobileNav />
            
            <main className="flex-1 relative overflow-y-auto focus:outline-none pb-16 md:pb-0">
              <div className="py-6">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-8">
                  <h1 className="text-2xl font-semibold text-foreground font-nunito mb-4">
                    Messages
                  </h1>
                  
                  <Card className="border-dashed border-2">
                    <CardHeader>
                      <CardTitle className="text-center">Coming Soon</CardTitle>
                    </CardHeader>
                    <CardContent className="flex flex-col items-center justify-center py-10">
                      <MessageSquare className="h-20 w-20 text-primary opacity-50 mb-4" />
                      <p className="text-muted-foreground text-center max-w-md">
                        The messaging functionality will be implemented in a future update. 
                        Stay tuned for real-time communication between teachers, parents and staff.
                      </p>
                    </CardContent>
                  </Card>
                </div>
              </div>
            </main>
          </div>
        </div>
      </div>
    </>
  );
}
