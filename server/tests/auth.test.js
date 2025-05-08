const request = require("supertest");
const mongoose = require("mongoose");
const { MongoMemoryServer } = require("mongodb-memory-server");
const app = require("../server");
const User = require("../models/User");

let mongoServer;

beforeAll(async () => {
  mongoServer = await MongoMemoryServer.create();
  const uri = mongoServer.getUri();
  await mongoose.connect(uri);
});

afterAll(async () => {
  await mongoose.disconnect();
  await mongoServer.stop();
});

beforeEach(async () => {
  await User.deleteMany({});
});

describe("Auth API", () => {
  describe("POST /api/auth/register", () => {
    it("should register a new user", async () => {
      const res = await request(app).post("/api/auth/register").send({
        name: "Test User",
        email: "test@example.com",
        password: "password123",
      });

      expect(res.statusCode).toEqual(201);
      expect(res.body).toHaveProperty("token");
      expect(res.body).toHaveProperty("user");
      expect(res.body.user.name).toEqual("Test User");
      expect(res.body.user.email).toEqual("test@example.com");
      expect(res.body.user).not.toHaveProperty("password");
    });

    it("should not register a user with an existing email", async () => {
      // Create a user first
      await User.create({
        name: "Existing User",
        email: "existing@example.com",
        password: "password123",
      });

      // Try to register with the same email
      const res = await request(app).post("/api/auth/register").send({
        name: "Test User",
        email: "existing@example.com",
        password: "password123",
      });

      expect(res.statusCode).toEqual(400);
      expect(res.body).toHaveProperty("message");
      expect(res.body.message).toEqual("User already exists");
    });
  });

  describe("POST /api/auth/login", () => {
    it("should login a user with valid credentials", async () => {
      // Create a user first
      await request(app).post("/api/auth/register").send({
        name: "Login Test",
        email: "login@example.com",
        password: "password123",
      });

      // Login with the created user
      const res = await request(app).post("/api/auth/login").send({
        email: "login@example.com",
        password: "password123",
      });

      expect(res.statusCode).toEqual(200);
      expect(res.body).toHaveProperty("token");
      expect(res.body).toHaveProperty("user");
      expect(res.body.user.name).toEqual("Login Test");
      expect(res.body.user.email).toEqual("login@example.com");
    });

    it("should not login with invalid credentials", async () => {
      // Create a user first
      await request(app).post("/api/auth/register").send({
        name: "Login Test",
        email: "login@example.com",
        password: "password123",
      });

      // Try to login with wrong password
      const res = await request(app).post("/api/auth/login").send({
        email: "login@example.com",
        password: "wrongpassword",
      });

      expect(res.statusCode).toEqual(400);
      expect(res.body).toHaveProperty("message");
      expect(res.body.message).toEqual("Invalid credentials");
    });
  });

  describe("GET /api/auth/me", () => {
    it("should get the current user profile", async () => {
      // Register a user and get token
      const registerRes = await request(app).post("/api/auth/register").send({
        name: "Profile Test",
        email: "profile@example.com",
        password: "password123",
      });

      const token = registerRes.body.token;

      // Get user profile
      const res = await request(app)
        .get("/api/auth/me")
        .set("Authorization", `Bearer ${token}`);

      expect(res.statusCode).toEqual(200);
      expect(res.body).toHaveProperty("name");
      expect(res.body).toHaveProperty("email");
      expect(res.body.name).toEqual("Profile Test");
      expect(res.body.email).toEqual("profile@example.com");
    });

    it("should not get profile without authentication", async () => {
      const res = await request(app).get("/api/auth/me");

      expect(res.statusCode).toEqual(401);
      expect(res.body).toHaveProperty("message");
      expect(res.body.message).toEqual(
        "No authentication token, access denied"
      );
    });
  });
});
