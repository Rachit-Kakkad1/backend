/**
 * OWASP CLASSIFIER
 * ----------------
 * Maps detected vulnerabilities to OWASP Top 10 (2021)
 * Classification is deterministic and descriptive only.
 */

export function runOWASPDetections(vulnerabilities = []) {
  if (!Array.isArray(vulnerabilities)) {
    return [];
  }

  return vulnerabilities.map((vuln) => {
    let category = "A00:2021 - Unclassified";

    switch (vuln.type) {
      case "SQL Injection":
      case "Cross-Site Scripting (XSS)":
        category = "A03:2021 - Injection";
        break;

      case "Hardcoded Secret":
        category =
          "A07:2021 - Identification and Authentication Failures";
        break;

      default:
        category = "A05:2021 - Security Misconfiguration";
        break;
    }

    return {
      ...vuln,
      owasp: category,
    };
  });
}
