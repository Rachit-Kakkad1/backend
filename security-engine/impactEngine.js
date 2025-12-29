export function generateImpactAnalysis(vulnerabilities, normalizedInput) {
  if (!vulnerabilities || vulnerabilities.length === 0) {
    return {
      technicalImpact: "No exploitable technical impact detected.",
      dataExposure: "No sensitive data exposure identified.",
      businessImpact: "No business impact at current risk level.",
    };
  }

  const impacts = {
    technicalImpact: [],
    dataExposure: [],
    businessImpact: [],
  };

  for (const vuln of vulnerabilities) {
    switch (vuln.type) {
      case "SQL Injection":
        impacts.technicalImpact.push(
          "Database queries can be manipulated by an attacker."
        );
        impacts.dataExposure.push(
          "User records, credentials, or internal data may be exposed."
        );
        impacts.businessImpact.push(
          "Data breach risk, regulatory penalties, and loss of user trust."
        );
        break;

      case "Cross-Site Scripting (XSS)":
        impacts.technicalImpact.push(
          "Malicious scripts can execute in a user’s browser."
        );
        impacts.dataExposure.push(
          "Session tokens or user actions may be hijacked."
        );
        impacts.businessImpact.push(
          "Account compromise, phishing attacks, and brand damage."
        );
        break;

      case "Hardcoded Secret":
        impacts.technicalImpact.push(
          "Secrets can be extracted from source or configuration."
        );
        impacts.dataExposure.push("API keys or credentials may be abused.");
        impacts.businessImpact.push(
          "Unauthorized system access and potential financial loss."
        );
        break;

      default:
        impacts.technicalImpact.push("Potential technical weakness detected.");
        impacts.businessImpact.push("Unknown business risk.");
    }
  }

  return {
    technicalImpact: [...new Set(impacts.technicalImpact)].join(" "),
    dataExposure: [...new Set(impacts.dataExposure)].join(" "),
    businessImpact: [...new Set(impacts.businessImpact)].join(" "),
  };
}
