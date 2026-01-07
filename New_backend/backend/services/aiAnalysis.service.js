// services/aiAnalysis.service.js
import axios from "axios";
import { recordAIAudit } from "./audit.service.js";

const AI_HOST = process.env.LLM_HOST || "127.0.0.1";
const AI_PORT = Number(process.env.LLM_PORT || 5050);
const AI_PATH = process.env.LLM_PATH || "/v1/chat/completions";
const AI_URL = `http://${AI_HOST}:${AI_PORT}${AI_PATH}`;
const AI_MODEL = process.env.LLM_MODEL || "llama-3-8b-lexi-uncensored";
const AI_API_KEY = process.env.LLM_API_KEY || null;

export async function runAIAnalysis({ code, language, findings, useAI }) {
  if (useAI !== true) {
    throw new Error("AI execution blocked: user opt-in required");
  }
  if (!Array.isArray(findings) || findings.length === 0) {
    throw new Error("AI execution blocked: authoritative findings missing");
  }
  const systemPrompt = `
You are a secure coding assistant.

CRITICAL RULES:
- You do NOT perform vulnerability detection.
- You do NOT invent new confirmed vulnerabilities.
- The provided findings are authoritative.
- You may ONLY explain, suggest defensive fixes, and propose unverified hypotheses.
- Do NOT generate exploit payloads.
- Do NOT provide step-by-step attack instructions.
- Do NOT rewrite entire files.

OUTPUT FORMAT (STRICT):
Return JSON with the following structure:
{
  "explanation": {
    "summary": string,
    "perVulnerability": {
      "<vulnId>": string
    }
  },
  "codeSuggestions": {
    "<vulnId>": {
      "guidance": string,
      "snippet": string | null,
      "language": string
    }
  },
  "hypotheses": [
    {
      "title": string,
      "confidence": "low" | "medium",
      "reasoning": string,
      "unverified": true
    }
  ]
}
If there are no hypotheses, return an empty array.
`;

  const userPrompt = `
Language: ${language}

AUTHORITATIVE ENGINE FINDINGS:
${JSON.stringify(findings, null, 2)}

READ-ONLY CODE CONTEXT (DO NOT ANALYZE FOR NEW ISSUES):
${code}

Tasks:
1. Explain each confirmed vulnerability clearly.
2. Provide secure coding guidance per vulnerability.
3. Include short illustrative snippets ONLY if helpful.
4. Optionally suggest unverified security hypotheses.
`;

  let response;
  const requestStart = Date.now();
  
  // Prepare headers
  const headers = {
    "Content-Type": "application/json"
  };
  if (AI_API_KEY) {
    headers["Authorization"] = `Bearer ${AI_API_KEY}`;
  }

  try {
    recordAIAudit({
      stage: "ai_request_start",
      url: AI_URL,
      model: AI_MODEL,
      useAI
    });

    response = await axios.post(
      AI_URL,
      {
        model: AI_MODEL,
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: userPrompt },
        ],
        temperature: 0.2,
        max_tokens: 900,
      },
      { 
        timeout: 60000, 
        proxy: false,
        headers
      }
    );

    recordAIAudit({
      stage: "ai_request_success",
      status: response.status,
      durationMs: Date.now() - requestStart
    });

  } catch (error) {
    const durationMs = Date.now() - requestStart;
    const status = error?.response?.status;
    const data = error?.response?.data;
    
    // Detailed error classification
    let errorType = "unknown";
    if (error.code === 'ECONNREFUSED') errorType = "connection_refused";
    else if (error.code === 'ETIMEDOUT') errorType = "timeout";
    else if (status >= 500) errorType = "server_error";
    else if (status >= 400) errorType = "client_error";

    console.error("[AI] Request failed", { 
      url: AI_URL, 
      errorType,
      status, 
      code: error.code,
      durationMs 
    });

    recordAIAudit({
      stage: "ai_request_failed",
      errorType,
      status,
      message: error.message,
      durationMs
    });

    // Propagate a generic error message unless it's a timeout/connection issue which might be temporary
    if (errorType === "connection_refused") {
      throw new Error("AI server unavailable (Connection Refused)");
    }
    if (errorType === "timeout") {
      throw new Error("AI analysis timed out");
    }
    
    throw new Error(`AI request failed: ${error.message}`);
  }

  const raw = response.data.choices?.[0]?.message?.content;

  if (!raw) {
    recordAIAudit({ stage: "ai_response_empty", raw });
    throw new Error("Empty response from AI server");
  }

  // Safety parse: AI must return JSON
  try {
    const parsed = JSON.parse(raw);
    recordAIAudit({ stage: "ai_parse_success" });
    return parsed;
  } catch (err) {
    console.warn("[AI] JSON Parse failed", { raw });
    recordAIAudit({ stage: "ai_parse_failed", error: err.message, rawSnippet: raw.slice(0, 100) });
    
    // Fallback: never crash analysis
    return {
      explanation: {
        summary: "AI explanation unavailable (Invalid Format).",
        perVulnerability: {},
      },
      codeSuggestions: {},
      hypotheses: [],
    };
  }
}
