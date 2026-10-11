import express from "express";
import passport from "passport";

import {
  registerUser,
  loginUser,
  forgotPassword,
  resetPassword,
  updateProfile,
  changePassword,
} from "../controllers/authController.js";

import protect from "../middleware/authMiddleware.js";
import tokenGenerator from "../utils/tokenGenerator.js";

const router = express.Router();

// Normal authentication

// Register
router.post("/register", registerUser);

// Login
router.post("/login", loginUser);

// Forgot password
router.post("/forgot-password", forgotPassword);

// Reset password
router.post("/reset-password/:token", resetPassword);

// User profile

// Get logged-in user profile
router.get("/profile", protect, (req, res) => {
  res.status(200).json({
    success: true,
    user: req.user,
  });
});

// Update profile
router.put("/profile", protect, updateProfile);

// Change password
router.put("/change-password", protect, changePassword);

// Google authentication

// Start Google login
router.get(
  "/google",
  passport.authenticate("google", {
    scope: ["profile", "email"],
  }),
);

// Google callback
router.get(
  "/google/callback",
  passport.authenticate("google", {
    session: false,
    failureRedirect: `${process.env.CLIENT_URL}/login`,
  }),
  (req, res) => {
    // Generate JWT token
    const token = tokenGenerator(req.user._id);

    // Redirect directly to frontend after successful Google authentication
    res.redirect(`${process.env.CLIENT_URL}/login?googleToken=${token}`);
  },
);

export default router;
