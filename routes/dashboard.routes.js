import express from "express";
import authenticateToken from "../middleware/auth.middleware.js";
import { getDashboardMetrics } from "../controllers/dashboard.controller.js";

const router = express.Router();

/* ------------------------------------------------------
 * Dashboard Routes (Protected)
 * ------------------------------------------------------ */

router.get("/metrics", authenticateToken, getDashboardMetrics);

export default router;
