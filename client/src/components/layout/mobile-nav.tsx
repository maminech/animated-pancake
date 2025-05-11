import { Link, useLocation } from "wouter";
import { Home, UserRound, FileText, CalendarCheck, Menu } from "lucide-react";
import { useAuth } from "@/hooks/use-auth";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { getInitials } from "@/lib/utils";
import { Button } from "@/components/ui/button";

interface NavItem {
  name: string;
  path: string;
  icon: React.ReactNode;
  roles: string[];
}

export function MobileNav() {
  const [location] = useLocation();
  const { user, logout } = useAuth();

  const navItems: NavItem[] = [
    {
      name: "Home",
      path: "/",
      icon: <Home className="h-5 w-5" />,
      roles: ["parent", "teacher", "director"]
    },
    {
      name: "Students",
      path: "/students",
      icon: <UserRound className="h-5 w-5" />,
      roles: ["parent", "teacher", "director"]
    },
    {
      name: "Reports",
      path: "/reports",
      icon: <FileText className="h-5 w-5" />,
      roles: ["parent", "teacher", "director"]
    },
    {
      name: "Attendance",
      path: "/attendance",
      icon: <CalendarCheck className="h-5 w-5" />,
      roles: ["teacher", "director"]
    }
  ];

  // Filter nav items based on user role
  const filteredItems = navItems.filter(
    item => !user?.role || item.roles.includes(user.role)
  );

  return (
    <>
      {/* Top Mobile Header */}
      <div className="relative z-10 flex-shrink-0 flex h-16 bg-white shadow md:hidden">
        <div className="flex-1 px-4 flex justify-between">
          <div className="flex-1 flex items-center">
            <h1 className="text-xl font-bold text-primary font-nunito">SmartKid Manager</h1>
          </div>
          <div className="flex items-center">
            <Sheet>
              <SheetTrigger asChild>
                <button className="rounded-full p-2">
                  <Avatar className="h-8 w-8">
                    <AvatarImage 
                      src={user?.profileImage} 
                      alt={user ? `${user.firstName} ${user.lastName}` : "User profile"}
                    />
                    <AvatarFallback>
                      {user ? getInitials(user.firstName, user.lastName) : "U"}
                    </AvatarFallback>
                  </Avatar>
                </button>
              </SheetTrigger>
              <SheetContent>
                <SheetHeader>
                  <SheetTitle>
                    <div className="flex items-center">
                      <Avatar className="h-10 w-10 mr-2">
                        <AvatarImage 
                          src={user?.profileImage} 
                          alt={user ? `${user.firstName} ${user.lastName}` : "User profile"}
                        />
                        <AvatarFallback>
                          {user ? getInitials(user.firstName, user.lastName) : "U"}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="text-sm font-medium">
                          {user ? `${user.firstName} ${user.lastName}` : "Loading..."}
                        </p>
                        <p className="text-xs text-muted-foreground capitalize">
                          {user?.role || "Loading..."}
                        </p>
                      </div>
                    </div>
                  </SheetTitle>
                </SheetHeader>
                <div className="mt-6 flex flex-col space-y-2">
                  <Link href="/messages" className="flex items-center py-2 px-3 text-sm hover:bg-muted rounded-md">
                    <MessageCircle className="h-5 w-5 mr-3" />
                    Messages
                  </Link>
                  <Link href="/settings" className="flex items-center py-2 px-3 text-sm hover:bg-muted rounded-md">
                    <Settings className="h-5 w-5 mr-3" />
                    Settings
                  </Link>
                  <div className="pt-4 mt-4 border-t">
                    <Button 
                      variant="destructive" 
                      className="w-full justify-start" 
                      onClick={() => logout()}
                    >
                      <LogOut className="h-5 w-5 mr-3" />
                      Logout
                    </Button>
                  </div>
                </div>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </div>

      {/* Bottom Mobile Navigation */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 bg-white shadow-[0_-1px_3px_rgba(0,0,0,0.1)] flex justify-around z-10">
        {filteredItems.map((item) => (
          <Link 
            key={item.path}
            href={item.path}
            className={`${
              location === item.path
                ? "active-mobile-nav-item"
                : "text-gray-500"
            } py-4 flex flex-col items-center w-1/5`}
          >
            {item.icon}
            <span className="text-xs mt-1">{item.name}</span>
          </Link>
        ))}
        <Sheet>
          <SheetTrigger asChild>
            <button className="text-gray-500 py-4 flex flex-col items-center w-1/5">
              <Menu className="h-5 w-5" />
              <span className="text-xs mt-1">More</span>
            </button>
          </SheetTrigger>
          <SheetContent side="bottom" className="h-[85vh]">
            <div className="grid grid-cols-3 gap-4 py-6">
              <Link 
                href="/messages" 
                className="flex flex-col items-center justify-center p-4 rounded-md hover:bg-muted"
              >
                <MessageCircle className="h-8 w-8 mb-2 text-primary" />
                <span className="text-sm">Messages</span>
              </Link>
              <Link 
                href="/settings" 
                className="flex flex-col items-center justify-center p-4 rounded-md hover:bg-muted"
              >
                <Settings className="h-8 w-8 mb-2 text-primary" />
                <span className="text-sm">Settings</span>
              </Link>
              <button 
                onClick={() => logout()}
                className="flex flex-col items-center justify-center p-4 rounded-md hover:bg-muted"
              >
                <LogOut className="h-8 w-8 mb-2 text-destructive" />
                <span className="text-sm">Logout</span>
              </button>
            </div>
          </SheetContent>
        </Sheet>
      </div>
    </>
  );
}

// Import these at the top of the file
import { MessageCircle, Settings, LogOut } from "lucide-react";
