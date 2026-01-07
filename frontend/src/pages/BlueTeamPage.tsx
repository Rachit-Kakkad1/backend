import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Shield, Lock, Eye, FileCheck, Network, AlertTriangle, CheckCircle, XCircle, Target, ChevronDown, Menu, X, Scan, Activity, FileText, Settings, Zap } from 'lucide-react';
import { DashboardLayout } from '../components/DashboardLayout';
import { GlassCard } from '../components/GlassCard';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';

export const BlueTeamPage = () => {
  const navigate = useNavigate();
  const { team, setTeam, setSidebarCollapsed } = useAuth();
  const [activeTab, setActiveTab] = useState<'overview' | 'defense' | 'monitoring' | 'reports'>('overview');
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  // Menu items with icons
  const menuItems = [
    { 
      id: 'scan', 
      label: 'Scan Network', 
      icon: Scan, 
      description: 'Perform network vulnerability scan',
      color: 'text-cyber-blue'
    },
    { 
      id: 'monitor', 
      label: 'Start Monitoring', 
      icon: Activity, 
      description: 'Enable real-time threat monitoring',
      color: 'text-cyber-green'
    },
    { 
      id: 'report', 
      label: 'Generate Report', 
      icon: FileText, 
      description: 'Create security assessment report',
      color: 'text-cyber-purple'
    },
    { 
      id: 'settings', 
      label: 'Defense Settings', 
      icon: Settings, 
      description: 'Configure defense systems',
      color: 'text-cyber-amber'
    },
  ];

  // Toggle menu - opens/closes on click
  const toggleMenu = () => {
    const next = !menuOpen;
    setMenuOpen(next);
    setSidebarCollapsed(next); // Minimize sidebar when menu opens, restore when closes
  };

  // Close menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        if (menuOpen) {
          setMenuOpen(false);
          setSidebarCollapsed(false); // Restore sidebar when closing menu
        }
      }
    };

    if (menuOpen) {
      // Small delay to avoid immediate closing
      setTimeout(() => {
        document.addEventListener('mousedown', handleClickOutside);
      }, 100);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [menuOpen, setSidebarCollapsed]);

  const defenseMetrics = [
    { label: 'Protected Systems', value: '24', icon: Shield, color: 'text-cyber-blue' },
    { label: 'Active Defenses', value: '18', icon: Lock, color: 'text-cyber-green' },
    { label: 'Threats Blocked', value: '1,247', icon: XCircle, color: 'text-red-400' },
    { label: 'Security Score', value: '94%', icon: CheckCircle, color: 'text-cyber-green' },
  ];

  const recentThreats = [
    { id: 1, type: 'SQL Injection Attempt', severity: 'High', status: 'Blocked', time: '2m ago' },
    { id: 2, type: 'XSS Attack Detected', severity: 'Medium', status: 'Blocked', time: '15m ago' },
    { id: 3, type: 'Unauthorized Access', severity: 'Critical', status: 'Blocked', time: '1h ago' },
    { id: 4, type: 'DDoS Attempt', severity: 'High', status: 'Mitigated', time: '2h ago' },
  ];

  const defenseStrategies = [
    {
      title: 'Web Application Firewall',
      status: 'Active',
      description: 'Protecting all web endpoints from common attacks',
      icon: Shield,
    },
    {
      title: 'Intrusion Detection System',
      status: 'Active',
      description: 'Monitoring network traffic for suspicious activity',
      icon: Eye,
    },
    {
      title: 'Code Analysis',
      status: 'Active',
      description: 'Automated vulnerability scanning in CI/CD pipeline',
      icon: FileCheck,
    },
    {
      title: 'Network Monitoring',
      status: 'Active',
      description: 'Real-time network traffic analysis and alerting',
      icon: Network,
    },
  ];

  // Redirect to Red Team if not in Blue Team mode
  useEffect(() => {
    if (team !== 'blue') {
      navigate('/red-team');
    }
  }, [team, navigate]);

  if (team !== 'blue') {
    return null; // Don't render anything while redirecting
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between relative">
          <div>
            <h1 className="text-3xl font-black text-cyber-white mb-2 flex items-center">
              <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center mr-3">
                <Shield size={24} className="text-white" />
              </div>
              Blue Team Operations
            </h1>
            <p className="text-cyber-slate">Defensive security and threat protection</p>
          </div>

          <div className="flex items-center space-x-3">
            {/* Enhanced Menu - Toggle on click */}
            <div className="relative" ref={menuRef}>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={toggleMenu}
                className={`px-5 py-2.5 rounded-xl text-sm font-bold transition-all flex items-center space-x-2 relative overflow-hidden ${
                  menuOpen 
                    ? 'bg-cyber-blue/20 border-2 border-cyber-blue/50 text-cyber-blue shadow-[0_0_20px_rgba(59,130,246,0.4)]' 
                    : 'bg-white/5 border border-white/10 text-cyber-white hover:bg-white/10 hover:border-white/20'
                }`}
              >
                <div className="absolute inset-0 bg-gradient-to-r from-cyber-blue/10 via-transparent to-cyber-blue/10 opacity-0 hover:opacity-100 transition-opacity" />
                <Menu size={18} className="relative z-10" />
                <span className="relative z-10">Menu</span>
                <ChevronDown 
                  size={16} 
                  className={`relative z-10 transition-transform duration-300 ${menuOpen ? 'rotate-180' : ''}`} 
                />
              </motion.button>

              <AnimatePresence>
                {menuOpen && (
                  <motion.div
                    initial={{ opacity: 0, y: -10, scale: 0.98 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: -10, scale: 0.98 }}
                    transition={{ 
                      duration: 0.15,
                      ease: [0.16, 1, 0.3, 1] // Custom cubic-bezier for smooth animation
                    }}
                    className="absolute right-0 top-14 w-72 bg-cyber-dark/95 backdrop-blur-xl border border-white/20 rounded-xl shadow-2xl p-4 z-50 overflow-hidden"
                  >
                    {/* Header */}
                    <div className="flex items-center justify-between mb-4 pb-3 border-b border-white/10">
                      <div className="flex items-center space-x-2">
                        <div className="w-8 h-8 bg-cyber-blue/20 rounded-lg flex items-center justify-center">
                          <Zap size={16} className="text-cyber-blue" />
                        </div>
                        <div>
                          <p className="text-sm font-black text-cyber-white">Defense Menu</p>
                          <p className="text-[10px] text-cyber-slate uppercase tracking-wider">Quick Actions</p>
                        </div>
                      </div>
                      <button
                        onClick={toggleMenu}
                        className="w-7 h-7 rounded-lg bg-white/5 hover:bg-white/10 flex items-center justify-center transition-colors"
                      >
                        <X size={14} className="text-cyber-slate" />
                      </button>
                    </div>

                    {/* Menu Items */}
                    <div className="space-y-2">
                      {menuItems.map((item, index) => {
                        const Icon = item.icon;
                        return (
                          <motion.button
                            key={item.id}
                            initial={{ opacity: 0, x: -5 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ 
                              delay: index * 0.03,
                              duration: 0.2,
                              ease: "easeOut"
                            }}
                            whileHover={{ x: 2 }}
                            whileTap={{ scale: 0.97 }}
                            onClick={() => {
                              // Handle menu item click
                              console.log(`Clicked: ${item.label}`);
                              // You can add specific actions here
                            }}
                            className="w-full text-left p-3 rounded-lg bg-white/5 border border-white/5 hover:bg-white/10 hover:border-white/20 transition-all duration-200 group"
                          >
                            <div className="flex items-center space-x-3">
                              <div className={`w-10 h-10 rounded-lg bg-cyber-blue/10 flex items-center justify-center group-hover:bg-cyber-blue/20 transition-colors ${item.color}`}>
                                <Icon size={18} />
                              </div>
                              <div className="flex-1">
                                <p className="text-sm font-bold text-cyber-white group-hover:text-cyber-blue transition-colors">
                                  {item.label}
                                </p>
                                <p className="text-[10px] text-cyber-slate mt-0.5">
                                  {item.description}
                                </p>
                              </div>
                              <ChevronDown 
                                size={14} 
                                className="text-cyber-slate group-hover:text-cyber-blue transform -rotate-90 transition-colors" 
                              />
                            </div>
                          </motion.button>
                        );
                      })}
                    </div>

                    {/* Footer */}
                    <div className="mt-4 pt-3 border-t border-white/10">
                      <div className="flex items-center justify-between text-[10px] text-cyber-slate">
                        <span className="flex items-center space-x-1">
                          <div className="w-1.5 h-1.5 rounded-full bg-cyber-green animate-pulse" />
                          <span>All systems operational</span>
                        </span>
                        <span className="font-mono">v2.0</span>
                      </div>
                    </div>

                    {/* Decorative gradient overlay */}
                    <div className="absolute inset-0 bg-gradient-to-br from-cyber-blue/5 via-transparent to-cyber-purple/5 pointer-events-none rounded-xl" />
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Red Team Switch Button */}
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => { 
                setTeam('red'); 
                navigate('/red-team'); 
              }}
              className="px-4 py-2 bg-red-500/20 border border-red-500/50 rounded-lg text-sm font-bold text-red-400 hover:bg-red-500/30 hover:border-red-500/70 transition-all shadow-[0_0_10px_rgba(239,68,68,0.3)] flex items-center space-x-2"
            >
              <Target size={16} />
              <span>Switch to Red Team</span>
            </motion.button>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex space-x-2 border-b border-white/10">
          {[
            { id: 'overview', label: 'Overview' },
            { id: 'defense', label: 'Defense Systems' },
            { id: 'monitoring', label: 'Monitoring' },
            { id: 'reports', label: 'Reports' },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`px-6 py-3 font-bold text-sm transition-all ${
                activeTab === tab.id
                  ? 'text-cyber-blue border-b-2 border-cyber-blue'
                  : 'text-cyber-slate hover:text-cyber-white'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {defenseMetrics.map((metric, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
            >
              <GlassCard className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <metric.icon size={32} className={metric.color} />
                </div>
                <p className="text-3xl font-black text-cyber-white mb-1">{metric.value}</p>
                <p className="text-xs text-cyber-slate uppercase tracking-wider">{metric.label}</p>
              </GlassCard>
            </motion.div>
          ))}
        </div>

        {/* Content based on active tab */}
        {activeTab === 'overview' && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Recent Threats */}
            <GlassCard className="p-6">
              <h3 className="text-lg font-black text-cyber-white mb-4 flex items-center">
                <AlertTriangle size={20} className="mr-2 text-red-400" />
                Recent Threat Activity
              </h3>
              <div className="space-y-3">
                {recentThreats.map((threat) => (
                  <div
                    key={threat.id}
                    className="p-4 bg-white/5 rounded-lg border border-white/5 hover:border-red-500/30 transition-colors"
                  >
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-bold text-cyber-white">{threat.type}</span>
                      <span className={`text-xs px-2 py-1 rounded ${
                        threat.severity === 'Critical' ? 'bg-red-500/20 text-red-400' :
                        threat.severity === 'High' ? 'bg-orange-500/20 text-orange-400' :
                        'bg-yellow-500/20 text-yellow-400'
                      }`}>
                        {threat.severity}
                      </span>
                    </div>
                    <div className="flex items-center justify-between text-xs text-cyber-slate">
                      <span className="text-cyber-green flex items-center">
                        <CheckCircle size={12} className="mr-1" />
                        {threat.status}
                      </span>
                      <span>{threat.time}</span>
                    </div>
                  </div>
                ))}
              </div>
            </GlassCard>

            {/* Defense Status */}
            <GlassCard className="p-6">
              <h3 className="text-lg font-black text-cyber-white mb-4 flex items-center">
                <Shield size={20} className="mr-2 text-cyber-blue" />
                Defense Systems Status
              </h3>
              <div className="space-y-4">
                {defenseStrategies.map((strategy, index) => (
                  <div
                    key={index}
                    className="p-4 bg-white/5 rounded-lg border border-white/5"
                  >
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center space-x-3">
                        <strategy.icon size={20} className="text-cyber-blue" />
                        <span className="font-bold text-cyber-white">{strategy.title}</span>
                      </div>
                      <span className="text-xs px-2 py-1 rounded bg-cyber-green/20 text-cyber-green">
                        {strategy.status}
                      </span>
                    </div>
                    <p className="text-xs text-cyber-slate mt-2">{strategy.description}</p>
                  </div>
                ))}
              </div>
            </GlassCard>
          </div>
        )}

        {activeTab === 'defense' && (
          <GlassCard className="p-6">
            <h3 className="text-lg font-black text-cyber-white mb-4">Active Defense Systems</h3>
            <p className="text-cyber-slate">Detailed defense system configuration and management</p>
          </GlassCard>
        )}

        {activeTab === 'monitoring' && (
          <GlassCard className="p-6">
            <h3 className="text-lg font-black text-cyber-white mb-4">Real-time Monitoring</h3>
            <p className="text-cyber-slate">Live threat monitoring and alerting dashboard</p>
          </GlassCard>
        )}

        {activeTab === 'reports' && (
          <GlassCard className="p-6">
            <h3 className="text-lg font-black text-cyber-white mb-4">Security Reports</h3>
            <p className="text-cyber-slate">Generate and view security assessment reports</p>
          </GlassCard>
        )}
      </div>
    </DashboardLayout>
  );
};

