// services/decision.service.js

/**
 * Decides analysis presentation mode.
 *
 * IMPORTANT:
 * - Static security engine ALWAYS runs
 * - AI is advisory-only and contextual
 * - There is NO AI-only analysis mode
 *
 * Modes:
 * - SECURITY_ONLY        → Engine results only
 * - SECURITY_PLUS_AI     → Engine + AI explanation
 */
export function decideAnalysisMode({ useAI = false, riskScore = 0 }) {
  console.info("[AI_OPT_IN] verify", { useAI: useAI === true });
  if (useAI === true) {
    console.info("[AI_OPT_IN] mode_set", { mode: "SECURITY_PLUS_AI" });
    return "SECURITY_PLUS_AI";
  }
  console.info("[AI_OPT_IN] mode_set", { mode: "SECURITY_ONLY" });
  return "SECURITY_ONLY";
}
