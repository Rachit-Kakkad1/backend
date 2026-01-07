import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence, animate } from "framer-motion";
import { DashboardLayout } from "../components/DashboardLayout";
import { GlassCard } from "../components/GlassCard";
import { CodeAnalysisGraph } from "../components/CodeAnalysisGraph";
import {
  Terminal,
  ShieldAlert,
  Cpu,
  Play,
  Search,
  Activity,
  AlertTriangle,
  Code2,
  Wand2,
  RefreshCw,
  Zap,
  Bug,
  Fingerprint,
  FileText,
  Network,
} from "lucide-react";
import { analysisApi } from "../api/analysis";
import type { AnalysisResult, Vulnerability } from "../types/analysis";

export const AnalysisPage = () => {
  // --- STATE MANAGEMENT ---
  const [status, setStatus] = useState<"IDLE" | "SCANNING" | "FINISHED">(
    "IDLE"
  );
  // DEMO VULNERABILITY: Use this to test the scanner!
  // const AWS_SECRET = "AKIA1234567890abcdef"; 

  const [code, setCode] = useState("");
  const [result, setResult] = useState<AnalysisResult | null>(null);
  const [logs, setLogs] = useState<string[]>([]);
  const [error, setError] = useState<string | null>(null);

  // Helper to safely get risk score regardless of backend field naming
  const getRiskScore = (res: AnalysisResult | null) => {
    if (!res) return 0;
    // Check both potential keys: riskScore (type def) or overallRiskScore (backend actual)
    return res.riskScore ?? res.overallRiskScore ?? 0;
  };

  // UI Helpers
  const isDanger = getRiskScore(result) > 0;
  const terminalEndRef = useRef<null | HTMLDivElement>(null);

  // Transform analysis result to graph data
  const transformToGraphData = (analysisResult: AnalysisResult | null) => {
    if (!analysisResult) return null;

    const nodes: Array<{
      id: string;
      label: string;
      type: 'file' | 'function' | 'vulnerability' | 'dependency';
      risk: 'low' | 'medium' | 'high' | 'critical';
    }> = [];
    const edges: Array<{
      from: string;
      to: string;
      type: 'import' | 'call' | 'dependency';
    }> = [];

    // Add main code node
    const codeNodeId = 'analyzed_code';
    nodes.push({
      id: codeNodeId,
      label: 'Analyzed Code',
      type: 'file',
      risk: isDanger ? 'high' : 'low',
    });

    // Add vulnerability nodes and connect them to code
    if (analysisResult.vulnerabilities && analysisResult.vulnerabilities.length > 0) {
      analysisResult.vulnerabilities.forEach((vuln: Vulnerability, index: number) => {
        const vulnId = `vuln_${index}`;
        const severityStr = (vuln.severity || 'Low').toLowerCase();
        const severity = (severityStr === 'critical' ? 'critical' :
                         severityStr === 'high' ? 'high' :
                         severityStr === 'medium' ? 'medium' : 'low') as 'low' | 'medium' | 'high' | 'critical';
        
        nodes.push({
          id: vulnId,
          label: vuln.type || vuln.name || `Vulnerability ${index + 1}`,
          type: 'vulnerability',
          risk: severity,
        });

        // Connect vulnerability to code
        edges.push({
          from: codeNodeId,
          to: vulnId,
          type: 'dependency',
        });
      });
    }

    // Add risk score node if there are vulnerabilities
    if (nodes.length > 1) {
      const riskNodeId = 'risk_score';
      const riskLevel = getRiskScore(analysisResult) > 7 ? 'critical' : 
                       getRiskScore(analysisResult) > 4 ? 'high' : 
                       getRiskScore(analysisResult) > 2 ? 'medium' : 'low';
      
      nodes.push({
        id: riskNodeId,
        label: `Risk: ${getRiskScore(analysisResult).toFixed(1)}`,
        type: 'dependency',
        risk: riskLevel,
      });

      // Connect risk score to code
      edges.push({
        from: codeNodeId,
        to: riskNodeId,
        type: 'dependency',
      });
    }

    return { nodes, edges };
  };

  // --- ACTIONS ---
  const startScan = async (scanMode: "manual" | "ai" = "manual") => {
    if (status === "SCANNING" || !code.trim()) return;

    setStatus("SCANNING");
    setError(null);
    setResult(null);
    setLogs(
      scanMode === "ai"
        ? [
            "> INITIALIZING SECURE CONNECTION...",
            "> AI HEURISTICS ENABLED...",
            "> PACKAGING PAYLOAD...",
          ]
        : ["> INITIALIZING SECURE CONNECTION...", "> PACKAGING PAYLOAD..."]
    );

    try {
      // 1. Minimum "Scanning" Duration for UX (2.5 seconds)
      const minDurationPromise = new Promise((r) => setTimeout(r, 2500));

      // Simulate progressive log loading
      setLogs((prev) => [
        ...prev,
        "> TRANSMITTING TO ENGINE...",
        "> ENCRYPTING PACKETS...",
      ]);
      setTimeout(() => {
        setLogs((prev) => [
          ...prev,
          "> HANDSHAKE ESTABLISHED",
          scanMode === "ai" ? "> AI MODEL PRIMED..." : "> SCANNING VECTORS...",
        ]);
      }, 800);
      setTimeout(() => {
        setLogs((prev) => [
          ...prev,
          scanMode === "ai" ? "> AI ANALYSIS: ACTIVE" : "> HEURISTICS ENGINE: ACTIVE",
          "> DEEP PACKET INSPECTION...",
        ]);
      }, 1600);

      // 2. Real API Call (Parallel)
      const dataPromise = analysisApi.analyze({
        inputType: "code",
        content: code,
        useAI: scanMode === "ai",
      });

      const [, data] = await Promise.all([minDurationPromise, dataPromise]);

      if (!data) {
        throw new Error("Received empty response from server");
      }

      // 3. Handle Success safely
      setResult(data);

      // 🛑 HANDLE SYNTAX ERROR HALT
      if (data.engineDecision === "HALTED_AT_SYNTAX_STAGE" && data.syntax && !data.syntax.valid) {
        const errorCount = data.syntax.errors.length;
        setLogs((prev) => [
          ...prev,
          "> ANALYSIS HALTED: SYNTAX ERROR DETECTED",
          `> ${errorCount} SYNTAX ERRORS FOUND`,
          ...data.syntax!.errors.map(e => `> [LINE ${e.line}:${e.column}] ${e.message}`),
          "> VULNERABILITY SCAN: SKIPPED",
          "> ABORTING..."
        ]);
        setStatus("FINISHED");
        setError("Analysis Halted: Syntax Error Detected");
        return; // Stop further processing
      }

      const vulnCount = data.vulnerabilities?.length ?? 0;
      const rScore = getRiskScore(data);

      setLogs((prev) => [
        ...prev,
        "> ANALYSIS COMPLETE.",
        `> RISK_SCORE: ${rScore.toFixed(1)}`,
        `> VULNERABILITIES DETECTED: ${vulnCount}`,
        "> DECRYPTING RESULTS...",
      ]);
      setStatus("FINISHED");
    } catch (err: unknown) {
      console.error("Analysis Error:", err);
      // Safely extract error message
      type ErrShape = { message?: string; response?: { data?: { message?: string } } };
      const e = err as ErrShape;
      const errMsg = e.response?.data?.message ?? e.message ?? "Connection failed";

      setError(`Analysis Terminated: ${errMsg}`);
      setLogs((prev) => [...prev, `> ERROR: ${errMsg}`, "> ABORTING..."]);
      setStatus("IDLE");
    }
  };

  const handleGeneratePatch = () => {
    // Placeholder for future implementation or navigating to details
    setLogs((prev) => [
      ...prev,
      "> AUTO-PATCHING NOT YET AVAILABLE IN THIS VERSION...",
    ]);
  };

  useEffect(() => {
    terminalEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [logs]);

  // Color helper for severity
  const getSeverityColor = (sev?: string) => {
    if (!sev) return "text-cyber-blue bg-cyber-blue/20"; // Default safe fallback

    switch (sev.toLowerCase()) {
      case "critical":
        return "text-red-500 bg-red-500/20";
      case "high":
        return "text-orange-500 bg-orange-500/20";
      case "medium":
        return "text-yellow-500 bg-yellow-500/20";
      default:
        return "text-cyber-blue bg-cyber-blue/20";
    }
  };

  // --- SCRAMBLE TEXT EFFECT ---
  const ScrambleText = ({ text, className }: { text: string, className?: string }) => {
    const [display, setDisplay] = useState(text);
    const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*()_+-=[]{}|;:,.<>?";

    useEffect(() => {
      let iteration = 0;
      const interval = setInterval(() => {
        setDisplay(
          text
            .split("")
            .map((_, index) => {
              if (index < iteration) return text[index];
              return chars[Math.floor(Math.random() * chars.length)];
            })
            .join("")
        );

        if (iteration >= text.length) clearInterval(interval);
        iteration += 1 / 3;
      }, 30);

      return () => clearInterval(interval);
    }, [text]);

    return <span className={className}>{display}</span>;
  };

  // --- ANIMATED COUNTER ---
  const AnimatedCounter = ({ value }: { value: number }) => {
    const nodeRef = useRef<HTMLSpanElement>(null);

    useEffect(() => {
      const node = nodeRef.current;
      if (!node) return;

      const controls = animate(0, value, {
        duration: 1.5,
        ease: "easeOut",
        onUpdate(v) {
          node.textContent = v.toFixed(1);
        },
      });

      return () => controls.stop();
    }, [value]);

    return <span ref={nodeRef} />;
  };

  return (
    <DashboardLayout>
      {/* 1. TOP HEADER WITH GLITCH EFFECT */}
      <div className="flex justify-between items-center mb-6">
        <div className="relative group">
          <motion.h1
            animate={
              status === "SCANNING" && isDanger
                ? {
                  x: [-1, 1, -1, 0],
                  filter: [
                    "hue-rotate(0deg)",
                    "hue-rotate(90deg)",
                    "hue-rotate(0deg)",
                  ],
                }
                : {}
            }
            transition={status === "SCANNING" ? { repeat: Infinity, duration: 0.2 } : undefined}
            className="text-3xl font-black tracking-tighter italic select-none text-white"
          >
            THREAT-LAB <span className="text-cyber-blue">X-01</span>
          </motion.h1>
          <div className="flex items-center space-x-4 text-[10px] font-bold tracking-[0.2em] text-gray-500 uppercase mt-1">
            <span className="flex items-center text-cyber-green/70">
              <Cpu size={12} className="mr-1" /> ONLINE
            </span>
            <span className="flex items-center">
              <Zap size={12} className="mr-1 text-cyber-blue" /> V.2.0.4
            </span>
          </div>
        </div>

        {/* THREAT ALERT BUTTON (Header) */}
        <AnimatePresence>
          {isDanger && (
            <motion.div
              initial={{ x: 50, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              exit={{ x: 50, opacity: 0 }}
              className="bg-red-500/10 border border-red-500/50 px-4 py-2 rounded-lg flex items-center space-x-2 shadow-[0_0_15px_rgba(239,68,68,0.3)]"
            >
              <AlertTriangle size={16} className="text-red-500 animate-pulse" />
              <span className="text-[10px] font-black text-red-500 uppercase tracking-widest">
                Threat Detected
              </span>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <div className="grid grid-cols-12 gap-6">
        {/* ERROR BANNER */}
        {error && (
          <div className="col-span-12 bg-red-500/10 border border-red-500/30 p-4 rounded-xl flex items-center text-red-400 mb-2">
            <AlertTriangle className="mr-3" />
            <span className="font-mono text-xs">{error}</span>
          </div>
        )}

        {/* 2. THE SCANNER CARD */}
        <div className="col-span-12 lg:col-span-7 space-y-6">
          <GlassCard
            className={`relative overflow-hidden transition-all duration-500 ${isDanger ? "border-red-500/50" : "border-cyber-blue/20"
              }`}
          >
            {/* ADVANCED SCANNING ANIMATION */}
            <AnimatePresence>
              {status === "SCANNING" && (
                <>
                  {/* 2. Grid Pulse */}
                  <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: [0, 0.5, 0], scale: 1.1 }}
                    transition={{ duration: 2, repeat: Infinity }}
                    className="absolute inset-0 z-0 pointer-events-none bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-10"
                    style={{
                      backgroundImage: `linear-gradient(${isDanger ? 'rgba(239,68,68,0.1)' : 'rgba(59,130,246,0.1)'} 1px, transparent 1px), linear-gradient(90deg, ${isDanger ? 'rgba(239,68,68,0.1)' : 'rgba(59,130,246,0.1)'} 1px, transparent 1px)`,
                      backgroundSize: '40px 40px'
                    }}
                  />

                  {/* 3. Scanning Bar */}
                  <motion.div
                    initial={{ top: "-10%", opacity: 0 }}
                    animate={{ top: "110%", opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{
                      duration: 1.5,
                      repeat: Infinity,
                      ease: "linear",
                    }}
                    className={`absolute left-0 right-0 h-32 bg-gradient-to-b from-transparent ${isDanger ? 'via-red-500/20' : 'via-cyber-blue/20'} to-transparent z-10 pointer-events-none backdrop-blur-[2px]`}
                  />
                </>
              )}
            </AnimatePresence>

            <div className="flex justify-between items-center mb-4 text-[10px] font-bold text-gray-500 tracking-widest uppercase relative z-20">
              <div className="flex items-center space-x-2">
                <Code2 size={14} className={`mr-2 ${status === "SCANNING" ? "animate-spin" : ""} text-cyber-blue`} />{" "}
                <ScrambleText text="Analysis_Buffer" />
              </div>
              <div className="flex items-center space-x-2">
                <span
                  className={
                    status === "SCANNING" ? "text-cyber-blue animate-pulse" : ""
                  }
                >
                  {status === "SCANNING" ? "Uploading..." : "Ready"}
                </span>
                <div
                  className={`w-1.5 h-1.5 rounded-full ${status === "SCANNING"
                    ? "bg-cyber-blue animate-ping"
                    : "bg-gray-700"
                    }`}
                />
              </div>
            </div>

            <div className="relative group">
              <textarea
                value={code}
                onChange={(e) => setCode(e.target.value)}
                className="w-full h-80 bg-black/60 rounded-xl p-5 font-mono text-sm text-cyber-green outline-none border border-white/5 resize-none scrollbar-hide focus:border-cyber-blue/30 transition-colors placeholder-gray-700"
                spellCheck="false"
                placeholder="// Paste code here for security analysis..."
              />
              {/* Overlay CRT grid effect */}
              <div className="absolute inset-0 pointer-events-none opacity-[0.03] bg-[linear-gradient(rgba(18,16,16,0)_50%,rgba(0,0,0,0.25)_50%),linear-gradient(90deg,rgba(255,0,0,0.06),rgba(0,255,0,0.02),rgba(0,0,255,0.06))] bg-[length:100%_2px,3px_100%]" />
            </div>

            {/* INITIALIZE BUTTONS */}
            <div className="grid grid-cols-2 gap-3 mt-4">
              <motion.button
                whileHover={{ scale: 1.01 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => startScan("manual")}
                disabled={status === "SCANNING" || !code}
                className={`btn ${status === "SCANNING" ? "" : "btn-primary"} btn-advanced btn-tilt btn-icon-shift btn-scanline btn-border-beam w-full ${!code ? "opacity-50 cursor-not-allowed" : ""}`}
              >
                {status === "SCANNING" ? (
                  <RefreshCw className="animate-spin" size={20} />
                ) : (
                  <Play fill="currentColor" size={20} />
                )}
                <span className="relative z-10">Manual Analysis</span>
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.01 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => startScan("ai")}
                disabled={status === "SCANNING" || !code}
                className={`btn ${status === "SCANNING" ? "" : "btn-secondary"} btn-underline btn-icon-shift btn-scanline btn-border-beam w-full ${!code ? "opacity-50 cursor-not-allowed" : ""}`}
              >
                {status === "SCANNING" ? (
                  <RefreshCw className="animate-spin" size={20} />
                ) : (
                  <Wand2 size={20} />
                )}
                <span className="relative z-10">AI Analysis</span>
              </motion.button>
            </div>
          </GlassCard>

          {/* 3. TERMINAL LOGS */}
          <GlassCard className="bg-black/90 border-white/5 p-4 h-40 overflow-hidden relative">
            <div className="absolute top-2 right-2 text-[10px] text-gray-600 font-bold uppercase tracking-widest flex items-center">
              <Terminal size={10} className="mr-1" /> SYSTEM_LOGS
            </div>
            <div className="font-mono text-[10px] text-cyber-green/80 space-y-1 overflow-y-auto h-full pr-2 scrollbar-none stagger-entry">
              {logs.map((log, i) => (
                <motion.div
                  initial={{ opacity: 0, x: -5 }}
                  animate={{ opacity: 1, x: 0 }}
                  key={i}
                  className="flex space-x-2"
                >
                  <span className="text-cyber-green/40">
                    [{new Date().toLocaleTimeString([], { hour12: false })}]
                  </span>
                  <span>{log}</span>
                </motion.div>
              ))}
              <div ref={terminalEndRef} />
            </div>
          </GlassCard>
        </div>

        {/* 4. DIAGNOSTICS & THREAT FEED */}
        <div className="col-span-12 lg:col-span-5 space-y-6">
          <GlassCard className="relative min-h-[540px]">
            <h3 className="text-[10px] font-black uppercase tracking-widest text-gray-500 mb-8 flex items-center group">
              <Search size={14} className="mr-2 text-cyber-blue group-hover:animate-spin" />{" "}
              <span className="group-hover:text-gradient-animate transition-all duration-300">Diagnostics_Core</span>
            </h3>

            {/* THREAT LEVEL METER */}
            <div className="mb-10">
              <div className="flex justify-between items-end mb-2">
                <span className="text-[10px] font-bold text-gray-600">
                  <ScrambleText text="RISK_SCORE" />
                </span>
                <motion.span
                  key={isDanger ? "crit" : "sec"}
                  initial={{ opacity: 0, scale: 0.5, filter: "blur(10px)" }}
                  animate={{ opacity: 1, scale: 1, filter: "blur(0px)" }}
                  className={`text-2xl font-black italic tracking-tighter ${isDanger ? "text-red-500" : "text-cyber-green"
                    }`}
                >
                  <AnimatedCounter value={getRiskScore(result)} />
                </motion.span>
              </div>
              <div className="h-1.5 w-full bg-white/5 rounded-full overflow-hidden border border-white/5">
                <motion.div
                  animate={{
                    width: result
                      ? `${Math.min(getRiskScore(result) * 10, 100)}%`
                      : "0%",
                    backgroundColor: isDanger ? "#ef4444" : "#93B1A6",
                  }}
                  className="h-full shadow-[0_0_15px_currentColor]"
                />
              </div>
            </div>

            {/* ANALYZED CODE DISPLAY */}
            {result && code && (
              <div className="mb-8 p-4 bg-black/40 rounded-xl border border-white/5">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-[10px] font-black uppercase tracking-widest text-gray-500 flex items-center">
                    <FileText size={14} className="mr-2 text-cyber-blue" />
                    Analyzed_Source
                  </h3>
                  <button
                    onClick={() => navigator.clipboard.writeText(code)}
                    className="text-[9px] font-bold uppercase tracking-wider text-gray-500 hover:text-white transition-colors flex items-center gap-1 cursor-pointer"
                  >
                    <FileText size={10} />
                    Copy
                  </button>
                </div>
                <div className="max-h-40 overflow-y-auto custom-scrollbar font-mono text-[10px] text-cyber-white whitespace-pre-wrap break-all pr-2">
                  {code}
                </div>
              </div>
            )}

            {/* AI ANALYSIS REPORT */}
            {result?.ai?.enabled && (
              <div className="mb-8 p-4 bg-cyber-blue/5 rounded-xl border border-cyber-blue/20">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-[10px] font-black uppercase tracking-widest text-cyber-blue flex items-center">
                    <Wand2 size={14} className="mr-2" />
                    AI_Security_Insight
                  </h3>
                </div>
                
                {/* Summary */}
                <div className="mb-4">
                  <h4 className="text-[9px] font-bold uppercase text-gray-500 mb-2">Executive Summary</h4>
                  <p className="text-[10px] text-gray-300 leading-relaxed font-mono">
                    {result.ai.explanation?.summary || "No summary provided."}
                  </p>
                </div>

                {/* Hypotheses */}
                {result.ai.hypotheses && result.ai.hypotheses.length > 0 && (
                  <div className="mb-4">
                    <h4 className="text-[9px] font-bold uppercase text-gray-500 mb-2">Potential Vectors (Hypothetical)</h4>
                    <div className="space-y-2">
                      {result.ai.hypotheses.map((h, i) => (
                        <div key={i} className="p-2 bg-black/20 rounded border border-white/5">
                          <div className="flex items-center justify-between mb-1">
                            <span className="text-[10px] font-bold text-cyber-blue">{h.title}</span>
                            <span className="text-[8px] uppercase tracking-wider px-1.5 py-0.5 rounded bg-white/5 text-gray-400">
                              {h.confidence} Confidence
                            </span>
                          </div>
                          <p className="text-[9px] text-gray-400 font-mono">{h.reasoning}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* DANGER LIST */}
            <AnimatePresence mode="wait">
              {isDanger && result ? (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  className="space-y-4"
                >
                  <div className="p-4 rounded-xl bg-red-500/5 border border-red-500/20">
                    <div className="flex items-center text-red-500 space-x-2 mb-4">
                      <ShieldAlert size={16} />
                      <span className="text-[10px] font-black uppercase">
                        <ScrambleText text={`Vulnerabilities Detected (${result.vulnerabilities?.length ?? 0})`} />
                      </span>
                    </div>

                    <div className="space-y-2 max-h-60 overflow-y-auto pr-2 scrollbar-thin scrollbar-thumb-white/10">
                      {result.vulnerabilities?.map((vuln, i) => (
                        <motion.div
                          layout
                          key={i}
                          initial={{ opacity: 0, x: -20 }}
                          animate={{
                            opacity: 1,
                            x: 0,
                            transition: { delay: i * 0.05, type: "spring", stiffness: 100 },
                          }}
                          whileHover={{ scale: 1.02, x: 5, backgroundColor: "rgba(255,255,255,0.03)" }}
                          className="flex justify-between items-center bg-black/40 p-3 rounded-lg border border-white/5 group hover:border-red-500/30 transition-colors cursor-default"
                        >
                          <div className="flex flex-col">
                            <span className="text-[11px] font-bold text-gray-300">
                              {vuln.type ||
                                vuln.name ||
                                "Unknown Vulnerability"}
                            </span>
                            <span className="text-[9px] text-gray-500 truncate max-w-[150px]">
                              {vuln.description || "No description available"}
                            </span>
                          </div>
                          <span
                            className={`text-[9px] font-bold px-2 py-0.5 rounded ${getSeverityColor(
                              vuln.severity
                            )}`}
                          >
                            {(vuln.severity || "LOW").toUpperCase()}
                          </span>
                        </motion.div>
                      ))}
                    </div>

                    {/* PATCH BUTTON */}
                    <motion.button
                      onClick={handleGeneratePatch}
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      className="w-full mt-6 py-3 bg-red-600 text-white font-black text-xs uppercase tracking-widest rounded-lg shadow-[0_0_20px_rgba(239,68,68,0.3)] hover:bg-red-500 transition-all flex items-center justify-center space-x-2"
                    >
                      <Wand2 size={14} />
                      <span>Generate Report</span>
                    </motion.button>
                  </div>
                </motion.div>
              ) : status === "FINISHED" && !isDanger ? (
                // SAFE STATE
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="flex flex-col items-center justify-center h-48 text-center"
                >
                  <div className="w-16 h-16 rounded-full bg-cyber-green/5 border border-cyber-green/20 flex items-center justify-center mb-4 shadow-[0_0_20px_rgba(0,255,136,0.1)]">
                    <Activity className="text-cyber-green" size={30} />
                  </div>
                  <p className="text-[10px] font-bold text-gray-500 uppercase tracking-widest leading-loose">
                    Assessment Complete
                    <br />
                    <span className="text-cyber-green">
                      No Threats Detected
                    </span>
                  </p>
                </motion.div>
              ) : (
                // IDLE STATE
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="flex flex-col items-center justify-center h-48 text-center"
                >
                  <div className="w-16 h-16 rounded-full bg-cyber-dark/50 border border-cyber-slate/20 flex items-center justify-center mb-4">
                    <Activity className="text-gray-600" size={30} />
                  </div>
                  <p className="text-[10px] font-bold text-gray-600 uppercase tracking-widest leading-loose">
                    Awaiting Input
                    <br />
                    Standby Mode
                  </p>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Extra Info Tiles */}
            <div className="grid grid-cols-2 gap-3 mt-6">
              <div className="p-3 bg-white/5 rounded-lg border border-white/5 flex flex-col items-center justify-center text-center opacity-50 hover:opacity-100 transition-opacity">
                <Bug size={16} className="mb-2 text-gray-400" />
                <span className="text-[9px] font-bold uppercase text-gray-500">
                  Heuristic Engine
                </span>
              </div>
              <div className="p-3 bg-white/5 rounded-lg border border-white/5 flex flex-col items-center justify-center text-center opacity-50 hover:opacity-100 transition-opacity">
                <Fingerprint size={16} className="mb-2 text-gray-400" />
                <span className="text-[9px] font-bold uppercase text-gray-500">
                  Static Analysis
                </span>
              </div>
            </div>
          </GlassCard>
        </div>
      </div>

      {/* CODE ANALYSIS GRAPH - Shows after analysis is complete */}
      {status === "FINISHED" && result && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="mt-6"
        >
          <GlassCard className="relative overflow-hidden">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-[10px] font-black uppercase tracking-widest text-gray-500 flex items-center group">
                <Network size={14} className="mr-2 text-cyber-blue group-hover:animate-pulse" />
                <span className="group-hover:text-gradient-animate transition-all duration-300">
                  Code Analysis Graph
                </span>
              </h3>
              <div className="text-[9px] text-gray-600 font-mono">
                {result.vulnerabilities?.length || 0} vulnerabilities detected
              </div>
            </div>
            
            <div className="w-full bg-transparent p-4">
              <CodeAnalysisGraph
                data={transformToGraphData(result) || undefined}
                riskScore={getRiskScore(result)}
                vulnerabilityCount={result.vulnerabilities?.length || 0}
              />
            </div>
            
            <div className="mt-4 text-[9px] text-gray-500 font-mono text-center">
              Comprehensive risk analysis and security metrics visualization
            </div>
          </GlassCard>
        </motion.div>
      )}
    </DashboardLayout>
  );
};
