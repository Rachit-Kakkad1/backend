/**
 * ANALYSIS CONTROLLER
 * ===================
 * - Orchestrates combined analysis
 * - Normalizes engine output
 * - Enforces DB schema contracts
 * - NEVER executes code
 * - Privacy-safe (no raw code stored)
 */

import mongoose from "mongoose";
import crypto from "crypto";

import Analysis from "../models/Analysis.js";
import { runCombinedAnalysis } from "../services/combinedAnalysis.service.js";

/* ------------------------------------------------------
 * Constants
 * ------------------------------------------------------ */
const ALLOWED_INPUT_TYPES = new Set(["code", "api", "sql", "config"]);
const MAX_CONTENT_LENGTH = 100_000;

/* ------------------------------------------------------
 * Utilities
 * ------------------------------------------------------ */

/**
 * Hash content for deduplication / privacy
 */
const hashContent = (content) =>
  crypto.createHash("sha256").update(content).digest("hex");

/**
 * Normalize location into a string (schema-safe)
 */
function normalizeLocation(location) {
  if (!location) return null;

  if (typeof location === "string") return location;

  if (typeof location === "object") {
    const line = location.line ?? "?";
    const column = location.column ?? "?";
    return `line:${line}, column:${column}`;
  }

  return String(location);
}

/* ======================================================
 * POST /api/analyze
 * ====================================================== */
export async function analyzeCode(req, res) {
  try {
    const { inputType = "code", content, language, useAI = false } = req.body;
    const aiOptIn = useAI === true;
    console.log("[REQ] /api/analyze", {
      inputType,
      contentLen: typeof content === "string" ? content.length : 0,
      useAI: aiOptIn,
    });
    const userId = req.userId;

    /* ---------- Auth ---------- */
    if (!userId || !mongoose.Types.ObjectId.isValid(userId)) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized",
      });
    }

    /* ---------- Input Validation ---------- */
    if (!content || typeof content !== "string") {
      return res.status(400).json({
        success: false,
        message: "Invalid or empty content",
      });
    }

    if (!ALLOWED_INPUT_TYPES.has(inputType)) {
      return res.status(400).json({
        success: false,
        message: "Invalid inputType",
      });
    }

    if (content.length > MAX_CONTENT_LENGTH) {
      return res.status(413).json({
        success: false,
        message: "Content too large",
      });
    }

    /* ---------- Run Combined Analysis ---------- */
    const result = await runCombinedAnalysis({
      inputType,
      content,
      language,
      useAI: aiOptIn,
    });

    if (!result?.success) {
      return res.status(500).json({
        success: false,
        message: "Analysis engine failed",
        error: result?.error,
      });
    }

    /* ---------- Normalize Vulnerabilities for DB ---------- */
    const normalizedVulnerabilities = result.analysis.vulnerabilities.map(
      (v) => ({
        id: v.id,
        type: v.type || v.name || "Unknown",
        severity: v.severity,
        description: v.description || "",
        attackerLogic: null,
        defenderLogic: null,
        secureCodeFix: null,
      })
    );

    /* ---------- Persist Analysis ---------- */
    const analysis = await Analysis.create({
      userId,
      inputType,
      contentHash: hashContent(content),
      overallRiskScore: result.analysis.overallRiskScore,
      vulnerabilities: normalizedVulnerabilities,
      processingTime: Number(result.analysis.processingTime) || 0,
      analysisDate: new Date(),
      // 🆕 Persist Engine Decision & Syntax
      engineDecision: result.engineDecision,
      syntax: result.syntax,
    });

    /* ---------- Response ---------- */
    return res.status(201).json({
      success: true,
      mode: result.mode,
      engineDecision: result.engineDecision, // ✅ Pass decision to frontend
      syntax: result.syntax, // ✅ Pass syntax details to frontend
      analysis: {
        id: analysis._id,
        inputType,
        overallRiskScore: analysis.overallRiskScore,
        vulnerabilities: normalizedVulnerabilities,
        attackerView: result.analysis.attackerView,
        defenderFixes: result.analysis.defenderFixes,
        impactAnalysis: result.analysis.impactAnalysis,
        processingTime: analysis.processingTime,
        analysisDate: analysis.analysisDate,
      },
      ai: result.ai,
      ethics: result.ethics,
    });
  } catch (error) {
    console.error("Analysis error:", error);

    return res.status(500).json({
      success: false,
      message: "Analysis failed",
      error: error.message,
    });
  }
}

/* ======================================================
 * GET /api/analyze/history
 * ====================================================== */
export async function getAnalysisHistory(req, res) {
  try {
    const userId = req.userId;

    if (!mongoose.Types.ObjectId.isValid(userId)) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized",
      });
    }

    const limit = Math.min(Number(req.query.limit) || 10, 50);
    const page = Math.max(Number(req.query.page) || 1, 1);
    const skip = (page - 1) * limit;

    const [analyses, total] = await Promise.all([
      Analysis.find({ userId })
        .sort({ analysisDate: -1 })
        .skip(skip)
        .limit(limit)
        .select("-__v")
        .lean(),
      Analysis.countDocuments({ userId }),
    ]);

    return res.json({
      success: true,
      analyses: analyses.map((a) => ({
        id: a._id,
        inputType: a.inputType,
        overallRiskScore: a.overallRiskScore,
        vulnerabilityCount: a.vulnerabilities.length,
        analysisDate: a.analysisDate,
      })),
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error("History fetch error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to fetch analysis history",
    });
  }
}

/* ======================================================
 * GET /api/analyze/:id
 * ====================================================== */
export async function getAnalysisById(req, res) {
  try {
    const { id } = req.params;
    const userId = req.userId;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid analysis ID",
      });
    }

    const analysis = await Analysis.findOne({ _id: id, userId }).lean();

    if (!analysis) {
      return res.status(404).json({
        success: false,
        message: "Analysis not found",
      });
    }

    return res.json({
      success: true,
      analysis: {
        id: analysis._id,
        inputType: analysis.inputType,
        overallRiskScore: analysis.overallRiskScore,
        vulnerabilities: analysis.vulnerabilities,
        analysisDate: analysis.analysisDate,
        processingTime: analysis.processingTime,
      },
    });
  } catch (error) {
    console.error("Fetch analysis error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to fetch analysis",
    });
  }
}
