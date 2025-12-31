/**
 * ETHICAL GUARD SECURITY ENGINE
 * =============================
 * Single, authoritative entry point for static security analysis
 */

import { validateInput } from "./utils/inputValidator.js";
import { normalizeInput } from "./normalizers/index.js";
import { runAllDetectors } from "./detectors/index.js";
import { calculateRiskScore } from "./riskEngine.js";
import { generateAttackerView } from "./attackerView/attackerView.js";
import { generateDefenderFixes } from "./defenderView/defenderEngine.js";
import { generateSimulatedPayloads } from "./payloads/payloadEngine.js";
import { calculateImpact } from "./impactEngine.js";
import { buildSummary } from "./summaryEngine.js";
import { measureTime } from "./utils/timers.js";

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

  /* 2️⃣ Normalize input */
  const normalizedInput = normalizeInput(inputType, content, language);

  /* 3️⃣ Detect vulnerabilities */
  const vulnerabilities = runAllDetectors(normalizedInput);

  /* 4️⃣ Risk scoring */
  const rawRiskScore =
    vulnerabilities.length > 0
      ? calculateRiskScore(vulnerabilities)
      : 0;

  const riskScore = Number.isFinite(rawRiskScore) ? rawRiskScore : 0;

  /* 5️⃣ Attacker / Defender views */
  const attackerView = generateAttackerView(
    vulnerabilities,
    normalizedInput
  );

  const defenderFixes = generateDefenderFixes(
    vulnerabilities,
    normalizedInput
  );

  /* 6️⃣ Simulated payloads (ethical only) */
  const payloads = generateSimulatedPayloads(vulnerabilities);

  /* 7️⃣ Impact + summary */
  const impactAnalysis = calculateImpact(vulnerabilities);

  const summary = buildSummary(vulnerabilities);

  return {
    success: true,
    vulnerabilities,
    riskScore,
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
  };
}
