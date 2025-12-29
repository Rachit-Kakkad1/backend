// demo/security-engine/utils/constants.js

// Allowed input types for Feature 1
export const ALLOWED_INPUT_TYPES = new Set(["code", "api", "sql", "config"]);

// Max content length for input (50 KB for demo)
export const MAX_CONTENT_LENGTH = 50_000;

// Risk score weights (can be adjusted per vulnerability)
export const RISK_WEIGHTS = {
  "SQL Injection": 50,
  "Cross-Site Scripting (XSS)": 30,
  "Hardcoded Secret": 50,
};

// Default severity mapping (just for display)
export const SEVERITY_VALUES = {
  Low: 10,
  Medium: 30,
  High: 50,
  Critical: 80,
};
