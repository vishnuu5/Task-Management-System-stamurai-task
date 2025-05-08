const request = require("supertest");
const mongoose = require("mongoose");
const { MongoMemoryServer } = require("mongodb-memory-server");
const app = require("../server");
const User = require("../models/User");
const Task = require("../models/Task");

let mongoServer;
let token;
let userId;

beforeAll(async () => {
  mongoServer = await MongoMemoryServer.create();
  const uri = mongoServer.getUri();
  await mongoose.connect(uri);

  // Create a test user
  const registerRes = await request(app).post("/api/auth/register").send({
    name: "Task Test User",
    email: "tasktest@example.com",
    password: "password123",
  });

  token = registerRes.body.token;
  userId = registerRes.body.user._id;
});

afterAll(async () => {
  await mongoose.disconnect();
  await mongoServer.stop();
});

beforeEach(async () => {
  await Task.deleteMany({});
});

describe("Tasks API", () => {
  describe("POST /api/tasks", () => {
    it("should create a new task", async () => {
      const res = await request(app)
        .post("/api/tasks")
        .set("Authorization", `Bearer ${token}`)
        .send({
          title: "Test Task",
          description: "This is a test task",
          status: "todo",
          priority: "medium",
          dueDate: new Date().toISOString(),
        });

      expect(res.statusCode).toEqual(201);
      expect(res.body).toHaveProperty("_id");
      expect(res.body.title).toEqual("Test Task");
      expect(res.body.description).toEqual("This is a test task");
      expect(res.body.createdBy).toEqual(userId);
    });

    it("should not create a task without authentication", async () => {
      const res = await request(app).post("/api/tasks").send({
        title: "Test Task",
        description: "This is a test task",
        status: "todo",
        priority: "medium",
        dueDate: new Date().toISOString(),
      });

      expect(res.statusCode).toEqual(401);
      expect(res.body).toHaveProperty("message");
      expect(res.body.message).toEqual(
        "No authentication token, access denied"
      );
    });
  });

  describe("GET /api/tasks", () => {
    it("should get all tasks", async () => {
      // Create a few tasks first
      await Task.create({
        title: "Task 1",
        description: "Description 1",
        status: "todo",
        priority: "low",
        dueDate: new Date(),
        createdBy: userId,
      });

      await Task.create({
        title: "Task 2",
        description: "Description 2",
        status: "in-progress",
        priority: "high",
        dueDate: new Date(),
        createdBy: userId,
      });

      const res = await request(app)
        .get("/api/tasks")
        .set("Authorization", `Bearer ${token}`);

      expect(res.statusCode).toEqual(200);
      expect(Array.isArray(res.body)).toBeTruthy();
      expect(res.body.length).toEqual(2);
      expect(res.body[0]).toHaveProperty("title");
      expect(res.body[1]).toHaveProperty("title");
    });

    it("should filter tasks by status", async () => {
      // Create tasks with different statuses
      await Task.create({
        title: "Todo Task",
        description: "Description",
        status: "todo",
        priority: "medium",
        dueDate: new Date(),
        createdBy: userId,
      });

      await Task.create({
        title: "In Progress Task",
        description: "Description",
        status: "in-progress",
        priority: "medium",
        dueDate: new Date(),
        createdBy: userId,
      });

      const res = await request(app)
        .get("/api/tasks?status=todo")
        .set("Authorization", `Bearer ${token}`);

      expect(res.statusCode).toEqual(200);
      expect(Array.isArray(res.body)).toBeTruthy();
      expect(res.body.length).toEqual(1);
      expect(res.body[0].status).toEqual("todo");
    });
  });

  describe("PUT /api/tasks/:id", () => {
    it("should update a task", async () => {
      // Create a task first
      const task = await Task.create({
        title: "Original Title",
        description: "Original Description",
        status: "todo",
        priority: "medium",
        dueDate: new Date(),
        createdBy: userId,
      });

      const res = await request(app)
        .put(`/api/tasks/${task._id}`)
        .set("Authorization", `Bearer ${token}`)
        .send({
          title: "Updated Title",
          description: "Updated Description",
          status: "in-progress",
        });

      expect(res.statusCode).toEqual(200);
      expect(res.body).toHaveProperty("_id");
      expect(res.body.title).toEqual("Updated Title");
      expect(res.body.description).toEqual("Updated Description");
      expect(res.body.status).toEqual("in-progress");
    });

    it("should not update a task that doesn't exist", async () => {
      const fakeId = new mongoose.Types.ObjectId();

      const res = await request(app)
        .put(`/api/tasks/${fakeId}`)
        .set("Authorization", `Bearer ${token}`)
        .send({
          title: "Updated Title",
        });

      expect(res.statusCode).toEqual(404);
      expect(res.body).toHaveProperty("message");
      expect(res.body.message).toEqual("Task not found");
    });
  });

  describe("DELETE /api/tasks/:id", () => {
    it("should delete a task", async () => {
      // Create a task first
      const task = await Task.create({
        title: "Task to Delete",
        description: "This task will be deleted",
        status: "todo",
        priority: "medium",
        dueDate: new Date(),
        createdBy: userId,
      });

      const res = await request(app)
        .delete(`/api/tasks/${task._id}`)
        .set("Authorization", `Bearer ${token}`);

      expect(res.statusCode).toEqual(200);
      expect(res.body).toHaveProperty("message");
      expect(res.body.message).toEqual("Task deleted successfully");

      // Verify the task is deleted
      const deletedTask = await Task.findById(task._id);
      expect(deletedTask).toBeNull();
    });
  });
});
