import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { analysisApi } from "../api/analysis";
import type { AnalysisHistoryItem, AnalysisResult } from "../types/analysis";
import { RiskMeter } from "../components/RiskMeter";
import { VulnerabilityCard } from "../components/VulnerabilityCard";
import { DashboardLayout } from "../components/DashboardLayout";
import { GlassCard } from "../components/GlassCard";
import {
  History,
  AlertTriangle,
  Clock,
  ShieldAlert,
  CheckCircle2,
  FileText,
} from "lucide-react";
import "./DashboardAnimations.css";

const HistoryPage = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  // -----------------------------
  // State
  // -----------------------------
  const [history, setHistory] = useState<AnalysisHistoryItem[]>([]);
  const [selectedAnalysis, setSelectedAnalysis] =
    useState<AnalysisResult | null>(null);
  const [selectedId, setSelectedId] = useState<string | null>(null);

  const [loading, setLoading] = useState(true);
  const [loadingAnalysis, setLoadingAnalysis] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // -----------------------------
  // Load history
  // -----------------------------
  useEffect(() => {
    const fetchHistory = async () => {
      try {
        const data = await analysisApi.getHistory();
        setHistory(Array.isArray(data) ? data : []);
      } catch (err: any) {
        setError(
          err.response?.data?.message || "Failed to load analysis history"
        );
      } finally {
        setLoading(false);
      }
    };
    fetchHistory();
  }, []);

  // -----------------------------
  // Load full analysis
  // -----------------------------
  const loadAnalysis = async (id: string) => {
    try {
      setSelectedId(id);
      setLoadingAnalysis(true);
      const response = await analysisApi.getAnalysisById(id);
      // Backend returns { success: true, analysis: {...} }
      if (response && response.analysis) {
        setSelectedAnalysis(response.analysis);
      } else if (response && response.id) {
        // Fallback if response structure is different
        setSelectedAnalysis(response as AnalysisResult);
      } else {
        setError("Invalid analysis data received");
      }
    } catch (err) {
      console.error("Failed to load analysis", err);
      setError("Failed to load selected analysis");
    } finally {
      setLoadingAnalysis(false);
    }
  };

  // Helper to get risk score
  const getRiskScore = (analysis: AnalysisResult | null) => {
    if (!analysis) return 0;
    return analysis.overallRiskScore ?? analysis.riskScore ?? 0;
  };

  // -----------------------------
  // Render
  // -----------------------------
  return (
    <DashboardLayout>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="space-y-6"
      >
        {/* Header */}
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-4xl font-black tracking-tighter text-white flex items-center gap-3 text-glitch" data-text="ANALYSIS_HISTORY">
              <History className="text-cyber-blue" size={32} />
              ANALYSIS_HISTORY
            </h1>
            <p className="text-cyber-slate text-xs font-bold uppercase tracking-[0.3em] mt-1 flex items-center">
              <span className="w-2 h-2 bg-cyber-green rounded-full mr-2 animate-pulse shadow-[0_0_10px_rgb(var(--cyber-green))]" />
              {history.length} Total Scans // USER:{" "}
              {user?.name?.toUpperCase() || "ADMIN"}
            </p>
          </div>
        </div>

        {/* Error Banner */}
        {error && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="p-4 rounded-xl bg-red-500/10 border border-red-500/30 text-red-400 flex items-center"
          >
            <AlertTriangle className="mr-3" size={20} />
            {error}
          </motion.div>
        )}

        {loading ? (
          // Loading State
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <GlassCard className="lg:col-span-1 h-[600px]">
              <div className="h-8 w-32 bg-white/5 rounded animate-pulse mb-4"></div>
              <div className="space-y-3">
                {[1, 2, 3].map((i) => (
                  <div
                    key={i}
                    className="h-24 bg-white/5 rounded-xl animate-pulse"
                  ></div>
                ))}
              </div>
            </GlassCard>
            <GlassCard className="lg:col-span-2 h-[600px]">
              <div className="h-8 w-48 bg-white/5 rounded animate-pulse mb-6"></div>
              <div className="h-32 w-full bg-white/5 rounded animate-pulse"></div>
            </GlassCard>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* ==================================================
                HISTORY LIST (SUMMARY)
               ================================================== */}
            <div className="lg:col-span-1">
              <GlassCard className="h-[calc(100vh-200px)] border-cyber-blue/20">
                <div className="flex flex-col h-full">
                  <div className="flex items-center justify-between mb-6 pb-4 border-b border-white/10 shrink-0">
                    <h2 className="text-lg font-bold text-white flex items-center gap-2">
                      <FileText size={20} className="text-cyber-blue" />
                      Past Analyses
                    </h2>
                    <span className="text-xs font-bold text-gray-500 bg-white/5 px-2 py-1 rounded uppercase tracking-wider">
                      {history.length}
                    </span>
                  </div>

                  {history.length === 0 ? (
                    <div className="flex-1 flex flex-col items-center justify-center text-center py-12">
                      <div className="w-16 h-16 rounded-full bg-white/5 border border-white/10 flex items-center justify-center mb-4">
                        <History className="text-gray-600" size={32} />
                      </div>
                      <p className="text-gray-500 text-sm font-medium">
                        No analysis history found
                      </p>
                      <button
                        onClick={() => navigate("/analyze")}
                        className="mt-4 px-4 py-2 bg-cyber-blue text-cyber-black font-black text-xs uppercase tracking-widest rounded-lg hover:bg-cyber-blue/80 transition-all cyber-btn"
                      >
                        Start First Analysis
                      </button>
                    </div>
                  ) : (
                    <div className="flex-1 space-y-3 overflow-y-scroll pb-4 custom-scrollbar" style={{ paddingRight: '4px', minHeight: 0 }}>
                      <AnimatePresence>
                        {history.map((analysis) => {
                          const isSelected = selectedId === analysis.id;
                          const riskScore = analysis.overallRiskScore;
                          const riskColor =
                            riskScore > 70
                              ? "text-red-500"
                              : riskScore > 40
                                ? "text-cyber-purple"
                                : "text-cyber-green";

                          return (
                            <motion.button
                              key={analysis.id}
                              initial={{ opacity: 0, x: -20 }}
                              animate={{ opacity: 1, x: 0 }}
                              exit={{ opacity: 0, x: -20 }}
                              onClick={() => loadAnalysis(analysis.id)}
                              className={`
                                w-full text-left p-4 rounded-xl border transition-all duration-300 group relative overflow-hidden perspective-card glow-stagger
                                ${isSelected
                                  ? "bg-cyber-blue/20 border-cyber-blue/50 shadow-lg shadow-cyber-blue/20 scale-[1.02]"
                                  : "bg-white/5 border-white/10 hover:bg-white/10 hover:border-cyber-blue/30 hover:shadow-md hover:-translate-y-1"
                                }
                            `}
                            >
                              {/* Accent Border Reveal */}
                              {isSelected && (
                                <div className="absolute left-0 top-0 bottom-0 w-1 bg-cyber-blue"></div>
                              )}

                              <div className="flex justify-between items-start mb-3">
                                <span
                                  className={`text-[10px] font-black px-2 py-1 rounded uppercase tracking-wider ${isSelected
                                    ? "bg-cyber-blue/30 text-cyber-blue border border-cyber-blue/50"
                                    : "bg-white/10 text-gray-400 border border-white/10"
                                    }`}
                                >
                                  {analysis.inputType}
                                </span>
                                <div className="flex items-center gap-1 text-[10px] text-gray-500">
                                  <Clock size={12} />
                                  <span className="font-mono">
                                    {new Date(
                                      analysis.analysisDate
                                    ).toLocaleDateString()}
                                  </span>
                                </div>
                              </div>

                              <div className="flex items-center justify-between mb-2">
                                <div className="text-xs font-bold text-gray-400 uppercase tracking-wider">
                                  Risk Score
                                </div>
                                <div
                                  className={`text-2xl font-black ${riskColor} drop-shadow-sm`}
                                >
                                  {riskScore}
                                </div>
                              </div>

                              <div className="flex items-center gap-2 text-[10px] text-gray-500">
                                <ShieldAlert
                                  size={14}
                                  className={
                                    analysis.vulnerabilityCount > 0
                                      ? "text-red-500"
                                      : "text-cyber-green"
                                  }
                                />
                                <span className="font-mono">
                                  {analysis.vulnerabilityCount} Vuln
                                  {analysis.vulnerabilityCount !== 1 ? "s" : ""}
                                </span>
                              </div>
                            </motion.button>
                          );
                        })}
                      </AnimatePresence>
                    </div>
                  )}
                </div>
              </GlassCard>
            </div>

            {/* ==================================================
                SELECTED ANALYSIS (FULL OBJECT)
               ================================================== */}
            <div className="lg:col-span-2">
              {loadingAnalysis ? (
                <GlassCard className="h-[calc(100vh-200px)] flex flex-col gap-6">
                  <div className="h-8 w-1/3 rounded bg-white/5 animate-pulse"></div>
                  <div className="h-32 w-full rounded bg-white/5 animate-pulse"></div>
                  <div className="space-y-4">
                    <div className="h-20 w-full rounded bg-white/5 animate-pulse"></div>
                    <div className="h-20 w-full rounded bg-white/5 animate-pulse"></div>
                  </div>
                </GlassCard>
              ) : selectedAnalysis ? (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="space-y-6"
                >
                  {/* Report Header */}
                  <GlassCard className="border-cyber-blue/20 scanline-overlay">
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6 pb-6 border-b border-white/10">
                      <div>
                        <h2 className="text-2xl font-black text-white tracking-tighter mb-2">
                          ANALYSIS_REPORT
                        </h2>
                        {selectedAnalysis.createdAt && (
                          <p className="text-xs text-gray-500 font-mono flex items-center gap-2">
                            <span className="w-2 h-2 rounded-full bg-cyber-blue animate-pulse"></span>
                            Generated:{" "}
                            {new Date(
                              selectedAnalysis.createdAt
                            ).toLocaleString()}
                          </p>
                        )}
                      </div>

                      <div className="bg-white/5 px-4 py-3 rounded-lg border border-white/10">
                        <p className="text-[10px] text-gray-500 uppercase tracking-wider text-center mb-2">
                          Risk Level
                        </p>
                        <RiskMeter
                          riskScore={getRiskScore(selectedAnalysis)}
                        />
                      </div>
                    </div>

                    <div>
                      {selectedAnalysis.content && (
                        <div className="mb-6 pb-6 border-b border-white/10">
                          <div className="flex items-center justify-between mb-4">
                            <h3 className="text-lg font-bold text-white flex items-center gap-2">
                              <FileText size={20} className="text-cyber-blue" />
                              ANALYZED_SOURCE
                            </h3>
                            <button
                              onClick={() => {
                                navigator.clipboard.writeText(selectedAnalysis.content || "");
                                // Optional: Add toast notification here
                              }}
                              className="text-[10px] font-bold uppercase tracking-wider text-gray-500 hover:text-white transition-colors flex items-center gap-1"
                            >
                              <FileText size={12} />
                              Copy Code
                            </button>
                          </div>
                          <div className="bg-black/40 rounded-xl border border-white/10 p-4 max-h-[300px] overflow-y-auto custom-scrollbar font-mono text-xs text-cyber-white">
                            <pre className="whitespace-pre-wrap break-all">
                              {selectedAnalysis.content}
                            </pre>
                          </div>
                        </div>
                      )}

                      <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                        <ShieldAlert
                          size={20}
                          className={
                            selectedAnalysis.vulnerabilities.length > 0
                              ? "text-red-500"
                              : "text-cyber-green"
                          }
                        />
                        Detected Vulnerabilities
                        <span className="bg-white/10 text-gray-300 text-xs px-2 py-0.5 rounded-full border border-white/10">
                          {selectedAnalysis.vulnerabilities.length}
                        </span>
                      </h3>

                      {selectedAnalysis.vulnerabilities.length === 0 ? (
                        <div className="p-6 bg-cyber-green/10 border border-cyber-green/30 rounded-xl flex items-center gap-4">
                          <div className="p-3 bg-cyber-green/20 rounded-full">
                            <CheckCircle2
                              size={24}
                              className="text-cyber-green"
                            />
                          </div>
                          <div>
                            <p className="font-bold text-cyber-green">
                              System Secure
                            </p>
                            <p className="text-sm text-gray-400 mt-1">
                              No vulnerabilities were detected in this scan.
                            </p>
                          </div>
                        </div>
                      ) : (
                        <div className="space-y-4">
                          <AnimatePresence>
                            {selectedAnalysis.vulnerabilities.map(
                              (vuln, index) => (
                                <motion.div
                                  key={index}
                                  initial={{ opacity: 0, y: 10 }}
                                  animate={{ opacity: 1, y: 0 }}
                                  exit={{ opacity: 0 }}
                                  transition={{ delay: index * 0.1 }}
                                >
                                  <VulnerabilityCard vulnerability={vuln} />
                                </motion.div>
                              )
                            )}
                          </AnimatePresence>
                        </div>
                      )}
                    </div>
                  </GlassCard>
                </motion.div>
              ) : (
                <GlassCard className="h-[calc(100vh-200px)] flex flex-col items-center justify-center text-center">
                  <div className="w-20 h-20 rounded-full bg-white/5 border border-white/10 flex items-center justify-center mb-6">
                    <FileText size={40} className="text-gray-600" />
                  </div>
                  <p className="text-gray-400 font-medium mb-2">
                    No Analysis Selected
                  </p>
                  <p className="text-xs text-gray-600 mb-6">
                    Select an analysis from the list to view details
                  </p>
                  <button
                    onClick={() => navigate("/analyze")}
                    className="px-6 py-3 bg-cyber-blue text-cyber-black font-black text-xs uppercase tracking-widest rounded-lg hover:bg-cyber-blue/80 transition-all shadow-[0_0_20px_rgb(var(--cyber-blue)/0.3)] cyber-btn"
                  >
                    Start New Analysis
                  </button>
                </GlassCard>
              )}
            </div>
          </div>
        )}
      </motion.div>
    </DashboardLayout>
  );
};

export default HistoryPage;
