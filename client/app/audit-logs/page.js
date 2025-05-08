"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";
import DashboardLayout from "@/components/layouts/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { format } from "date-fns";
import { CalendarIcon, Loader2 } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
import { cn } from "@/lib/utils";
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";

export default function AuditLogsPage() {
  const { user, isAuthenticated, loading } = useAuth();
  const router = useRouter();
  const { toast } = useToast();

  const [auditLogs, setAuditLogs] = useState([]);
  const [users, setUsers] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [pagination, setPagination] = useState({
    total: 0,
    page: 1,
    limit: 20,
    pages: 1,
  });

  // Filters
  const [userFilter, setUserFilter] = useState("");
  const [actionFilter, setActionFilter] = useState("");
  const [entityTypeFilter, setEntityTypeFilter] = useState("");
  const [startDate, setStartDate] = useState(null);
  const [endDate, setEndDate] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    if (!loading && !isAuthenticated) {
      router.push("/auth/login");
    }
  }, [isAuthenticated, loading, router]);

  useEffect(() => {
    if (isAuthenticated) {
      // Check if user is admin
      if (user?.role !== "admin" && user?.role !== "manager") {
        toast({
          title: "Access Denied",
          description: "You don't have permission to view audit logs.",
          variant: "destructive",
        });
        router.push("/dashboard");
        return;
      }

      fetchUsers();
      fetchAuditLogs();
    }
  }, [isAuthenticated, user, pagination.page]);

  const fetchUsers = async () => {
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

  const fetchAuditLogs = async () => {
    setIsLoading(true);
    try {
      // Build query params
      const params = new URLSearchParams({
        page: pagination.page,
        limit: pagination.limit,
      });

      if (userFilter) params.append("user", userFilter);
      if (actionFilter) params.append("action", actionFilter);
      if (entityTypeFilter) params.append("entityType", entityTypeFilter);
      if (startDate) params.append("startDate", startDate.toISOString());
      if (endDate) params.append("endDate", endDate.toISOString());

      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/audit-logs?${params}`,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );

      if (!response.ok) {
        throw new Error("Failed to fetch audit logs");
      }

      const data = await response.json();
      setAuditLogs(data.auditLogs);
      setPagination(data.pagination);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to load audit logs. Please try again later.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleFilterChange = () => {
    setPagination({ ...pagination, page: 1 });
    fetchAuditLogs();
  };

  const handlePageChange = (page) => {
    setPagination({ ...pagination, page });
  };

  const getUserName = (userId) => {
    const user = users.find((u) => u._id === userId);
    return user ? user.name : "Unknown User";
  };

  const formatActionType = (action) => {
    return action
      .split("_")
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(" ");
  };

  const formatEntityType = (type) => {
    return type.charAt(0).toUpperCase() + type.slice(1);
  };

  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <DashboardLayout>
      <div className="p-4 sm:p-6">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
          <h1 className="text-2xl font-bold">Audit Logs</h1>
        </div>

        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Filters</CardTitle>
            <CardDescription>
              Filter audit logs by various criteria
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="userFilter">User</Label>
                <Select value={userFilter} onValueChange={setUserFilter}>
                  <SelectTrigger id="userFilter">
                    <SelectValue placeholder="All Users" />
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
              </div>

              <div className="space-y-2">
                <Label htmlFor="actionFilter">Action</Label>
                <Select value={actionFilter} onValueChange={setActionFilter}>
                  <SelectTrigger id="actionFilter">
                    <SelectValue placeholder="All Actions" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Actions</SelectItem>
                    <SelectItem value="create">Create</SelectItem>
                    <SelectItem value="update">Update</SelectItem>
                    <SelectItem value="delete">Delete</SelectItem>
                    <SelectItem value="assign">Assign</SelectItem>
                    <SelectItem value="status_change">Status Change</SelectItem>
                    <SelectItem value="login">Login</SelectItem>
                    <SelectItem value="logout">Logout</SelectItem>
                    <SelectItem value="register">Register</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="entityTypeFilter">Entity Type</Label>
                <Select
                  value={entityTypeFilter}
                  onValueChange={setEntityTypeFilter}
                >
                  <SelectTrigger id="entityTypeFilter">
                    <SelectValue placeholder="All Entities" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Entities</SelectItem>
                    <SelectItem value="task">Task</SelectItem>
                    <SelectItem value="user">User</SelectItem>
                    <SelectItem value="notification">Notification</SelectItem>
                    <SelectItem value="system">System</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Start Date</Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className={cn(
                        "w-full justify-start text-left font-normal",
                        !startDate && "text-muted-foreground"
                      )}
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {startDate ? format(startDate, "PPP") : "Select date"}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0">
                    <Calendar
                      mode="single"
                      selected={startDate}
                      onSelect={setStartDate}
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
              </div>

              <div className="space-y-2">
                <Label>End Date</Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className={cn(
                        "w-full justify-start text-left font-normal",
                        !endDate && "text-muted-foreground"
                      )}
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {endDate ? format(endDate, "PPP") : "Select date"}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0">
                    <Calendar
                      mode="single"
                      selected={endDate}
                      onSelect={setEndDate}
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
              </div>

              <div className="space-y-2 md:self-end">
                <Button onClick={handleFilterChange} className="w-full">
                  Apply Filters
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {isLoading ? (
          <div className="flex items-center justify-center h-64">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : (
          <>
            <Card>
              <CardContent className="p-0">
                <div className="rounded-md border">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Timestamp</TableHead>
                        <TableHead>User</TableHead>
                        <TableHead>Action</TableHead>
                        <TableHead>Entity Type</TableHead>
                        <TableHead>Details</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {auditLogs.length === 0 ? (
                        <TableRow>
                          <TableCell colSpan={5} className="text-center py-8">
                            No audit logs found
                          </TableCell>
                        </TableRow>
                      ) : (
                        auditLogs.map((log) => (
                          <TableRow key={log._id}>
                            <TableCell className="font-medium">
                              {format(
                                new Date(log.timestamp),
                                "MMM d, yyyy h:mm a"
                              )}
                            </TableCell>
                            <TableCell>{getUserName(log.user)}</TableCell>
                            <TableCell>
                              {formatActionType(log.action)}
                            </TableCell>
                            <TableCell>
                              {formatEntityType(log.entityType)}
                            </TableCell>
                            <TableCell className="max-w-xs truncate">
                              {log.details && log.details.method
                                ? `${log.details.method} ${log.details.path}`
                                : "No details available"}
                            </TableCell>
                          </TableRow>
                        ))
                      )}
                    </TableBody>
                  </Table>
                </div>
              </CardContent>
            </Card>

            {pagination.pages > 1 && (
              <div className="mt-4 flex justify-center">
                <Pagination>
                  <PaginationContent>
                    <PaginationItem>
                      <PaginationPrevious
                        onClick={() =>
                          handlePageChange(Math.max(1, pagination.page - 1))
                        }
                        disabled={pagination.page === 1}
                      />
                    </PaginationItem>

                    {Array.from(
                      { length: Math.min(5, pagination.pages) },
                      (_, i) => {
                        let pageNumber;
                        if (pagination.pages <= 5) {
                          pageNumber = i + 1;
                        } else if (pagination.page <= 3) {
                          pageNumber = i + 1;
                        } else if (pagination.page >= pagination.pages - 2) {
                          pageNumber = pagination.pages - 4 + i;
                        } else {
                          pageNumber = pagination.page - 2 + i;
                        }

                        return (
                          <PaginationItem key={pageNumber}>
                            <PaginationLink
                              isActive={pageNumber === pagination.page}
                              onClick={() => handlePageChange(pageNumber)}
                            >
                              {pageNumber}
                            </PaginationLink>
                          </PaginationItem>
                        );
                      }
                    )}

                    {pagination.pages > 5 &&
                      pagination.page < pagination.pages - 2 && (
                        <>
                          <PaginationItem>
                            <PaginationEllipsis />
                          </PaginationItem>
                          <PaginationItem>
                            <PaginationLink
                              onClick={() => handlePageChange(pagination.pages)}
                            >
                              {pagination.pages}
                            </PaginationLink>
                          </PaginationItem>
                        </>
                      )}

                    <PaginationItem>
                      <PaginationNext
                        onClick={() =>
                          handlePageChange(
                            Math.min(pagination.pages, pagination.page + 1)
                          )
                        }
                        disabled={pagination.page === pagination.pages}
                      />
                    </PaginationItem>
                  </PaginationContent>
                </Pagination>
              </div>
            )}
          </>
        )}
      </div>
    </DashboardLayout>
  );
}
