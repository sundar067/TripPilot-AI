import express from "express";

import {
  createAttraction,
  getAttractionsByDestination,
  getAttractionById,
  updateAttraction,
  deleteAttraction,
} from "../controllers/attractionController.js";

const router = express.Router();

// Create New Attraction
// POST /api/attractions
router.post("/", createAttraction);

// Get All Attractions Of A Destination
// GET /api/attractions/destination/:destinationId
router.get("/destination/:destinationId", getAttractionsByDestination);

// Get Single Attraction
// GET /api/attractions/:id
router.get("/:id", getAttractionById);

// Update Attraction
// PUT /api/attractions/:id
router.put("/:id", updateAttraction);

// Delete Attraction
// DELETE /api/attractions/:id
router.delete("/:id", deleteAttraction);

export default router;
