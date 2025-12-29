import express from "express";
import rateLimit from "express-rate-limit";

import {
  googleLogin,
  completeOnboarding,
  getCurrentUser,
  logout,
} from "../controllers/auth.controller.js";

import authenticateToken from "../middleware/auth.middleware.js";

const router = express.Router();

/* ------------------------------------------------------
 * Rate Limiters
 * ------------------------------------------------------ */
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 20,
  standardHeaders: true,
  legacyHeaders: false,
});

const strictLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 5,
});

/* ------------------------------------------------------
 * Routes
 * ------------------------------------------------------ */

// Public OAuth entry
router.post("/google", authLimiter, googleLogin);

// Protected routes
router.post(
  "/complete-onboarding",
  strictLimiter,
  authenticateToken,
  completeOnboarding
);

router.get("/me", authenticateToken, getCurrentUser);

router.post("/logout", authenticateToken, logout);

export default router;
