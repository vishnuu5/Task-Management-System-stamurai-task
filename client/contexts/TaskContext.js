"use client";

import { createContext, useContext, useState, useEffect } from "react";
import { useAuth } from "./AuthContext";
import { useSocket } from "./SocketContext";

const TaskContext = createContext();

export function TaskProvider({ children }) {
  const [tasks, setTasks] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const { isAuthenticated } = useAuth();
  const { socket, isConnected } = useSocket();

  useEffect(() => {
    if (isAuthenticated) {
      fetchTasks();
    }
  }, [isAuthenticated]);

  useEffect(() => {
    if (isConnected && socket) {
      // Listen for task updates
      socket.on("taskUpdate", (updatedTask) => {
        setTasks((prevTasks) => {
          const taskIndex = prevTasks.findIndex(
            (task) => task._id === updatedTask._id
          );
          if (taskIndex !== -1) {
            // Update existing task
            const newTasks = [...prevTasks];
            newTasks[taskIndex] = updatedTask;
            return newTasks;
          } else {
            // Add new task
            return [...prevTasks, updatedTask];
          }
        });
      });

      // Listen for task deletions
      socket.on("taskDelete", (taskId) => {
        setTasks((prevTasks) =>
          prevTasks.filter((task) => task._id !== taskId)
        );
      });

      // Clean up listeners on unmount
      return () => {
        socket.off("taskUpdate");
        socket.off("taskDelete");
      };
    }
  }, [isConnected, socket]);

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
      console.error("Failed to fetch tasks:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const addTask = async (taskData) => {
    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/tasks`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
          body: JSON.stringify(taskData),
        }
      );

      if (!response.ok) {
        throw new Error("Failed to create task");
      }

      const newTask = await response.json();

      // Update local state immediately
      setTasks((prevTasks) => [...prevTasks, newTask]);

      return newTask;
    } catch (error) {
      console.error("Failed to add task:", error);
      throw error;
    }
  };

  const updateTask = async (taskId, taskData) => {
    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/tasks/${taskId}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
          body: JSON.stringify(taskData),
        }
      );

      if (!response.ok) {
        throw new Error("Failed to update task");
      }

      const updatedTask = await response.json();

      // Update local state immediately
      setTasks((prevTasks) =>
        prevTasks.map((task) => (task._id === taskId ? updatedTask : task))
      );

      return updatedTask;
    } catch (error) {
      console.error("Failed to update task:", error);
      throw error;
    }
  };

  const deleteTask = async (taskId) => {
    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/tasks/${taskId}`,
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

      // Update local state immediately
      setTasks((prevTasks) => prevTasks.filter((task) => task._id !== taskId));

      return true;
    } catch (error) {
      console.error("Failed to delete task:", error);
      throw error;
    }
  };

  return (
    <TaskContext.Provider
      value={{
        tasks,
        isLoading,
        fetchTasks,
        addTask,
        updateTask,
        deleteTask,
      }}
    >
      {children}
    </TaskContext.Provider>
  );
}

export function useTasks() {
  return useContext(TaskContext);
}
