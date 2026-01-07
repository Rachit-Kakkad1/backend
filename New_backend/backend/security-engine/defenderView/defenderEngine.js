/**
 * Generates secure remediation guidance for detected vulnerabilities.
 * This provides defensive, best-practice fixes only.
 * No executable or harmful code is produced.
 */
export function generateDefenderFixes(vulnerabilities = [], _normalizedInput) {
  return vulnerabilities.map((vuln) => {
    const type = vuln?.type || "Unknown";

    switch (type) {
      case "SQL Injection":
        return {
          vulnerability: "SQL Injection",
          secureFix:
            "Use parameterized queries or prepared statements instead of building SQL queries via string concatenation.",
          secureExample:
            "db.query('SELECT * FROM users WHERE id = ?', [userId]);",
          bestPractice:
            "Always rely on database parameter binding and avoid interpolating user input directly into queries.",
          owasp: vuln.owasp || "A03:2021 - Injection",
        };

      case "Cross-Site Scripting (XSS)":
        return {
          vulnerability: "Cross-Site Scripting (XSS)",
          secureFix:
            "Avoid rendering raw user input into HTML or the DOM without proper encoding.",
          secureExample:
            "element.textContent = userInput; // instead of innerHTML",
          bestPractice:
            "Encode output based on context and use trusted templating or sanitization libraries.",
          owasp: vuln.owasp || "A03:2021 - Injection",
        };

      case "Hardcoded Secret":
        return {
          vulnerability: "Hardcoded Secret",
          secureFix:
            "Remove credentials and secrets from source code and configuration files.",
          secureExample:
            "const apiKey = process.env.API_KEY;",
          bestPractice:
            "Store secrets in environment variables or use a dedicated secret management service.",
          owasp: vuln.owasp || "A02:2021 - Cryptographic Failures",
        };

      default:
        return {
          vulnerability: type,
          secureFix:
            "Apply secure coding practices and validate all inputs and outputs.",
          secureExample:
            "// Follow principle of least privilege and secure defaults",
          bestPractice:
            "Review the code against OWASP secure coding guidelines and threat models.",
          owasp: vuln.owasp || "OWASP Top 10",
        };
    }
  });
}
