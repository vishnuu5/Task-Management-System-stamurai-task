"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";
import { useNotification } from "@/contexts/NotificationContext";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Sheet, SheetContent } from "@/components/ui/sheet";
import {
  Bell,
  CheckCircle,
  ChevronDown,
  Home,
  LogOut,
  Menu,
  Settings,
  User,
  Users,
  X,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/components/ui/use-toast";

export default function DashboardLayout({ children }) {
  const { user, logout } = useAuth();
  const { notifications, markAsRead, clearNotifications } = useNotification();
  const pathname = usePathname();
  const router = useRouter();
  const { toast } = useToast();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);

  const navigation = [
    { name: "Dashboard", href: "/dashboard", icon: Home },
    { name: "Tasks", href: "/tasks", icon: CheckCircle },
    { name: "Team", href: "/team", icon: Users },
    { name: "Settings", href: "/settings", icon: Settings },
  ];

  const userInitials = user?.name
    ? user.name
        .split(" ")
        .map((n) => n[0])
        .join("")
        .toUpperCase()
    : "U";

  const unreadNotifications = notifications.filter((n) => !n.read).length;

  const handleProfileClick = () => {
    router.push("/profile");
  };

  const handleSettingsClick = () => {
    router.push("/settings");
  };

  const handleMarkAsRead = async (notificationId, e) => {
    if (e) {
      e.stopPropagation();
    }

    if (isProcessing) return;

    try {
      setIsProcessing(true);
      await markAsRead(notificationId);
      toast({
        title: "Success",
        description: "Notification marked as read.",
      });
    } catch (error) {
      console.error("Error marking notification as read:", error);
      toast({
        title: "Note",
        description: "Notification marked as read locally.",
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const handleClearNotifications = async (e) => {
    if (e) {
      e.stopPropagation();
    }

    if (isProcessing) return;

    try {
      setIsProcessing(true);
      await clearNotifications();
      toast({
        title: "Success",
        description: "All notifications cleared.",
      });
    } catch (error) {
      console.error("Error clearing notifications:", error);
      toast({
        title: "Note",
        description: "Notifications cleared locally.",
      });
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="flex h-screen bg-gray-100">
      {/* Sidebar for desktop */}
      <div className="hidden md:flex md:w-64 md:flex-col md:fixed md:inset-y-0">
        <div className="flex flex-col flex-1 min-h-0 bg-white border-r border-gray-200">
          <div className="flex items-center h-16 flex-shrink-0 px-4 border-b border-gray-200">
            <Link href="/dashboard" className="text-xl font-bold text-primary">
              TaskManager
            </Link>
          </div>
          <div className="flex-1 flex flex-col overflow-y-auto pt-5 pb-4">
            <nav className="mt-5 flex-1 px-2 space-y-1">
              {navigation.map((item) => (
                <Link
                  key={item.name}
                  href={item.href}
                  className={`${
                    pathname === item.href ||
                    pathname.startsWith(`${item.href}/`)
                      ? "bg-primary text-white"
                      : "text-gray-600 hover:bg-gray-50"
                  } group flex items-center px-2 py-2 text-sm font-medium rounded-md`}
                >
                  <item.icon
                    className={`${
                      pathname === item.href ||
                      pathname.startsWith(`${item.href}/`)
                        ? "text-white"
                        : "text-gray-400 group-hover:text-gray-500"
                    } mr-3 flex-shrink-0 h-5 w-5`}
                  />
                  {item.name}
                </Link>
              ))}
            </nav>
          </div>
        </div>
      </div>

      {/* Mobile menu */}
      <Sheet open={isMobileMenuOpen} onOpenChange={setIsMobileMenuOpen}>
        <SheetContent side="left" className="p-0">
          <div className="flex items-center h-16 flex-shrink-0 px-4 border-b border-gray-200">
            <Link href="/dashboard" className="text-xl font-bold text-primary">
              TaskManager
            </Link>
          </div>
          <nav className="mt-5 px-2 space-y-1">
            {navigation.map((item) => (
              <Link
                key={item.name}
                href={item.href}
                className={`${
                  pathname === item.href || pathname.startsWith(`${item.href}/`)
                    ? "bg-primary text-white"
                    : "text-gray-600 hover:bg-gray-50"
                } group flex items-center px-2 py-2 text-base font-medium rounded-md`}
                onClick={() => setIsMobileMenuOpen(false)}
              >
                <item.icon
                  className={`${
                    pathname === item.href ||
                    pathname.startsWith(`${item.href}/`)
                      ? "text-white"
                      : "text-gray-400 group-hover:text-gray-500"
                  } mr-3 flex-shrink-0 h-5 w-5`}
                />
                {item.name}
              </Link>
            ))}
          </nav>
        </SheetContent>
      </Sheet>

      <div className="md:pl-64 flex flex-col flex-1">
        <div className="sticky top-0 z-10 flex-shrink-0 h-16 bg-white border-b border-gray-200 flex">
          <button
            type="button"
            className="md:hidden px-4 text-gray-500 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-primary"
            onClick={() => setIsMobileMenuOpen(true)}
          >
            <span className="sr-only">Open sidebar</span>
            <Menu className="h-6 w-6" />
          </button>

          <div className="flex-1 flex justify-end px-4">
            <div className="ml-4 flex items-center md:ml-6 space-x-4">
              {/* Notifications dropdown */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon" className="relative">
                    <Bell className="h-5 w-5" />
                    {unreadNotifications > 0 && (
                      <span className="absolute top-0 right-0 block h-2 w-2 rounded-full bg-red-500 ring-2 ring-white" />
                    )}
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-80">
                  <DropdownMenuLabel className="flex justify-between items-center">
                    <span>Notifications</span>
                    {notifications.length > 0 && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={handleClearNotifications}
                        className="h-auto py-1 px-2 text-xs"
                        disabled={isProcessing}
                      >
                        Clear all
                      </Button>
                    )}
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  {notifications.length === 0 ? (
                    <div className="py-4 text-center text-sm text-gray-500">
                      No notifications
                    </div>
                  ) : (
                    <div className="max-h-80 overflow-y-auto">
                      {notifications.map((notification) => (
                        <DropdownMenuItem
                          key={notification._id || notification.id}
                          className="flex flex-col items-start p-3 cursor-default"
                          onSelect={(e) => e.preventDefault()}
                        >
                          <div className="flex justify-between w-full">
                            <span className="font-medium">
                              {notification.title}
                            </span>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-5 w-5"
                              onClick={(e) =>
                                handleMarkAsRead(
                                  notification._id || notification.id,
                                  e
                                )
                              }
                              disabled={isProcessing}
                            >
                              <X className="h-3 w-3" />
                            </Button>
                          </div>
                          <span className="text-sm text-gray-500">
                            {notification.message}
                          </span>
                          <div className="flex justify-between w-full mt-1">
                            <span className="text-xs text-gray-400">
                              {new Date(
                                notification.timestamp
                              ).toLocaleString()}
                            </span>
                            {!notification.read && (
                              <Badge variant="secondary" className="text-xs">
                                New
                              </Badge>
                            )}
                          </div>
                        </DropdownMenuItem>
                      ))}
                    </div>
                  )}
                </DropdownMenuContent>
              </DropdownMenu>

              {/* Profile dropdown */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="flex items-center">
                    <Avatar className="h-8 w-8">
                      <AvatarImage
                        src={user?.avatar || "/placeholder.svg"}
                        alt={user?.name}
                      />
                      <AvatarFallback>{userInitials}</AvatarFallback>
                    </Avatar>
                    <span className="ml-2 text-sm font-medium text-gray-700 hidden md:block">
                      {user?.name}
                    </span>
                    <ChevronDown className="ml-1 h-4 w-4 text-gray-400" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuLabel>My Account</DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={handleProfileClick}>
                    <User className="mr-2 h-4 w-4" />
                    <span>Profile</span>
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={handleSettingsClick}>
                    <Settings className="mr-2 h-4 w-4" />
                    <span>Settings</span>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={logout}>
                    <LogOut className="mr-2 h-4 w-4" />
                    <span>Logout</span>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        </div>

        <main className="flex-1 overflow-y-auto">{children}</main>
      </div>
    </div>
  );
}
