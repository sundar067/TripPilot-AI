import express from "express";
import {
  addRecentlyViewed,
  getRecentlyViewed,
} from "../controllers/recentlyViewedController.js";

const router = express.Router();

// Logged-in user ke liye destination ko recently viewed me add/update karna
router.post("/:destinationId", addRecentlyViewed);

// Logged-in user ki recently viewed destinations fetch karna
router.get("/user/:userId", getRecentlyViewed);

export default router;
