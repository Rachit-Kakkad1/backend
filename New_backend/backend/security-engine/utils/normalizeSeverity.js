/**
 * NORMALIZE SEVERITY (ENGINE → DB)
 * --------------------------------
 * Converts any engine / detector severity
 * into DB-safe ENUM values.
 *
 * DB ENUM: CRITICAL | HIGH | MEDIUM | LOW
 */

export function normalizeSeverity(severity) {
  if (!severity) return "LOW";

  const map = {
    CRITICAL: "CRITICAL",
    HIGH: "HIGH",
    MEDIUM: "MEDIUM",
    LOW: "LOW",

    // defensive handling (just in case)
    critical: "CRITICAL",
    high: "HIGH",
    medium: "MEDIUM",
    low: "LOW",
  };

  return map[String(severity)] || "LOW";
}
