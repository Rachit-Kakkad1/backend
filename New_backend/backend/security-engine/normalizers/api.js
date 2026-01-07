/**
 * Normalizes API endpoint input for static security analysis.
 * This is a read-only normalization step.
 */
export function normalizeAPI(content) {
  const safeContent =
    typeof content === "string" ? content : String(content ?? "");

  return {
    type: "api",
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
