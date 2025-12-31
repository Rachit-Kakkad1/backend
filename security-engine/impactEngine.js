/**
 * IMPACT ENGINE
 * -------------
 * Describes potential impact of detected vulnerabilities.
 * Descriptive only. No execution. No exploitation.
 */

export function calculateImpact(vulnerabilities = []) {
  if (!Array.isArray(vulnerabilities)) return [];

  return vulnerabilities.map((vuln) => {
    const severity = vuln?.severity || "LOW";

    switch (vuln.type) {
      case "SQL Injection":
        return {
          vulnerability: "SQL Injection",
          severity,
          impactLevel: "HIGH",
          killChainStage: "Exploitation",
          businessImpact:
            "Unauthorized access, modification, or destruction of sensitive database records.",
          technicalImpact:
            "Manipulation of SQL query execution through unvalidated user input.",
          likelihood:
            "HIGH when user input is directly concatenated into queries.",
        };

      case "Cross-Site Scripting (XSS)":
        return {
          vulnerability: "Cross-Site Scripting (XSS)",
          severity,
          impactLevel: "MEDIUM",
          killChainStage: "Execution",
          businessImpact:
            "Session hijacking, credential theft, or reputational damage.",
          technicalImpact:
            "Execution of attacker-controlled scripts in a victim’s browser.",
          likelihood:
            "MEDIUM to HIGH depending on input exposure and output encoding.",
        };

      case "Hardcoded Secret":
        return {
          vulnerability: "Hardcoded Secret",
          severity,
          impactLevel: "HIGH",
          killChainStage: "Credential Access",
          businessImpact:
            "Credential reuse leading to unauthorized access to internal or third-party systems.",
          technicalImpact:
            "Secrets embedded in code or configuration files exposed via repositories or logs.",
          likelihood:
            "HIGH if secrets are committed or deployed without rotation.",
        };

      default:
        return {
          vulnerability: vuln.type || "Unknown",
          severity,
          impactLevel: "LOW",
          killChainStage: "Unknown",
          businessImpact:
            "Potential impact depends on how the vulnerability is exploited.",
          technicalImpact:
            "Technical consequences vary based on application context.",
          likelihood: "UNKNOWN until further analysis.",
        };
    }
  });
}
