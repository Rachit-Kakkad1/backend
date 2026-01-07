/**
 * Detects hardcoded secrets in source code or configuration files.
 * Static, pattern-based detection only.
 */
export function detectHardcodedSecrets(normalizedInput) {
  if (!normalizedInput || !["code", "config"].includes(normalizedInput.type)) {
    return [];
  }

  const issues = [];
  const content = normalizedInput.raw || "";

  const patterns = [
    {
      regex: /\b(api[_-]?key|apikey)\b\s*[:=]\s*['"][^'"]{10,}['"]/i,
      label: "API Key",
    },
    {
      regex: /\b(secret|token|password|passwd|pwd)\b\s*[:=]\s*['"][^'"]{6,}['"]/i,
      label: "Secret or Password",
    },
    {
      regex: /\b(aws|amazon)[_-]?(secret|access)[_-]?key\b\s*[:=]\s*['"][^'"]+['"]/i,
      label: "AWS Credential",
    },
  ];

  for (const { regex, label } of patterns) {
    const match = content.match(regex);

    if (match) {
      issues.push({
        type: "Hardcoded Secret",
        severity: "HIGH", // ✅ engine-level, normalized later
        owasp: "A02:2021 - Cryptographic Failures",
        description: `A ${label} appears to be hardcoded in the source code or configuration file.`,
        recommendation:
          "Remove hardcoded secrets and store them securely using environment variables or a secrets management service.",
        location: {
          context: match[0],
          source: normalizedInput.type,
        },
      });
    }
  }

  return issues;
}
