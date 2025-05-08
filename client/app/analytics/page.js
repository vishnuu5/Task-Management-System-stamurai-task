"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";
import DashboardLayout from "@/components/layouts/DashboardLayout";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { format, subDays } from "date-fns";
import { CalendarIcon, Loader2 } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
import { cn } from "@/lib/utils";
import TaskCompletionChart from "@/components/analytics/TaskCompletionChart";
import UserPerformanceChart from "@/components/analytics/UserPerformanceChart";
import OverdueTrendChart from "@/components/analytics/OverdueTrendChart";
import PriorityDistributionChart from "@/components/analytics/PriorityDistributionChart";
import TaskCreationTrendChart from "@/components/analytics/TaskCreationTrendChart";

export default function AnalyticsPage() {
  const { user, isAuthenticated, loading } = useAuth();
  const router = useRouter();
  const { toast } = useToast();

  const [startDate, setStartDate] = useState(subDays(new Date(), 30));
  const [endDate, setEndDate] = useState(new Date());
  const [selectedUser, setSelectedUser] = useState("");
  const [users, setUsers] = useState([]);
  const [isAdmin, setIsAdmin] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // Analytics data states
  const [taskCompletionData, setTaskCompletionData] = useState(null);
  const [userPerformanceData, setUserPerformanceData] = useState(null);
  const [overdueTrendData, setOverdueTrendData] = useState(null);
  const [priorityDistributionData, setPriorityDistributionData] =
    useState(null);
  const [taskCreationTrendData, setTaskCreationTrendData] = useState(null);

  useEffect(() => {
    if (!loading && !isAuthenticated) {
      router.push("/auth/login");
    }
  }, [isAuthenticated, loading, router]);

  useEffect(() => {
    if (isAuthenticated) {
      setIsAdmin(user?.role === "admin" || user?.role === "manager");
      fetchUsers();
      fetchAnalyticsData();
    }
  }, [isAuthenticated, user]);

  const fetchUsers = async () => {
    if (user?.role !== "admin" && user?.role !== "manager") return;

    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/users`,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );

      if (!response.ok) {
        throw new Error("Failed to fetch users");
      }

      const data = await response.json();
      setUsers(data);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to load users. Please try again later.",
        variant: "destructive",
      });
    }
  };

  const fetchAnalyticsData = async () => {
    setIsLoading(true);
    try {
      await Promise.all([
        fetchTaskCompletionData(),
        fetchUserPerformanceData(),
        fetchOverdueTrendData(),
        fetchPriorityDistributionData(),
        fetchTaskCreationTrendData(),
      ]);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to load analytics data. Please try again later.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const fetchTaskCompletionData = async () => {
    try {
      const params = new URLSearchParams({
        startDate: startDate.toISOString(),
        endDate: endDate.toISOString(),
      });

      if (selectedUser) {
        params.append("userId", selectedUser);
      }

      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/analytics/task-completion?${params}`,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );

      if (!response.ok) {
        throw new Error("Failed to fetch task completion data");
      }

      const data = await response.json();
      setTaskCompletionData(data);
    } catch (error) {
      console.error("Failed to fetch task completion data:", error);
    }
  };

  const fetchUserPerformanceData = async () => {
    if (user?.role !== "admin" && user?.role !== "manager") return;

    try {
      const params = new URLSearchParams({
        startDate: startDate.toISOString(),
        endDate: endDate.toISOString(),
      });

      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/analytics/task-completion-by-user?${params}`,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );

      if (!response.ok) {
        throw new Error("Failed to fetch user performance data");
      }

      const data = await response.json();
      setUserPerformanceData(data);
    } catch (error) {
      console.error("Failed to fetch user performance data:", error);
    }
  };

  const fetchOverdueTrendData = async () => {
    try {
      const params = new URLSearchParams({
        days: "30",
      });

      if (selectedUser) {
        params.append("userId", selectedUser);
      }

      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/analytics/overdue-trend?${params}`,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );

      if (!response.ok) {
        throw new Error("Failed to fetch overdue trend data");
      }

      const data = await response.json();
      setOverdueTrendData(data);
    } catch (error) {
      console.error("Failed to fetch overdue trend data:", error);
    }
  };

  const fetchPriorityDistributionData = async () => {
    try {
      const params = new URLSearchParams();

      if (selectedUser) {
        params.append("userId", selectedUser);
      }

      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/analytics/priority-distribution?${params}`,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );

      if (!response.ok) {
        throw new Error("Failed to fetch priority distribution data");
      }

      const data = await response.json();
      setPriorityDistributionData(data);
    } catch (error) {
      console.error("Failed to fetch priority distribution data:", error);
    }
  };

  const fetchTaskCreationTrendData = async () => {
    if (user?.role !== "admin" && user?.role !== "manager") return;

    try {
      const params = new URLSearchParams({
        days: "30",
      });

      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/analytics/task-creation-trend?${params}`,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );

      if (!response.ok) {
        throw new Error("Failed to fetch task creation trend data");
      }

      const data = await response.json();
      setTaskCreationTrendData(data);
    } catch (error) {
      console.error("Failed to fetch task creation trend data:", error);
    }
  };

  const handleDateRangeChange = () => {
    fetchAnalyticsData();
  };

  const handleUserChange = (userId) => {
    setSelectedUser(userId);
    fetchAnalyticsData();
  };

  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <DashboardLayout>
      <div className="p-4 sm:p-6">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
          <h1 className="text-2xl font-bold">Analytics Dashboard</h1>
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex items-center gap-2">
              <div className="grid gap-2">
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className={cn(
                        "w-[240px] justify-start text-left font-normal"
                      )}
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {format(startDate, "PPP")} - {format(endDate, "PPP")}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="end">
                    <div className="flex">
                      <div className="p-2 border-r">
                        <div className="px-3 py-2 text-sm font-medium">
                          Start Date
                        </div>
                        <Calendar
                          mode="single"
                          selected={startDate}
                          onSelect={setStartDate}
                          initialFocus
                        />
                      </div>
                      <div className="p-2">
                        <div className="px-3 py-2 text-sm font-medium">
                          End Date
                        </div>
                        <Calendar
                          mode="single"
                          selected={endDate}
                          onSelect={setEndDate}
                          initialFocus
                        />
                      </div>
                    </div>
                    <div className="p-2 border-t flex justify-end">
                      <Button size="sm" onClick={handleDateRangeChange}>
                        Apply
                      </Button>
                    </div>
                  </PopoverContent>
                </Popover>
              </div>
            </div>
            {isAdmin && (
              <Select value={selectedUser} onValueChange={handleUserChange}>
                <SelectTrigger className="w-[200px]">
                  <SelectValue placeholder="Filter by user" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Users</SelectItem>
                  {users.map((user) => (
                    <SelectItem key={user._id} value={user._id}>
                      {user.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
          </div>
        </div>

        {isLoading ? (
          <div className="flex items-center justify-center h-64">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : (
          <Tabs defaultValue="overview">
            <TabsList className="mb-6">
              <TabsTrigger value="overview">Overview</TabsTrigger>
              {isAdmin && (
                <TabsTrigger value="users">User Performance</TabsTrigger>
              )}
              <TabsTrigger value="trends">Trends</TabsTrigger>
            </TabsList>

            <TabsContent value="overview">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Task Completion</CardTitle>
                    <CardDescription>
                      Task completion status distribution
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    {taskCompletionData ? (
                      <TaskCompletionChart data={taskCompletionData} />
                    ) : (
                      <div className="flex items-center justify-center h-64">
                        <p className="text-muted-foreground">
                          No data available
                        </p>
                      </div>
                    )}
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Priority Distribution</CardTitle>
                    <CardDescription>
                      Distribution of tasks by priority
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    {priorityDistributionData ? (
                      <PriorityDistributionChart
                        data={priorityDistributionData}
                      />
                    ) : (
                      <div className="flex items-center justify-center h-64">
                        <p className="text-muted-foreground">
                          No data available
                        </p>
                      </div>
                    )}
                  </CardContent>
                </Card>

                <Card className="md:col-span-2">
                  <CardHeader>
                    <CardTitle>Overdue Tasks Trend</CardTitle>
                    <CardDescription>
                      Trend of overdue tasks over time
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    {overdueTrendData ? (
                      <OverdueTrendChart data={overdueTrendData} />
                    ) : (
                      <div className="flex items-center justify-center h-64">
                        <p className="text-muted-foreground">
                          No data available
                        </p>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            {isAdmin && (
              <TabsContent value="users">
                <Card>
                  <CardHeader>
                    <CardTitle>User Performance</CardTitle>
                    <CardDescription>
                      Task completion rates by user
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    {userPerformanceData ? (
                      <UserPerformanceChart data={userPerformanceData} />
                    ) : (
                      <div className="flex items-center justify-center h-64">
                        <p className="text-muted-foreground">
                          No data available
                        </p>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>
            )}

            <TabsContent value="trends">
              <Card>
                <CardHeader>
                  <CardTitle>Task Creation Trend</CardTitle>
                  <CardDescription>
                    Number of tasks created over time
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {taskCreationTrendData ? (
                    <TaskCreationTrendChart data={taskCreationTrendData} />
                  ) : (
                    <div className="flex items-center justify-center h-64">
                      <p className="text-muted-foreground">No data available</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        )}
      </div>
    </DashboardLayout>
  );
}
