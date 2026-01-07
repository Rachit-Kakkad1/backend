/**
 * COMBINED ANALYSIS SERVICE (AUTHORITATIVE)
 * ========================================
 * - Static security engine ALWAYS runs
 * - AI is advisory-only and never authoritative
 * - No code execution, no exploit generation
 * - Frontend contract aligned
 */

import { analyzeInput } from "../security-engine/index.js";
import { runAIAnalysis } from "./aiAnalysis.service.js";
import { decideAnalysisMode } from "./decision.service.js";
import { normalizeSeverity } from "../security-engine/utils/normalizeSeverity.js";
import { recordAIAudit } from "./audit.service.js";

/* ---------------------------------------------
 * Utility: deterministic vulnerability ID
 * --------------------------------------------- */
function generateVulnId(vuln, index) {
  return `vuln-${vuln.type}-${vuln.location || "global"}-${index}`
    .toLowerCase()
    .replace(/[^a-z0-9-_]/g, "");
}

/* ---------------------------------------------
 * Main executor (SINGLE ENTRY POINT)
 * --------------------------------------------- */
export async function runCombinedAnalysis({
  inputType,
  content,
  language,
  useAI = false,
}) {
  /* ==================================================
   * STEP 1: Run STATIC SECURITY ENGINE (MANDATORY)
   * ================================================== */
  const engineResult = analyzeInput({
    inputType,
    content,
    language,
  });

  if (!engineResult || engineResult.error) {
    return {
      success: false,
      error: engineResult?.error || "Security analysis failed",
    };
  }

  // 🛑 HALT ON SYNTAX ERROR
  if (engineResult.engineDecision === "HALTED_AT_SYNTAX_STAGE") {
    return {
      success: true,
      analysisType: "MANUAL",
      syntax: engineResult.syntax,
      analysis: {
        vulnerabilities: [],
        overallRiskScore: 0,
      },
      engineDecision: "HALTED_AT_SYNTAX_STAGE",
    };
  }

  const {
    vulnerabilities = [],
    attackerView = [],
    defenderFixes = [],
    impactAnalysis = [],
    abuseScenarios = [],
    overallRiskScore,
    processingTime = 0,
  } = engineResult;

  /* ==================================================
   * STEP 2: Normalize vulnerabilities (PURE OBJECTS)
   * 🔒 FIX: Severity normalization enforced here
   * ================================================== */
  const normalizedVulnerabilities = vulnerabilities.map((v, i) => ({
    id: generateVulnId(v, i),
    type: v.type,
    severity: normalizeSeverity(v.severity), // ✅ FIXED
    description: v.description,
    location: v.location || null,
  }));

  /* ==================================================
   * STEP 3: Map auxiliary views by vulnerability ID
   * ================================================== */
  const mapById = (arr = []) =>
    arr.reduce((acc, item, i) => {
      const id = normalizedVulnerabilities[i]?.id;
      if (id) acc[id] = item;
      return acc;
    }, {});

  const attackerMap = mapById(attackerView);
  const defenderMap = mapById(defenderFixes);
  const impactMap = mapById(impactAnalysis);
  const abuseMap = mapById(abuseScenarios);

  /* ==================================================
   * STEP 4: Decide analysis mode (NO AI_ONLY)
   * ================================================== */
  const mode = decideAnalysisMode({
    useAI,
    riskScore: overallRiskScore,
  });
  recordAIAudit({ stage: "mode_decision", useAI, mode });

  /* ==================================================
   * STEP 5: Optional AI advisory (CONTEXTUAL ONLY)
   * ================================================== */
  let ai = null;

  if (mode === "SECURITY_PLUS_AI") {
    try {
      recordAIAudit({ stage: "ai_execute_attempt", useAI, mode });
      ai = await runAIAnalysis({
        code: content,
        language: inputType,
        findings: normalizedVulnerabilities,
        useAI,
      });
      recordAIAudit({ stage: "ai_execute_success", useAI, mode });
    } catch (err) {
      recordAIAudit({ stage: "ai_execute_error", useAI, mode, error: String(err?.message || err) });
      ai = null;
    }
  }

  /* ==================================================
   * STEP 6: Final response (FRONTEND CONTRACT)
   * ================================================== */
  return {
    success: true,
    mode,
    engineDecision: engineResult.engineDecision || "COMPLETED",
    syntax: engineResult.syntax, // ✅ Syntax status

    analysis: {
      overallRiskScore,
      processingTime,
      vulnerabilities: normalizedVulnerabilities,
      attackerView: attackerMap,
      defenderFixes: defenderMap,
      impactAnalysis: impactMap,
      abuseScenarios: abuseMap,
    },

    ai: ai
      ? {
          enabled: true,
          advisoryOnly: true,
          explanation: ai.explanation,
          codeSuggestions: ai.codeSuggestions,
          hypotheses: ai.hypotheses,
        }
      : { enabled: false },

    ethics: {
      staticAnalysisOnly: true,
      noExecution: true,
      aiAdvisoryOnly: true,
    },
  };
}
