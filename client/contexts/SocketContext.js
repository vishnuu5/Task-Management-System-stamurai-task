"use client";

import { createContext, useContext, useEffect, useState } from "react";
import { io } from "socket.io-client";
import { useAuth } from "./AuthContext";
import { useNotification } from "./NotificationContext";
import { useToast } from "@/components/ui/use-toast";

const SocketContext = createContext();

export function SocketProvider({ children }) {
  const [socket, setSocket] = useState(null);
  const [isConnected, setIsConnected] = useState(false);
  const { isAuthenticated, user } = useAuth();
  const { addNotification } = useNotification();
  const { toast } = useToast();

  useEffect(() => {
    if (isAuthenticated) {
      // Initialize socket connection
      const socketInstance = io(process.env.NEXT_PUBLIC_API_URL, {
        auth: {
          token: localStorage.getItem("token"),
        },
      });

      // Set up event listeners
      socketInstance.on("connect", () => {
        console.log("Socket connected");
        setIsConnected(true);
      });

      socketInstance.on("disconnect", () => {
        console.log("Socket disconnected");
        setIsConnected(false);
      });

      socketInstance.on("connect_error", (error) => {
        console.error("Socket connection error:", error);
        setIsConnected(false);
      });

      // Handle notifications
      socketInstance.on("notification", (notification) => {
        addNotification(notification);

        toast({
          title: notification.title,
          description: notification.message,
        });
      });

      // Handle task assignments
      socketInstance.on("taskAssigned", (task) => {
        toast({
          title: "New Task Assigned",
          description: `You have been assigned to the task: ${task.title}`,
        });
      });

      // Handle task updates
      socketInstance.on("taskUpdate", (task) => {
        // Only show toast if the task is relevant to the user
        if (task.assignedTo === user?._id || task.createdBy === user?._id) {
          toast({
            title: "Task Updated",
            description: `The task "${task.title}" has been updated.`,
          });
        }
      });

      setSocket(socketInstance);

      // Clean up on unmount
      return () => {
        socketInstance.disconnect();
      };
    }
  }, [isAuthenticated, user]);

  return (
    <SocketContext.Provider value={{ socket, isConnected }}>
      {children}
    </SocketContext.Provider>
  );
}

export function useSocket() {
  return useContext(SocketContext);
}
