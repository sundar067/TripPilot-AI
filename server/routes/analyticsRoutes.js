import express from "express";

import { getAnalytics } from "../controllers/analyticsController.js";

const router = express.Router();

// Dashboard Analytics

router.get("/", getAnalytics);

export default router;
