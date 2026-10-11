import express from "express";

import {
  createState,
  getStates,
  getStateById,
  searchStates,
  updateState,
  deleteState,
} from "../controllers/stateController.js";

import protect from "../middleware/authMiddleware.js";
import adminOnly from "../middleware/adminMiddleware.js";

const router = express.Router();

//Public Routes

// Get all states
router.get("/", getStates);

// Search states
router.get("/search", searchStates);

// Get single state
router.get("/:id", getStateById);

//Admin Routes

// Create State
router.post("/", protect, adminOnly, createState);

// Update State
router.put("/:id", protect, adminOnly, updateState);

// Delete State
router.delete("/:id", protect, adminOnly, deleteState);

export default router;
