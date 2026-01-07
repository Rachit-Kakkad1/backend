/**
 * ENGINE CONSTANTS
 * ----------------
 * Centralized enums & mappings
 */

export const SEVERITY_WEIGHTS = {
  Critical: 30,
  High: 15,
  Medium: 5,
  Low: 2,
};

export const OWASP_MAP = {
  SQL_INJECTION: "A03:2021 - Injection",
  XSS: "A03:2021 - Injection",
  HARDCODED_SECRET: "A07:2021 - Identification and Authentication Failures",
};

export const MAX_CODE_SIZE = 50_000;

export const SUPPORTED_INPUT_TYPES = ["code", "sql", "config", "api"];

export const SUPPORTED_LANGUAGES = ["javascript", "typescript", "node"];
