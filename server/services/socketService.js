const socketIO = require("socket.io");
const jwt = require("jsonwebtoken");
const User = require("../models/User");

let io;

// Initialize Socket.IO
const initializeSocket = (server) => {
  io = socketIO(server, {
    cors: {
      origin: process.env.FRONTEND_URL || "*",
      methods: ["GET", "POST"],
      credentials: true,
    },
  });

  // Authentication middleware
  io.use(async (socket, next) => {
    try {
      const token = socket.handshake.auth.token;

      if (!token) {
        return next(new Error("Authentication error: Token missing"));
      }

      // Verify token
      const decoded = jwt.verify(token, process.env.JWT_SECRET);

      // Find user
      const user = await User.findById(decoded.userId);
      if (!user) {
        return next(new Error("Authentication error: User not found"));
      }

      // Attach user to socket
      socket.user = user;
      socket.userId = user._id.toString();
      next();
    } catch (error) {
      console.error("Socket authentication error:", error);
      next(new Error("Authentication error"));
    }
  });

  // Connection handler
  io.on("connection", (socket) => {
    console.log(`User connected: ${socket.userId}`);

    // Join user's room for private notifications
    socket.join(socket.userId);

    // Handle disconnection
    socket.on("disconnect", () => {
      console.log(`User disconnected: ${socket.userId}`);
    });
  });

  console.log("Socket.IO initialized");
  return io;
};

// Get Socket.IO instance
const getIO = () => {
  if (!io) {
    throw new Error("Socket.IO not initialized");
  }
  return io;
};

// Send notification to a specific user
const sendNotification = (userId, notification) => {
  if (!io) {
    console.error("Socket.IO not initialized");
    return;
  }

  io.to(userId.toString()).emit("notification", notification);
};

// Send task update to all connected clients
const broadcastTaskUpdate = (task) => {
  if (!io) {
    console.error("Socket.IO not initialized");
    return;
  }

  io.emit("taskUpdate", task);
};

// Send task assignment notification
const sendTaskAssignment = (userId, task) => {
  if (!io) {
    console.error("Socket.IO not initialized");
    return;
  }

  io.to(userId.toString()).emit("taskAssigned", task);
};

module.exports = {
  initializeSocket,
  getIO,
  sendNotification,
  broadcastTaskUpdate,
  sendTaskAssignment,
};
