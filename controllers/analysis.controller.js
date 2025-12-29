import mongoose from "mongoose";
import crypto from "crypto";

import Analysis from "../models/Analysis.js";
import User from "../models/User.js";

/* ---------------- Security Engine ---------------- */
import { analyze } from "../security-engine/index.js";
import { calculateRiskScore } from "../security-engine/riskEngine.js";
import { generateAttackerView } from "../security-engine/attackerView/attackerView.js";
import { generateDefenderFixes } from "../security-engine/defenderView/defenderEngine.js";
import { generateSimulatedPayloads } from "../security-engine/payloads/payloadEngine.js";
import { generateImpactAnalysis } from "../security-engine/impactEngine.js";

/* --------------------------------------------------
 * Constants
 * -------------------------------------------------- */
const ALLOWED_INPUT_TYPES = new Set(["code", "api", "sql", "config"]);
const MAX_CONTENT_LENGTH = 100_000;

/* --------------------------------------------------
 * Utils
 * -------------------------------------------------- */
const hashContent = (content) =>
  crypto.createHash("sha256").update(content).digest("hex");

/* --------------------------------------------------
 * POST /api/analyze
 * -------------------------------------------------- */
export const analyzeCode = async (req, res) => {
  try {
    const { inputType, content } = req.body;
    const userId = req.userId;

    /* ---------------- Auth & Input Validation ---------------- */
    if (!userId || !mongoose.Types.ObjectId.isValid(userId)) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized",
      });
    }

    if (!inputType || !content) {
      return res.status(400).json({
        success: false,
        message: "inputType and content are required",
      });
    }

    if (!ALLOWED_INPUT_TYPES.has(inputType)) {
      return res.status(400).json({
        success: false,
        message: "Invalid inputType",
      });
    }

    if (typeof content !== "string" || content.length > MAX_CONTENT_LENGTH) {
      return res.status(413).json({
        success: false,
        message: "Content too large or invalid",
      });
    }

    /* ---------------- Run Security Engine ---------------- */
    const engineResult = analyze(inputType, content);
    const vulnerabilities = engineResult.vulnerabilities || [];

    const attackerView = generateAttackerView(
      vulnerabilities,
      engineResult.normalizedInput
    );

    const defenderFixes = generateDefenderFixes(
      vulnerabilities,
      engineResult.normalizedInput
    );

    const simulatedPayloads = generateSimulatedPayloads(vulnerabilities);

    const impactAnalysis = generateImpactAnalysis(
      vulnerabilities,
      engineResult.normalizedInput
    );

    const overallRiskScore =
      vulnerabilities.length > 0
        ? calculateRiskScore(vulnerabilities)
        : 0;

    /* ---------------- Normalize for DB ---------------- */
    const enrichedVulnerabilities = vulnerabilities.map((v, i) => ({
      id: `vuln-${Date.now()}-${i}`,
      name: v.type,
      severity: v.severity,
      description: v.description,
      attackerLogic: attackerView[i]?.abuseLogic,
      defenderLogic: defenderFixes[i]?.secureFix,
      secureCodeFix: defenderFixes[i]?.secureExample,
    }));

    /* ---------------- Persist Analysis ---------------- */
    const analysis = await Analysis.create({
      userId,
      inputType,
      contentHash: hashContent(content),
      overallRiskScore,
      vulnerabilities: enrichedVulnerabilities,
      processingTime: engineResult.processingTime || 0,
      analysisDate: new Date(),
    });

    /* ---------------- Update User Stats ---------------- */
    await User.updateOne(
      { _id: userId },
      { $inc: { analysisCount: 1 } }
    );

    /* ---------------- Response ---------------- */
    res.status(200).json({
      success: true,
      analysis: {
        id: analysis._id,
        inputType,
        overallRiskScore,
        vulnerabilities: enrichedVulnerabilities,
        attackerView,
        defenderFixes,
        simulatedPayloads,
        impactAnalysis,
        analysisDate: analysis.analysisDate,
        processingTime: analysis.processingTime,
      },
    });
  } catch (error) {
    console.error("Analysis error:", error.message);

    res.status(500).json({
      success: false,
      message: "Analysis failed",
    });
  }
};

/* --------------------------------------------------
 * GET /api/analyze/history
 * -------------------------------------------------- */
export const getAnalysisHistory = async (req, res) => {
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

    res.json({
      success: true,
      analyses: analyses.map((a) => ({
        id: a._id,
        inputType: a.inputType,
        overallRiskScore: a.overallRiskScore,
        vulnerabilityCount: a.vulnerabilities?.length || 0,
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
    console.error("History fetch error:", error.message);

    res.status(500).json({
      success: false,
      message: "Failed to fetch analysis history",
    });
  }
};

/* --------------------------------------------------
 * GET /api/analyze/:id
 * -------------------------------------------------- */
export const getAnalysisById = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.userId;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid analysis ID",
      });
    }

    const analysis = await Analysis.findOne({
      _id: id,
      userId,
    }).lean();

    if (!analysis) {
      return res.status(404).json({
        success: false,
        message: "Analysis not found",
      });
    }

    res.json({
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
    console.error("Fetch analysis error:", error.message);

    res.status(500).json({
      success: false,
      message: "Failed to fetch analysis",
    });
  }
};
