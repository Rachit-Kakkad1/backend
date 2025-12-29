import { runAllDetectors } from "./detectors/index.js";

export function runOWASPDetections(normalizedInput) {
  return runAllDetectors(normalizedInput);
}
