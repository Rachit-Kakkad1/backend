import mongoose from "mongoose";
import { getOwnedAnalysis, buildJsonReport, streamPdfReport } from "../services/reports.service.js";

// Validate ObjectId
function isValidId(id) {
  return mongoose.Types.ObjectId.isValid(id);
}

export async function getJsonReport(req, res) {
  try {
    const { analysisId } = req.params;
    const userId = req.userId;

    if (!userId || !isValidId(userId)) {
      return res.status(401).json({ success: false, message: "Unauthorized" });
    }
    if (!analysisId || !isValidId(analysisId)) {
      return res.status(400).json({ success: false, message: "Invalid analysisId" });
    }

    const { data, error } = await getOwnedAnalysis(analysisId, userId);
    if (error) {
      return res.status(error.code).json({ success: false, message: error.message });
    }

    const report = buildJsonReport(data, userId);

    res.setHeader("Content-Type", "application/json");
    res.setHeader(
      "Content-Disposition",
      `attachment; filename="analysis-${report.analysisId}.json"`
    );
    return res.status(200).send(JSON.stringify(report));
  } catch (err) {
    return res.status(500).json({ success: false, message: "Report generation failed" });
  }
}

export async function getPdfReport(req, res) {
  try {
    const { analysisId } = req.params;
    const userId = req.userId;

    if (!userId || !isValidId(userId)) {
      return res.status(401).json({ success: false, message: "Unauthorized" });
    }
    if (!analysisId || !isValidId(analysisId)) {
      return res.status(400).json({ success: false, message: "Invalid analysisId" });
    }

    const { data, error } = await getOwnedAnalysis(analysisId, userId);
    if (error) {
      return res.status(error.code).json({ success: false, message: error.message });
    }

    const report = buildJsonReport(data, userId);
    await streamPdfReport(res, report);
  } catch (err) {
    if (!res.headersSent) {
      return res.status(500).json({ success: false, message: "Report generation failed" });
    }
  }
}

