/**
 * Generates attacker perspective explanations for each vulnerability.
 * This is a READ-ONLY, educational simulation.
 * No real exploitation logic is executed.
 */
export function generateAttackerView(vulnerabilities = [], _normalizedInput) {
  return vulnerabilities.map((vuln) => {
    const type = vuln?.type || "Unknown";

    switch (type) {
      case "SQL Injection":
        return {
          vulnerability: "SQL Injection",
          entryPoint: "User-controlled input reaching database queries",
          attackerMindset:
            "An attacker searches for parameters that influence SQL statements without proper sanitization.",
          abuseLogic:
            "By injecting crafted SQL fragments, the attacker can modify query logic to bypass authentication or extract data.",
          potentialGain:
            "Unauthorized access to sensitive database records or full database compromise",
        };

      case "Cross-Site Scripting (XSS)":
        return {
          vulnerability: "Cross-Site Scripting (XSS)",
          entryPoint: "Unsanitized user input rendered in HTML responses",
          attackerMindset:
            "An attacker looks for places where user input is reflected in the browser without encoding.",
          abuseLogic:
            "Injected JavaScript executes in the victim’s browser, allowing malicious actions under the victim’s session.",
          potentialGain:
            "Session hijacking, credential theft, or malicious actions on behalf of the user",
        };

      case "Hardcoded Secret":
        return {
          vulnerability: "Hardcoded Secret",
          entryPoint: "Source code or configuration files",
          attackerMindset:
            "An attacker scans repositories and builds for embedded credentials.",
          abuseLogic:
            "Exposed secrets can be reused to authenticate against internal systems or third-party services.",
          potentialGain:
            "Unauthorized access to APIs, databases, or cloud resources",
        };

      default:
        return {
          vulnerability: type,
          entryPoint: "Application surface",
          attackerMindset:
            "An attacker probes application behavior to discover unintended functionality.",
          abuseLogic:
            "Without clear validation or controls, the weakness may be abused in unexpected ways.",
          potentialGain:
            "Unknown impact depending on how the weakness can be exploited",
        };
    }
  });
}
