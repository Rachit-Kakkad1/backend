export function generateAttackerView(vulnerabilities, normalizedInput) {
  return vulnerabilities.map((vuln) => {
    switch (vuln.type) {
      case "SQL Injection":
        return {
          vulnerability: vuln.type,
          entryPoint: "User-controlled input used in SQL query",
          attackerMindset:
            "An attacker looks for inputs that directly affect database queries.",
          abuseLogic:
            "By manipulating input values, the attacker may alter the intended SQL logic.",
          potentialGain: "Unauthorized access to database records",
        };

      case "Cross-Site Scripting (XSS)":
        return {
          vulnerability: vuln.type,
          entryPoint: "Unsanitized user input rendered in the browser",
          attackerMindset:
            "An attacker searches for places where input is injected into HTML or DOM.",
          abuseLogic:
            "Malicious scripts could be injected to run in another user's browser.",
          potentialGain: "Session hijacking or credential theft",
        };

      case "Hardcoded Secret":
        return {
          vulnerability: vuln.type,
          entryPoint: "Source code or config files",
          attackerMindset:
            "An attacker looks for exposed credentials in code repositories.",
          abuseLogic:
            "Extracted secrets can be reused to access protected services.",
          potentialGain: "Unauthorized API or system access",
        };

      default:
        return {
          vulnerability: vuln.type,
          entryPoint: "Unknown",
          attackerMindset: "Generic probing for weaknesses",
          abuseLogic: "Unknown exploitation path",
          potentialGain: "Unknown",
        };
    }
  });
}
