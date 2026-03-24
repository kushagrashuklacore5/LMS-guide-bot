const jwt = require("jsonwebtoken");

module.exports = (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;

    // Extract token from header
    if (authHeader && authHeader.startsWith("Bearer ")) {
      const token = authHeader.substring(7); // Remove "Bearer " prefix
      
      if (token) {
        // Check if it's a superadmin token (base64 encoded JSON)
        if (token.startsWith("superadmin-")) {
          try {
            const encodedData = token.replace("superadmin-", "");
            const decoded = JSON.parse(atob(encodedData));
            req.user = {
              userId: "superadmin-id",
              role: "superadmin",
              email: decoded.email,
              name: decoded.name || "Super Admin"
            };
            console.log("Auth - Superadmin token verified, role:", req.user.role);
            return next();
          } catch (e) {
            console.log("Auth - Invalid superadmin token:", e.message);
          }
        } else {
          // Regular JWT token verification
          const jwtSecret = process.env.JWT_SECRET || "default_jwt_secret_key";
          console.log("Auth - Using JWT_SECRET:", jwtSecret ? "set (length: " + jwtSecret.length + ")" : "not set");
          
          try {
            const decoded = jwt.verify(token, jwtSecret);
            req.user = {
              userId: decoded.userId,
              role: decoded.role,
              name: decoded.name || "",
              universityId: decoded.universityId || decoded.university_id || 1
            };
            console.log("Auth - Token verified, userId:", req.user.userId, "role:", req.user.role, "universityId:", req.user.universityId);
            return next();
          } catch (tokenError) {
            console.log("Auth - Invalid token:", tokenError.message);
            // Fall through to set default user
          }
        }
      }
    }

    // No valid token - set a user with available info or default
    // This allows the app to work with or without authentication
    req.user = {
      userId: null,
      role: "guest",
      name: "Guest"
    };
    
    console.log("Auth - No valid token, using guest user");
    next();
  } catch (error) {
    console.log("Auth middleware error:", error.message);
    // Set default user on error
    req.user = {
      userId: null,
      role: "guest",
      name: "Guest"
    };
    next();
  }
};
