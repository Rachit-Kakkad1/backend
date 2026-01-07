import React from 'react';
import { motion } from 'framer-motion';

export const RedTeamPulse = () => {
  return (
    <div className="relative flex items-center justify-center w-12 h-12">
      {/* Outer Rotating Ring */}
      <motion.div
        className="absolute w-full h-full border-2 border-red-500/30 rounded-full border-t-red-500"
        animate={{ rotate: 360 }}
        transition={{ duration: 4, repeat: Infinity, ease: "linear" }}
      />
      
      {/* Middle Pulsing Ring */}
      <motion.div
        className="absolute w-8 h-8 border border-red-500/50 rounded-full"
        animate={{ scale: [1, 1.2, 1], opacity: [0.3, 0.8, 0.3] }}
        transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
      />

      {/* Inner Core */}
      <div className="w-2 h-2 bg-red-500 rounded-full shadow-[0_0_10px_rgba(239,68,68,0.8)]" />
      
      {/* Optional: "Active" Text label next to it? 
          User asked for "Small, non-distracting". 
          Let's keep it just the graphic for now as it's cleaner.
      */}
    </div>
  );
};
