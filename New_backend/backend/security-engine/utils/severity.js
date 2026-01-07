export function normalizeSeverity(severity) {
  const map = {
    critical: "CRITICAL",
    high: "HIGH",
    medium: "MEDIUM",
    low: "LOW",
  };

  if (!severity) return "LOW";

  const key = String(severity).toLowerCase();
  return map[key] || "LOW";
}
