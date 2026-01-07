import { decideAnalysisMode } from "../services/decision.service.js";
import { runCombinedAnalysis } from "../services/combinedAnalysis.service.js";

async function testDecide() {
  const m1 = decideAnalysisMode({ useAI: false, riskScore: 100 });
  if (m1 !== "SECURITY_ONLY") throw new Error("riskScore must not trigger AI");
  const m2 = decideAnalysisMode({ useAI: true, riskScore: 0 });
  if (m2 !== "SECURITY_PLUS_AI") throw new Error("useAI true must enable AI");
}

async function testRun(useAI) {
  const res = await runCombinedAnalysis({
    inputType: "code",
    content: "eval('1+1')",
    language: "javascript",
    useAI,
  });
  if (!res.success) throw new Error("combined analysis failed");
  const enabled = Boolean(res.ai?.enabled);
  if (useAI && !enabled) throw new Error("AI should be enabled");
  if (!useAI && enabled) throw new Error("AI must not run");
}

async function main() {
  try {
    await testDecide();
    await testRun(false);
    console.log("PASS: useAI=false blocks AI");
    await testRun(true);
    console.log("PASS: useAI=true enables AI");
    console.log("All tests passed.");
    process.exit(0);
  } catch (e) {
    console.error("Test failed:", e.message);
    process.exit(1);
  }
}

main();
