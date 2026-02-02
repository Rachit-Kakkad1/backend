/**
 * SERVER ENTRY POINT
 * ==================
 * EthicalGuard – Backend API
 * - No attack execution
 * - Static analysis only
 * - AI advisory only
 */

import express from "express";
import cors from "cors";
import helmet from "helmet";
import rateLimit from "express-rate-limit";
import dotenv from "dotenv";

import connectDB from "./config/db.js";
import errorHandler from "./middleware/errorHandler.js";

/* -------------------- Routes -------------------- */
import authRoutes from "./routes/auth.routes.js";
import analysisRoutes from "./routes/analysis.routes.js";
import dashboardRoutes from "./routes/dashboard.routes.js";
import profileRoutes from "./routes/profile.routes.js";
import systemRoutes from "./routes/system.routes.js";
import aiRoutes from "./routes/ai.routes.js";
import reportsRoutes from "./routes/reports.routes.js";

/* -------------------- Init -------------------- */
dotenv.config();

const app = express();

// Trust first proxy (Render) for correct client IP detection
app.set('trust proxy', 1);

/* -------------------- Security Middleware -------------------- */
app.use(helmet());

app.use(
  cors({
    origin: process.env.CLIENT_URL || "*",
    credentials: true,
  })
);

/* -------------------- Body Parsing -------------------- */
app.use(express.json({ limit: "1mb" }));
app.use(express.urlencoded({ extended: true }));

/* -------------------- Rate Limiting -------------------- */
const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 min
  max: 300,
  standardHeaders: true,
  legacyHeaders: false,
});

app.use("/api", apiLimiter);

/* -------------------- Health Check -------------------- */
app.get("/", (_req, res) => {
  res.json({
    status: "ok",
    service: "EthicalGuard Backend",
    mode: "static-analysis-only",
  });
});

/* -------------------- API Routes -------------------- */
app.use("/api/auth", authRoutes);
app.use("/api/analyze", analysisRoutes);
app.use("/api/dashboard", dashboardRoutes);
app.use("/api/profile", profileRoutes);
app.use("/api/system", systemRoutes);
app.use("/api/ai", aiRoutes); // 🔥 AI chat + advisory endpoints
app.use("/api/reports", reportsRoutes);

/* -------------------- Error Handler -------------------- */
app.use(errorHandler);

/* -------------------- Server Start -------------------- */
const PORT = process.env.PORT || 5000;

async function startServer() {
  try {
    await connectDB();

    app.listen(PORT, () => {
      console.log(`🚀 Server running on port ${PORT}`);
    });
  } catch (err) {
    console.error("❌ Server startup failed:", err);
    process.exit(1);
  }
}

startServer();
