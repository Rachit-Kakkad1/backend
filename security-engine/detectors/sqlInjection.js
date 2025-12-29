export function detectSQLInjection(normalizedInput) {
  if (normalizedInput.type !== "sql") return [];

  const issues = [];
  if (normalizedInput.metadata?.usesConcat) {
    issues.push({
      type: "SQL Injection",
      owasp: "A03:2021 - Injection",
      severity: "High",
      description: "Query uses string concatenation; may allow SQL injection.",
      recommendation: "Use parameterized queries or prepared statements.",
    });
  }
  return issues;
}
