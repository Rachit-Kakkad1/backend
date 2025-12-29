import normalizeCode from "./normalizers/code.js";
import normalizeAPI from "./normalizers/api.js";
import normalizeSQL from "./normalizers/sql.js";
import normalizeConfig from "./normalizers/config.js";

export function routeInput({ inputType, content, language }) {
  switch (inputType) {
    case "code":
      return normalizeCode(content, language);

    case "api":
      return normalizeAPI(content);

    case "sql":
      return normalizeSQL(content);

    case "config":
      return normalizeConfig(content);

    default:
      throw new Error("Unsupported input type");
  }
}
