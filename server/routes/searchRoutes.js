import express from "express";

import { logSearch } from "../controllers/searchController.js";

const router = express.Router();

// Save Final Search

router.post("/log", logSearch);

export default router;
