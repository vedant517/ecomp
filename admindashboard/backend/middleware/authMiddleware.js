const jwt = require("jsonwebtoken");

exports.protect = (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({ msg: "No token provided" });
    }

    const token = authHeader.split(" ")[1];
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Attach decoded payload to req.user
    req.user = decoded;
    next();
  } catch (error) {
    console.error("Auth error:", error.message);
    return res.status(401).json({ msg: "Invalid or expired token" });
  }
};

exports.authorize = (...roles) => {
  return (req, res, next) => {
    if (!req.user || !roles.includes(req.user.role)) {
      return res.status(403).json({
        msg: `User role ${req.user?.role || 'unknown'} is not authorized to access this route`,
      });
    }
    next();
  };
};
