import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, User, Mail, Calendar, Shield, Activity, Award, Settings } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

interface ProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const ProfileModal: React.FC<ProfileModalProps> = ({ isOpen, onClose }) => {
  const { user } = useAuth();

  const getInitials = (name: string) => {
    if (!name) return "AU";
    return name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase();
  };

  const stats = [
    { label: 'Analyses Run', value: '127', icon: Activity },
    { label: 'Vulnerabilities Found', value: '342', icon: Shield },
    { label: 'Security Score', value: '94%', icon: Award },
  ];

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50"
          />

          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="bg-cyber-dark border border-white/10 rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
              {/* Header */}
              <div className="relative bg-gradient-to-r from-cyber-blue/20 to-cyber-purple/20 p-6 border-b border-white/10">
                <button
                  onClick={onClose}
                  className="absolute top-4 right-4 p-2 rounded-lg hover:bg-white/10 transition-colors text-cyber-slate hover:text-cyber-white"
                >
                  <X size={20} />
                </button>

                <div className="flex items-center space-x-4">
                  <div className="w-20 h-20 rounded-xl bg-gradient-to-br from-cyber-blue to-cyber-purple flex items-center justify-center text-2xl font-black text-white shadow-lg">
                    {getInitials(user?.name || "Admin User")}
                  </div>
                  <div>
                    <h2 className="text-2xl font-black text-cyber-white mb-1">
                      {user?.name || "Admin User"}
                    </h2>
                    <p className="text-cyber-green flex items-center text-sm font-bold uppercase tracking-wider">
                      <span className="w-2 h-2 rounded-full bg-cyber-green mr-2 animate-pulse" />
                      Online & Active
                    </p>
                  </div>
                </div>
              </div>

              {/* Content */}
              <div className="p-6 space-y-6">
                {/* User Details */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="flex items-center space-x-3 p-4 bg-white/5 rounded-xl border border-white/5">
                    <div className="p-3 bg-cyber-blue/20 rounded-lg">
                      <Mail size={20} className="text-cyber-blue" />
                    </div>
                    <div>
                      <p className="text-xs text-cyber-slate uppercase tracking-wider mb-1">Email</p>
                      <p className="text-sm font-bold text-cyber-white">
                        {user?.email || "admin@ThreatLens.io"}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center space-x-3 p-4 bg-white/5 rounded-xl border border-white/5">
                    <div className="p-3 bg-cyber-purple/20 rounded-lg">
                      <Calendar size={20} className="text-cyber-purple" />
                    </div>
                    <div>
                      <p className="text-xs text-cyber-slate uppercase tracking-wider mb-1">Member Since</p>
                      <p className="text-sm font-bold text-cyber-white">
                        {user?.createdAt ? new Date(user.createdAt).toLocaleDateString() : "Jan 2024"}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center space-x-3 p-4 bg-white/5 rounded-xl border border-white/5">
                    <div className="p-3 bg-cyber-green/20 rounded-lg">
                      <Shield size={20} className="text-cyber-green" />
                    </div>
                    <div>
                      <p className="text-xs text-cyber-slate uppercase tracking-wider mb-1">Role</p>
                      <p className="text-sm font-bold text-cyber-white">
                        {user?.role || "Security Analyst"}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center space-x-3 p-4 bg-white/5 rounded-xl border border-white/5">
                    <div className="p-3 bg-yellow-500/20 rounded-lg">
                      <User size={20} className="text-yellow-500" />
                    </div>
                    <div>
                      <p className="text-xs text-cyber-slate uppercase tracking-wider mb-1">User ID</p>
                      <p className="text-sm font-bold text-cyber-white font-mono">
                        {user?._id?.slice(0, 8) || "VULN-001"}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Statistics */}
                <div>
                  <h3 className="text-sm font-black uppercase tracking-wider text-cyber-slate mb-4 flex items-center">
                    <Activity size={16} className="mr-2" />
                    Activity Statistics
                  </h3>
                  <div className="grid grid-cols-3 gap-4">
                    {stats.map((stat, index) => (
                      <motion.div
                        key={index}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.1 }}
                        className="p-4 bg-gradient-to-br from-white/5 to-white/0 rounded-xl border border-white/5 text-center"
                      >
                        <stat.icon size={24} className="text-cyber-blue mx-auto mb-2" />
                        <p className="text-2xl font-black text-cyber-white mb-1">{stat.value}</p>
                        <p className="text-xs text-cyber-slate uppercase tracking-wider">{stat.label}</p>
                      </motion.div>
                    ))}
                  </div>
                </div>

                {/* Security Badges */}
                <div>
                  <h3 className="text-sm font-black uppercase tracking-wider text-cyber-slate mb-4 flex items-center">
                    <Award size={16} className="mr-2" />
                    Security Badges
                  </h3>
                  <div className="flex flex-wrap gap-3">
                    {['Code Defender', 'Vulnerability Hunter', 'Security Expert', 'Analysis Master'].map((badge, index) => (
                      <motion.div
                        key={index}
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: index * 0.1 }}
                        className="px-4 py-2 bg-gradient-to-r from-cyber-blue/20 to-cyber-purple/20 border border-cyber-blue/30 rounded-lg text-sm font-bold text-cyber-white"
                      >
                        {badge}
                      </motion.div>
                    ))}
                  </div>
                </div>

                {/* Settings Button */}
                <button className="w-full p-4 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl transition-all flex items-center justify-center space-x-2 text-cyber-white font-bold">
                  <Settings size={18} />
                  <span>Account Settings</span>
                </button>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

