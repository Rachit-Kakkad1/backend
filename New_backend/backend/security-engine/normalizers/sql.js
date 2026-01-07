/**
 * Normalizes SQL query input for static security analysis.
 * This step does NOT execute or validate the query.
 */
export function normalizeSQL(content) {
  const safeContent =
    typeof content === "string" ? content : String(content ?? "");

  return {
    type: "sql",
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
