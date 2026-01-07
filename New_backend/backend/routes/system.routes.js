import express from "express";
import { getSystemHealth } from "../controllers/system.controller.js";

const router = express.Router();

// ✅ PUBLIC, SAFE, NON-BLOCKING
router.get("/health", getSystemHealth);

export default router;
