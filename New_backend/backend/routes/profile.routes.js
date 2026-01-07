import express from "express";
import authenticateToken from "../middleware/auth.middleware.js";

import {
  getProfile,
  updateProfile,
  deactivateProfile,
} from "../controllers/profile.controller.js";

const router = express.Router();

/* ------------------------------------------------------
 * Profile Routes (Protected)
 * ------------------------------------------------------ */
router.use(authenticateToken);

router.get("/", getProfile);
router.put("/", updateProfile);
router.delete("/", deactivateProfile);

export default router;
