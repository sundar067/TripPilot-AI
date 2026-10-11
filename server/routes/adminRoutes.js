import express from "express";
import protect from "../middleware/authMiddleware.js";
import adminOnly from "../middleware/adminMiddleware.js";
import {
  // dashboard
  getDashboardStats,
  getRecentActivity,
  // users
  getAllUsers,
  getUserDetails,
  changeUserRole,
  deleteUser,
  toggleUserBlock,
  // profile
  getProfile,
  updateProfile,
  // security
  changePassword,
} from "../controllers/adminController.js";

const router = express.Router();

// Protect Admin Routes
router.use(protect);
router.use(adminOnly);

// dashboard
router.get("/dashboard", (req, res) => {
  res.status(200).json({
    success: true,
    message: "Welcome Admin",
    user: req.user,
  });
});

router.get("/stats", getDashboardStats);
router.get("/activity", getRecentActivity);

// users
router.get("/users", getAllUsers);
router.get("/users/:id", getUserDetails);
router.patch("/users/:id/role", changeUserRole);
router.patch("/users/:id/block", toggleUserBlock);
router.delete("/users/:id", deleteUser);

// profile
router.get("/profile", getProfile);
router.put("/profile", updateProfile);

// security
router.put("/change-password", changePassword);

export default router;
