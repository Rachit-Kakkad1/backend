import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const logDir = path.join(__dirname, "..", "logs");
const logFile = path.join(logDir, "ai_audit.log");

function ensureDir() {
  if (!fs.existsSync(logDir)) {
    fs.mkdirSync(logDir, { recursive: true });
  }
}

export function recordAIAudit(event) {
  try {
    ensureDir();
    const payload = {
      ts: new Date().toISOString(),
      ...event,
    };
    fs.appendFileSync(logFile, JSON.stringify(payload) + "\n", { encoding: "utf8" });
  } catch {}
}
