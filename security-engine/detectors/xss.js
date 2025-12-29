export function detectXSS(normalizedInput) {
  if (normalizedInput.type !== "code") return [];

  const issues = [];
  for (const block of normalizedInput.blocks || []) {
    if (/innerHTML\s*=|document\.write\(/i.test(block.content)) {
      issues.push({
        type: "Cross-Site Scripting (XSS)",
        owasp: "A03:2021 - Injection",
        severity: "Medium",
        description:
          "Direct assignment to innerHTML or document.write may lead to XSS.",
        recommendation: "Use safe DOM APIs or sanitize user input.",
      });
      break;
    }
  }
  return issues;
}
