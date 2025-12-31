import { validateInput } from "../utils/inputValidator.js";
import { normalizeInput } from "../normalizers/index.js";
import { runAllDetectors } from "../detectors/index.js";
import { calculateRiskScore } from "../riskEngine.js";
import { generateAttackerView } from "../attackerView/attackerView.js";
import { generateDefenderFixes } from "../defenderView/defenderEngine.js";
import { calculateImpact } from "../impactEngine.js";
import { buildSummary } from "../summaryEngine.js";
import { generateSimulatedPayloads } from "../payloads/payloadEngine.js";
import { measureTime } from "../utils/timers.js";

/**
 * ETHICAL SECURITY GATE
 * --------------------
 * Enforces static-only, read-only analysis
 * No execution, no attacks, no mutations
 */
export function runEthicalSecurityAnalysis({ inputType, content, language }) {
  const stopTimer = measureTime();

  /* 1️⃣ Validate input */
  const validation = validateInput({ inputType, content });
  if (!validation.valid) {
    return {
      success: false,
      error: validation.message,
      processingTime: stopTimer(),
    };
  }

  /* 2️⃣ Normalize input */
  const normalizedInput = normalizeInput(inputType, content, language);
  if (!normalizedInput || typeof normalizedInput !== "object") {
    return {
      success: false,
      error: "Failed to normalize input",
      processingTime: stopTimer(),
    };
  }

  /* 3️⃣ Detect vulnerabilities (HARDENED) */
  const vulnerabilities = runAllDetectors(normalizedInput);
  const safeVulnerabilities = Array.isArray(vulnerabilities)
    ? vulnerabilities
    : [];

  /* 4️⃣ Risk scoring */
  const overallRiskScore =
    safeVulnerabilities.length > 0
      ? calculateRiskScore(safeVulnerabilities)
      : 0;

  /* 5️⃣ Attacker & Defender views */
  const attackerView = generateAttackerView(
    safeVulnerabilities,
    normalizedInput
  );

  const defenderFixes = generateDefenderFixes(
    safeVulnerabilities,
    normalizedInput
  );

  /* 6️⃣ Ethical simulated payloads */
  const simulatedPayloads = generateSimulatedPayloads(safeVulnerabilities);

  /* 7️⃣ Impact analysis & summary */
  const impactAnalysis = calculateImpact(
    safeVulnerabilities,
    normalizedInput
  );

  const summary = buildSummary({
    vulnerabilities: safeVulnerabilities,
    overallRiskScore,
    attackerView,
    defenderFixes,
    impactAnalysis,
  });

  /* 8️⃣ Final response */
  return {
    success: true,
    normalizedInput,
    vulnerabilities: safeVulnerabilities,
    attackerView,
    defenderFixes,
    simulatedPayloads,
    impactAnalysis,
    summary,
    overallRiskScore,
    processingTime: stopTimer(),
    ethics: {
      staticAnalysisOnly: true,
      noExecution: true,
      noLiveAttacks: true,
    },
  };
}
