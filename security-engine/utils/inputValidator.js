// demo/security-engine/utils/inputValidator.js
import { ALLOWED_INPUT_TYPES, MAX_CONTENT_LENGTH } from "./constants.js";

export function validateInput({ inputType, content }) {
  if (!inputType || !content) {
    return { valid: false, message: "inputType and content are required" };
  }

  if (!ALLOWED_INPUT_TYPES.has(inputType)) {
    return { valid: false, message: "Invalid inputType" };
  }

  if (typeof content !== "string" || content.length > MAX_CONTENT_LENGTH) {
    return {
      valid: false,
      message: "Content too large or invalid",
    };
  }

  return { valid: true };
}
