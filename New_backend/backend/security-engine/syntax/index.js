import * as acorn from "acorn";
import SQLParser from "node-sql-parser";

const { Parser } = SQLParser;

/**
 * SYNTAX VALIDATION ENGINE
 * ========================
 * - Deterministic, rule-based parsing
 * - Zero execution
 * - Language-aware (JS, SQL, JSON)
 */

let sqlParser = null;
try {
  sqlParser = new Parser();
} catch (e) {
  sqlParser = null;
}

/**
 * Validate syntax for a given content and language.
 * @param {string} content - The code content to validate.
 * @param {string} language - The language of the content (javascript, sql, json).
 * @returns {object} - Validation result { valid, language, errors: [{ message, line, column }] }
 */
export function validateSyntax(content, language) {
  const normalizedLang = language?.toLowerCase() || "unknown";

  if (!content || typeof content !== "string") {
    return {
      valid: false,
      language: normalizedLang,
      errors: [{ message: "Empty or invalid content", line: 0, column: 0 }],
    };
  }

  switch (normalizedLang) {
    case "javascript":
    case "js":
      return validateJavaScript(content);
    case "sql":
      return validateSQL(content);
    case "json":
      return validateJSON(content);
    default:
      // For unsupported languages, we default to valid (or should we fail? User said "Language Detection (JS / SQL / JSON / Config)")
      // If it's "config", it might be JSON.
      // But user listed specific requirements only for JS, SQL, JSON.
      // So other languages pass syntax check (or rather, are skipped).
      return {
        valid: true,
        language: normalizedLang,
        errors: [],
      };
  }
}

function validateJavaScript(content) {
  try {
    acorn.parse(content, { ecmaVersion: 2022, locations: true });
    return {
      valid: true,
      language: "javascript",
      errors: [],
    };
  } catch (err) {
    return {
      valid: false,
      language: "javascript",
      errors: [
        {
          message: err.message.replace(/\s*\(\d+:\d+\)$/, ""), // Remove location from message if present
          line: err.loc?.line || 0,
          column: err.loc?.column || 0,
        },
      ],
    };
  }
}

function validateSQL(content) {
  if (!sqlParser) {
    return {
      valid: false,
      language: "sql",
      errors: [
        {
          message: "SQL parser not initialized",
          line: 0,
          column: 0,
        },
      ],
    };
  }
  try {
    sqlParser.astify(content);
    return {
      valid: true,
      language: "sql",
      errors: [],
    };
  } catch (err) {
    const line = err.location?.start?.line || 0;
    const column = err.location?.start?.column || 0;
    return {
      valid: false,
      language: "sql",
      errors: [
        {
          message: err.message || "Invalid SQL syntax",
          line,
          column,
        },
      ],
    };
  }
}

function validateJSON(content) {
  try {
    JSON.parse(content);
    return {
      valid: true,
      language: "json",
      errors: [],
    };
  } catch (err) {
    // JSON.parse throws SyntaxError but doesn't give line/column easily in standard JS
    // We can try to parse the message "at position N" to guess
    // Or just return 0,0
    
    let line = 1;
    let column = 0;
    
    // Extract position from message if possible (e.g. "Unexpected token } in JSON at position 10")
    const match = err.message.match(/at position (\d+)/);
    if (match) {
        const pos = parseInt(match[1], 10);
        // Calculate line/col
        const prefix = content.substring(0, pos);
        const lines = prefix.split('\n');
        line = lines.length;
        column = lines[lines.length - 1].length + 1;
    }

    return {
      valid: false,
      language: "json",
      errors: [
        {
          message: err.message,
          line,
          column,
        },
      ],
    };
  }
}
