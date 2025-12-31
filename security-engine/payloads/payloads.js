/**
 * PAYLOAD ENGINE (SIMULATED)
 * --------------------------
 * Generates educational, NON-EXECUTABLE payload explanations.
 * These are conceptual descriptions, NOT real attack payloads.
 */
export function generateSimulatedPayloads(vulnerabilities = []) {
  return vulnerabilities.map((vuln) => {
    const type = vuln?.type || "Unknown";

    switch (type) {
      case "SQL Injection":
        return {
          type: "SQL Injection",
          payloads: [
            "An attacker may attempt to manipulate query parameters to change how the database interprets a query.",
            "Improper query construction could allow bypassing filters or accessing unintended records.",
          ],
          note:
            "These are conceptual examples used to explain exploitability. No payloads are executed or generated.",
        };

      case "Cross-Site Scripting (XSS)":
        return {
          type: "Cross-Site Scripting (XSS)",
          payloads: [
            "User input reflected in responses without encoding could allow injection of script-like content.",
            "Such scripts may execute in another user’s browser if proper output encoding is missing.",
          ],
          note:
            "These descriptions are educational and demonstrate risk conceptually without providing exploit code.",
        };

      case "Hardcoded Secret":
        return {
          type: "Hardcoded Secret",
          payloads: [
            "Exposed credentials in source code could be reused by an attacker.",
            "Secrets committed to repositories may remain accessible through version history.",
          ],
          note:
            "No executable payloads exist for this issue. Risk arises from credential exposure and reuse.",
        };

      default:
        return {
          type,
          payloads: [
            "This issue could potentially be abused depending on application context and threat model.",
          ],
          note:
            "No specific simulated payloads are available for this vulnerability type.",
        };
    }
  });
}
