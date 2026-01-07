/**
 * Normalizes source code input into contextual blocks for static analysis.
 * Each block includes surrounding lines to enable multi-line vulnerability detection.
 */
export function normalizeCode(content, language = "javascript") {
  const safeContent =
    typeof content === "string" ? content : String(content ?? "");

  const lines = safeContent.split("\n");

  const blocks = lines.map((line, index) => {
    const context = [
      lines[index - 1] || "",
      line,
      lines[index + 1] || "",
    ].join("\n");

    return {
      content: context,
      line: index + 1,
      location: {
        line: index + 1,
        column: 1,
      },
    };
  });

  return {
    type: "code",
    language,
    raw: safeContent,
    blocks,
  };
}
