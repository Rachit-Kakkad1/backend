import crypto from "crypto";
import PDFDocument from "pdfkit";
import mongoose from "mongoose";
import Analysis from "../models/Analysis.js";

// Helper: sha256 hash masking for user reference
function maskUserId(userId) {
  return crypto.createHash("sha256").update(String(userId)).digest("hex");
}

// Helper: compute severity counts from stored vulnerabilities
function computeSeverityCounts(vulnerabilities = []) {
  const counts = { CRITICAL: 0, HIGH: 0, MEDIUM: 0, LOW: 0, SAFE: 0 };
  vulnerabilities.forEach((v) => {
    const sev = String(v.severity || "").toUpperCase();
    if (counts[sev] !== undefined) counts[sev] += 1;
  });
  // SAFE bucket: convenience for dashboards
  counts.SAFE = vulnerabilities.length === 0 ? 1 : 0;
  return counts;
}

// Fetch analysis ensuring ownership and valid ID
export async function getOwnedAnalysis(analysisId, userId) {
  if (!mongoose.Types.ObjectId.isValid(analysisId)) {
    return { error: { code: 400, message: "Invalid analysisId" } };
  }
  const doc = await Analysis.findOne({ _id: analysisId, userId }).lean();
  if (!doc) {
    // Determine existence vs ownership
    const exists = await Analysis.exists({ _id: analysisId });
    return exists
      ? { error: { code: 403, message: "Analysis does not belong to user" } }
      : { error: { code: 404, message: "Analysis not found" } };
  }
  return { data: doc };
}

// Build deterministic JSON report object
export function buildJsonReport(analysisDoc, userId) {
  const severityCounts = computeSeverityCounts(analysisDoc.vulnerabilities);
  return {
    reportVersion: "1.0.0",
    generatedAt: new Date().toISOString(),
    analysisId: String(analysisDoc._id),
    userRef: maskUserId(userId),
    inputType: analysisDoc.inputType,
    overallRiskScore: Number(analysisDoc.overallRiskScore) || 0,
    severityCounts,
    processingTime: Number(analysisDoc.processingTime) || 0,
    analysisDate: analysisDoc.analysisDate?.toISOString?.() || new Date().toISOString(),
    ethics: {
      staticAnalysisOnly: !!analysisDoc?.ethics?.staticAnalysisOnly || true,
      noExecution: !!analysisDoc?.ethics?.noExecution || true,
      aiAdvisoryOnly: !!analysisDoc?.ethics?.aiAdvisoryOnly || true,
    },
    // Vulnerability summary: privacy-safe, no payloads
    vulnerabilities: (analysisDoc.vulnerabilities || []).map((v) => ({
      id: v.id,
      type: v.type,
      severity: v.severity,
      description: v.description,
      location: v.location || null,
    })),
    // Educational views (optional, stored only)
    attackerView: analysisDoc.attackerView || [],
    defenderFixes: analysisDoc.defenderFixes || [],
    impactAnalysis: analysisDoc.impactAnalysis || [],
  };
}

// Stream PDF report to response using pdfkit
export async function streamPdfReport(res, report) {
  return new Promise((resolve, reject) => {
    try {
      const doc = new PDFDocument({ size: "A4", margin: 50 });

      res.setHeader("Content-Type", "application/pdf");
      res.setHeader(
        "Content-Disposition",
        `attachment; filename="analysis-${report.analysisId}.pdf"`
      );

      // Handle stream errors cleanly
      const onError = (err) => {
        try {
          // Avoid leaking stack traces; respond JSON if headers not committed
          if (!res.headersSent) {
            res.status(500).json({
              success: false,
              message: "PDF generation failed",
            });
          } else {
            res.end();
          }
        } catch {}
        reject(err);
      };

      doc.on("error", onError);
      res.on("error", onError);

      doc.pipe(res);

      // Title & Branding
      doc.fontSize(20).text("EthicalGuard Security Report", { align: "center" });
      doc.moveDown(0.5);
      doc.fontSize(10).text(`Report Version: ${report.reportVersion}`, { align: "center" });
      doc.text(`Generated At: ${report.generatedAt}`, { align: "center" });
      doc.moveDown();

      // Summary
      doc.fontSize(14).text("Risk Summary");
      doc.moveDown(0.5);
      doc.fontSize(10).text(`Analysis ID: ${report.analysisId}`);
      doc.text(`User Ref: ${report.userRef}`);
      doc.text(`Input Type: ${report.inputType}`);
      doc.text(`Overall Risk Score: ${report.overallRiskScore}`);
      doc.text(`Processing Time: ${report.processingTime} ms`);
      doc.text(`Analysis Date: ${report.analysisDate}`);
      doc.moveDown();

      // Severity Distribution
      doc.fontSize(14).text("Severity Distribution");
      const sev = report.severityCounts || {};
      doc.fontSize(10).list(
        [
          `CRITICAL: ${sev.CRITICAL || 0}`,
          `HIGH: ${sev.HIGH || 0}`,
          `MEDIUM: ${sev.MEDIUM || 0}`,
          `LOW: ${sev.LOW || 0}`,
          `SAFE: ${sev.SAFE || 0}`,
        ],
        { bulletRadius: 2 }
      );
      doc.moveDown();

      // Vulnerabilities
      doc.fontSize(14).text("Vulnerabilities");
      doc.moveDown(0.5);
      if (!report.vulnerabilities || report.vulnerabilities.length === 0) {
        doc.fontSize(10).text("No vulnerabilities detected.");
      } else {
        report.vulnerabilities.forEach((v, idx) => {
          doc.fontSize(10).text(`${idx + 1}. [${v.severity}] ${v.type}`);
          if (v.description) doc.text(`   - ${v.description}`);
          if (v.location) doc.text(`   - Location: ${v.location}`);
        });
      }
      doc.moveDown();

      // Attacker Perspective (educational, high-level text only)
      doc.fontSize(14).text("Attacker Perspective");
      (report.attackerView || []).slice(0, 10).forEach((a, idx) => {
        doc.fontSize(10).text(`${idx + 1}. ${a?.abuseLogic || a}`);
      });
      doc.moveDown();

      // Defender Recommendations
      doc.fontSize(14).text("Defender Recommendations");
      (report.defenderFixes || []).slice(0, 10).forEach((d, idx) => {
        const fix = d?.secureFix || d;
        const ex = d?.secureExample ? ` (Example: ${d.secureExample})` : "";
        doc.fontSize(10).text(`${idx + 1}. ${fix}${ex}`);
      });
      doc.moveDown();

      // Impact Analysis
      doc.fontSize(14).text("Impact Analysis");
      (report.impactAnalysis || []).slice(0, 10).forEach((i, idx) => {
        const tech = i?.technicalImpact || i?.technical || "";
        const biz = i?.businessImpact || i?.business || "";
        doc.fontSize(10).text(`${idx + 1}. Technical: ${tech}`);
        if (biz) doc.text(`   Business: ${biz}`);
      });
      doc.moveDown();

      // Ethics & Disclaimer
      doc.fontSize(14).text("Ethics & Disclaimer");
      doc.fontSize(10).text(
        "This report is generated by a static analysis engine. No code execution, exploits, or live attacks occur. Results are deterministic and privacy-safe."
      );
      doc.fontSize(10).text(
        `Ethics Flags: staticAnalysisOnly=${!!report.ethics?.staticAnalysisOnly}, noExecution=${!!report.ethics?.noExecution}, aiAdvisoryOnly=${!!report.ethics?.aiAdvisoryOnly}`
      );

      doc.end();
      doc.on("end", resolve);
    } catch (err) {
      if (!res.headersSent) {
        res.status(500).json({ success: false, message: "PDF generation failed" });
      }
      reject(err);
    }
  });
}

