import { motion } from 'framer-motion';

// Professional Status Badge with Glow
export const StatusBadge = ({ status }: { status: 'secure' | 'warning' | 'critical' | 'info' | string }) => {
  const styles: Record<string, string> = {
    secure: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20 shadow-[0_0_12px_rgba(16,185,129,0.1)]',
    warning: 'bg-amber-500/10 text-amber-400 border-amber-500/20 shadow-[0_0_12px_rgba(245,158,11,0.1)]',
    critical: 'bg-rose-500/10 text-rose-400 border-rose-500/20 shadow-[0_0_12px_rgba(244,63,94,0.1)]',
    info: 'bg-cyber-blue/10 text-cyber-blue border-cyber-blue/20 shadow-[0_0_12px_rgb(var(--cyber-blue)/0.1)]',
  };

  // Default to 'info' if status key doesn't match
  const activeStyle = styles[status?.toLowerCase()] || styles.info;

  return (
    <div className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold border uppercase tracking-wider ${activeStyle} animate-[flicker_4s_infinite]`}>
      {status}
    </div>
  );
};


// Animated Loading Dots for Buttons
export const ButtonLoader = () => (
  <div className="flex space-x-1 justify-center items-center h-full">
    {[0, 1, 2].map((i) => (
      <motion.div
        key={i}
        animate={{ scale: [1, 1.5, 1], opacity: [0.5, 1, 0.5] }}
        transition={{ repeat: Infinity, duration: 0.6, delay: i * 0.1 }}
        className="w-1.5 h-1.5 bg-current rounded-full"
      />
    ))}
  </div>
);