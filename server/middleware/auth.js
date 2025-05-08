const jwt = require("jsonwebtoken");
const User = require("../models/User");

// Middleware to authenticate user with JWT
const auth = async (req, res, next) => {
  try {
    // Get token from header
    const authHeader = req.header("Authorization");

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res
        .status(401)
        .json({ message: "No authentication token, access denied" });
    }

    const token = authHeader.replace("Bearer ", "");

    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Find user by id
    const user = await User.findById(decoded.userId);

    if (!user) {
      return res.status(401).json({ message: "User not found" });
    }

    // Add user to request object
    req.user = user;
    req.userId = user._id;

    next();
  } catch (error) {
    res.status(401).json({ message: "Token is not valid" });
  }
};

// Middleware to check if user is admin
const admin = (req, res, next) => {
  if (req.user && req.user.role === "admin") {
    next();
  } else {
    res
      .status(403)
      .json({ message: "Access denied, admin privileges required" });
  }
};

// Middleware to check if user is manager or admin
const manager = (req, res, next) => {
  if (req.user && (req.user.role === "manager" || req.user.role === "admin")) {
    next();
  } else {
    res
      .status(403)
      .json({ message: "Access denied, manager privileges required" });
  }
};

module.exports = { auth, admin, manager };
