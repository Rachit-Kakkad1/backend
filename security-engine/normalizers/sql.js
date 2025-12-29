export default function normalizeSQL(sql) {
  return {
    type: "sql",
    metadata: {
      usesConcat: /\+|\$\{/.test(sql),
      isParameterized: /\?/.test(sql),
    },
    query: sql.trim(),
  };
}
