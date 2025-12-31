/**
 * Detects potential Cross-Site Scripting (XSS) vulnerabilities in code input.
 * This is a static, pattern-based detection and does not execute code.
 */
export function detectXSS(normalizedInput) {
  if (
    !normalizedInput ||
    normalizedInput.type !== "code" ||
    !Array.isArray(normalizedInput.blocks)
  ) {
    return [];
  }

  const issues = [];

  const userInput = /\breq\.(query|body|params|headers|cookies)\b/;
  const htmlSink =
    /\b(res\.send|res\.write|res\.end|innerHTML|document\.write)\b/i;
  const concat = /(\+)|(`.*\$\{.*\}`)/;

  for (const block of normalizedInput.blocks) {
    const code =
      block?.content?.replace(/\/\/.*|\/\*[\s\S]*?\*\//g, "") || "";

    if (!code) continue;

    if (htmlSink.test(code) && userInput.test(code) && concat.test(code)) {
      issues.push({
        type: "Cross-Site Scripting (XSS)",
        severity: "HIGH", // ✅ ENUM SAFE
        owasp: "A03:2021 - Injection",
        description:
          "User-controlled input is reflected into HTML output without proper encoding, enabling script injection.",
        recommendation:
          "Encode or sanitize output before rendering and avoid constructing HTML directly from user input.",
        location: block.location || null,
      });
    }
  }

  return issues;
}
