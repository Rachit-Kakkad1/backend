/**
 * ETHICAL PAYLOAD GENERATOR
 * ------------------------
 * Generates NON-EXECUTABLE, SIMULATED payload examples.
 * These are strictly educational and are NEVER executed.
 */
export function generateSimulatedPayloads(vulnerabilities = []) {
  return vulnerabilities.map((vuln) => {
    const type = vuln?.type || "Unknown";

    switch (type) {
      case "SQL Injection":
        return {
          type: "SQL Injection",
          payloads: [
            "' OR '1'='1' --",
            "' UNION SELECT NULL --",
            "'; DROP TABLE users; --",
          ],
          note:
            "These payloads are simulated examples only, used to explain how improper query construction can be abused. They are never executed.",
        };

      case "Cross-Site Scripting (XSS)":
        return {
          type: "Cross-Site Scripting (XSS)",
          payloads: [
            "<script>alert(1)</script>",
            "<img src=x onerror=alert(1)>",
            "<svg onload=alert(1)>",
          ],
          note:
            "These payloads demonstrate how unescaped input could result in script execution in a browser. No payloads are executed.",
        };

      case "Hardcoded Secret":
        return {
          type: "Hardcoded Secret",
          payloads: [
            "Credential reuse across environments",
            "Secret leakage through version control history",
            "Exposure via CI/CD logs or build artifacts",
          ],
          note:
            "No executable payloads exist for this issue. The risk lies in credential exposure and reuse.",
        };

      default:
        return {
          type,
          payloads: [],
          note:
            "No simulated payloads are available for this vulnerability type.",
        };
    }
  });
}
