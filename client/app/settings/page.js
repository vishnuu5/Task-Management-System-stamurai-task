"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";
import DashboardLayout from "@/components/layouts/DashboardLayout";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { useToast } from "@/components/ui/use-toast";
import {
  Loader2,
  Bell,
  Moon,
  Sun,
  Monitor,
  Palette,
  Layout,
  Eye,
  Mail,
  ToggleLeft,
} from "lucide-react";

export default function SettingsPage() {
  const { user, isAuthenticated, loading, updateUserData } = useAuth();
  const router = useRouter();
  const { toast } = useToast();

  const [preferences, setPreferences] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [errors, setErrors] = useState({});

  // Profile state
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  useEffect(() => {
    if (!loading && !isAuthenticated) {
      router.push("/auth/login");
    }
  }, [isAuthenticated, loading, router]);

  useEffect(() => {
    if (isAuthenticated) {
      fetchPreferences();
      if (user) {
        setName(user.name || "");
        setEmail(user.email || "");
      }
    }
  }, [isAuthenticated, user]);

  const fetchPreferences = async () => {
    setIsLoading(true);
    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/preferences`,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );

      if (!response.ok) {
        throw new Error("Failed to fetch preferences");
      }

      const data = await response.json();
      setPreferences(data);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to load preferences. Please try again later.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const validateProfileForm = () => {
    const newErrors = {};

    if (!name.trim()) newErrors.name = "Name is required";
    if (!email.trim()) newErrors.email = "Email is required";
    if (!/^\S+@\S+\.\S+$/.test(email)) newErrors.email = "Invalid email format";

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const validatePasswordForm = () => {
    const newErrors = {};

    if (!currentPassword)
      newErrors.currentPassword = "Current password is required";
    if (!newPassword) newErrors.newPassword = "New password is required";
    if (newPassword && newPassword.length < 6)
      newErrors.newPassword = "Password must be at least 6 characters";
    if (!confirmPassword)
      newErrors.confirmPassword = "Please confirm your new password";
    if (newPassword !== confirmPassword)
      newErrors.confirmPassword = "Passwords don't match";

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const savePreferences = async () => {
    setIsSaving(true);
    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/preferences`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
          body: JSON.stringify(preferences),
        }
      );

      if (!response.ok) {
        throw new Error("Failed to save preferences");
      }

      const updatedPreferences = await response.json();
      setPreferences(updatedPreferences);

      // Apply theme changes if needed
      applyThemeChanges(updatedPreferences.theme);

      toast({
        title: "Success",
        description: "Preferences saved successfully.",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to save preferences. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSaving(false);
    }
  };

  const resetPreferences = async () => {
    setIsSaving(true);
    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/preferences/reset`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );

      if (!response.ok) {
        throw new Error("Failed to reset preferences");
      }

      const data = await response.json();
      setPreferences(data);

      // Apply theme changes
      applyThemeChanges(data.theme);

      toast({
        title: "Success",
        description: "Preferences reset to default.",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to reset preferences. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSaving(false);
    }
  };

  const updateProfile = async () => {
    if (!validateProfileForm()) {
      return;
    }

    setIsSaving(true);
    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/auth/profile`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
          body: JSON.stringify({ name, email }),
        }
      );

      if (!response.ok) {
        throw new Error("Failed to update profile");
      }

      const updatedUser = await response.json();

      // Update the user data in the auth context
      updateUserData({
        ...user,
        name,
        email,
      });

      toast({
        title: "Success",
        description: "Profile updated successfully.",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update profile. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSaving(false);
    }
  };

  const changePassword = async () => {
    if (!validatePasswordForm()) {
      return;
    }

    setIsSaving(true);
    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/auth/change-password`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
          body: JSON.stringify({ currentPassword, newPassword }),
        }
      );

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.message || "Failed to change password");
      }

      toast({
        title: "Success",
        description: "Password changed successfully.",
      });

      // Clear password fields
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
      setErrors({});
    } catch (error) {
      toast({
        title: "Error",
        description:
          error.message ||
          "Failed to change password. Please check your current password and try again.",
        variant: "destructive",
      });
    } finally {
      setIsSaving(false);
    }
  };

  const handleNotificationChange = (type, channel, value) => {
    setPreferences({
      ...preferences,
      notifications: {
        ...preferences.notifications,
        [channel]: {
          ...preferences.notifications[channel],
          [type]: value,
        },
      },
    });
  };

  const handleThemeChange = (type, value) => {
    setPreferences({
      ...preferences,
      theme: {
        ...preferences.theme,
        [type]: value,
      },
    });

    // Apply theme changes immediately for preview
    if (type === "mode") {
      applyThemeMode(value);
    }
  };

  const applyThemeChanges = (theme) => {
    // Apply theme mode
    applyThemeMode(theme.mode);

    // Apply accent color (would require CSS variables or a theme system)
    document.documentElement.style.setProperty("--accent-color", theme.color);
  };

  const applyThemeMode = (mode) => {
    const root = window.document.documentElement;

    if (mode === "system") {
      const systemPreference = window.matchMedia("(prefers-color-scheme: dark)")
        .matches
        ? "dark"
        : "light";
      root.classList.toggle("dark", systemPreference === "dark");
    } else {
      root.classList.toggle("dark", mode === "dark");
    }
  };

  const handleDashboardChange = (type, value) => {
    setPreferences({
      ...preferences,
      dashboard: {
        ...preferences.dashboard,
        [type]: value,
      },
    });
  };

  if (loading || isLoading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-full p-8">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="p-4 sm:p-6">
        <div className="mb-6">
          <h1 className="text-2xl font-bold">Settings</h1>
        </div>

        <Tabs defaultValue="profile">
          <TabsList className="mb-6">
            <TabsTrigger value="profile">Profile</TabsTrigger>
            <TabsTrigger value="notifications">Notifications</TabsTrigger>
            <TabsTrigger value="appearance">Appearance</TabsTrigger>
            <TabsTrigger value="dashboard">Dashboard</TabsTrigger>
          </TabsList>

          <TabsContent value="profile">
            <div className="grid gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Profile Information</CardTitle>
                  <CardDescription>
                    Update your account profile information
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label
                      htmlFor="name"
                      className={errors.name ? "text-destructive" : ""}
                    >
                      Name
                    </Label>
                    <Input
                      id="name"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      className={errors.name ? "border-destructive" : ""}
                    />
                    {errors.name && (
                      <p className="text-sm text-destructive">{errors.name}</p>
                    )}
                  </div>
                  <div className="space-y-2">
                    <Label
                      htmlFor="email"
                      className={errors.email ? "text-destructive" : ""}
                    >
                      Email
                    </Label>
                    <Input
                      id="email"
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className={errors.email ? "border-destructive" : ""}
                    />
                    {errors.email && (
                      <p className="text-sm text-destructive">{errors.email}</p>
                    )}
                  </div>
                </CardContent>
                <CardFooter>
                  <Button onClick={updateProfile} disabled={isSaving}>
                    {isSaving ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Saving...
                      </>
                    ) : (
                      "Save Changes"
                    )}
                  </Button>
                </CardFooter>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Change Password</CardTitle>
                  <CardDescription>Update your password</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label
                      htmlFor="currentPassword"
                      className={
                        errors.currentPassword ? "text-destructive" : ""
                      }
                    >
                      Current Password
                    </Label>
                    <Input
                      id="currentPassword"
                      type="password"
                      value={currentPassword}
                      onChange={(e) => setCurrentPassword(e.target.value)}
                      className={
                        errors.currentPassword ? "border-destructive" : ""
                      }
                    />
                    {errors.currentPassword && (
                      <p className="text-sm text-destructive">
                        {errors.currentPassword}
                      </p>
                    )}
                  </div>
                  <div className="space-y-2">
                    <Label
                      htmlFor="newPassword"
                      className={errors.newPassword ? "text-destructive" : ""}
                    >
                      New Password
                    </Label>
                    <Input
                      id="newPassword"
                      type="password"
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      className={errors.newPassword ? "border-destructive" : ""}
                    />
                    {errors.newPassword && (
                      <p className="text-sm text-destructive">
                        {errors.newPassword}
                      </p>
                    )}
                  </div>
                  <div className="space-y-2">
                    <Label
                      htmlFor="confirmPassword"
                      className={
                        errors.confirmPassword ? "text-destructive" : ""
                      }
                    >
                      Confirm New Password
                    </Label>
                    <Input
                      id="confirmPassword"
                      type="password"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      className={
                        errors.confirmPassword ? "border-destructive" : ""
                      }
                    />
                    {errors.confirmPassword && (
                      <p className="text-sm text-destructive">
                        {errors.confirmPassword}
                      </p>
                    )}
                  </div>
                </CardContent>
                <CardFooter>
                  <Button onClick={changePassword} disabled={isSaving}>
                    {isSaving ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Changing...
                      </>
                    ) : (
                      "Change Password"
                    )}
                  </Button>
                </CardFooter>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="notifications">
            {preferences && (
              <Card>
                <CardHeader>
                  <CardTitle>Notification Preferences</CardTitle>
                  <CardDescription>
                    Manage how you receive notifications
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div>
                    <h3 className="text-lg font-medium mb-4">
                      In-App Notifications
                    </h3>
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-2">
                          <Bell className="h-4 w-4 text-muted-foreground" />
                          <Label htmlFor="inAppEnabled">
                            Enable in-app notifications
                          </Label>
                        </div>
                        <Switch
                          id="inAppEnabled"
                          checked={preferences.notifications.inApp.enabled}
                          onCheckedChange={(value) =>
                            handleNotificationChange("enabled", "inApp", value)
                          }
                          className="data-[state=checked]:bg-primary data-[state=unchecked]:bg-input"
                        />
                      </div>
                      <Separator />
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-2">
                          <ToggleLeft className="h-4 w-4 text-muted-foreground" />
                          <Label htmlFor="inAppTaskAssigned">
                            Task assignments
                          </Label>
                        </div>
                        <Switch
                          id="inAppTaskAssigned"
                          checked={preferences.notifications.inApp.taskAssigned}
                          onCheckedChange={(value) =>
                            handleNotificationChange(
                              "taskAssigned",
                              "inApp",
                              value
                            )
                          }
                          disabled={!preferences.notifications.inApp.enabled}
                          className="data-[state=checked]:bg-primary data-[state=unchecked]:bg-input"
                        />
                      </div>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-2">
                          <ToggleLeft className="h-4 w-4 text-muted-foreground" />
                          <Label htmlFor="inAppTaskUpdated">Task updates</Label>
                        </div>
                        <Switch
                          id="inAppTaskUpdated"
                          checked={preferences.notifications.inApp.taskUpdated}
                          onCheckedChange={(value) =>
                            handleNotificationChange(
                              "taskUpdated",
                              "inApp",
                              value
                            )
                          }
                          disabled={!preferences.notifications.inApp.enabled}
                          className="data-[state=checked]:bg-primary data-[state=unchecked]:bg-input"
                        />
                      </div>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-2">
                          <ToggleLeft className="h-4 w-4 text-muted-foreground" />
                          <Label htmlFor="inAppTaskCompleted">
                            Task completions
                          </Label>
                        </div>
                        <Switch
                          id="inAppTaskCompleted"
                          checked={
                            preferences.notifications.inApp.taskCompleted
                          }
                          onCheckedChange={(value) =>
                            handleNotificationChange(
                              "taskCompleted",
                              "inApp",
                              value
                            )
                          }
                          disabled={!preferences.notifications.inApp.enabled}
                          className="data-[state=checked]:bg-primary data-[state=unchecked]:bg-input"
                        />
                      </div>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-2">
                          <ToggleLeft className="h-4 w-4 text-muted-foreground" />
                          <Label htmlFor="inAppTaskOverdue">
                            Overdue tasks
                          </Label>
                        </div>
                        <Switch
                          id="inAppTaskOverdue"
                          checked={preferences.notifications.inApp.taskOverdue}
                          onCheckedChange={(value) =>
                            handleNotificationChange(
                              "taskOverdue",
                              "inApp",
                              value
                            )
                          }
                          disabled={!preferences.notifications.inApp.enabled}
                          className="data-[state=checked]:bg-primary data-[state=unchecked]:bg-input"
                        />
                      </div>
                    </div>
                  </div>

                  <div>
                    <h3 className="text-lg font-medium mb-4">
                      Email Notifications
                    </h3>
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-2">
                          <Mail className="h-4 w-4 text-muted-foreground" />
                          <Label htmlFor="emailEnabled">
                            Enable email notifications
                          </Label>
                        </div>
                        <Switch
                          id="emailEnabled"
                          checked={preferences.notifications.email.enabled}
                          onCheckedChange={(value) =>
                            handleNotificationChange("enabled", "email", value)
                          }
                          className="data-[state=checked]:bg-primary data-[state=unchecked]:bg-input"
                        />
                      </div>
                      <Separator />
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-2">
                          <ToggleLeft className="h-4 w-4 text-muted-foreground" />
                          <Label htmlFor="emailTaskAssigned">
                            Task assignments
                          </Label>
                        </div>
                        <Switch
                          id="emailTaskAssigned"
                          checked={preferences.notifications.email.taskAssigned}
                          onCheckedChange={(value) =>
                            handleNotificationChange(
                              "taskAssigned",
                              "email",
                              value
                            )
                          }
                          disabled={!preferences.notifications.email.enabled}
                          className="data-[state=checked]:bg-primary data-[state=unchecked]:bg-input"
                        />
                      </div>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-2">
                          <ToggleLeft className="h-4 w-4 text-muted-foreground" />
                          <Label htmlFor="emailTaskUpdated">Task updates</Label>
                        </div>
                        <Switch
                          id="emailTaskUpdated"
                          checked={preferences.notifications.email.taskUpdated}
                          onCheckedChange={(value) =>
                            handleNotificationChange(
                              "taskUpdated",
                              "email",
                              value
                            )
                          }
                          disabled={!preferences.notifications.email.enabled}
                          className="data-[state=checked]:bg-primary data-[state=unchecked]:bg-input"
                        />
                      </div>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-2">
                          <ToggleLeft className="h-4 w-4 text-muted-foreground" />
                          <Label htmlFor="emailTaskCompleted">
                            Task completions
                          </Label>
                        </div>
                        <Switch
                          id="emailTaskCompleted"
                          checked={
                            preferences.notifications.email.taskCompleted
                          }
                          onCheckedChange={(value) =>
                            handleNotificationChange(
                              "taskCompleted",
                              "email",
                              value
                            )
                          }
                          disabled={!preferences.notifications.email.enabled}
                          className="data-[state=checked]:bg-primary data-[state=unchecked]:bg-input"
                        />
                      </div>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-2">
                          <ToggleLeft className="h-4 w-4 text-muted-foreground" />
                          <Label htmlFor="emailTaskOverdue">
                            Overdue tasks
                          </Label>
                        </div>
                        <Switch
                          id="emailTaskOverdue"
                          checked={preferences.notifications.email.taskOverdue}
                          onCheckedChange={(value) =>
                            handleNotificationChange(
                              "taskOverdue",
                              "email",
                              value
                            )
                          }
                          disabled={!preferences.notifications.email.enabled}
                          className="data-[state=checked]:bg-primary data-[state=unchecked]:bg-input"
                        />
                      </div>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-2">
                          <ToggleLeft className="h-4 w-4 text-muted-foreground" />
                          <Label htmlFor="emailDailyDigest">Daily digest</Label>
                        </div>
                        <Switch
                          id="emailDailyDigest"
                          checked={preferences.notifications.email.dailyDigest}
                          onCheckedChange={(value) =>
                            handleNotificationChange(
                              "dailyDigest",
                              "email",
                              value
                            )
                          }
                          disabled={!preferences.notifications.email.enabled}
                          className="data-[state=checked]:bg-primary data-[state=unchecked]:bg-input"
                        />
                      </div>
                    </div>
                  </div>

                  <div>
                    <h3 className="text-lg font-medium mb-4">
                      Real-Time Notifications
                    </h3>
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-2">
                          <Bell className="h-4 w-4 text-muted-foreground" />
                          <Label htmlFor="realTimeEnabled">
                            Enable real-time notifications
                          </Label>
                        </div>
                        <Switch
                          id="realTimeEnabled"
                          checked={preferences.notifications.realTime.enabled}
                          onCheckedChange={(value) =>
                            handleNotificationChange(
                              "enabled",
                              "realTime",
                              value
                            )
                          }
                          className="data-[state=checked]:bg-primary data-[state=unchecked]:bg-input"
                        />
                      </div>
                    </div>
                  </div>
                </CardContent>
                <CardFooter className="flex justify-between">
                  <Button
                    variant="outline"
                    onClick={resetPreferences}
                    disabled={isSaving}
                  >
                    Reset to Default
                  </Button>
                  <Button onClick={savePreferences} disabled={isSaving}>
                    {isSaving ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Saving...
                      </>
                    ) : (
                      "Save Changes"
                    )}
                  </Button>
                </CardFooter>
              </Card>
            )}
          </TabsContent>

          <TabsContent value="appearance">
            {preferences && (
              <Card>
                <CardHeader>
                  <CardTitle>Appearance Settings</CardTitle>
                  <CardDescription>
                    Customize the look and feel of the application
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label
                        htmlFor="themeMode"
                        className="flex items-center space-x-2"
                      >
                        <div className="flex space-x-2">
                          <Sun className="h-4 w-4 text-muted-foreground" />
                          <Moon className="h-4 w-4 text-muted-foreground" />
                        </div>
                        <span>Theme Mode</span>
                      </Label>
                      <Select
                        value={preferences.theme.mode}
                        onValueChange={(value) =>
                          handleThemeChange("mode", value)
                        }
                      >
                        <SelectTrigger id="themeMode">
                          <SelectValue placeholder="Select theme mode" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="light">
                            <div className="flex items-center">
                              <Sun className="mr-2 h-4 w-4" />
                              Light
                            </div>
                          </SelectItem>
                          <SelectItem value="dark">
                            <div className="flex items-center">
                              <Moon className="mr-2 h-4 w-4" />
                              Dark
                            </div>
                          </SelectItem>
                          <SelectItem value="system">
                            <div className="flex items-center">
                              <Monitor className="mr-2 h-4 w-4" />
                              System
                            </div>
                          </SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <Label
                        htmlFor="themeColor"
                        className="flex items-center space-x-2"
                      >
                        <Palette className="h-4 w-4 text-muted-foreground" />
                        <span>Accent Color</span>
                      </Label>
                      <Select
                        value={preferences.theme.color}
                        onValueChange={(value) =>
                          handleThemeChange("color", value)
                        }
                      >
                        <SelectTrigger id="themeColor">
                          <SelectValue placeholder="Select accent color" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="blue">
                            <div className="flex items-center">
                              <div className="mr-2 h-4 w-4 rounded-full bg-blue-500" />
                              Blue
                            </div>
                          </SelectItem>
                          <SelectItem value="green">
                            <div className="flex items-center">
                              <div className="mr-2 h-4 w-4 rounded-full bg-green-500" />
                              Green
                            </div>
                          </SelectItem>
                          <SelectItem value="purple">
                            <div className="flex items-center">
                              <div className="mr-2 h-4 w-4 rounded-full bg-purple-500" />
                              Purple
                            </div>
                          </SelectItem>
                          <SelectItem value="red">
                            <div className="flex items-center">
                              <div className="mr-2 h-4 w-4 rounded-full bg-red-500" />
                              Red
                            </div>
                          </SelectItem>
                          <SelectItem value="orange">
                            <div className="flex items-center">
                              <div className="mr-2 h-4 w-4 rounded-full bg-orange-500" />
                              Orange
                            </div>
                          </SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </CardContent>
                <CardFooter className="flex justify-between">
                  <Button
                    variant="outline"
                    onClick={resetPreferences}
                    disabled={isSaving}
                  >
                    Reset to Default
                  </Button>
                  <Button onClick={savePreferences} disabled={isSaving}>
                    {isSaving ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Saving...
                      </>
                    ) : (
                      "Save Changes"
                    )}
                  </Button>
                </CardFooter>
              </Card>
            )}
          </TabsContent>

          <TabsContent value="dashboard">
            {preferences && (
              <Card>
                <CardHeader>
                  <CardTitle>Dashboard Settings</CardTitle>
                  <CardDescription>
                    Customize your dashboard experience
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label
                        htmlFor="defaultView"
                        className="flex items-center space-x-2"
                      >
                        <Layout className="h-4 w-4 text-muted-foreground" />
                        <span>Default View</span>
                      </Label>
                      <Select
                        value={preferences.dashboard.defaultView}
                        onValueChange={(value) =>
                          handleDashboardChange("defaultView", value)
                        }
                      >
                        <SelectTrigger id="defaultView">
                          <SelectValue placeholder="Select default view" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all">All Tasks</SelectItem>
                          <SelectItem value="assigned">
                            Assigned to Me
                          </SelectItem>
                          <SelectItem value="created">Created by Me</SelectItem>
                          <SelectItem value="overdue">Overdue</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <Eye className="h-4 w-4 text-muted-foreground" />
                        <Label htmlFor="showCompletedTasks">
                          Show completed tasks
                        </Label>
                      </div>
                      <Switch
                        id="showCompletedTasks"
                        checked={preferences.dashboard.showCompletedTasks}
                        onCheckedChange={(value) =>
                          handleDashboardChange("showCompletedTasks", value)
                        }
                        className="data-[state=checked]:bg-primary data-[state=unchecked]:bg-input"
                      />
                    </div>
                  </div>
                </CardContent>
                <CardFooter className="flex justify-between">
                  <Button
                    variant="outline"
                    onClick={resetPreferences}
                    disabled={isSaving}
                  >
                    Reset to Default
                  </Button>
                  <Button onClick={savePreferences} disabled={isSaving}>
                    {isSaving ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Saving...
                      </>
                    ) : (
                      "Save Changes"
                    )}
                  </Button>
                </CardFooter>
              </Card>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  );
}
