import express from "express";
import authenticateToken from "../middleware/auth.middleware.js";
import { getJsonReport, getPdfReport } from "../controllers/reports.controller.js";

const router = express.Router();

// All endpoints require JWT auth and strict validation
router.get("/:analysisId/json", authenticateToken, getJsonReport);
router.get("/:analysisId/pdf", authenticateToken, getPdfReport);

export default router;

