/**
 * ETHICAL GUARD SECURITY ENGINE
 * =============================
 * Single, authoritative entry point for static security analysis
 */

import { validateInput } from "./utils/inputValidator.js";
import { validateSyntax } from "./syntax/index.js";
import { normalizeInput } from "./normalizers/index.js";
import { runAllDetectors } from "./detectors/index.js";
import { calculateRiskScore } from "./riskEngine.js";
import { generateAttackerView } from "./attackerView/attackerView.js";
import { generateDefenderFixes } from "./defenderView/defenderEngine.js";
import { generateSimulatedPayloads } from "./payloads/payloadEngine.js";
import { calculateImpact } from "./impactEngine.js";
import { buildSummary } from "./summaryEngine.js";
import { measureTime } from "./utils/timers.js";

function detectLanguage(inputType, content) {
  const t = String(inputType || "").toLowerCase();
  if (t === "sql") return "sql";
  if (t === "config") return "json";
  const s = String(content || "").trim();
  try {
    JSON.parse(s);
    return "json";
  } catch {}
  const upper = s.slice(0, 512).toUpperCase();
  const sqlHints = ["SELECT ", "INSERT ", "UPDATE ", "DELETE ", "CREATE ", "DROP ", "ALTER ", "WITH "];
  if (sqlHints.some((k) => upper.includes(k))) return "sql";
  return "javascript";
}

export function analyzeInput({ inputType = "code", content, language }) {
  const stopTimer = measureTime();

  /* 1️⃣ Validate input */
  const validation = validateInput({ inputType, content });
  if (!validation.valid) {
    return {
      success: false,
      error: validation.message,
      processingTime: Number(stopTimer()) || 0,
    };
  }

  try {
    const effectiveLanguage = language || detectLanguage(inputType, content);
    const syntaxCheck = validateSyntax(content, effectiveLanguage);
    if (!syntaxCheck.valid) {
      return {
        success: true,
        analysisType: "MANUAL",
        syntax: syntaxCheck,
        analysis: {
          vulnerabilities: [],
          overallRiskScore: 0,
        },
        engineDecision: "HALTED_AT_SYNTAX_STAGE",
        processingTime: Number(stopTimer()) || 0,
      };
    }

    const normalizedInput = normalizeInput(inputType, content, effectiveLanguage);
    const vulnerabilities = runAllDetectors(normalizedInput);
    const rawRiskScore =
      vulnerabilities.length > 0 ? calculateRiskScore(vulnerabilities) : 0;
    const riskScore = Number.isFinite(rawRiskScore) ? rawRiskScore : 0;
    const attackerView = generateAttackerView(vulnerabilities, normalizedInput);
    const defenderFixes = generateDefenderFixes(vulnerabilities, normalizedInput);
    const payloads = generateSimulatedPayloads(vulnerabilities);
    const impactAnalysis = calculateImpact(vulnerabilities);
    const summary = buildSummary(vulnerabilities);

    return {
      success: true,
      syntax: syntaxCheck,
      vulnerabilities,
      riskScore,
      overallRiskScore: riskScore,
      attackerView,
      defenderFixes,
      payloads,
      impactAnalysis,
      summary,
      processingTime: Number(stopTimer()) || 0,
      ethics: {
        staticAnalysisOnly: true,
        noExecution: true,
        noLiveAttacks: true,
      },
      engineDecision: "COMPLETED",
    };
  } catch (err) {
    return {
      success: false,
      error: "Engine failure",
      processingTime: Number(stopTimer()) || 0,
    };
  }
}

export default { analyze: analyzeInput };
