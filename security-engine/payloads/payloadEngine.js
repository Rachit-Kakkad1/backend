export function generateSimulatedPayloads(vulnerabilities) {
  const payloads = [];

  for (const vuln of vulnerabilities) {
    switch (vuln.type) {
      case "SQL Injection":
        payloads.push({
          vulnerability: "SQL Injection",
          simulated: true,
          payload: "' OR '1'='1' --",
          note: "SIMULATED payload for demonstration only. Not executed.",
        });
        break;

      case "Cross-Site Scripting (XSS)":
        payloads.push({
          vulnerability: "XSS",
          simulated: true,
          payload: "<script>alert('XSS')</script>",
          note: "SIMULATED payload. Demonstrates reflective XSS pattern.",
        });
        break;

      case "Hardcoded Secret":
        payloads.push({
          vulnerability: "Hardcoded Secret",
          simulated: true,
          payload: "API_KEY=EXPOSED_SECRET_VALUE",
          note: "SIMULATED example of exposed credential.",
        });
        break;

      default:
        break;
    }
  }

  return payloads;
}
