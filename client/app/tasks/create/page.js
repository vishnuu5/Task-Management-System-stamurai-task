"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";
import { useTasks } from "@/contexts/TaskContext";
import DashboardLayout from "@/components/layouts/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
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
import { Switch } from "@/components/ui/switch";
import { format } from "date-fns";
import { CalendarIcon, Loader2, Clock, Repeat } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
import { cn } from "@/lib/utils";

export default function CreateTask() {
  const { isAuthenticated, loading } = useAuth();
  const { addTask } = useTasks();
  const router = useRouter();
  const { toast } = useToast();

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [dueDate, setDueDate] = useState(new Date());
  const [priority, setPriority] = useState("medium");
  const [status, setStatus] = useState("todo");
  const [assignee, setAssignee] = useState("");
  const [isRecurring, setIsRecurring] = useState(false);
  const [recurringPattern, setRecurringPattern] = useState("daily");
  const [users, setUsers] = useState([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoadingUsers, setIsLoadingUsers] = useState(true);
  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (!loading && !isAuthenticated) {
      router.push("/auth/login");
    }
  }, [isAuthenticated, loading, router]);

  useEffect(() => {
    if (isAuthenticated) {
      fetchUsers();
    }
  }, [isAuthenticated]);

  const fetchUsers = async () => {
    setIsLoadingUsers(true);
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
    } finally {
      setIsLoadingUsers(false);
    }
  };

  const validateForm = () => {
    const newErrors = {};

    if (!title.trim()) newErrors.title = "Title is required";
    if (!description.trim()) newErrors.description = "Description is required";
    if (!dueDate) newErrors.dueDate = "Due date is required";
    if (!priority) newErrors.priority = "Priority is required";
    if (!status) newErrors.status = "Status is required";
    if (isRecurring && !recurringPattern)
      newErrors.recurringPattern = "Recurring pattern is required";

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      toast({
        title: "Validation Error",
        description: "Please fix the errors in the form.",
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);

    try {
      const taskData = {
        title,
        description,
        dueDate,
        priority,
        status,
        assignedTo: assignee || undefined,
        isRecurring,
        recurringPattern: isRecurring ? recurringPattern : null,
      };

      await addTask(taskData);

      toast({
        title: "Success",
        description: "Task created successfully.",
      });

      router.push("/dashboard");
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to create task. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <DashboardLayout>
      <div className="p-4 sm:p-6">
        <div className="mb-6">
          <h1 className="text-2xl font-bold">Create New Task</h1>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <Label
                htmlFor="title"
                className={errors.title ? "text-destructive" : ""}
              >
                Task Title
              </Label>
              <Input
                id="title"
                placeholder="Enter task title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className={errors.title ? "border-destructive" : ""}
                required
              />
              {errors.title && (
                <p className="text-sm text-destructive">{errors.title}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label
                htmlFor="description"
                className={errors.description ? "text-destructive" : ""}
              >
                Description
              </Label>
              <Textarea
                id="description"
                placeholder="Enter task description"
                rows={4}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className={errors.description ? "border-destructive" : ""}
                required
              />
              {errors.description && (
                <p className="text-sm text-destructive">{errors.description}</p>
              )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label
                  htmlFor="dueDate"
                  className={errors.dueDate ? "text-destructive" : ""}
                >
                  Due Date
                </Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      id="dueDate"
                      variant="outline"
                      className={cn(
                        "w-full justify-start text-left font-normal",
                        !dueDate && "text-muted-foreground",
                        errors.dueDate && "border-destructive"
                      )}
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {dueDate ? format(dueDate, "PPP") : "Select a date"}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      mode="single"
                      selected={dueDate}
                      onSelect={setDueDate}
                      initialFocus
                      disabled={(date) =>
                        date < new Date(new Date().setHours(0, 0, 0, 0))
                      }
                      className="rounded-md border"
                    />
                    <div className="p-3 border-t border-border">
                      <div className="flex justify-between items-center">
                        <Label htmlFor="dueTime">Time</Label>
                        <div className="flex items-center space-x-2">
                          <Clock className="h-4 w-4 text-muted-foreground" />
                          <Input
                            id="dueTime"
                            type="time"
                            className="w-auto"
                            defaultValue="17:00"
                            onChange={(e) => {
                              if (dueDate && e.target.value) {
                                const [hours, minutes] = e.target.value
                                  .split(":")
                                  .map(Number);
                                const newDate = new Date(dueDate);
                                newDate.setHours(hours, minutes);
                                setDueDate(newDate);
                              }
                            }}
                          />
                        </div>
                      </div>
                    </div>
                  </PopoverContent>
                </Popover>
                {errors.dueDate && (
                  <p className="text-sm text-destructive">{errors.dueDate}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label
                  htmlFor="priority"
                  className={errors.priority ? "text-destructive" : ""}
                >
                  Priority
                </Label>
                <Select value={priority} onValueChange={setPriority}>
                  <SelectTrigger
                    id="priority"
                    className={errors.priority ? "border-destructive" : ""}
                  >
                    <SelectValue placeholder="Select priority" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="low">Low</SelectItem>
                    <SelectItem value="medium">Medium</SelectItem>
                    <SelectItem value="high">High</SelectItem>
                  </SelectContent>
                </Select>
                {errors.priority && (
                  <p className="text-sm text-destructive">{errors.priority}</p>
                )}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label
                  htmlFor="status"
                  className={errors.status ? "text-destructive" : ""}
                >
                  Status
                </Label>
                <Select value={status} onValueChange={setStatus}>
                  <SelectTrigger
                    id="status"
                    className={errors.status ? "border-destructive" : ""}
                  >
                    <SelectValue placeholder="Select status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="todo">To Do</SelectItem>
                    <SelectItem value="in-progress">In Progress</SelectItem>
                    <SelectItem value="review">Review</SelectItem>
                    <SelectItem value="completed">Completed</SelectItem>
                  </SelectContent>
                </Select>
                {errors.status && (
                  <p className="text-sm text-destructive">{errors.status}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="assignee">Assign To (Optional)</Label>
                <Select value={assignee} onValueChange={setAssignee}>
                  <SelectTrigger id="assignee">
                    <SelectValue placeholder="Select team member" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="unassigned">Unassigned</SelectItem>
                    {isLoadingUsers ? (
                      <SelectItem value="loading" disabled>
                        Loading users...
                      </SelectItem>
                    ) : (
                      users.map((user) => (
                        <SelectItem key={user._id} value={user._id}>
                          {user.name}
                        </SelectItem>
                      ))
                    )}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-4">
              <div className="flex items-center space-x-2">
                <Switch
                  id="isRecurring"
                  checked={isRecurring}
                  onCheckedChange={setIsRecurring}
                  className="data-[state=checked]:bg-primary data-[state=unchecked]:bg-input"
                />
                <Label
                  htmlFor="isRecurring"
                  className="flex items-center cursor-pointer"
                >
                  <Repeat className="h-4 w-4 mr-2 text-muted-foreground" />
                  Recurring Task
                </Label>
              </div>

              {isRecurring && (
                <div className="space-y-2 pl-6">
                  <Label
                    htmlFor="recurringPattern"
                    className={
                      errors.recurringPattern ? "text-destructive" : ""
                    }
                  >
                    Recurring Pattern
                  </Label>
                  <Select
                    value={recurringPattern}
                    onValueChange={setRecurringPattern}
                  >
                    <SelectTrigger
                      id="recurringPattern"
                      className={
                        errors.recurringPattern ? "border-destructive" : ""
                      }
                    >
                      <SelectValue placeholder="Select pattern" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="daily">Daily</SelectItem>
                      <SelectItem value="weekly">Weekly</SelectItem>
                      <SelectItem value="monthly">Monthly</SelectItem>
                    </SelectContent>
                  </Select>
                  {errors.recurringPattern && (
                    <p className="text-sm text-destructive">
                      {errors.recurringPattern}
                    </p>
                  )}
                </div>
              )}
            </div>

            <div className="flex justify-end space-x-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => router.push("/dashboard")}
                disabled={isSubmitting}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Creating...
                  </>
                ) : (
                  "Create Task"
                )}
              </Button>
            </div>
          </form>
        </div>
      </div>
    </DashboardLayout>
  );
}
