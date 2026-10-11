import express from "express";
import {
  generateTripPlan,
  askTripQuestion,
  getMyTrips,
  getTripById,
  deleteTrip,
} from "../controllers/tripController.js";

import protect from "../middleware/authMiddleware.js";

const router = express.Router();

// Logged-in user trip generate karega
router.post("/generate", protect, generateTripPlan);

// Logged-in user ke saved trips fetch karne ke liye
router.get("/my-trips", protect, getMyTrips);

// Single saved trip details fetch karne ke liye
router.get("/:id", protect, getTripById);

// Logged-in user apni saved trip delete karne ke liye
router.delete("/:id", protect, deleteTrip);

// Generated itinerary ke related follow-up question puchne ke liye
router.post("/ask", askTripQuestion);

export default router;
