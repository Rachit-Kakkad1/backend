export function generateDefenderFixes(vulnerabilities, normalizedInput) {
  return vulnerabilities.map((vuln) => {
    switch (vuln.type) {
      case "SQL Injection":
        return {
          vulnerability: vuln.type,
          secureFix:
            "Use parameterized queries instead of string concatenation.",
          secureExample: "SELECT * FROM users WHERE id = ?",
          bestPractice:
            "Always use prepared statements provided by your database library.",
          owasp: vuln.owasp,
        };

      case "Cross-Site Scripting (XSS)":
        return {
          vulnerability: vuln.type,
          secureFix: "Avoid using innerHTML with user input.",
          secureExample: "element.textContent = userInput;",
          bestPractice:
            "Sanitize or encode all user-controlled data before rendering.",
          owasp: vuln.owasp,
        };

      case "Hardcoded Secret":
        return {
          vulnerability: vuln.type,
          secureFix: "Remove secrets from source code.",
          secureExample: "process.env.API_KEY",
          bestPractice:
            "Store secrets in environment variables or secret managers.",
          owasp: vuln.owasp,
        };

      default:
        return {
          vulnerability: vuln.type,
          secureFix: "Follow secure coding best practices.",
          bestPractice: "Refer to OWASP secure coding guidelines.",
          owasp: vuln.owasp,
        };
    }
  });
}
