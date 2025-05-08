"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { format } from "date-fns";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useToast } from "@/components/ui/use-toast";
import { Calendar, Clock, Edit, MoreHorizontal, Trash2 } from "lucide-react";

export default function TaskCard({ task, onUpdate }) {
  const router = useRouter();
  const { toast } = useToast();
  const [isDeleting, setIsDeleting] = useState(false);

  const getPriorityColor = (priority) => {
    switch (priority) {
      case "high":
        return "bg-red-100 text-red-800";
      case "medium":
        return "bg-yellow-100 text-yellow-800";
      case "low":
        return "bg-green-100 text-green-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "todo":
        return "bg-gray-100 text-gray-800";
      case "in-progress":
        return "bg-blue-100 text-blue-800";
      case "review":
        return "bg-purple-100 text-purple-800";
      case "completed":
        return "bg-green-100 text-green-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const isOverdue = () => {
    const today = new Date();
    const dueDate = new Date(task.dueDate);
    return dueDate < today && task.status !== "completed";
  };

  const handleDelete = async () => {
    setIsDeleting(true);
    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/tasks/${task._id}`,
        {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );

      if (!response.ok) {
        throw new Error("Failed to delete task");
      }

      toast({
        title: "Success",
        description: "Task deleted successfully.",
      });

      if (onUpdate) {
        onUpdate();
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to delete task. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsDeleting(false);
    }
  };

  const handleStatusChange = async (newStatus) => {
    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/tasks/${task._id}`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
          body: JSON.stringify({ status: newStatus }),
        }
      );

      if (!response.ok) {
        throw new Error("Failed to update task status");
      }

      toast({
        title: "Success",
        description: "Task status updated successfully.",
      });

      if (onUpdate) {
        onUpdate();
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update task status. Please try again.",
        variant: "destructive",
      });
    }
  };

  return (
    <Card className={`overflow-hidden ${isOverdue() ? "border-red-300" : ""}`}>
      <CardHeader className="pb-2">
        <div className="flex justify-between items-start">
          <CardTitle className="text-lg font-semibold line-clamp-1">
            {task.title}
          </CardTitle>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="-mr-2">
                <MoreHorizontal className="h-5 w-5" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem
                onClick={() => router.push(`/tasks/${task._id}`)}
              >
                <Edit className="mr-2 h-4 w-4" />
                Edit
              </DropdownMenuItem>
              <DropdownMenuItem
                className="text-destructive focus:text-destructive"
                onClick={handleDelete}
                disabled={isDeleting}
              >
                <Trash2 className="mr-2 h-4 w-4" />
                Delete
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
        <div className="flex flex-wrap gap-2 mt-1">
          <Badge
            variant="secondary"
            className={getPriorityColor(task.priority)}
          >
            {task.priority.charAt(0).toUpperCase() + task.priority.slice(1)}
          </Badge>
          <Badge variant="secondary" className={getStatusColor(task.status)}>
            {task.status
              .replace(/-/g, " ")
              .replace(/\b\w/g, (l) => l.toUpperCase())}
          </Badge>
          {isOverdue() && (
            <Badge variant="secondary" className="bg-red-100 text-red-800">
              Overdue
            </Badge>
          )}
        </div>
      </CardHeader>
      <CardContent className="pb-2">
        <p className="text-sm text-gray-600 line-clamp-2">{task.description}</p>
        <div className="flex items-center mt-3 text-sm text-gray-500">
          <Calendar className="h-4 w-4 mr-1" />
          <span>Due: {format(new Date(task.dueDate), "MMM d, yyyy")}</span>
        </div>
        {task.assignedTo && task.assignedUser && (
          <div className="flex items-center mt-2">
            <Avatar className="h-6 w-6 mr-2">
              <AvatarImage
                src={task.assignedUser.avatar || "/placeholder.svg"}
                alt={task.assignedUser.name}
              />
              <AvatarFallback>
                {task.assignedUser.name
                  .split(" ")
                  .map((n) => n[0])
                  .join("")
                  .toUpperCase()}
              </AvatarFallback>
            </Avatar>
            <span className="text-sm">{task.assignedUser.name}</span>
          </div>
        )}
      </CardContent>
      <CardFooter className="pt-2 flex justify-between">
        <div className="flex items-center text-xs text-gray-500">
          <Clock className="h-3 w-3 mr-1" />
          <span>
            Updated {format(new Date(task.updatedAt), "MMM d, h:mm a")}
          </span>
        </div>
        <Link href={`/tasks/${task._id}`}>
          <Button variant="ghost" size="sm" className="h-8">
            View
          </Button>
        </Link>
      </CardFooter>
    </Card>
  );
}
