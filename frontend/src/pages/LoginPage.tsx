import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { GoogleLogin } from "@react-oauth/google";
import { useAuth } from "../context/AuthContext";
import { motion } from "framer-motion";
import { ShieldCheck, Lock, Cpu, Activity, Zap, Terminal } from "lucide-react";
import { GlassCard } from "../components/GlassCard";
import "./LoginPage.css";

export const LoginPage = () => {
  const { login, devLogin } = useAuth();
  const navigate = useNavigate();
  const [error, setError] = useState<string | null>(null);
  const [statusText, setStatusText] = useState("");

  // --- CURSOR LOGIC START ---
  const cursorRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const cursor = cursorRef.current;

    // Move Cursor
    const moveCursor = (e: MouseEvent) => {
      if (cursor) {
        // Direct DOM manipulation for performance (no React state lag)
        cursor.style.transform = `translate(${e.clientX}px, ${e.clientY}px) translate(-50%, -50%)`;
      }
    };

    // Hover Effects
    const hoverStart = () => cursor?.classList.add('hovered');
    const hoverEnd = () => cursor?.classList.remove('hovered');

    window.addEventListener('mousemove', moveCursor);

    // Attach hover listeners to interactive elements
    const targets = document.querySelectorAll('button, a, .glass-card, input');
    targets.forEach(el => {
      el.addEventListener('mouseenter', hoverStart);
      el.addEventListener('mouseleave', hoverEnd);
    });

    return () => {
      window.removeEventListener('mousemove', moveCursor);
      targets.forEach(el => {
        el.removeEventListener('mouseenter', hoverStart);
        el.removeEventListener('mouseleave', hoverEnd);
      });
    };
  }, []);
  // --- CURSOR LOGIC END ---

  // Typing effect
  useEffect(() => {
    const text = "ENCRYPTED CONNECTION ESTABLISHED...";
    let i = 0;
    const interval = setInterval(() => {
      if (i < text.length) {
        setStatusText((prev) => prev + text.charAt(i));
        i++;
      } else {
        clearInterval(interval);
      }
    }, 50);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="min-h-screen bg-[#020408] flex items-center justify-center relative overflow-hidden">

      {/* --- CUSTOM CURSOR ELEMENT --- */}
      <div ref={cursorRef} className="custom-cursor" />

      {/* --- BACKGROUND LAYERS --- */}
      <div className="absolute inset-0 bg-grid-pattern opacity-20 pointer-events-none" />
      <div className="absolute top-[-20%] left-[-10%] w-[500px] h-[500px] bg-blue-600/10 rounded-full blur-[100px]" />
      <div className="absolute bottom-[-20%] right-[-10%] w-[500px] h-[500px] bg-cyan-600/5 rounded-full blur-[100px]" />

      {/* --- MAIN CARD --- */}
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
        className="relative z-10 w-full max-w-md"
      >
        <GlassCard className="relative overflow-hidden p-0 border border-white/10 shadow-[0_0_50px_rgba(0,0,0,0.8)] backdrop-blur-xl bg-[#0B0F19]/80">

          <div className="p-8 relative z-20">

            {/* --- HEADER --- */}
            <div className="text-center mb-10">
              <div className="relative inline-block mb-6">
                <div className="absolute inset-[-10px] border border-blue-500/30 rounded-full border-dashed holo-spin" />
                <div className="absolute inset-[-4px] border border-cyan-500/20 rounded-full holo-spin-reverse" />

                <div className="relative w-20 h-20 bg-gradient-to-b from-white/10 to-transparent border border-white/10 rounded-full flex items-center justify-center mx-auto backdrop-blur-md shadow-[0_0_20px_rgba(59,130,246,0.3)]">
                  <ShieldCheck size={36} className="text-blue-400 drop-shadow-[0_0_10px_rgba(59,130,246,0.8)]" />
                </div>
              </div>

              <div className="relative">
                <h1 className="text-4xl font-black tracking-tighter text-white mb-2 relative inline-block">
                  ThreatLens
                  <span className="glitch-layer" aria-hidden="true">ThreatLens</span>
                  <span className="glitch-layer" aria-hidden="true">ThreatLens</span>
                  <span className="text-blue-500">_CORE</span>
                </h1>
              </div>

              <div className="flex items-center justify-center gap-2 mt-2">
                <span className="px-2 py-0.5 rounded bg-blue-500/10 border border-blue-500/20 text-[10px] font-bold text-blue-400 tracking-widest uppercase">
                  Secure Gateway
                </span>
                <span className="px-2 py-0.5 rounded bg-white/5 border border-white/10 text-[10px] font-bold text-gray-400 tracking-widest uppercase flex items-center gap-1">
                  <Lock size={8} /> 256-Bit Encrypted
                </span>
              </div>
            </div>

            {/* --- ERROR MESSAGE --- */}
            {error && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                className="mb-6 p-3 bg-red-950/30 border-l-2 border-red-500 rounded-r-lg flex items-center text-xs text-red-300 font-mono"
              >
                <Activity size={14} className="mr-2 text-red-500 animate-pulse" />
                <span className="font-bold mr-1">ERR_0X1:</span> {error}
              </motion.div>
            )}

            {/* --- LOGIN AREA --- */}
            <div className="space-y-6">
              <div className="p-6 bg-white/5 rounded-2xl border border-white/5 text-center relative overflow-hidden group hover:border-blue-500/30 transition-colors duration-500">
                <div className="absolute top-0 left-1/2 -translate-x-1/2 w-1/2 h-[1px] bg-gradient-to-r from-transparent via-blue-500 to-transparent opacity-50" />

                <p className="text-[10px] font-bold text-gray-400 uppercase mb-6 tracking-[0.2em] flex items-center justify-center gap-2">
                  <Zap size={10} className="text-yellow-400" /> Authenticate Identity
                </p>

                <div className="flex justify-center relative z-10">
                  <GoogleLogin
                    onSuccess={async (credentialResponse) => {
                      try {
                        if (!credentialResponse.credential) throw new Error("No ID Token");
                        await login(credentialResponse.credential);
                        navigate("/dashboard");
                      } catch (err) {
                        console.error(err);
                        setError("Handshake Failed. Retrying...");
                      }
                    }}
                    onError={() => setError("Google Oath Service Unreachable")}
                    theme="filled_black"
                    shape="pill"
                    width="280"
                    logo_alignment="left"
                  />
                </div>

                {/* --- DEV BYPASS --- */}
                <div className="mt-6 pt-4 border-t border-white/5 flex justify-center">
                  <button
                    onClick={async () => {
                      try {
                        await devLogin();
                        navigate("/dashboard");
                      } catch (err) {
                        setError("Dev Bypass Rejected");
                      }
                    }}
                    className="group flex items-center gap-2 text-[10px] font-bold text-gray-600 hover:text-green-400 font-mono uppercase tracking-widest transition-colors"
                  >
                    {/* <Terminal size={10} />
                    <span>[ Initialize_Dev_Protocol ]</span> */}
                  </button>
                </div>
              </div>

              {/* --- FOOTER STATUS --- */}
              <div className="flex justify-between items-center text-[10px] text-gray-500 font-mono uppercase border-t border-white/5 pt-4">
                <div className="flex items-center gap-2">
                  <div className="pulse-dot" />
                  <span className="text-blue-400/80">{statusText}</span>
                  <span className="animate-pulse">_</span>
                </div>
                <div className="flex items-center gap-1 opacity-50">
                  <Cpu size={10} />
                  <span>V.4.0.2</span>
                </div>
              </div>
            </div>
          </div>
        </GlassCard>

        <p className="text-center text-[10px] text-gray-600 mt-6 font-mono tracking-widest">
          UNAUTHORIZED ACCESS ATTEMPTS WILL BE LOGGED
        </p>
      </motion.div>
    </div>
  );
};