import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";

import { connectDB } from "./config/db.js";
import { errorHandler } from "./middleware/errorHandler.js";

/* ---------------- Routes ---------------- */
import authRoutes from "./routes/auth.routes.js";
import analysisRoutes from "./routes/analysis.routes.js";
import dashboardRoutes from "./routes/dashboard.routes.js";

/* --------------------------------------------------
 * Environment Setup
 * -------------------------------------------------- */
dotenv.config();

/* --------------------------------------------------
 * App Init
 * -------------------------------------------------- */
const app = express();

/* --------------------------------------------------
 * Security & Core Middleware
 * -------------------------------------------------- */
app.use(helmet());

/**
 * ✅ CORRECT CORS CONFIG FOR JWT AUTH
 */
app.use(
  cors({
    origin: "http://localhost:5173",
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);

// Explicitly handle preflight requests
app.options("*", cors());

app.use(express.json({ limit: "200kb" }));
app.use(express.urlencoded({ extended: true }));

if (process.env.NODE_ENV === "development") {
  app.use(morgan("dev"));
}

/* --------------------------------------------------
 * Health & Meta
 * -------------------------------------------------- */
app.get("/health", (_req, res) => {
  res.status(200).json({
    status: "ok",
    service: "SentinAI Backend",
    ethicalMode: "ENABLED",
    timestamp: new Date().toISOString(),
  });
});

/* --------------------------------------------------
 * API Routes
 * -------------------------------------------------- */
app.use("/api/auth", authRoutes);
app.use("/api/analyze", analysisRoutes);
app.use("/api/dashboard", dashboardRoutes);

/* --------------------------------------------------
 * 404 Handler
 * -------------------------------------------------- */
app.use((_req, res) => {
  res.status(404).json({
    success: false,
    message: "API route not found",
  });
});

/* --------------------------------------------------
 * Global Error Handler
 * -------------------------------------------------- */
app.use(errorHandler);

/* --------------------------------------------------
 * Server Boot
 * -------------------------------------------------- */
const PORT = process.env.PORT || 5000;

const startServer = async () => {
  try {
    await connectDB();

    app.listen(PORT, () => {
      console.log("🚀 SentinAI Backend Server Started");
      console.log(`📡 Running on port ${PORT}`);
      console.log("🛡️ Ethical Mode: ENFORCED");
    });
  } catch (error) {
    console.error("❌ Server startup failed:", error.message);
    process.exit(1);
  }
};

startServer();

/* --------------------------------------------------
 * Graceful Shutdown
 * -------------------------------------------------- */
process.on("SIGINT", async () => {
  console.log("\n🛑 Shutting down server...");
  process.exit(0);
});
