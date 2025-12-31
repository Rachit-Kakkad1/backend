/**
 * SUMMARY ENGINE
 * --------------
 * Aggregates vulnerability statistics by severity.
 * Severity values are expected to be ALL CAPS.
 */

export function buildSummary(vulnerabilities = []) {
  const summary = {
    total: vulnerabilities.length,
    CRITICAL: 0,
    HIGH: 0,
    MEDIUM: 0,
    LOW: 0,
  };

  if (!Array.isArray(vulnerabilities)) {
    return summary;
  }

  vulnerabilities.forEach((v) => {
    switch (v?.severity) {
      case "CRITICAL":
        summary.CRITICAL++;
        break;
      case "HIGH":
        summary.HIGH++;
        break;
      case "MEDIUM":
        summary.MEDIUM++;
        break;
      case "LOW":
        summary.LOW++;
        break;
      default:
        // ignore unknown severities
        break;
    }
  });

  return summary;
}
