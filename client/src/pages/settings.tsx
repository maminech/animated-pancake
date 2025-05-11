import { Helmet } from "react-helmet";
import { Sidebar } from "@/components/layout/sidebar";
import { MobileNav } from "@/components/layout/mobile-nav";
import { useAuth } from "@/hooks/use-auth";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ThemeProvider, useTheme } from "@/components/ui/theme-provider";
import { getInitials } from "@/lib/utils";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { queryClient } from "@/lib/queryClient";
import { Moon, Sun, User, Bell, Lock, Globe } from "lucide-react";

export default function Settings() {
  const { user, logout } = useAuth();
  const { theme, setTheme } = useTheme();
  const { toast } = useToast();
  const [isUpdating, setIsUpdating] = useState(false);
  const [profileImage, setProfileImage] = useState(user?.profileImage || "");
  const [firstName, setFirstName] = useState(user?.firstName || "");
  const [lastName, setLastName] = useState(user?.lastName || "");
  const [email, setEmail] = useState(user?.email || "");
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  // Handle profile update
  const handleProfileUpdate = async () => {
    if (!firstName || !lastName || !email) {
      toast({
        title: "Error",
        description: "Please fill all required fields",
        variant: "destructive",
      });
      return;
    }

    try {
      setIsUpdating(true);

      await apiRequest("PUT", `/api/users/${user?.id}`, {
        firstName,
        lastName,
        email,
        profileImage,
      });

      // Refresh user data
      queryClient.invalidateQueries({ queryKey: ['/api/auth/me'] });

      toast({
        title: "Success",
        description: "Profile updated successfully",
      });
    } catch (error) {
      console.error("Failed to update profile:", error);
      toast({
        title: "Error",
        description: "Failed to update profile",
        variant: "destructive",
      });
    } finally {
      setIsUpdating(false);
    }
  };

  // Handle password change
  const handlePasswordChange = async () => {
    if (!currentPassword || !newPassword || !confirmPassword) {
      toast({
        title: "Error",
        description: "Please fill all password fields",
        variant: "destructive",
      });
      return;
    }

    if (newPassword !== confirmPassword) {
      toast({
        title: "Error",
        description: "New passwords do not match",
        variant: "destructive",
      });
      return;
    }

    if (newPassword.length < 6) {
      toast({
        title: "Error",
        description: "Password must be at least 6 characters",
        variant: "destructive",
      });
      return;
    }

    try {
      setIsUpdating(true);

      await apiRequest("PUT", `/api/users/${user?.id}/password`, {
        currentPassword,
        newPassword,
      });

      // Clear password fields
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");

      toast({
        title: "Success",
        description: "Password changed successfully",
      });
    } catch (error) {
      console.error("Failed to change password:", error);
      toast({
        title: "Error",
        description: "Current password is incorrect or there was a server error",
        variant: "destructive",
      });
    } finally {
      setIsUpdating(false);
    }
  };

  // Handle profile image update
  const handleProfileImageChange = () => {
    // In a real implementation, this would upload the image
    // For now, we'll use a placeholder service
    const newImage = `https://ui-avatars.com/api/?name=${firstName}+${lastName}&background=random`;
    setProfileImage(newImage);
    
    toast({
      title: "Profile image updated",
      description: "Your profile image has been updated",
    });
  };

  // Handle account deletion
  const handleDeleteAccount = () => {
    // This would typically show a confirmation dialog
    toast({
      title: "Account deletion",
      description: "This feature is not implemented yet",
      variant: "destructive",
    });
  };

  return (
    <>
      <Helmet>
        <title>Settings - SmartKid Manager</title>
        <meta name="description" content="Manage your account settings and preferences" />
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
                    Settings
                  </h1>
                  
                  <Tabs defaultValue="profile" className="w-full">
                    <TabsList className="grid grid-cols-4 mb-8">
                      <TabsTrigger value="profile" className="flex items-center gap-2">
                        <User className="h-4 w-4" />
                        <span className="hidden sm:inline">Profile</span>
                      </TabsTrigger>
                      <TabsTrigger value="password" className="flex items-center gap-2">
                        <Lock className="h-4 w-4" />
                        <span className="hidden sm:inline">Password</span>
                      </TabsTrigger>
                      <TabsTrigger value="notifications" className="flex items-center gap-2">
                        <Bell className="h-4 w-4" />
                        <span className="hidden sm:inline">Notifications</span>
                      </TabsTrigger>
                      <TabsTrigger value="appearance" className="flex items-center gap-2">
                        <Globe className="h-4 w-4" />
                        <span className="hidden sm:inline">Appearance</span>
                      </TabsTrigger>
                    </TabsList>
                    
                    {/* Profile Tab */}
                    <TabsContent value="profile">
                      <Card>
                        <CardHeader>
                          <CardTitle>Profile Information</CardTitle>
                          <CardDescription>
                            Update your personal information and profile image
                          </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-6">
                          <div className="flex flex-col sm:flex-row items-center gap-4">
                            <Avatar className="h-24 w-24">
                              <AvatarImage 
                                src={profileImage} 
                                alt={user ? `${user.firstName} ${user.lastName}` : "User profile"}
                              />
                              <AvatarFallback className="text-xl">
                                {user ? getInitials(user.firstName, user.lastName) : "U"}
                              </AvatarFallback>
                            </Avatar>
                            <div className="flex-1">
                              <h3 className="text-lg font-medium">{firstName} {lastName}</h3>
                              <p className="text-sm text-muted-foreground capitalize">{user?.role || "User"}</p>
                              <Button 
                                variant="outline" 
                                size="sm" 
                                className="mt-2"
                                onClick={handleProfileImageChange}
                              >
                                Change Avatar
                              </Button>
                            </div>
                          </div>
                          
                          <div className="grid gap-4 sm:grid-cols-2">
                            <div className="grid gap-2">
                              <Label htmlFor="firstName">First Name</Label>
                              <Input 
                                id="firstName" 
                                value={firstName}
                                onChange={(e) => setFirstName(e.target.value)}
                              />
                            </div>
                            <div className="grid gap-2">
                              <Label htmlFor="lastName">Last Name</Label>
                              <Input 
                                id="lastName" 
                                value={lastName}
                                onChange={(e) => setLastName(e.target.value)}
                              />
                            </div>
                          </div>
                          
                          <div className="grid gap-2">
                            <Label htmlFor="email">Email</Label>
                            <Input 
                              id="email" 
                              type="email" 
                              value={email}
                              onChange={(e) => setEmail(e.target.value)}
                            />
                          </div>
                          
                          <div className="grid gap-2">
                            <Label htmlFor="role">Role</Label>
                            <Input 
                              id="role" 
                              value={user?.role ? user.role.charAt(0).toUpperCase() + user.role.slice(1) : ""} 
                              disabled
                            />
                            <p className="text-sm text-muted-foreground mt-1">
                              Your role cannot be changed. Contact an administrator if this is incorrect.
                            </p>
                          </div>
                        </CardContent>
                        <CardFooter className="flex justify-between">
                          <Button variant="outline" onClick={() => {
                            setFirstName(user?.firstName || "");
                            setLastName(user?.lastName || "");
                            setEmail(user?.email || "");
                            setProfileImage(user?.profileImage || "");
                          }}>
                            Reset
                          </Button>
                          <Button 
                            onClick={handleProfileUpdate}
                            disabled={isUpdating}
                          >
                            {isUpdating ? "Saving..." : "Save Changes"}
                          </Button>
                        </CardFooter>
                      </Card>
                    </TabsContent>
                    
                    {/* Password Tab */}
                    <TabsContent value="password">
                      <Card>
                        <CardHeader>
                          <CardTitle>Change Password</CardTitle>
                          <CardDescription>
                            Update your password to keep your account secure
                          </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                          <div className="grid gap-2">
                            <Label htmlFor="currentPassword">Current Password</Label>
                            <Input 
                              id="currentPassword" 
                              type="password" 
                              value={currentPassword}
                              onChange={(e) => setCurrentPassword(e.target.value)}
                            />
                          </div>
                          <div className="grid gap-2">
                            <Label htmlFor="newPassword">New Password</Label>
                            <Input 
                              id="newPassword" 
                              type="password" 
                              value={newPassword}
                              onChange={(e) => setNewPassword(e.target.value)}
                            />
                          </div>
                          <div className="grid gap-2">
                            <Label htmlFor="confirmPassword">Confirm New Password</Label>
                            <Input 
                              id="confirmPassword" 
                              type="password" 
                              value={confirmPassword}
                              onChange={(e) => setConfirmPassword(e.target.value)}
                            />
                          </div>
                        </CardContent>
                        <CardFooter>
                          <Button 
                            className="w-full" 
                            onClick={handlePasswordChange}
                            disabled={isUpdating}
                          >
                            {isUpdating ? "Updating..." : "Update Password"}
                          </Button>
                        </CardFooter>
                      </Card>
                      
                      <Card className="mt-6 border-destructive/20">
                        <CardHeader>
                          <CardTitle className="text-destructive">Danger Zone</CardTitle>
                          <CardDescription>
                            Irreversible and destructive actions
                          </CardDescription>
                        </CardHeader>
                        <CardContent>
                          <p className="text-sm text-muted-foreground mb-4">
                            Once you delete your account, there is no going back. Please be certain.
                          </p>
                          <Button 
                            variant="destructive" 
                            onClick={handleDeleteAccount}
                          >
                            Delete Account
                          </Button>
                        </CardContent>
                      </Card>
                    </TabsContent>
                    
                    {/* Notifications Tab */}
                    <TabsContent value="notifications">
                      <Card>
                        <CardHeader>
                          <CardTitle>Notification Preferences</CardTitle>
                          <CardDescription>
                            Choose how you want to be notified
                          </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-6">
                          <div className="flex items-center justify-between">
                            <div>
                              <h3 className="font-medium">Email Notifications</h3>
                              <p className="text-sm text-muted-foreground">Receive emails about new reports and updates</p>
                            </div>
                            <Switch defaultChecked />
                          </div>
                          
                          <div className="flex items-center justify-between">
                            <div>
                              <h3 className="font-medium">Daily Report Summaries</h3>
                              <p className="text-sm text-muted-foreground">Get a daily summary of student reports</p>
                            </div>
                            <Switch defaultChecked />
                          </div>
                          
                          <div className="flex items-center justify-between">
                            <div>
                              <h3 className="font-medium">Attendance Alerts</h3>
                              <p className="text-sm text-muted-foreground">Get notified when a student is marked absent</p>
                            </div>
                            <Switch defaultChecked />
                          </div>
                          
                          <div className="flex items-center justify-between">
                            <div>
                              <h3 className="font-medium">System Announcements</h3>
                              <p className="text-sm text-muted-foreground">Important updates about the SmartKid Manager system</p>
                            </div>
                            <Switch defaultChecked />
                          </div>
                        </CardContent>
                        <CardFooter>
                          <Button>Save Preferences</Button>
                        </CardFooter>
                      </Card>
                    </TabsContent>
                    
                    {/* Appearance Tab */}
                    <TabsContent value="appearance">
                      <Card>
                        <CardHeader>
                          <CardTitle>Appearance Settings</CardTitle>
                          <CardDescription>
                            Customize the look and feel of the application
                          </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-6">
                          <div className="space-y-2">
                            <h3 className="font-medium">Theme</h3>
                            <div className="flex items-center space-x-2">
                              <Button 
                                variant={theme === "light" ? "default" : "outline"} 
                                className="w-[120px]"
                                onClick={() => setTheme("light")}
                              >
                                <Sun className="h-5 w-5 mr-2" />
                                Light
                              </Button>
                              <Button 
                                variant={theme === "dark" ? "default" : "outline"} 
                                className="w-[120px]"
                                onClick={() => setTheme("dark")}
                              >
                                <Moon className="h-5 w-5 mr-2" />
                                Dark
                              </Button>
                              <Button 
                                variant={theme === "system" ? "default" : "outline"} 
                                className="w-[120px]"
                                onClick={() => setTheme("system")}
                              >
                                <span className="mr-2">🖥️</span>
                                System
                              </Button>
                            </div>
                          </div>
                          
                          <div className="space-y-2">
                            <h3 className="font-medium">Compact Mode</h3>
                            <div className="flex items-center space-x-2">
                              <Switch id="compact-mode" />
                              <Label htmlFor="compact-mode">Use compact view for tables and lists</Label>
                            </div>
                          </div>
                          
                          <div className="space-y-2">
                            <h3 className="font-medium">Font Size</h3>
                            <div className="grid grid-cols-3 gap-2">
                              <Button variant="outline" className="text-sm">Small</Button>
                              <Button variant="default" className="text-base">Medium</Button>
                              <Button variant="outline" className="text-lg">Large</Button>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    </TabsContent>
                  </Tabs>
                </div>
              </div>
            </main>
          </div>
        </div>
      </div>
    </>
  );
}
