import api from "./axios";
import type {
  AnalysisRequest,
  AnalysisResult,
  AnalysisHistoryItem,
  DashboardMetrics,
} from "../types/analysis";

export const analysisApi = {
  // -----------------------------
  // POST /api/analyze
  // -----------------------------
  analyze: async (payload: AnalysisRequest): Promise<AnalysisResult> => {
    const allowed = new Set(["code", "api", "sql", "config"]);
    if (!payload || typeof payload.content !== "string") {
      throw new Error("Invalid request: content must be a string");
    }
    const content = payload.content.trim();
    if (content.length === 0) {
      throw new Error("Invalid request: content cannot be empty");
    }
    if (content.length > 100_000) {
      throw new Error("Invalid request: content exceeds size limit");
    }
    if (!allowed.has(payload.inputType)) {
      throw new Error("Invalid request: unsupported inputType");
    }
    const body = {
      inputType: payload.inputType,
      content,
      useAI: payload.useAI === true,
    };
    let lastErr: any = null;
    for (let attempt = 0; attempt < 3; attempt++) {
      try {
        const response = await api.post("/api/analyze", body);
        const res = response.data || {};
        const analysis = res.analysis || {};
        return {
          riskScore: analysis.riskScore ?? analysis.overallRiskScore ?? 0,
          vulnerabilities: analysis.vulnerabilities ?? [],
          attackerView: analysis.attackerView ?? [],
          defenderFixes: analysis.defenderFixes ?? [],
          impactAnalysis: analysis.impactAnalysis ?? [],
          processingTime: analysis.processingTime ?? 0,
          overallRiskScore: analysis.overallRiskScore ?? analysis.riskScore ?? 0,
          syntax: res.syntax,
          engineDecision: res.engineDecision,
          summary: analysis.summary,
          _id: analysis.id,
          inputType: analysis.inputType,
          content: undefined,
          createdAt: undefined,
          updatedAt: undefined,
          ai: res.ai,
        };
      } catch (err: any) {
        lastErr = err;
        const wait = 200 * Math.pow(2, attempt);
        await new Promise((r) => setTimeout(r, wait));
      }
    }
    const msg =
      lastErr?.response?.data?.message ||
      lastErr?.message ||
      "Analysis request failed";
    throw new Error(msg);
  },

  // -----------------------------
  // GET /api/analyze/history
  // -----------------------------
  getHistory: async (): Promise<AnalysisHistoryItem[]> => {
    const response = await api.get("/api/analyze/history");
    // Backend returns { success: true, analyses: [...] }
    return response.data.analyses || [];
  },

  // -----------------------------
  // GET /api/analyze/:id
  // -----------------------------
  getAnalysisById: async (id: string) => {
    const response = await api.get(`/api/analyze/${id}`);
    // Backend returns { success: true, analysis: {...} }
    return response.data;
  },

  // -----------------------------
  // GET /api/dashboard/metrics
  // -----------------------------
  getDashboardMetrics: async (): Promise<DashboardMetrics> => {
    const response = await api.get("/api/dashboard/metrics");
    return response.data.metrics;
  },
};
