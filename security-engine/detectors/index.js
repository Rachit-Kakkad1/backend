import { detectSQLInjection } from "./sqlInjection.js";
import { detectXSS } from "./xss.js";
import { detectHardcodedSecrets } from "./hardcodedSecrets.js";

export function runAllDetectors(normalizedInput) {
  return [
    ...detectSQLInjection(normalizedInput),
    ...detectXSS(normalizedInput),
    ...detectHardcodedSecrets(normalizedInput),
  ];
}
