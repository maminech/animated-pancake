import { useState } from "react";
import { Link, useLocation } from "wouter";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useAuth } from "@/hooks/use-auth";
import { getInitials } from "@/lib/utils";
import {
  Home,
  UserRound,
  FileText,
  CalendarCheck,
  MessageCircle,
  Settings,
  LogOut
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface NavItem {
  name: string;
  path: string;
  icon: React.ReactNode;
  roles: string[];
}

export function Sidebar() {
  const [location] = useLocation();
  const { user, logout } = useAuth();
  const { toast } = useToast();

  const navItems: NavItem[] = [
    {
      name: "Dashboard",
      path: "/",
      icon: <Home className="h-5 w-5 mr-3" />,
      roles: ["parent", "teacher", "director"]
    },
    {
      name: "Students",
      path: "/students",
      icon: <UserRound className="h-5 w-5 mr-3" />,
      roles: ["parent", "teacher", "director"]
    },
    {
      name: "Reports",
      path: "/reports",
      icon: <FileText className="h-5 w-5 mr-3" />,
      roles: ["parent", "teacher", "director"]
    },
    {
      name: "Attendance",
      path: "/attendance",
      icon: <CalendarCheck className="h-5 w-5 mr-3" />,
      roles: ["teacher", "director"]
    },
    {
      name: "Messages",
      path: "/messages",
      icon: <MessageCircle className="h-5 w-5 mr-3" />,
      roles: ["parent", "teacher", "director"]
    },
    {
      name: "Settings",
      path: "/settings",
      icon: <Settings className="h-5 w-5 mr-3" />,
      roles: ["parent", "teacher", "director"]
    }
  ];

  const handleLogout = () => {
    logout();
  };

  return (
    <div className="hidden md:flex md:flex-shrink-0">
      <div className="flex flex-col w-64 bg-white shadow">
        <div className="flex flex-col h-0 flex-1">
          <div className="flex items-center h-16 flex-shrink-0 px-4 bg-primary">
            <h1 className="text-xl font-bold text-white font-nunito">SmartKid Manager</h1>
          </div>
          <div className="flex-1 flex flex-col overflow-y-auto">
            {/* User profile section */}
            <div className="px-4 py-6 border-b border-border">
              <div className="flex items-center">
                <Avatar className="h-12 w-12">
                  <AvatarImage 
                    src={user?.profileImage} 
                    alt={user ? `${user.firstName} ${user.lastName}` : "User profile"}
                  />
                  <AvatarFallback>
                    {user ? getInitials(user.firstName, user.lastName) : "U"}
                  </AvatarFallback>
                </Avatar>
                <div className="ml-3">
                  <p className="text-sm font-medium text-foreground">
                    {user ? `${user.firstName} ${user.lastName}` : "Loading..."}
                  </p>
                  <p className="text-xs text-muted-foreground capitalize">
                    {user?.role || "Loading..."}
                  </p>
                </div>
              </div>
            </div>
            
            {/* Navigation Links */}
            <nav className="px-2 py-4 space-y-1">
              {navItems
                .filter(item => !user?.role || item.roles.includes(user.role))
                .map((item) => (
                  <Link
                    key={item.path}
                    href={item.path}
                    className={`${
                      location === item.path
                        ? "active-nav-item text-primary"
                        : "text-foreground hover:bg-gray-50 hover:text-primary"
                    } px-3 py-2 rounded-md text-sm font-medium flex items-center`}
                  >
                    {item.icon}
                    <span>{item.name}</span>
                  </Link>
                ))}
            </nav>
          </div>
          {/* Logout button */}
          <div className="border-t border-border p-4">
            <button
              onClick={handleLogout}
              className="flex items-center text-foreground hover:text-destructive group w-full"
            >
              <LogOut className="h-5 w-5 mr-3" />
              <span>Logout</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
