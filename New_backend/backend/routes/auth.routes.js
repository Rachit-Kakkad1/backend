import express from "express";
import rateLimit from "express-rate-limit";

import authenticateToken from "../middleware/auth.middleware.js";
import {
  googleLogin,
  devLogin,
  completeOnboarding,
  getCurrentUser,
  logout,
} from "../controllers/auth.controller.js";

const router = express.Router();

/* ------------------------------------------------------
 * Rate Limiters
 * ------------------------------------------------------ */
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 20,
  standardHeaders: true,
  legacyHeaders: false,
});

const strictLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 5,
});

/* ------------------------------------------------------
 * Auth Routes
 * ------------------------------------------------------ */

// Google OAuth login
router.post("/google", authLimiter, googleLogin);

// Dev Login (Bypass)
router.post("/dev-login", devLogin);

// Get current authenticated user
router.get("/me", authenticateToken, getCurrentUser);

// Complete onboarding
router.post(
  "/complete-onboarding",
  strictLimiter,
  authenticateToken,
  completeOnboarding
);

// Logout (stateless)
router.post("/logout", authenticateToken, logout);

export default router;
