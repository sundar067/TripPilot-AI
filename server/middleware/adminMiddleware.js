// Check karne ke liye ki logged-in user admin hai ya nahi
const adminOnly = (req, res, next) => {
  try {
    // auth middleware ke baad req.user available hona chahiye
    if (!req.user) {
      return res.status(401).json({
        message: "Not authorized",
      });
    }

    if (req.user.role !== "admin") {
      return res.status(403).json({
        message: "Admin access required",
      });
    }

    next();
  } catch (error) {
    return res.status(500).json({
      message: "Admin authorization failed",
      error: error.message,
    });
  }
};

export default adminOnly;
