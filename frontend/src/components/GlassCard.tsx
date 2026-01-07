import { motion, useMotionTemplate, useMotionValue } from 'framer-motion';
import type { MouseEvent } from 'react';

interface GlassCardProps {
  children: React.ReactNode;
  className?: string;
}

export const GlassCard = ({ children, className = "" }: GlassCardProps) => {
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);

  function handleMouseMove({ currentTarget, clientX, clientY }: MouseEvent) {
    const { left, top } = currentTarget.getBoundingClientRect();
    mouseX.set(clientX - left);
    mouseY.set(clientY - top);
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: "easeOut" }}
      onMouseMove={handleMouseMove}
      className={`group relative bg-cyber-dark/60 backdrop-blur-xl border border-white/5 rounded-2xl p-6 shadow-glass-pro overflow-hidden transition-all duration-300 hover:border-cyber-blue/30 glass-card-hover card-highlight ${className}`}
    >
      {/* HUD Corners */}
      <div className="hud-corner hud-tl rounded-tl-2xl" />
      <div className="hud-corner hud-tr rounded-tr-2xl" />
      <div className="hud-corner hud-bl rounded-bl-2xl" />
      <div className="hud-corner hud-br rounded-br-2xl" />

      {/* Interactive Spotlight Effect */}
      <motion.div
        className="pointer-events-none absolute -inset-px rounded-2xl opacity-0 transition duration-300 group-hover:opacity-100"
        style={{
          background: useMotionTemplate`
            radial-gradient(
              600px circle at ${mouseX}px ${mouseY}px,
              rgba(255, 255, 255, 0.03),
              transparent 80%
            )
          `,
        }}
      />

      {/* Systemic Scan Effect (Periodic) */}
      <div className="systemic-scan opacity-[0.15]" />

      {/* Subtle inner glow */}
      <div className="absolute inset-0 bg-gradient-to-tr from-white/[0.02] to-transparent pointer-events-none" />

      <div className="relative z-10 h-full w-full">
        {children}
      </div>
    </motion.div>
  );
};
