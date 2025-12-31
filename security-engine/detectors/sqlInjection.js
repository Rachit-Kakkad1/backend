/**
 * Detects potential SQL Injection vulnerabilities in code input.
 * This is a static pattern-based detection and does not execute queries.
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
  const userInput = /\breq\.(query|body|params|headers|cookies)\b/;
  const concat = /(\+)|(`.*\$\{.*\}`)/;

  for (const block of normalizedInput.blocks) {
    const code =
      block?.content?.replace(/\/\/.*|\/\*[\s\S]*?\*\//g, "") || "";

    if (!code) continue;

    if (sqlKeywords.test(code) && userInput.test(code) && concat.test(code)) {
      issues.push({
        type: "SQL Injection",
        severity: "CRITICAL", // ✅ ENUM SAFE
        owasp: "A03:2021 - Injection",
        description:
          "SQL queries are constructed using string concatenation with user-controlled input, which may allow attackers to manipulate query logic.",
        recommendation:
          "Use parameterized queries or prepared statements provided by the database driver.",
        location: block.location || null,
      });
    }
  }

  return issues;
}
