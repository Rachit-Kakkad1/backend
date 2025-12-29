export function detectHardcodedSecrets(normalizedInput) {
  if (normalizedInput.type !== "config") return [];

  if ((normalizedInput.secrets || []).length === 0) return [];

  return [
    {
      type: "Hardcoded Secret",
      owasp: "A02:2021 - Cryptographic Failures",
      severity: "High",
      description: "Sensitive data like API keys are hardcoded.",
      recommendation:
        "Move secrets to environment variables or a secure vault.",
    },
  ];
}
