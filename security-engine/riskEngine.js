export function calculateRiskScore(vulnerabilities = []) {
  let score = 0;

  for (const vuln of vulnerabilities) {
    switch (vuln.severity) {
      case "Critical":
        score += 60;
        break;
      case "High":
        score += 40;
        break;
      case "Medium":
        score += 25;
        break;
      case "Low":
        score += 10;
        break;
      default:
        break;
    }
  }

  // Cap score at 100
  return Math.min(score, 100);
}
