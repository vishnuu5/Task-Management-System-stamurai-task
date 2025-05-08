"use client";

import { Label } from "@/components/ui/label";

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
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/components/ui/use-toast";
import { Search, Mail, Calendar, Loader2 } from "lucide-react";
import { format } from "date-fns";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";

export default function TeamPage() {
  const { user, isAuthenticated, loading } = useAuth();
  const router = useRouter();
  const { toast } = useToast();

  const [teamMembers, setTeamMembers] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [userTasks, setUserTasks] = useState({});
  const [selectedMember, setSelectedMember] = useState(null);
  const [contactDialogOpen, setContactDialogOpen] = useState(false);
  const [messageSubject, setMessageSubject] = useState("");
  const [messageBody, setMessageBody] = useState("");
  const [isSending, setIsSending] = useState(false);
  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (!loading && !isAuthenticated) {
      router.push("/auth/login");
    }
  }, [isAuthenticated, loading, router]);

  useEffect(() => {
    if (isAuthenticated) {
      fetchTeamMembers();
    }
  }, [isAuthenticated]);

  const fetchTeamMembers = async () => {
    setIsLoading(true);
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
        throw new Error("Failed to fetch team members");
      }

      const data = await response.json();
      setTeamMembers(data);

      // Fetch tasks for each user
      for (const member of data) {
        fetchUserTasks(member._id);
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to load team members. Please try again later.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const fetchUserTasks = async (userId) => {
    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/tasks?assignedTo=${userId}`,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );

      if (!response.ok) {
        throw new Error("Failed to fetch user tasks");
      }

      const data = await response.json();
      setUserTasks((prev) => ({
        ...prev,
        [userId]: data,
      }));
    } catch (error) {
      console.error("Failed to fetch user tasks:", error);
    }
  };

  const filteredTeamMembers = teamMembers.filter(
    (member) =>
      member.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      member.email.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const getInitials = (name) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase();
  };

  const getTaskStats = (userId) => {
    const tasks = userTasks[userId] || [];
    const total = tasks.length;
    const completed = tasks.filter(
      (task) => task.status === "completed"
    ).length;
    const inProgress = tasks.filter(
      (task) => task.status === "in-progress"
    ).length;
    const todo = tasks.filter((task) => task.status === "todo").length;
    const review = tasks.filter((task) => task.status === "review").length;

    return { total, completed, inProgress, todo, review };
  };

  const handleContactClick = (member) => {
    setSelectedMember(member);
    setContactDialogOpen(true);
    setMessageSubject("");
    setMessageBody("");
    setErrors({});
  };

  const handleViewTasks = (userId) => {
    router.push(`/tasks?userId=${userId}`);
  };

  const validateContactForm = () => {
    const newErrors = {};

    if (!messageSubject.trim()) newErrors.subject = "Subject is required";
    if (!messageBody.trim()) newErrors.message = "Message is required";

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSendMessage = async () => {
    if (!validateContactForm()) {
      return;
    }

    setIsSending(true);
    try {
      // Simulate API call to send message
      await new Promise((resolve) => setTimeout(resolve, 1000));

      toast({
        title: "Message Sent",
        description: `Your message has been sent to ${selectedMember.name}.`,
      });

      setContactDialogOpen(false);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to send message. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSending(false);
    }
  };

  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <DashboardLayout>
      <div className="p-4 sm:p-6">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
          <h1 className="text-2xl font-bold">Team Members</h1>
          <div className="relative w-full sm:w-64">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-500" />
            <Input
              placeholder="Search team members..."
              className="pl-8"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </div>

        <Tabs defaultValue="grid">
          <TabsList className="mb-6">
            <TabsTrigger value="grid">Grid View</TabsTrigger>
            <TabsTrigger value="table">Table View</TabsTrigger>
          </TabsList>

          <TabsContent value="grid">
            {isLoading ? (
              <div className="flex items-center justify-center h-64">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
              </div>
            ) : filteredTeamMembers.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredTeamMembers.map((member) => {
                  const stats = getTaskStats(member._id);
                  return (
                    <Card key={member._id}>
                      <CardHeader className="pb-2">
                        <div className="flex items-center space-x-4">
                          <Avatar className="h-12 w-12">
                            <AvatarImage
                              src={member.avatar || "/placeholder.svg"}
                              alt={member.name}
                            />
                            <AvatarFallback>
                              {getInitials(member.name)}
                            </AvatarFallback>
                          </Avatar>
                          <div>
                            <CardTitle className="text-lg">
                              {member.name}
                            </CardTitle>
                            <CardDescription>{member.email}</CardDescription>
                          </div>
                        </div>
                      </CardHeader>
                      <CardContent>
                        <div className="mt-2">
                          <Badge variant="outline" className="mr-2 capitalize">
                            {member.role}
                          </Badge>
                          <Badge variant="secondary" className="mr-2">
                            {stats.total} Tasks
                          </Badge>
                        </div>
                        <div className="mt-4 space-y-2">
                          <div className="flex justify-between text-sm">
                            <span className="text-gray-500">Completed:</span>
                            <span className="font-medium">
                              {stats.completed}
                            </span>
                          </div>
                          <div className="flex justify-between text-sm">
                            <span className="text-gray-500">In Progress:</span>
                            <span className="font-medium">
                              {stats.inProgress}
                            </span>
                          </div>
                          <div className="flex justify-between text-sm">
                            <span className="text-gray-500">To Do:</span>
                            <span className="font-medium">{stats.todo}</span>
                          </div>
                          <div className="flex justify-between text-sm">
                            <span className="text-gray-500">In Review:</span>
                            <span className="font-medium">{stats.review}</span>
                          </div>
                        </div>
                        <div className="mt-4 pt-4 border-t flex justify-between">
                          <Button
                            variant="ghost"
                            size="sm"
                            className="w-full"
                            onClick={() => handleContactClick(member)}
                          >
                            <Mail className="h-4 w-4 mr-2" />
                            Contact
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="w-full"
                            onClick={() => handleViewTasks(member._id)}
                          >
                            <Calendar className="h-4 w-4 mr-2" />
                            View Tasks
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            ) : (
              <div className="text-center py-8 bg-gray-50 rounded-lg">
                <h3 className="mt-2 text-lg font-medium">
                  No team members found
                </h3>
                <p className="mt-1 text-gray-500">
                  Try adjusting your search criteria.
                </p>
              </div>
            )}
          </TabsContent>

          <TabsContent value="table">
            {isLoading ? (
              <div className="flex items-center justify-center h-64">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
              </div>
            ) : filteredTeamMembers.length > 0 ? (
              <Card>
                <CardContent className="p-0">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Name</TableHead>
                        <TableHead>Email</TableHead>
                        <TableHead>Role</TableHead>
                        <TableHead>Tasks</TableHead>
                        <TableHead>Joined</TableHead>
                        <TableHead>Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredTeamMembers.map((member) => {
                        const stats = getTaskStats(member._id);
                        return (
                          <TableRow key={member._id}>
                            <TableCell className="font-medium">
                              <div className="flex items-center space-x-2">
                                <Avatar className="h-8 w-8">
                                  <AvatarImage
                                    src={member.avatar || "/placeholder.svg"}
                                    alt={member.name}
                                  />
                                  <AvatarFallback>
                                    {getInitials(member.name)}
                                  </AvatarFallback>
                                </Avatar>
                                <span>{member.name}</span>
                              </div>
                            </TableCell>
                            <TableCell>{member.email}</TableCell>
                            <TableCell>
                              <Badge variant="outline" className="capitalize">
                                {member.role}
                              </Badge>
                            </TableCell>
                            <TableCell>
                              <div className="flex space-x-1">
                                <Badge variant="secondary">
                                  {stats.total} Total
                                </Badge>
                                <Badge
                                  variant="outline"
                                  className="bg-green-100"
                                >
                                  {stats.completed} Done
                                </Badge>
                              </div>
                            </TableCell>
                            <TableCell>
                              {format(
                                new Date(member.createdAt),
                                "MMM d, yyyy"
                              )}
                            </TableCell>
                            <TableCell>
                              <div className="flex space-x-2">
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => handleContactClick(member)}
                                >
                                  <Mail className="h-4 w-4" />
                                </Button>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => handleViewTasks(member._id)}
                                >
                                  <Calendar className="h-4 w-4" />
                                </Button>
                              </div>
                            </TableCell>
                          </TableRow>
                        );
                      })}
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>
            ) : (
              <div className="text-center py-8 bg-gray-50 rounded-lg">
                <h3 className="mt-2 text-lg font-medium">
                  No team members found
                </h3>
                <p className="mt-1 text-gray-500">
                  Try adjusting your search criteria.
                </p>
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>

      {/* Contact Dialog */}
      <Dialog open={contactDialogOpen} onOpenChange={setContactDialogOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Contact {selectedMember?.name}</DialogTitle>
            <DialogDescription>
              Send a message to {selectedMember?.name}. They will receive a
              notification.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="space-y-2">
              <Label
                htmlFor="subject"
                className={errors.subject ? "text-destructive" : ""}
              >
                Subject
              </Label>
              <Input
                id="subject"
                value={messageSubject}
                onChange={(e) => setMessageSubject(e.target.value)}
                className={errors.subject ? "border-destructive" : ""}
              />
              {errors.subject && (
                <p className="text-sm text-destructive">{errors.subject}</p>
              )}
            </div>
            <div className="space-y-2">
              <Label
                htmlFor="message"
                className={errors.message ? "text-destructive" : ""}
              >
                Message
              </Label>
              <Textarea
                id="message"
                rows={5}
                value={messageBody}
                onChange={(e) => setMessageBody(e.target.value)}
                className={errors.message ? "border-destructive" : ""}
              />
              {errors.message && (
                <p className="text-sm text-destructive">{errors.message}</p>
              )}
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setContactDialogOpen(false)}
            >
              Cancel
            </Button>
            <Button onClick={handleSendMessage} disabled={isSending}>
              {isSending ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Sending...
                </>
              ) : (
                "Send Message"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </DashboardLayout>
  );
}
