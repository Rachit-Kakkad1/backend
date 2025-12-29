export default function normalizeCode(code, language = "unknown") {
  const lines = code.split("\n");

  return {
    type: "code",
    metadata: {
      language,
      totalLines: lines.length,
    },
    blocks: lines.map((line, index) => ({
      lineNumber: index + 1,
      content: line.trim(),
      isComment: line.trim().startsWith("//") || line.trim().startsWith("#"),
    })),
  };
}
