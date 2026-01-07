import { detectSQLInjection } from "./sqlInjection.js";
import { detectXSS } from "./xss.js";
import { detectHardcodedSecrets } from "./hardcodedSecrets.js";
import { detectCodeQualityIssues } from "./quality.js";

/**
 * Runs all vulnerability detectors against normalized input.
 * Each detector is isolated to prevent a single failure
 * from crashing the entire analysis.
 */
export function runAllDetectors(normalizedInput) {
  if (!normalizedInput || typeof normalizedInput !== "object") {
    return [];
  }

  const findings = [];

  try {
    const sqlFindings = detectSQLInjection(normalizedInput);
    if (Array.isArray(sqlFindings)) findings.push(...sqlFindings);
  } catch (error) {
    console.error("SQL Injection detector failed:", error.message);
  }

  try {
    const xssFindings = detectXSS(normalizedInput);
    if (Array.isArray(xssFindings)) findings.push(...xssFindings);
  } catch (error) {
    console.error("XSS detector failed:", error.message);
  }

  try {
    const secretFindings = detectHardcodedSecrets(normalizedInput);
    if (Array.isArray(secretFindings)) findings.push(...secretFindings);
  } catch (error) {
    console.error("Hardcoded Secrets detector failed:", error.message);
  }

  try {
    const qualityFindings = detectCodeQualityIssues(normalizedInput);
    if (Array.isArray(qualityFindings)) findings.push(...qualityFindings);
  } catch (error) {
    console.error("Code Quality detector failed:", error.message);
  }

  return findings;
}
