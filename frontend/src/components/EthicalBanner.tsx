import { useEffect, useState, useRef } from "react";
import { ethicsApi } from "../api/ethics";
import type { EthicalNotice } from "../types/analysis";

export const EthicalBanner = () => {
  const [notice, setNotice] = useState<EthicalNotice | null>(null);
  const [isVisible, setIsVisible] = useState(true);
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
  const cardRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const fetchNotice = async () => {
      try {
        const data = await ethicsApi.getEthicalNotice();
        setNotice(data);
      } catch (error) {
        console.error("Failed to fetch ethical notice:", error);
      }
    };
    fetchNotice();
  }, []);

  // 3D Holographic Mouse Tracking Logic
  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!cardRef.current) return;
    const rect = cardRef.current.getBoundingClientRect();
    setMousePos({
      x: e.clientX - rect.left,
      y: e.clientY - rect.top,
    });
  };

  if (!notice || !isVisible) return null;

  return (
    <>
      {/* ADVANCED ANIMATIONS ENGINE 
        (Injected directly to ensure 3D physics work without external CSS files)
      */}
      <style>{`
        @keyframes float-y {
          0%, 100% { transform: translateY(0px) perspective(1000px) rotateX(0deg); }
          50% { transform: translateY(-6px) perspective(1000px) rotateX(2deg); }
        }
        @keyframes scan-line {
          0% { transform: translateX(-100%) skewX(-20deg); opacity: 0; }
          15% { opacity: 1; }
          85% { opacity: 1; }
          100% { transform: translateX(200%) skewX(-20deg); opacity: 0; }
        }
        @keyframes pulse-ring {
          0% { box-shadow: 0 0 0 0 rgba(245, 158, 11, 0.4); }
          70% { box-shadow: 0 0 0 10px rgba(245, 158, 11, 0); }
          100% { box-shadow: 0 0 0 0 rgba(245, 158, 11, 0); }
        }
        @keyframes slide-bounce {
          0% { opacity: 0; transform: translateY(-50px) scale(0.9); }
          60% { opacity: 1; transform: translateY(10px) scale(1.02); }
          100% { opacity: 1; transform: translateY(0) scale(1); }
        }
        
        .banner-3d-container {
          animation: slide-bounce 0.8s cubic-bezier(0.34, 1.56, 0.64, 1) forwards;
        }
        
        /* Floating animation only when NOT hovering */
        .banner-3d-container:not(:hover) .banner-float-layer {
          animation: float-y 6s ease-in-out infinite;
        }
      `}</style>

      <div
        ref={cardRef}
        onMouseMove={handleMouseMove}
        className="banner-3d-container relative w-full mb-8 group perspective-[2000px] z-10"
      >
        <div className="banner-float-layer relative transition-all duration-300 ease-out group-hover:-translate-y-2 group-hover:scale-[1.01]">
          {/* 1. GLASS BACKGROUND & BORDER */}
          <div className="relative overflow-hidden rounded-2xl border border-cyber-slate/20 bg-cyber-dark/60 backdrop-blur-xl shadow-lg transition-all duration-500 group-hover:shadow-[0_20px_60px_-15px_rgba(245,158,11,0.3)] group-hover:border-amber-400/50">
            {/* 2. DYNAMIC SPOTLIGHT (Follows Mouse) */}
            <div
              className="pointer-events-none absolute -inset-px opacity-0 group-hover:opacity-100 transition-opacity duration-500"
              style={{
                background: `radial-gradient(600px circle at ${mousePos.x}px ${mousePos.y}px, rgba(255,255,255,0.6), transparent 40%)`,
              }}
            />

            {/* 3. AUTOMATIC SCANNERS & SHIMMERS */}
            <div className="absolute inset-0 opacity-20 bg-gradient-to-br from-amber-100/50 via-transparent to-orange-100/50"></div>
            <div className="absolute top-0 left-0 w-1/2 h-full bg-gradient-to-r from-transparent via-white/80 to-transparent skew-x-[-20deg] animate-[scan-line_4s_ease-in-out_infinite]"></div>

            {/* 4. CONTENT LAYOUT */}
            <div className="relative p-6 flex items-start gap-6">
              {/* Animated Icon */}
              <div className="relative flex-shrink-0">
                <div className="absolute inset-0 bg-amber-400 rounded-full blur-md opacity-20 animate-pulse"></div>
                <div className="relative p-3 bg-gradient-to-br from-cyber-dark to-amber-950/30 rounded-xl shadow-md border border-amber-500/20 text-amber-500 ring-1 ring-amber-500/10 group-hover:scale-110 transition-transform duration-300 flex items-center justify-center">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-6 w-6"
                    viewBox="0 0 20 20"
                    fill="currentColor"
                  >
                    <path
                      fillRule="evenodd"
                      d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z"
                      clipRule="evenodd"
                    />
                  </svg>
                </div>
              </div>

              {/* Text Content */}
              <div className="flex-1 space-y-2">
                <div className="flex items-center gap-3">
                  <h3 className="text-base font-bold text-cyber-white tracking-tight group-hover:text-amber-400 transition-colors">
                    {notice.title}
                  </h3>

                  {/* Glowing Badge */}
                  <span className="relative inline-flex h-5 items-center justify-center rounded-full bg-amber-500/10 px-2.5 text-[10px] font-black uppercase tracking-widest text-amber-500 ring-1 ring-inset ring-amber-500/20 overflow-hidden">
                    <span className="relative z-10">Educational</span>
                    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-amber-300/40 to-transparent animate-[shimmer_2s_infinite]"></div>
                  </span>
                </div>

                <p className="text-sm text-cyber-slate leading-relaxed font-medium group-hover:text-cyber-white transition-colors">
                  {notice.content}
                </p>

                {/* Micro-Interaction Note */}
                <div className="inline-flex items-center gap-2 rounded-lg bg-amber-500/5 px-3 py-1.5 text-xs font-semibold text-amber-500/70 border border-amber-500/20 group-hover:bg-amber-500/10 group-hover:border-amber-500/30 transition-colors">
                  <span className="flex h-2 w-2 relative">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-amber-500"></span>
                  </span>
                  Simulation Mode Active: No executables allowed.
                </div>
              </div>

              {/* Close Button with magnetic feel */}
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setIsVisible(false);
                }}
                className="group/btn relative -mr-2 -mt-2 p-2 rounded-full hover:bg-slate-100 transition-all active:scale-95"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-5 w-5 text-cyber-slate group-hover/btn:text-red-500 transition-colors"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                >
                  <path
                    fillRule="evenodd"
                    d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
                    clipRule="evenodd"
                  />
                </svg>
              </button>
            </div>

            {/* Bottom Glow Line */}
            <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r from-transparent via-amber-400 to-transparent opacity-50 group-hover:opacity-100 group-hover:h-1 transition-all duration-300"></div>
          </div>
        </div>
      </div>
    </>
  );
};
