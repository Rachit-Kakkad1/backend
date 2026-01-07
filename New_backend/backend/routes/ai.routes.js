import express from "express";
import { chatWithAI } from "../controllers/aiChat.controller.js";
import authMiddleware from "../middleware/auth.middleware.js";

const router = express.Router();

/**
 * POST /api/ai/chat
 * Authenticated, rate-limited, advisory-only
 */
router.post("/chat", authMiddleware, chatWithAI);

export default router;
