/**
 * Detects potential SQL Injection vulnerabilities.
 * Assumes unknown variables are tainted by default.
 */
export function detectSQLInjection(normalizedInput) {
  if (
    !normalizedInput ||
    normalizedInput.type !== "code" ||
    !Array.isArray(normalizedInput.blocks)
  ) {
    return [];
  }

  const issues = [];

  const sqlKeywords = /\b(SELECT|INSERT|UPDATE|DELETE|DROP|CREATE|ALTER)\b/i;

  const stringConcat = /(["'`].*["'`]\s*\+)|(\+\s*["'`])|(`.*\$\{.*\}`)/;

  const paramizedSafe = /\b(\?|:\w+)\b/; // prepared statements


  for (const block of normalizedInput.blocks) {
    const code = block?.content?.replace(/\/\/.*|\/\*[\s\S]*?\*\//g, "") || "";

    if (!code) continue;

    // SQL keyword present
    if (!sqlKeywords.test(code)) continue;

    // Dangerous concatenation
    if (stringConcat.test(code)) {
      issues.push({
        type: "SQL Injection",
        severity: "HIGH", // ⚠️ correct for static heuristic
        confidence: "MEDIUM",
        owasp: "A03:2021 - Injection",
        description:
          "SQL query is dynamically constructed using string concatenation. If the interpolated variable is user-controlled, this can lead to SQL injection.",
        recommendation:
          "Use parameterized queries or prepared statements instead of string concatenation.",
        location: block.location || null,
      });
    }
  }

  return issues;
}
