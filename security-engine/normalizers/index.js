import { normalizeCode } from "./code.js";
import { normalizeSQL } from "./sql.js";
import { normalizeConfig } from "./config.js";
import { normalizeAPI } from "./api.js";

/**
 * Normalizes user input into a structured format
 * suitable for static security analysis.
 */
export function normalizeInput(inputType, content, language) {
  const safeContent =
    typeof content === "string" ? content : String(content ?? "");

  switch (inputType) {
    case "code":
      return normalizeCode(safeContent, language);

    case "sql":
      return normalizeSQL(safeContent);

    case "config":
      return normalizeConfig(safeContent);

    case "api":
      return normalizeAPI(safeContent);

    default:
      return {
        type: "unknown",
        raw: safeContent,
        blocks: [
          {
            content: safeContent,
            location: {
              line: 1,
              column: 1,
            },
          },
        ],
      };
  }
}
