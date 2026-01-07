// services/securityAnalysis.service.js
import securityEngine from "../security-engine/index.js";

/**
 * Runs deterministic (manual) security analysis.
 * This is the PRIMARY source of truth for findings and risk.
 */
export async function runSecurityAnalysis(code, language) {
  const result = await securityEngine.analyze(code, language);

  return {
    // Canonical fields (used everywhere)
    findings: Array.isArray(result.findings) ? result.findings : [],
    riskScore: Number.isFinite(result.riskScore) ? result.riskScore : 0,

    // Optional metadata (safe fallbacks)
    summary: result.summary ?? null,
    breakdown: result.breakdown ?? {},

    // Explicit source marker (VERY IMPORTANT)
    source: "SECURITY_ENGINE",
  };
}
