import { useState, useEffect, useRef } from "react";
import { createPortal } from "react-dom"; // IMPORTED FOR CURSOR FIX
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { analysisApi } from "../api/analysis";
import type { DashboardMetrics } from "../types/analysis";
import { DashboardLayout } from "../components/DashboardLayout";
import { GlassCard } from "../components/GlassCard";
import { systemApi } from "../api/system";
import { StatusBadge } from "../components/UI";
import {
  ShieldCheck,
  Zap,
  AlertTriangle,
  Terminal,
  Cpu,
  Network,
  Plus,
  Download,
  RefreshCcw,
  ChevronRight,
  Bell,
  Server,
} from "lucide-react";

// Ensure your CSS is imported
import "./DashboardAnimations.css";

// Animation variants
const container = {
  hidden: { opacity: 0, scale: 0.98 },
  show: {
    opacity: 1,
    scale: 1,
    transition: {
      staggerChildren: 0.08,
      duration: 0.6,
    }
  },
};

const item = {
  hidden: { opacity: 0, y: 15 },
  show: { opacity: 1, y: 0 }
};

export const DashboardPage = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  // --- CURSOR LOGIC START ---
  const cursorRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const cursor = cursorRef.current;

    // Move Cursor
    const moveCursor = (e: MouseEvent) => {
      if (cursor) {
        // Using transform is more performant than top/left
        cursor.style.transform = `translate(${e.clientX}px, ${e.clientY}px) translate(-50%, -50%)`;
      }
    };

    // Hover Effects
    const hoverStart = () => cursor?.classList.add('hovered');
    const hoverEnd = () => cursor?.classList.remove('hovered');

    window.addEventListener('mousemove', moveCursor);

    // Attach listeners to interactive elements
    // We use a small timeout to ensure elements are rendered
    const timeoutId = setTimeout(() => {
      const clickables = document.querySelectorAll('button, a, .glass-card, input, .btn, .nav-item');
      clickables.forEach(el => {
        el.addEventListener('mouseenter', hoverStart);
        el.addEventListener('mouseleave', hoverEnd);
      });
    }, 1000);

    return () => {
      window.removeEventListener('mousemove', moveCursor);
      clearTimeout(timeoutId);
      const clickables = document.querySelectorAll('button, a, .glass-card, input, .btn, .nav-item');
      clickables.forEach(el => {
        el.removeEventListener('mouseenter', hoverStart);
        el.removeEventListener('mouseleave', hoverEnd);
      });
    };
  }, []);
  // --- CURSOR LOGIC END ---

  // --- REAL DATA STATE ---
  const [metrics, setMetrics] = useState<DashboardMetrics | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // --- SIMULATED LIVE STATE ---
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [cpuUsage, setCpuUsage] = useState<number>(0);
  const [latency, setLatency] = useState<number>(0);
  const [logs, setLogs] = useState([
    {
      id: 1,
      time: "LIVE",
      msg: "System integrity monitor active",
      type: "secure",
    },
    {
      id: 2,
      time: "LOG",
      msg: "Database connection established",
      type: "info",
    },
  ]);

  // 1. FETCH REAL DATA
  const fetchMetrics = async () => {
    try {
      setError(null);
      const dashboard = await analysisApi.getDashboardMetrics();
      setMetrics(dashboard);

      try {
        const system = await systemApi.getHealth();
        setCpuUsage(system.cpuUsagePercent);
        setLatency(system.apiLatencyMs);
      } catch (e) {
        console.warn("System health failed", e);
      }
    } catch (err) {
      console.error("Dashboard fetch failed:", err);
      setError("Unable to connect to analysis engine.");
    } finally {
      setLoading(false);
      setIsRefreshing(false);
    }
  };

  useEffect(() => {
    // ⛔ Do not fetch until auth is ready
    if (!user) return;

    fetchMetrics();

    // Auto-refresh every 30 seconds
    const poller = setInterval(fetchMetrics, 30000);
    return () => clearInterval(poller);
  }, [user]);


  // 3. REFRESH HANDLER
  const handleRefresh = () => {
    setIsRefreshing(true);
    fetchMetrics();
    setLogs((prev) => [
      {
        id: Date.now(),
        time: new Date().toLocaleTimeString([], { hour12: false }),
        msg: "Manual synchronization complete",
        type: "info",
      },
      ...prev.slice(0, 4),
    ]);
  };

 // --- SAFETY CHECKS ---
const safeStats = {
  totalScans: metrics?.totalScans || 0,
  totalVulnerabilities: metrics?.totalVulnerabilities || 0,
  severity: metrics?.severityDistribution || {
    Low: 0,
    Medium: 0,
    High: 0,
    Critical: 0,
  },
  riskTrends: metrics?.riskTrends || [],
};

// 🔥 ADD YOUR CODE RIGHT HERE
const totalVulns = safeStats.totalVulnerabilities;

const severityCounts = {
  LOW: safeStats.severity.Low,
  MEDIUM: safeStats.severity.Medium,
  HIGH: safeStats.severity.High,
  CRITICAL: safeStats.severity.Critical,
};

const atRiskCount =
  severityCounts.HIGH + severityCounts.CRITICAL;

const atRiskPercent =
  totalVulns === 0
    ? 0
    : Math.round((atRiskCount / totalVulns) * 100);


  // Calculate Risk Score Safely
  const currentRiskScore =
    safeStats.riskTrends.length > 0
      ? safeStats.riskTrends[safeStats.riskTrends.length - 1].riskScore
      : 0;

  // Determine Status
  const systemStatus =
    currentRiskScore > 70
      ? "critical"
      : currentRiskScore > 40
        ? "warning"
        : "secure";

  useEffect(() => {
    const timeout = setTimeout(() => {
      setLoading(false);
    }, 5000);

    return () => clearTimeout(timeout);
  }, []);

  return (
    <div className="min-h-screen cursor-scope">


      {/* --- CURSOR PORTAL: Renders directly to body to avoid clipping --- */}
      {createPortal(
        <div ref={cursorRef} className="custom-cursor" />,
        document.body
      )}


      <DashboardLayout>
        <motion.div
          variants={container}
          initial="hidden"
          animate="show"
          className="space-y-8"
        >
          {/* --- HEADER --- */}
          <motion.div variants={item} className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
            <div>
              <h1 className="text-4xl font-black tracking-tighter text-cyber-white">
                ThreatLens_COMMAND_CENTER
              </h1>
              <p className="text-cyber-slate text-xs font-bold uppercase tracking-[0.3em] mt-1 flex items-center">
                <span className="w-2 h-2 bg-cyber-green rounded-full mr-2 animate-pulse shadow-[0_0_10px_rgb(var(--cyber-green))]" />
                ThreatLens_CORE v4.0.0 // USER:{" "}
                {user?.name?.toUpperCase() || "ADMIN"}
              </p>
            </div>

            <div className="flex items-center space-x-3">
              <button
                onClick={handleRefresh}
                className="btn btn-ghost btn-underline btn-icon-shift btn-scanline btn-border-beam"
              >
                <RefreshCcw
                  size={18}
                  className={isRefreshing ? "animate-spin" : ""}
                />
              </button>
              <button
                onClick={() => navigate("/analyze")}
                className="btn btn-primary btn-advanced btn-tilt btn-icon-shift btn-scanline btn-border-beam"
              >
                <Plus size={18} className="mr-2" /> New Security Scan
              </button>
            </div>
          </motion.div>

          {error && (
            <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/30 text-red-400 flex items-center">
              <AlertTriangle className="mr-3" /> {error}
            </div>
          )}

          {/* --- HUD STATS --- */}
          <motion.div variants={item} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {[
              {
                label: "CPU_USAGE",
                value: `${cpuUsage}%`,
                icon: Cpu,
                color: "text-cyber-indigo",
              },
              {
                label: "NETWORK_LATENCY",
                value: `${latency}ms`,
                icon: Network,
                color: "text-cyber-cyan",
              },
              {
                label: "TOTAL_SCANS",
                value: safeStats.totalScans,
                icon: Terminal,
                color: "text-cyber-amber",
              },
              {
                label: "VULN_DETECTED",
                value: safeStats.totalVulnerabilities,
                icon: Zap,
                color:
                  safeStats.totalVulnerabilities > 0
                    ? "text-red-500"
                    : "text-cyber-green",
              },
            ].map((stat, i) => (
              <GlassCard
                key={i}
                className="flex items-center justify-between p-5 border-white/5 hover:border-white/20 transition-colors cursor-default group"
              >
                <div>
                  <p className="text-[10px] font-bold text-cyber-slate uppercase tracking-widest">
                    {stat.label}
                  </p>
                  <p className={`text-2xl font-black mt-1 ${stat.color}`}>
                    {stat.value}
                  </p>
                </div>
                <stat.icon
                  className="text-cyber-slate group-hover:text-cyber-white transition-colors"
                  size={24}
                />
              </GlassCard>
            ))}
          </motion.div>

          <div className="grid grid-cols-12 gap-6">
            {/* --- MAIN SECURITY RADAR --- */}
            <div className="col-span-12 lg:col-span-8">
              <GlassCard className="h-full min-h-[400px] border-t-2 border-t-cyber-blue/30 overflow-hidden flex flex-col">
                <div className="flex justify-between items-center mb-10">
                  <div className="flex items-center space-x-3">
                    <ShieldCheck className="text-cyber-blue" />
                    <h3 className="text-lg font-bold text-white">
                      Threat Monitoring Stream
                    </h3>
                  </div>
                  <StatusBadge status={systemStatus} />
                </div>

                {/* Severity Bars */}
                <div className="flex-1 px-4 space-y-6">
                  {[
                    {
                      label: "CRITICAL",
                      val: safeStats.severity.Critical,
                      color: "bg-red-600",
                    },
                    {
                      label: "HIGH",
                      val: safeStats.severity.High,
                      color: "bg-cyber-purple",
                    },
                    {
                      label: "MEDIUM",
                      val: safeStats.severity.Medium,
                      color: "bg-cyber-blue/60",
                    },
                    {
                      label: "LOW",
                      val: safeStats.severity.Low,
                      color: "bg-cyber-green",
                    },
                  ].map((bar, i) => (
                    <div key={i}>
                      <div className="flex justify-between text-[10px] font-bold uppercase mb-2">
                        <span className="text-gray-400">
                          {bar.label}_VULNERABILITIES
                        </span>
                        <span className="text-white">{bar.val} Found</span>
                      </div>
                      <div className="h-2 w-full bg-white/5 rounded-full overflow-hidden">
                        <motion.div
                          initial={{ width: 0 }}
                          animate={{
                            width: `${totalVulns === 0
                                ? 0
                                : Math.round((bar.val / totalVulns) * 100)
                              }%`,

                          }}
                          transition={{ duration: 1, delay: i * 0.1 }}
                          className={`h-full ${bar.color} shadow-[0_0_10px_currentColor]`}
                        />
                      </div>
                    </div>
                  ))}
                </div>

                <div className="mt-8 pt-6 border-t border-white/5 grid grid-cols-3 gap-4 text-center">
                  <div>
                    <p className="text-[10px] text-gray-500 uppercase">
                      Avg Risk
                    </p>
                    <p className="text-xl font-bold text-white">
                      {currentRiskScore}/100
                    </p>
                  </div>
                  <div className="border-x border-white/10">
                    <p className="text-[10px] text-gray-500 uppercase">Engine</p>
                    <p className="text-xl font-bold text-cyber-blue">ONLINE</p>
                  </div>
                  <div>
                    <p className="text-[10px] text-gray-500 uppercase">
                      Last Scan
                    </p>
                    <p className="text-xl font-bold text-white">Today</p>
                  </div>
                </div>
              </GlassCard>
            </div>

            {/* --- LIVE FEED --- */}
            <div className="col-span-12 lg:col-span-4 space-y-4">
              <GlassCard className="h-full flex flex-col">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-sm font-black uppercase tracking-widest flex items-center text-white">
                    <Bell size={16} className="mr-2 text-cyber-purple" />{" "}
                    Live_Feed
                  </h3>
                  <span className="text-[10px] font-mono text-gray-600 animate-pulse">
                    ● REC
                  </span>
                </div>

                <div className="flex-1 space-y-3 overflow-y-auto max-h-[300px] pr-2 custom-scrollbar">
                  <AnimatePresence>
                    {logs.map((log) => (
                      <motion.div
                        key={log.id}
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        className="p-3 rounded-lg bg-white/[0.03] border border-white/5 hover:border-white/10 transition-all cursor-default"
                      >
                        <div className="flex justify-between items-start mb-1">
                          <span className="text-[9px] font-mono text-gray-500">
                            {log.time}
                          </span>
                          <StatusBadge status={log.type as any} />
                        </div>
                        <p className="text-xs text-gray-300">{log.msg}</p>
                      </motion.div>
                    ))}
                  </AnimatePresence>
                </div>

                <button
                  onClick={() => navigate("/history")}
                  className="w-full mt-4 py-3 border border-white/10 rounded-xl text-[10px] font-bold uppercase tracking-[0.2em] hover:bg-white/5 transition-all text-gray-400 hover:text-white flex items-center justify-center group"
                >
                  Full Audit Log{" "}
                  <ChevronRight
                    size={14}
                    className="ml-1 group-hover:translate-x-1 transition-transform"
                  />
                </button>
              </GlassCard>
            </div>
          </div>

          {/* --- BOTTOM TOOLS --- */}
          <motion.div variants={item} className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="p-6 rounded-2xl bg-white/5 border border-white/10 flex items-center space-x-4 hover:bg-white/[0.08] transition-all cursor-pointer glow-stagger">
              <div className="p-3 rounded-lg bg-cyber-blue/10 text-cyber-blue">
                <Server size={20} />
              </div>
              <div>
                <p className="font-bold text-sm text-white">Server Health</p>
                <p className="text-[10px] text-gray-500 uppercase">
                  Diagnostic Tools
                </p>
              </div>
            </div>
            <div className="p-6 rounded-2xl bg-white/5 border border-white/10 flex items-center space-x-4 hover:bg-white/[0.08] transition-all cursor-pointer glow-stagger">
              <div className="p-3 rounded-lg bg-cyber-purple/10 text-cyber-purple">
                <Download size={20} />
              </div>
              <div>
                <p className="font-bold text-sm text-white">Export Data</p>
                <p className="text-[10px] text-gray-500 uppercase">
                  PDF / JSON / CSV
                </p>
              </div>
            </div>
            <div className="p-6 rounded-2xl bg-white/5 border border-white/10 flex items-center space-x-4 hover:bg-white/[0.08] transition-all cursor-pointer glow-stagger">
              <div className="p-3 rounded-lg bg-cyber-green/10 text-cyber-green">
                <ShieldCheck size={20} />
              </div>
              <div>
                <p className="font-bold text-sm text-white">Compliance</p>
                <p className="text-[10px] text-gray-500 uppercase">
                  ISO 27001 Status
                </p>
              </div>
            </div>
          </motion.div>
        </motion.div>
      </DashboardLayout>
    </div>
  );
};