import { SEVERITY_WEIGHTS } from "./utils/constants.js";

/**
 * RISK ENGINE
 * -----------
 * Produces a normalized risk score (0–100)
 * based on severity-weighted findings.
 */

export function calculateRiskScore(vulnerabilities = []) {
  if (!Array.isArray(vulnerabilities) || vulnerabilities.length === 0) {
    return 0;
  }

  const totalWeight = vulnerabilities.reduce((sum, vuln) => {
    const weight = SEVERITY_WEIGHTS[vuln?.severity] || 0;
    return sum + weight;
  }, 0);

  /**
   * Normalization:
   * - Prevents instant saturation
   * - Keeps score proportional
   * - Still rewards severity
   */
  const maxPossible =
    vulnerabilities.length * SEVERITY_WEIGHTS.CRITICAL;

  const normalizedScore = (totalWeight / maxPossible) * 100;

  return Math.min(Math.round(normalizedScore), 100);
}
