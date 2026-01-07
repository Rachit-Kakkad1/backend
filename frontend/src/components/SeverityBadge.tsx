// Ensure this import path matches your project structure
// If 'Severity' isn't defined in types, you can remove the import and use string type below
import type { Severity } from "../types/analysis";

interface SeverityBadgeProps {
  severity: Severity | string;
}

export const SeverityBadge = ({ severity }: SeverityBadgeProps) => {
  // Logic: Advanced styling maps for Glass + Glow effects
  const getStyles = (sev: string) => {
    const s = sev.toUpperCase();
    switch (s) {
      case "LOW":
        return {
          container:
            "bg-cyber-green/10 border-cyber-green/20 text-cyber-green shadow-cyber-green/10",
          dot: "bg-cyber-green",
          ring: "group-hover:ring-emerald-500/30",
          shimmer: "via-emerald-400/20",
        };
      case "MEDIUM":
        return {
          container:
            "bg-amber-500/10 border-amber-500/20 text-amber-700 shadow-amber-500/10",
          dot: "bg-amber-500",
          ring: "group-hover:ring-amber-500/30",
          shimmer: "via-amber-400/20",
        };
      case "HIGH":
        return {
          container:
            "bg-orange-500/10 border-orange-500/20 text-orange-700 shadow-orange-500/10",
          dot: "bg-orange-500",
          ring: "group-hover:ring-orange-500/30",
          shimmer: "via-orange-400/20",
        };
      case "CRITICAL":
        return {
          container:
            "bg-rose-500/10 border-rose-500/20 text-rose-700 shadow-rose-500/10",
          dot: "bg-rose-600",
          ring: "group-hover:ring-rose-500/30",
          shimmer: "via-rose-400/20",
        };
      default:
        return {
          container:
            "bg-cyber-slate/10 border-cyber-slate/20 text-cyber-slate shadow-cyber-slate/10",
          dot: "bg-cyber-slate",
          ring: "group-hover:ring-slate-500/30",
          shimmer: "via-slate-400/20",
        };
    }
  };

  const styles = getStyles(typeof severity === "string" ? severity : "LOW");

  return (
    <>
      {/* CSS Animation Injection */}
      <style>{`
        @keyframes shimmer-slide {
          0% { transform: translateX(-150%) skewX(-20deg); }
          100% { transform: translateX(200%) skewX(-20deg); }
        }
      `}</style>

      <span
        className={`
          group relative inline-flex items-center gap-1.5 px-3 py-1 rounded-full 
          text-[11px] font-black uppercase tracking-widest border 
          backdrop-blur-md shadow-sm transition-all duration-300 ease-out
          hover:scale-105 hover:shadow-md cursor-default select-none
          ring-1 ring-transparent ${styles.ring}
          ${styles.container}
        `}
      >
        {/* Shimmer Effect Overlay */}
        <div className="absolute inset-0 overflow-hidden rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-300">
          <div
            className={`absolute inset-0 w-full h-full bg-gradient-to-r from-transparent ${styles.shimmer} to-transparent animate-[shimmer-slide_1.5s_infinite]`}
          ></div>
        </div>

        {/* Status Beacon (Pulsing Dot) */}
        <span className="relative flex h-2 w-2">
          <span
            className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 ${styles.dot}`}
          ></span>
          <span
            className={`relative inline-flex rounded-full h-2 w-2 ${styles.dot}`}
          ></span>
        </span>

        {/* Text Content */}
        <span className="relative z-10 font-bold">{severity}</span>
      </span>
    </>
  );
};
