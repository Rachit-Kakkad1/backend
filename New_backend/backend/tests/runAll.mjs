import { decideAnalysisMode } from "../services/decision.service.js";
import { runCombinedAnalysis } from "../services/combinedAnalysis.service.js";
import { runAIAnalysis } from "../services/aiAnalysis.service.js";
import fs from "fs";
import path from "path";

function assert(cond, msg) {
  if (!cond) throw new Error(msg || "assertion failed");
}

async function unitTests() {
  const m1 = decideAnalysisMode({ useAI: false, riskScore: 100 });
  assert(m1 === "SECURITY_ONLY", "riskScore must not enable AI");
  const m2 = decideAnalysisMode({ useAI: true, riskScore: 0 });
  assert(m2 === "SECURITY_PLUS_AI", "useAI true must enable AI");
  let threw = false;
  try {
    await runAIAnalysis({ code: "x", language: "javascript", findings: [], useAI: true });
  } catch {
    threw = true;
  }
  assert(threw, "AI must throw when findings missing");
  threw = false;
  try {
    await runAIAnalysis({ code: "x", language: "javascript", findings: [{ id: "v1" }], useAI: false });
  } catch {
    threw = true;
  }
  assert(threw, "AI must throw when useAI false");
  return { passed: true };
}

async function integrationTests() {
  const resFalse = await runCombinedAnalysis({
    inputType: "code",
    content: "eval('1+1')",
    language: "javascript",
    useAI: false,
  });
  assert(resFalse.success, "combined analysis failed for useAI=false");
  assert(!resFalse.ai?.enabled, "AI must not run when useAI=false");

  const resTrue = await runCombinedAnalysis({
    inputType: "code",
    content: "eval('1+1')",
    language: "javascript",
    useAI: true,
  });
  assert(resTrue.success, "combined analysis failed for useAI=true");
  assert(resTrue.ai?.enabled, "AI must run when useAI=true");
  return { passed: true };
}

async function performanceTests() {
  const start = Date.now();
  const tasks = Array.from({ length: 5 }).map(() =>
    runAIAnalysis({
      code: "function a(){return 1}",
      language: "javascript",
      findings: [{ id: "v1" }],
      useAI: true,
    })
  );
  await Promise.all(tasks);
  const duration = Date.now() - start;
  assert(duration < 10000, "LLM perf exceeded 10s for 5 calls");
  return { passed: true, durationMs: duration };
}

async function errorHandlingTests() {
  const prevPort = process.env.LLM_PORT;
  process.env.LLM_PORT = "65535";
  let threw = false;
  try {
    await runAIAnalysis({
      code: "function a(){return 1}",
      language: "javascript",
      findings: [{ id: "v1" }],
      useAI: true,
    });
  } catch {
    threw = true;
  } finally {
    process.env.LLM_PORT = prevPort;
  }
  assert(threw, "AI should fail when endpoint unreachable");
  return { passed: true };
}

async function securityTests() {
  const res = await runCombinedAnalysis({
    inputType: "code",
    content: "eval('1+1')",
    language: "javascript",
    useAI: false,
  });
  assert(res.mode === "SECURITY_ONLY", "Mode must be SECURITY_ONLY when useAI=false");
  const logPath = path.join(path.dirname(new URL(import.meta.url).pathname), "..", "logs", "ai_audit.log");
  assert(fs.existsSync(logPath), "Audit log must exist");
  return { passed: true };
}

async function e2eTests() {
  const res = await runCombinedAnalysis({
    inputType: "code",
    content: "console.log('ok')",
    language: "javascript",
    useAI: true,
  });
  assert(res.success, "E2E failed");
  assert(!!res.analysis?.vulnerabilities, "E2E analysis missing");
  assert(res.ai?.enabled, "E2E AI not enabled");
  return { passed: true };
}

async function main() {
  const results = {};
  results.unit = await unitTests();
  results.integration = await integrationTests();
  results.performance = await performanceTests();
  results.error = await errorHandlingTests();
  results.security = await securityTests();
  results.e2e = await e2eTests();
  console.log(JSON.stringify({ success: true, results }, null, 2));
}

main().catch((e) => {
  console.error(JSON.stringify({ success: false, error: e.message }, null, 2));
  process.exit(1);
});
