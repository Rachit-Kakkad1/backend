import { SEVERITY_WEIGHTS } from "./utils/constants.js";

/**
 * RISK ENGINE
 * ===========
 * Deterministic risk score (0–100)
 */

const HIGH_IMPACT_TYPES = new Set([
  "Hardcoded Secret",
  "Credential Exposure",
  "API Key Exposure",
  "Password Leak",
  "SQL Injection",
  "Command Injection",
  "Remote Code Execution",
]);

export function calculateRiskScore(vulnerabilities = []) {
  if (!Array.isArray(vulnerabilities) || vulnerabilities.length === 0) {
    return 0;
  }

  let totalScore = 0;

  for (const vuln of vulnerabilities) {
    if (!vuln?.severity) continue;

    // 🔥 FORCE FINAL ENUM NORMALIZATION
    const severity =
      String(vuln.severity).charAt(0).toUpperCase() +
      String(vuln.severity).slice(1).toLowerCase();

    const baseWeight = SEVERITY_WEIGHTS[severity] || 0;

    let multiplier = 1;
    if (HIGH_IMPACT_TYPES.has(vuln?.type)) {
      multiplier = 1.5;
    }

    totalScore += baseWeight * multiplier;
  }

  const maxPossible =
    vulnerabilities.length * SEVERITY_WEIGHTS.Critical * 1.5;

  const normalizedScore = (totalScore / maxPossible) * 100;

  return Math.min(Math.round(normalizedScore), 100);
}
