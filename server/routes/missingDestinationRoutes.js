import express from "express";

import protect from "../middleware/authMiddleware.js";

import {
  getMissingDestinations,
  deleteMissingDestination,
  clearMissingDestinations,
} from "../controllers/missingDestinationController.js";

const router = express.Router();

// Get all missing destinations

router.get("/", protect, getMissingDestinations);

// Delete one missing destination

router.delete("/:id", protect, deleteMissingDestination);

// Delete all missing destinations

router.delete("/", protect, clearMissingDestinations);

export default router;
