/**
 * COMBINED ANALYSIS SERVICE
 * =========================
 * Supports:
 * 1) SECURITY_ONLY
 * 2) AI_ONLY
 * 3) SECURITY_PLUS_AI
 *
 * Static analysis is authoritative.
 * AI is advisory-only.
 */

import { analyzeInput } from "../security-engine/index.js";
import { calculateRiskScore } from "../security-engine/riskEngine.js";
import { normalizeSeverity } from "../security-engine/utils/normalizeSeverity.js";

import { runAIAnalysis } from "./aiAnalysis.service.js";
import { decideAnalysisMode } from "./decision.service.js";

export async function runCombinedAnalysis({
  inputType,
  content,
  language,
  useAI = false,
}) {
  /* ==================================================
   * STEP 1: Static Security Engine
   * ================================================== */
  const engineResult = analyzeInput({
    inputType,
    content,
    language,
  });

  // ✅ SAFE DEBUG LOG
  console.log("[DEBUG] Engine Result:", JSON.stringify(engineResult, null, 2));

  if (!engineResult || engineResult.error) {
    return {
      success: false,
      error: engineResult?.error || "Security analysis failed",
    };
  }

  const {
    vulnerabilities = [],
    attackerView = [],
    defenderFixes = [],
    payloads = [],
    impactAnalysis = [],
    processingTime = 0,
  } = engineResult;

  /* ==================================================
   * STEP 2: Normalize vulnerabilities (DB-safe)
   * ================================================== */
  const normalizedVulnerabilities = vulnerabilities.map((v, i) => ({
    id: `vuln-${Date.now()}-${i}`,

    // ✅ REQUIRED BY DB
    type: v.type || "Unknown",

    // (optional UI-friendly name if you want)
    name: v.type || "Unknown",

    // ✅ ENUM SAFE
    severity: normalizeSeverity(v.severity),

    description: v.description || "",
    attackerLogic: attackerView[i]?.abuseLogic || null,
    defenderLogic: defenderFixes[i]?.secureFix || null,
    secureCodeFix: defenderFixes[i]?.secureExample || null,
    simulatedPayload: payloads?.[i] || null,
    impact: impactAnalysis?.[i] || null,
  }));

  /* ==================================================
   * STEP 3: Risk Score
   * ================================================== */
  const overallRiskScore = calculateRiskScore(normalizedVulnerabilities);

  /* ==================================================
   * STEP 4: Mode Decision
   * ================================================== */
  const mode = decideAnalysisMode({
    useAI,
    riskScore: overallRiskScore,
  });

  /* ==================================================
   * STEP 5: Optional AI Advisory
   * ================================================== */
  let aiAdvisory = null;

  if (mode === "AI_ONLY" || mode === "SECURITY_PLUS_AI") {
    aiAdvisory = await runAIAnalysis({
      code: content,
      language: inputType,
      findings: normalizedVulnerabilities,
    });
  }

  /* ==================================================
   * STEP 6: FINAL RESPONSE
   * ================================================== */
  return {
    success: true,
    mode,

    analysis: {
      vulnerabilities: normalizedVulnerabilities,
      overallRiskScore,
      processingTime,
    },

    security: {
      enabled: true,
      vulnerabilities: normalizedVulnerabilities,
      overallRiskScore,
      processingTime,
    },

    ai: aiAdvisory
      ? {
          enabled: true,
          advisoryOnly: true,
          explanation: aiAdvisory.explanation || null,
          codeSuggestions: aiAdvisory.codeSuggestions || [],
          hypotheses: aiAdvisory.hypotheses || [],
        }
      : { enabled: false },

    ethics: {
      staticAnalysisOnly: true,
      noExecution: true,
      aiAdvisoryOnly: true,
    },
  };
}
