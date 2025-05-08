"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";
import { useNotification } from "@/contexts/NotificationContext";
import DashboardLayout from "@/components/layouts/DashboardLayout";
import TaskCard from "@/components/tasks/TaskCard";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/components/ui/use-toast";
import { Plus, Search, AlertCircle } from "lucide-react";
import Link from "next/link";

export default function Dashboard() {
  const { user, isAuthenticated, loading } = useAuth();
  const { notifications } = useNotification();
  const router = useRouter();
  const { toast } = useToast();

  const [tasks, setTasks] = useState([]);
  const [filteredTasks, setFilteredTasks] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [priorityFilter, setPriorityFilter] = useState("all");
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!loading && !isAuthenticated) {
      router.push("/auth/login");
    }
  }, [isAuthenticated, loading, router]);

  useEffect(() => {
    if (isAuthenticated) {
      fetchTasks();
    }
  }, [isAuthenticated]);

  useEffect(() => {
    filterTasks();
  }, [tasks, searchQuery, statusFilter, priorityFilter]);

  const fetchTasks = async () => {
    setIsLoading(true);
    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/tasks`,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );

      if (!response.ok) {
        throw new Error("Failed to fetch tasks");
      }

      const data = await response.json();
      setTasks(data);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to load tasks. Please try again later.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const filterTasks = () => {
    let filtered = [...tasks];

    // Search filter
    if (searchQuery) {
      filtered = filtered.filter(
        (task) =>
          task.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
          task.description.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    // Status filter
    if (statusFilter !== "all") {
      filtered = filtered.filter((task) => task.status === statusFilter);
    }

    // Priority filter
    if (priorityFilter !== "all") {
      filtered = filtered.filter((task) => task.priority === priorityFilter);
    }

    setFilteredTasks(filtered);
  };

  const getAssignedTasks = () => {
    return filteredTasks.filter((task) => task.assignedTo === user?._id);
  };

  const getCreatedTasks = () => {
    return filteredTasks.filter((task) => task.createdBy === user?._id);
  };

  const getOverdueTasks = () => {
    const today = new Date();
    return filteredTasks.filter((task) => {
      const dueDate = new Date(task.dueDate);
      return dueDate < today && task.status !== "completed";
    });
  };

  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <DashboardLayout>
      <div className="p-4 sm:p-6">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
          <h1 className="text-2xl font-bold">Dashboard</h1>
          <Link href="/tasks/create">
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Create Task
            </Button>
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <div className="bg-white p-4 rounded-lg shadow">
            <h2 className="font-semibold text-gray-500 mb-1">Assigned to me</h2>
            <p className="text-3xl font-bold">{getAssignedTasks().length}</p>
          </div>
          <div className="bg-white p-4 rounded-lg shadow">
            <h2 className="font-semibold text-gray-500 mb-1">Created by me</h2>
            <p className="text-3xl font-bold">{getCreatedTasks().length}</p>
          </div>
          <div className="bg-white p-4 rounded-lg shadow">
            <h2 className="font-semibold text-gray-500 mb-1">Overdue</h2>
            <p className="text-3xl font-bold text-red-500">
              {getOverdueTasks().length}
            </p>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow mb-6">
          <div className="p-4 border-b">
            <h2 className="text-lg font-semibold">Filter Tasks</h2>
          </div>
          <div className="p-4 grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <div className="relative">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-500" />
                <Input
                  placeholder="Search tasks..."
                  className="pl-8"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger>
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Statuses</SelectItem>
                <SelectItem value="todo">To Do</SelectItem>
                <SelectItem value="in-progress">In Progress</SelectItem>
                <SelectItem value="review">Review</SelectItem>
                <SelectItem value="completed">Completed</SelectItem>
              </SelectContent>
            </Select>
            <Select value={priorityFilter} onValueChange={setPriorityFilter}>
              <SelectTrigger>
                <SelectValue placeholder="Filter by priority" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Priorities</SelectItem>
                <SelectItem value="low">Low</SelectItem>
                <SelectItem value="medium">Medium</SelectItem>
                <SelectItem value="high">High</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <Tabs defaultValue="all">
          <TabsList className="mb-4">
            <TabsTrigger value="all">All Tasks</TabsTrigger>
            <TabsTrigger value="assigned">Assigned to Me</TabsTrigger>
            <TabsTrigger value="created">Created by Me</TabsTrigger>
            <TabsTrigger value="overdue">Overdue</TabsTrigger>
          </TabsList>

          <TabsContent value="all">
            {isLoading ? (
              <div className="text-center py-8">Loading tasks...</div>
            ) : filteredTasks.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {filteredTasks.map((task) => (
                  <TaskCard key={task._id} task={task} onUpdate={fetchTasks} />
                ))}
              </div>
            ) : (
              <div className="text-center py-8 bg-gray-50 rounded-lg">
                <AlertCircle className="mx-auto h-12 w-12 text-gray-400" />
                <h3 className="mt-2 text-lg font-medium">No tasks found</h3>
                <p className="mt-1 text-gray-500">
                  Try adjusting your search or filter criteria.
                </p>
              </div>
            )}
          </TabsContent>

          <TabsContent value="assigned">
            {getAssignedTasks().length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {getAssignedTasks().map((task) => (
                  <TaskCard key={task._id} task={task} onUpdate={fetchTasks} />
                ))}
              </div>
            ) : (
              <div className="text-center py-8 bg-gray-50 rounded-lg">
                <AlertCircle className="mx-auto h-12 w-12 text-gray-400" />
                <h3 className="mt-2 text-lg font-medium">
                  No tasks assigned to you
                </h3>
                <p className="mt-1 text-gray-500">
                  Tasks assigned to you will appear here.
                </p>
              </div>
            )}
          </TabsContent>

          <TabsContent value="created">
            {getCreatedTasks().length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {getCreatedTasks().map((task) => (
                  <TaskCard key={task._id} task={task} onUpdate={fetchTasks} />
                ))}
              </div>
            ) : (
              <div className="text-center py-8 bg-gray-50 rounded-lg">
                <AlertCircle className="mx-auto h-12 w-12 text-gray-400" />
                <h3 className="mt-2 text-lg font-medium">
                  No tasks created by you
                </h3>
                <p className="mt-1 text-gray-500">
                  Tasks you create will appear here.
                </p>
              </div>
            )}
          </TabsContent>

          <TabsContent value="overdue">
            {getOverdueTasks().length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {getOverdueTasks().map((task) => (
                  <TaskCard key={task._id} task={task} onUpdate={fetchTasks} />
                ))}
              </div>
            ) : (
              <div className="text-center py-8 bg-gray-50 rounded-lg">
                <AlertCircle className="mx-auto h-12 w-12 text-gray-400" />
                <h3 className="mt-2 text-lg font-medium">No overdue tasks</h3>
                <p className="mt-1 text-gray-500">You're all caught up!</p>
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  );
}
