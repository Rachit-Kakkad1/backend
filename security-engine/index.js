import { normalizeInput } from "./normalizers/index.js";
import { runOWASPDetections } from "./owaspEngine.js";
import { measureTime } from "./utils/timers.js";

export function analyze(inputType, content) {
  const stopTimer = measureTime();

  const normalizedInput = normalizeInput(inputType, content);
  const vulnerabilities = runOWASPDetections(normalizedInput);

  return {
    normalizedInput,
    vulnerabilities,
    processingTime: stopTimer(),
  };
}
