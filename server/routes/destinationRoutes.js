import express from "express";

import {
  createDestination,
  getDestinations,
  getDestinationsByState,
  getDestinationById,
  searchDestinations,
  filterDestinations,
  getDestinationCategories,
  updateDestination,
  deleteDestination,
} from "../controllers/destinationController.js";

const router = express.Router();

// Create Destination
router.post("/", createDestination);

// Get All Destinations
router.get("/", getDestinations);

// Search Destination
router.get("/search", searchDestinations);

// Filter Destination
router.get("/filter", filterDestinations);

// Get All Categories
router.get("/categories", getDestinationCategories);

// Get Destinations By State
router.get("/state/:stateId", getDestinationsByState);

// Get Single Destination
router.get("/:id", getDestinationById);

// Update Destination
router.put("/:id", updateDestination);

// Delete Destination
router.delete("/:id", deleteDestination);

export default router;
