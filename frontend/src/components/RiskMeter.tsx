import { useEffect, useState } from 'react';

interface RiskMeterProps {
  riskScore: number; // 0-100
}

export const RiskMeter = ({ riskScore }: RiskMeterProps) => {
  const [animatedWidth, setAnimatedWidth] = useState(0);
  const [isHovered, setIsHovered] = useState(false);

  // 1. Staggered Entry & Motion Blur Slide
  useEffect(() => {
    const timer = setTimeout(() => {
      setAnimatedWidth(riskScore);
    }, 300); // Slight delay for "Staggered" feel
    return () => clearTimeout(timer);
  }, [riskScore]);

  // Logic: Advanced Color Maps with Glows
  const getTheme = (score: number) => {
    if (score < 25) return {
      gradient: 'from-emerald-400 via-emerald-500 to-teal-500',
      text: 'text-emerald-400',
      bg: 'bg-emerald-500',
      shadow: 'shadow-emerald-500/40',
      border: 'border-emerald-500/30'
    };
    if (score < 50) return {
      gradient: 'from-amber-400 via-amber-500 to-orange-500',
      text: 'text-amber-400',
      bg: 'bg-amber-500',
      shadow: 'shadow-amber-500/40',
      border: 'border-amber-500/30'
    };
    if (score < 75) return {
      gradient: 'from-orange-500 via-orange-600 to-red-500',
      text: 'text-orange-400',
      bg: 'bg-orange-500',
      shadow: 'shadow-orange-500/40',
      border: 'border-orange-500/30'
    };
    return {
      gradient: 'from-rose-500 via-red-600 to-red-700',
      text: 'text-rose-400',
      bg: 'bg-rose-600',
      shadow: 'shadow-rose-500/40',
      border: 'border-rose-500/30'
    };
  };

  const theme = getTheme(riskScore);
  const getRiskLabel = (score: number) => {
    if (score < 25) return 'Secure';
    if (score < 50) return 'Moderate';
    if (score < 75) return 'Elevated';
    return 'Critical';
  };

  return (
    <>
      {/* CSS Injection for Specific Animations requested */}
      <style>{`
        @keyframes liquid-drift {
          0% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
          100% { background-position: 0% 50%; }
        }
        @keyframes beacon-pulse {
          0% { box-shadow: 0 0 0 0 rgba(255, 255, 255, 0.7); }
          70% { box-shadow: 0 0 0 10px rgba(255, 255, 255, 0); }
          100% { box-shadow: 0 0 0 0 rgba(255, 255, 255, 0); }
        }
        @keyframes scan-line {
          0% { transform: translateX(-100%); }
          100% { transform: translateX(200%); }
        }
      `}</style>

      {/* Main Container: Magnetic Hover + Shadow Depth Scaling */}
      <div
        className={`
          relative w-full group p-5 rounded-2xl border transition-all duration-500 ease-out
          bg-cyber-dark/60 backdrop-blur-xl
          ${isHovered ? 'shadow-2xl scale-[1.02] -translate-y-1' : 'shadow-sm scale-100'}
          ${isHovered ? theme.border : 'border-cyber-slate/20'}
        `}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        {/* Cursor Proximity Light / Edge Fade Mask (Subtle glow background) */}
        <div className={`absolute inset-0 bg-gradient-to-br ${theme.gradient} opacity-0 group-hover:opacity-5 transition-opacity duration-500 rounded-2xl pointer-events-none`} />

        {/* Header Section */}
        <div className="relative flex items-end justify-between mb-4 z-10">
          <div className="flex flex-col">
            {/* Focus Glow Label */}
            <span className="text-[10px] font-bold text-cyber-slate uppercase tracking-widest transition-colors group-hover:text-cyber-white mb-1">
              Threat Analysis
            </span>

            <div className="flex items-center gap-2">
              {/* Pulse Attention Effect */}
              <span className={`relative flex h-2.5 w-2.5`}>
                <span className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 ${theme.bg}`}></span>
                <span className={`relative inline-flex rounded-full h-2.5 w-2.5 ${theme.bg}`}></span>
              </span>

              <span className={`text-sm font-bold transition-all duration-300 ${theme.text} ${isHovered ? 'blur-[0.5px]' : ''} hover:blur-0`}>
                {getRiskLabel(riskScore)} Level
              </span>
            </div>
          </div>

          {/* Digital Score Readout */}
          <div className="text-right">
            <div className="flex items-baseline justify-end gap-1">
              <span className={`text-4xl font-black tracking-tight transition-all duration-700 ${theme.text} drop-shadow-sm`}>
                {riskScore}
              </span>
              <span className="text-sm text-cyber-slate font-medium">/100</span>
            </div>
          </div>
        </div>

        {/* Progress Bar Container: Subtle Noise Texture via Grid */}
        <div className="relative w-full h-5 bg-cyber-dark/80 rounded-full overflow-hidden shadow-inner ring-1 ring-black/5">

          {/* Background Grid Pattern (Subtle Noise/Tech texture) */}
          <div className="absolute inset-0 w-full h-full opacity-20"
            style={{
              backgroundImage: 'linear-gradient(90deg, transparent 50%, #cbd5e1 50%)',
              backgroundSize: '4px 4px'
            }}>
          </div>

          {/* Animated Bar: Gradient Drift + Shimmer */}
          <div
            className={`
              h-full relative rounded-full bg-gradient-to-r ${theme.gradient} 
              transition-all duration-1000 cubic-bezier(0.34, 1.56, 0.64, 1)
              group-hover:brightness-110
            `}
            style={{
              width: `${Math.min(animatedWidth, 100)}%`,
              backgroundSize: '200% 200%',
              animation: 'liquid-drift 3s ease infinite'
            }}
          >
            {/* Glossy Overlay (Glass Effect) */}
            <div className="absolute top-0 left-0 right-0 h-[40%] bg-gradient-to-b from-white/50 to-transparent"></div>

            {/* Status Beacon (The white dot at the tip) */}
            <div className="absolute right-1 top-1/2 -translate-y-1/2 w-3 h-3 bg-white rounded-full shadow-md animate-[beacon-pulse_2s_infinite]"></div>

            {/* Shimmer/Scan Line Effect */}
            <div className="absolute inset-0 w-full h-full bg-gradient-to-r from-transparent via-white/30 to-transparent -skew-x-12 opacity-50 animate-[scan-line_3s_ease-in-out_infinite]"></div>
          </div>
        </div>

        {/* Footer: Fade-In Tooltips / Metadata */}
        <div className="flex justify-between items-center mt-3 text-[10px] font-medium text-cyber-slate uppercase tracking-wider">
          <span className="group-hover:text-cyber-white transition-colors">Safety Index</span>
          <span className={`${theme.text} opacity-0 group-hover:opacity-100 transition-opacity duration-300 transform translate-y-1 group-hover:translate-y-0`}>
            Real-time
          </span>
        </div>
      </div>
    </>
  );
};