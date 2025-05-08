import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function Home() {
  return (
    <div className="flex flex-col min-h-screen">
      <header className="bg-white border-b border-gray-200">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <h1 className="text-2xl font-bold text-gray-900">
            Task Management System
          </h1>
          <div className="flex gap-4">
            <Link href="/auth/login">
              <Button variant="outline">Login</Button>
            </Link>
            <Link href="/auth/register">
              <Button>Register</Button>
            </Link>
          </div>
        </div>
      </header>

      <main className="flex-1 bg-gray-50">
        <div className="container mx-auto px-4 py-16">
          <div className="max-w-3xl mx-auto text-center">
            <h2 className="text-4xl font-bold text-gray-900 mb-6">
              Manage your team's tasks efficiently
            </h2>
            <p className="text-xl text-gray-600 mb-8">
              Create, assign, and track tasks with ease. Boost your team's
              productivity with our intuitive task management system.
            </p>
            <div className="flex justify-center gap-4">
              <Link href="/auth/register">
                <Button size="lg">Get Started</Button>
              </Link>
              <Link href="/auth/login">
                <Button size="lg" variant="outline">
                  Login
                </Button>
              </Link>
            </div>
          </div>

          <div className="mt-16 grid md:grid-cols-3 gap-8">
            <div className="bg-white p-6 rounded-lg shadow-md">
              <h3 className="text-xl font-semibold mb-3">Task Management</h3>
              <p className="text-gray-600">
                Create, update, and delete tasks with ease. Set priorities, due
                dates, and track progress.
              </p>
            </div>
            <div className="bg-white p-6 rounded-lg shadow-md">
              <h3 className="text-xl font-semibold mb-3">Team Collaboration</h3>
              <p className="text-gray-600">
                Assign tasks to team members and get notified when tasks are
                updated or completed.
              </p>
            </div>
            <div className="bg-white p-6 rounded-lg shadow-md">
              <h3 className="text-xl font-semibold mb-3">
                Intuitive Dashboard
              </h3>
              <p className="text-gray-600">
                Get a clear overview of all your tasks, including assigned,
                created, and overdue tasks.
              </p>
            </div>
          </div>
        </div>
      </main>

      <footer className="bg-white border-t border-gray-200 py-6">
        <div className="container mx-auto px-4 text-center text-gray-600">
          <p>© 2024 Task Management System. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}
