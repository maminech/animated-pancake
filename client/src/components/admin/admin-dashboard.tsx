import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from "recharts";
import { User } from "@shared/schema";
import { UsersIcon, LayoutDashboardIcon, UserCircleIcon, BookOpenIcon, AwardIcon, UsersRoundIcon } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { useLocation } from "wouter";
import { useState } from "react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { BadgeForm } from "../badges/badge-form";
import { UserList } from "./user-list";
import { motion } from "framer-motion";

const MOOD_COLORS = {
  amazing: "#22c55e", // green-500
  happy: "#3b82f6",   // blue-500
  okay: "#f97316",    // orange-500
  sad: "#f59e0b",     // amber-500
  upset: "#ef4444",   // red-500
};

interface AdminStats {
  totalStudents: number;
  totalTeachers: number;
  totalParents: number;
  totalClasses: number;
  totalReports: number;
  recentReportsCount: number;
  moodCounts: {
    amazing: number;
    happy: number;
    okay: number;
    sad: number;
    upset: number;
  };
}

export function AdminDashboard() {
  const [, navigate] = useLocation();
  const [showBadgeDialog, setShowBadgeDialog] = useState(false);
  
  // Fetch admin stats
  const { data: stats, isLoading: statsLoading, error: statsError } = useQuery<AdminStats>({
    queryKey: ["/api/admin/stats"],
  });
  
  // Fetch users for user management
  const { data: users = [], isLoading: usersLoading, error: usersError } = useQuery<User[]>({
    queryKey: ["/api/admin/users"],
  });
  
  if (statsLoading || usersLoading) {
    return <div className="text-center py-10">Loading admin dashboard...</div>;
  }
  
  if (statsError || usersError) {
    return (
      <Alert variant="destructive" className="mb-6">
        <AlertTitle>Error</AlertTitle>
        <AlertDescription>
          Failed to load admin dashboard data. Please make sure you have admin privileges.
        </AlertDescription>
      </Alert>
    );
  }
  
  // Format mood data for the pie chart
  const moodData = stats ? Object.entries(stats.moodCounts).map(([name, value]) => ({
    name: name.charAt(0).toUpperCase() + name.slice(1),
    value
  })) : [];
  
  return (
    <div className="space-y-10 animate-in fade-in-50 duration-500">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight mb-2">Admin Dashboard</h1>
          <p className="text-muted-foreground">Manage your school and monitor key metrics</p>
        </div>
        <div className="flex gap-3">
          <Dialog open={showBadgeDialog} onOpenChange={setShowBadgeDialog}>
            <DialogTrigger asChild>
              <Button>
                <AwardIcon className="mr-2 h-4 w-4" /> Create Badge
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[500px]">
              <DialogHeader>
                <DialogTitle>Create New Badge</DialogTitle>
                <DialogDescription>
                  Create a new badge that can be awarded to students for their achievements.
                </DialogDescription>
              </DialogHeader>
              <BadgeForm onSuccess={() => setShowBadgeDialog(false)} />
            </DialogContent>
          </Dialog>
          
          <Button variant="outline" onClick={() => navigate("/badges")}>
            <AwardIcon className="mr-2 h-4 w-4" /> View All Badges
          </Button>
        </div>
      </div>
      
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.1 }}
        >
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Students</CardTitle>
              <UsersIcon className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats?.totalStudents || 0}</div>
              <p className="text-xs text-muted-foreground">
                Active enrollments
              </p>
            </CardContent>
          </Card>
        </motion.div>
        
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.2 }}
        >
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Teachers</CardTitle>
              <UserCircleIcon className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats?.totalTeachers || 0}</div>
              <p className="text-xs text-muted-foreground">
                Faculty members
              </p>
            </CardContent>
          </Card>
        </motion.div>
        
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.3 }}
        >
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Classes</CardTitle>
              <LayoutDashboardIcon className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats?.totalClasses || 0}</div>
              <p className="text-xs text-muted-foreground">
                Active classrooms
              </p>
            </CardContent>
          </Card>
        </motion.div>
        
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.4 }}
        >
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Weekly Reports</CardTitle>
              <BookOpenIcon className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats?.recentReportsCount || 0}</div>
              <p className="text-xs text-muted-foreground">
                Reports in the last 7 days
              </p>
            </CardContent>
          </Card>
        </motion.div>
      </div>
      
      <Tabs defaultValue="stats" className="space-y-4">
        <TabsList>
          <TabsTrigger value="stats">Dashboard Stats</TabsTrigger>
          <TabsTrigger value="users">User Management</TabsTrigger>
        </TabsList>
        
        <TabsContent value="stats" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
            <Card className="col-span-4">
              <CardHeader>
                <CardTitle>Student Mood Analysis</CardTitle>
                <CardDescription>
                  Distribution of student moods from recent reports
                </CardDescription>
              </CardHeader>
              <CardContent className="pl-2">
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={moodData}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="value"
                      label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                    >
                      {moodData.map((entry, index) => (
                        <Cell 
                          key={`cell-${index}`} 
                          fill={MOOD_COLORS[entry.name.toLowerCase() as keyof typeof MOOD_COLORS]} 
                        />
                      ))}
                    </Pie>
                    <Tooltip />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
            
            <Card className="col-span-3">
              <CardHeader>
                <CardTitle>User Distribution</CardTitle>
                <CardDescription>
                  Breakdown of system users by role
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center">
                    <div className="w-full flex items-center gap-4">
                      <UserCircleIcon className="h-4 w-4 text-blue-500" />
                      <div className="space-y-1 flex-1">
                        <p className="text-sm font-medium leading-none">
                          Teachers
                        </p>
                        <div className="h-2 w-full bg-blue-100 rounded-full overflow-hidden">
                          <div 
                            className="h-full bg-blue-500 rounded-full" 
                            style={{
                              width: `${stats ? (stats.totalTeachers / 
                                (stats.totalTeachers + stats.totalParents + 2) * 100) : 0}%`
                            }}
                          />
                        </div>
                      </div>
                      <span className="text-sm font-medium">{stats?.totalTeachers || 0}</span>
                    </div>
                  </div>
                  
                  <div className="flex items-center">
                    <div className="w-full flex items-center gap-4">
                      <UsersRoundIcon className="h-4 w-4 text-green-500" />
                      <div className="space-y-1 flex-1">
                        <p className="text-sm font-medium leading-none">
                          Parents
                        </p>
                        <div className="h-2 w-full bg-green-100 rounded-full overflow-hidden">
                          <div 
                            className="h-full bg-green-500 rounded-full" 
                            style={{
                              width: `${stats ? (stats.totalParents / 
                                (stats.totalTeachers + stats.totalParents + 2) * 100) : 0}%`
                            }}
                          />
                        </div>
                      </div>
                      <span className="text-sm font-medium">{stats?.totalParents || 0}</span>
                    </div>
                  </div>
                  
                  <div className="flex items-center">
                    <div className="w-full flex items-center gap-4">
                      <UsersIcon className="h-4 w-4 text-amber-500" />
                      <div className="space-y-1 flex-1">
                        <p className="text-sm font-medium leading-none">
                          Students
                        </p>
                        <div className="h-2 w-full bg-amber-100 rounded-full overflow-hidden">
                          <div 
                            className="h-full bg-amber-500 rounded-full" 
                            style={{ 
                              width: '100%'
                            }}
                          />
                        </div>
                      </div>
                      <span className="text-sm font-medium">{stats?.totalStudents || 0}</span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
        
        <TabsContent value="users">
          <Card>
            <CardHeader>
              <CardTitle>User Management</CardTitle>
              <CardDescription>View and manage all users in the system</CardDescription>
            </CardHeader>
            <CardContent>
              <UserList users={users} />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}