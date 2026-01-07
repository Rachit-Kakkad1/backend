/**
 * Normalizes configuration file input for static security analysis.
 * This step does NOT detect vulnerabilities — it only structures input.
 */
export function normalizeConfig(content) {
  const safeContent =
    typeof content === "string" ? content : String(content ?? "");

  return {
    type: "config",
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
