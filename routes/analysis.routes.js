import express from "express";
import rateLimit from "express-rate-limit";

import {
  analyzeCode,
  getAnalysisHistory,
  getAnalysisById,
} from "../controllers/analysis.controller.js";

import authenticateToken from "../middleware/auth.middleware.js";

const router = express.Router();

/* ------------------------------------------------------
 * Rate Limiting
 * ------------------------------------------------------ */
const analyzeLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 30,
  standardHeaders: true,
  legacyHeaders: false,
});

const readLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
});

/* ------------------------------------------------------
 * Auth Middleware
 * ------------------------------------------------------ */
router.use(authenticateToken);

/* ------------------------------------------------------
 * Routes
 * ------------------------------------------------------ */

// CPU-intensive analysis endpoint
router.post("/", analyzeLimiter, analyzeCode);

// Read-only endpoints
router.get("/history", readLimiter, getAnalysisHistory);
router.get("/:id", readLimiter, getAnalysisById);

export default router;
