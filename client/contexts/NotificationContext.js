"use client";

import { createContext, useContext, useState, useEffect } from "react";
import { useAuth } from "./AuthContext";

const NotificationContext = createContext();

export function NotificationProvider({ children }) {
  const [notifications, setNotifications] = useState([]);
  const { isAuthenticated } = useAuth();

  useEffect(() => {
    if (isAuthenticated) {
      fetchNotifications();
      // Set up polling for new notifications
      const interval = setInterval(fetchNotifications, 30000); // Poll every 30 seconds

      return () => clearInterval(interval);
    }
  }, [isAuthenticated]);

  const fetchNotifications = async () => {
    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/notifications`,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );

      if (response.ok) {
        const data = await response.json();
        setNotifications(data);
      }
    } catch (error) {
      console.error("Failed to fetch notifications:", error);
    }
  };

  const markAsRead = async (notificationId) => {
    try {
      // Make API call to mark notification as read
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/notifications/${notificationId}/read`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );

      // Update local state immediately for better UX, even if the API call fails
      setNotifications((prevNotifications) =>
        prevNotifications.map((notification) =>
          notification._id === notificationId ||
          notification.id === notificationId
            ? { ...notification, read: true }
            : notification
        )
      );

      if (!response.ok) {
        console.warn(
          "API call to mark notification as read failed, but UI was updated"
        );
      }

      return true;
    } catch (error) {
      console.error("Error marking notification as read:", error);
      // Still update the UI even if the API call fails
      return true;
    }
  };

  const clearNotifications = async () => {
    try {
      // Update local state immediately for better UX
      setNotifications([]);

      // Make API call to clear all notifications
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/notifications/clear`,
        {
          method: "DELETE",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );

      if (!response.ok) {
        console.warn(
          "API call to clear notifications failed, but UI was updated"
        );
      }

      return true;
    } catch (error) {
      console.error("Error clearing notifications:", error);
      // We've already cleared the UI, so return true
      return true;
    }
  };

  const addNotification = (notification) => {
    setNotifications((prev) => [notification, ...prev]);
  };

  return (
    <NotificationContext.Provider
      value={{ notifications, markAsRead, clearNotifications, addNotification }}
    >
      {children}
    </NotificationContext.Provider>
  );
}

export function useNotification() {
  return useContext(NotificationContext);
}
