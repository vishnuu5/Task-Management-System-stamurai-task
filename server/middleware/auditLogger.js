const AuditLog = require("../models/AuditLog");

// Middleware to log user actions
const auditLogger = (action, entityType) => {
  return async (req, res, next) => {
    // Store the original send function
    const originalSend = res.send;

    // Override the send function
    res.send = function (data) {
      // Only log if the request was successful (status code 2xx)
      if (res.statusCode >= 200 && res.statusCode < 300) {
        try {
          // Parse the response data if it's a string
          const responseData =
            typeof data === "string" ? JSON.parse(data) : data;

          // Create the audit log
          const auditLog = new AuditLog({
            user: req.userId,
            action,
            entityType,
            entityId: responseData._id || req.params.id,
            details: {
              method: req.method,
              path: req.path,
              body: req.body,
              response: responseData,
            },
            ipAddress: req.ip,
            userAgent: req.get("User-Agent"),
          });

          // Save the audit log asynchronously (don't wait for it)
          auditLog
            .save()
            .catch((err) => console.error("Error saving audit log:", err));
        } catch (error) {
          console.error("Error creating audit log:", error);
        }
      }

      // Call the original send function
      return originalSend.call(this, data);
    };

    next();
  };
};

module.exports = auditLogger;
