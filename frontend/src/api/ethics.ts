import api from "./axios";

export interface EthicalNotice {
  title: string;
  content: string;
  lastUpdated: string;
}

export const ethicsApi = {
  // ✅ Used by EthicalBanner
  getEthicalNotice: async (): Promise<EthicalNotice> => {
    return {
      title: "Ethical Use Notice",
      content:
        "SentinAI performs simulated, non-destructive security analysis for educational and defensive purposes only. It does NOT execute real attacks, exploit systems, or perform unauthorized actions.",
      lastUpdated: new Date().toISOString(),
    };
  },

  // Existing APIs (unchanged)
  checkCompliance: async (payload: any) => {
    const { data } = await api.post("/api/ethics/check", payload);
    return data;
  },

  getPolicies: async () => {
    const { data } = await api.get("/api/ethics/policies");
    return data;
  },
};
