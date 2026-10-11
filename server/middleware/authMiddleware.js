import jwt from "jsonwebtoken";
import User from "../models/User.js";

// Protect Routes

const protect = async (req, res, next) => {
  try {
    let token;

    // Check Authorization Header

    if (
      req.headers.authorization &&
      req.headers.authorization.startsWith("Bearer")
    ) {
      token = req.headers.authorization.split(" ")[1];
    }

    // Check Token

    if (!token) {
      return res.status(401).json({
        success: false,
        message: "Not authorized. Token missing.",
      });
    }

    // Verify Token

    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Get User

    const user = await User.findById(decoded.id).select("-password");

    if (!user) {
      return res.status(401).json({
        success: false,
        message: "User not found.",
      });
    }

    // Attach User

    req.user = user;

    // Continue

    next();
  } catch (error) {
    console.error("Auth Middleware Error:", error);

    return res.status(401).json({
      success: false,
      message: "Not authorized. Invalid token.",
    });
  }
};

export default protect;
