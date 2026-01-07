import { MAX_CODE_SIZE, SUPPORTED_INPUT_TYPES } from "./constants.js";

/**
 * INPUT VALIDATION
 * ----------------
 * Blocks malformed, oversized, or unsafe analysis requests
 */

export function validateInput({ inputType, content }) {
  if (!content || typeof content !== "string") {
    return {
      valid: false,
      message: "Input content must be a non-empty string",
    };
  }

  if (content.length > MAX_CODE_SIZE) {
    return {
      valid: false,
      message: `Input exceeds maximum size of ${MAX_CODE_SIZE} characters`,
    };
  }

  if (inputType && !SUPPORTED_INPUT_TYPES.includes(inputType)) {
    return {
      valid: false,
      message: `Unsupported input type: ${inputType}`,
    };
  }

  return { valid: true };
}
