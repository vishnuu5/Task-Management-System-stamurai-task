import { Inter } from "next/font/google";
import "./globals.css";
import { AuthProvider } from "@/contexts/AuthContext";
import { NotificationProvider } from "@/contexts/NotificationContext";
import { SocketProvider } from "@/contexts/SocketContext";
import { TaskProvider } from "@/contexts/TaskContext";
import { Toaster } from "@/components/ui/sonner";

const inter = Inter({ subsets: ["latin"] });

export const metadata = {
  title: "Task Management System",
  description: "A task management system for small teams",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <AuthProvider>
          <NotificationProvider>
            <SocketProvider>
              <TaskProvider>
                {children}
                <Toaster />
              </TaskProvider>
            </SocketProvider>
          </NotificationProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
