import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Target, Zap, Bug, Code, TrendingUp, AlertCircle, Activity, Shield, Smartphone, Globe, Mail, Radio } from 'lucide-react';
import { DashboardLayout } from '../components/DashboardLayout';
import { GlassCard } from '../components/GlassCard';
import { RedTeamPulse } from '../components/RedTeamPulse';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';

export const RedTeamPage = () => {
  const navigate = useNavigate();
  const { setTeam } = useAuth();
  const [activeTab, setActiveTab] = useState<'overview' | 'attacks' | 'exploits' | 'simulation'>('overview');

  const attackMetrics = [
    { label: 'Attack Vectors', value: '12', icon: Target, color: 'text-red-400' },
    { label: 'Exploits Found', value: '8', icon: Bug, color: 'text-orange-400' },
    { label: 'Success Rate', value: '67%', icon: TrendingUp, color: 'text-yellow-400' },
    { label: 'Tests Run', value: '156', icon: Activity, color: 'text-cyber-blue' },
  ];

  const recentAttacks = [
    { id: 1, type: 'SQL Injection Test', target: 'Login API', status: 'Successful', time: '5m ago' },
    { id: 2, type: 'XSS Vulnerability', target: 'User Dashboard', status: 'Exploited', time: '20m ago' },
    { id: 3, type: 'Authentication Bypass', target: 'Admin Panel', status: 'Failed', time: '1h ago' },
    { id: 4, type: 'CSRF Attack', target: 'Payment Form', status: 'Successful', time: '2h ago' },
  ];

  const attackTools = [
    {
      title: 'Penetration Testing',
      description: 'Simulate real-world attacks to identify vulnerabilities',
      icon: Target,
      status: 'Ready',
    },
    {
      title: 'Exploit Development',
      description: 'Create and test custom exploits for discovered vulnerabilities',
      icon: Code,
      status: 'Active',
    },
    {
      title: 'Social Engineering',
      description: 'Test human factors and security awareness',
      icon: Zap,
      status: 'Ready',
    },
    {
      title: 'Network Reconnaissance',
      description: 'Gather intelligence about target systems and infrastructure',
      icon: Activity,
      status: 'Active',
    },
  ];

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-black text-cyber-white mb-2 flex items-center">
              <div className="w-10 h-10 bg-red-600 rounded-lg flex items-center justify-center mr-3">
                <Target size={24} className="text-white" />
              </div>
              Red Team Operations
            </h1>
            <p className="text-cyber-slate">Offensive security testing and ethical hacking</p>
          </div>

          {/* Active Operations Indicator */}
          <div className="flex items-center space-x-3 bg-black/20 px-4 py-2 rounded-full border border-red-500/10 backdrop-blur-sm">
             <div className="text-right hidden sm:block">
               <div className="text-xs font-bold text-red-500 tracking-wider">ACTIVE OPS</div>
               <div className="text-[10px] text-red-400/60 font-mono">NET-MONITORING</div>
             </div>
             <RedTeamPulse />
          </div>
        </div>

        {/* Warning Banner */}
        <div className="bg-red-500/10 border border-red-500/30 rounded-xl p-4 flex items-start space-x-3">
          <AlertCircle size={20} className="text-red-400 mt-0.5" />
          <div className="flex-1">
            <p className="text-red-400 font-bold text-sm mb-1">Ethical Hacking Only</p>
            <p className="text-xs text-red-300/70">
              All red team activities are authorized and conducted in controlled environments for security testing purposes only.
            </p>
          </div>

          {/* Blue Team Switch Button */}
          <div className="flex flex-col items-end space-y-2">
            <div className="flex items-center space-x-2">
              <div className="text-xs text-cyber-slate">Blue Team</div>
              <span className="w-2 h-2 rounded-full bg-cyber-green animate-pulse" />
            </div>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => { 
                setTeam('blue'); 
                navigate('/blue-team'); 
              }}
              className="px-4 py-2 bg-cyber-blue/20 border border-cyber-blue/50 rounded-lg text-sm font-bold text-cyber-blue hover:bg-cyber-blue/30 hover:border-cyber-blue/70 transition-all shadow-[0_0_10px_rgba(59,130,246,0.3)] flex items-center space-x-2"
            >
              <Shield size={16} />
              <span>Switch to Blue Team</span>
            </motion.button>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex space-x-2 border-b border-white/10">
          {[
            { id: 'overview', label: 'Overview' },
            { id: 'attacks', label: 'Attack Vectors' },
            { id: 'exploits', label: 'Exploits' },
            { id: 'simulation', label: 'Simulation' },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`px-6 py-3 font-bold text-sm transition-all ${
                activeTab === tab.id
                  ? 'text-red-400 border-b-2 border-red-400'
                  : 'text-cyber-slate hover:text-cyber-white'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {attackMetrics.map((metric, index) => (
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
            {/* Recent Attacks */}
            <GlassCard className="p-6">
              <h3 className="text-lg font-black text-cyber-white mb-4 flex items-center">
                <Target size={20} className="mr-2 text-red-400" />
                Recent Attack Tests
              </h3>
              <div className="space-y-3">
                {recentAttacks.map((attack) => (
                  <div
                    key={attack.id}
                    className="p-4 bg-white/5 rounded-lg border border-white/5 hover:border-red-500/30 transition-colors"
                  >
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-bold text-cyber-white">{attack.type}</span>
                      <span className={`text-xs px-2 py-1 rounded ${
                        attack.status === 'Successful' || attack.status === 'Exploited'
                          ? 'bg-red-500/20 text-red-400'
                          : 'bg-gray-500/20 text-gray-400'
                      }`}>
                        {attack.status}
                      </span>
                    </div>
                    <div className="flex items-center justify-between text-xs text-cyber-slate">
                      <span>Target: {attack.target}</span>
                      <span>{attack.time}</span>
                    </div>
                  </div>
                ))}
              </div>
            </GlassCard>

            {/* Attack Tools */}
            <GlassCard className="p-6">
              <h3 className="text-lg font-black text-cyber-white mb-4 flex items-center">
                <Zap size={20} className="mr-2 text-red-400" />
                Attack Tools & Techniques
              </h3>
              <div className="space-y-4">
                {attackTools.map((tool, index) => (
                  <div
                    key={index}
                    className="p-4 bg-white/5 rounded-lg border border-white/5"
                  >
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center space-x-3">
                        <tool.icon size={20} className="text-red-400" />
                        <span className="font-bold text-cyber-white">{tool.title}</span>
                      </div>
                      <span className="text-xs px-2 py-1 rounded bg-red-500/20 text-red-400">
                        {tool.status}
                      </span>
                    </div>
                    <p className="text-xs text-cyber-slate mt-2">{tool.description}</p>
                  </div>
                ))}
              </div>
            </GlassCard>
          </div>
        )}

        {activeTab === 'attacks' && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Mobile Hacking Section */}
            <GlassCard className="p-6 border-2 border-orange-500/30 hover:border-orange-500/50 transition-all">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center space-x-3">
                  <div className="w-12 h-12 bg-orange-500/20 rounded-lg flex items-center justify-center">
                    <Smartphone size={24} className="text-orange-400" />
                  </div>
                  <div>
                    <h3 className="text-lg font-black text-cyber-white">Mobile Hacking</h3>
                    <p className="text-xs text-cyber-slate">iOS & Android Testing</p>
                  </div>
                </div>
                <span className="px-2 py-1 bg-orange-500/20 text-orange-400 text-xs font-bold rounded">Active</span>
              </div>
              
              <div className="space-y-3 mb-4">
                <div className="p-3 bg-white/5 rounded-lg border border-white/5">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-sm font-bold text-cyber-white">App Analysis</span>
                    <span className="text-xs text-cyber-green">Ready</span>
                  </div>
                  <p className="text-xs text-cyber-slate">Static & dynamic analysis of mobile applications</p>
                </div>
                
                <div className="p-3 bg-white/5 rounded-lg border border-white/5">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-sm font-bold text-cyber-white">Reverse Engineering</span>
                    <span className="text-xs text-cyber-green">Ready</span>
                  </div>
                  <p className="text-xs text-cyber-slate">Decompile and analyze app binaries</p>
                </div>
                
                <div className="p-3 bg-white/5 rounded-lg border border-white/5">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-sm font-bold text-cyber-white">Network Interception</span>
                    <span className="text-xs text-orange-400">Testing</span>
                  </div>
                  <p className="text-xs text-cyber-slate">Intercept mobile network traffic</p>
                </div>
              </div>

              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="w-full py-2.5 bg-orange-500/20 border border-orange-500/50 rounded-lg text-sm font-bold text-orange-400 hover:bg-orange-500/30 transition-all"
              >
                Launch Mobile Test
              </motion.button>
            </GlassCard>

            {/* DDoS Attack Section */}
            <GlassCard className="p-6 border-2 border-red-500/30 hover:border-red-500/50 transition-all">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center space-x-3">
                  <div className="w-12 h-12 bg-red-500/20 rounded-lg flex items-center justify-center">
                    <Radio size={24} className="text-red-400" />
                  </div>
                  <div>
                    <h3 className="text-lg font-black text-cyber-white">DDoS Attack</h3>
                    <p className="text-xs text-cyber-slate">Network Stress Testing</p>
                  </div>
                </div>
                <span className="px-2 py-1 bg-red-500/20 text-red-400 text-xs font-bold rounded">Active</span>
              </div>
              
              <div className="space-y-3 mb-4">
                <div className="p-3 bg-white/5 rounded-lg border border-white/5">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-sm font-bold text-cyber-white">Volume Attacks</span>
                    <span className="text-xs text-cyber-green">Ready</span>
                  </div>
                  <p className="text-xs text-cyber-slate">Overwhelm target with high traffic volume</p>
                </div>
                
                <div className="p-3 bg-white/5 rounded-lg border border-white/5">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-sm font-bold text-cyber-white">Protocol Attacks</span>
                    <span className="text-xs text-cyber-green">Ready</span>
                  </div>
                  <p className="text-xs text-cyber-slate">Exploit network protocol weaknesses</p>
                </div>
                
                <div className="p-3 bg-white/5 rounded-lg border border-white/5">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-sm font-bold text-cyber-white">Application Layer</span>
                    <span className="text-xs text-orange-400">Testing</span>
                  </div>
                  <p className="text-xs text-cyber-slate">Target application-specific resources</p>
                </div>
              </div>

              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="w-full py-2.5 bg-red-500/20 border border-red-500/50 rounded-lg text-sm font-bold text-red-400 hover:bg-red-500/30 transition-all"
              >
                Launch DDoS Test
              </motion.button>
            </GlassCard>

            {/* Phishing Section */}
            <GlassCard className="p-6 border-2 border-yellow-500/30 hover:border-yellow-500/50 transition-all">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center space-x-3">
                  <div className="w-12 h-12 bg-yellow-500/20 rounded-lg flex items-center justify-center">
                    <Mail size={24} className="text-yellow-400" />
                  </div>
                  <div>
                    <h3 className="text-lg font-black text-cyber-white">Phishing</h3>
                    <p className="text-xs text-cyber-slate">Social Engineering</p>
                  </div>
                </div>
                <span className="px-2 py-1 bg-yellow-500/20 text-yellow-400 text-xs font-bold rounded">Active</span>
              </div>
              
              <div className="space-y-3 mb-4">
                <div className="p-3 bg-white/5 rounded-lg border border-white/5">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-sm font-bold text-cyber-white">Email Campaigns</span>
                    <span className="text-xs text-cyber-green">Ready</span>
                  </div>
                  <p className="text-xs text-cyber-slate">Create and send phishing email templates</p>
                </div>
                
                <div className="p-3 bg-white/5 rounded-lg border border-white/5">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-sm font-bold text-cyber-white">Landing Pages</span>
                    <span className="text-xs text-cyber-green">Ready</span>
                  </div>
                  <p className="text-xs text-cyber-slate">Build convincing phishing landing pages</p>
                </div>
                
                <div className="p-3 bg-white/5 rounded-lg border border-white/5">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-sm font-bold text-cyber-white">Credential Harvesting</span>
                    <span className="text-xs text-orange-400">Testing</span>
                  </div>
                  <p className="text-xs text-cyber-slate">Capture and analyze harvested credentials</p>
                </div>
              </div>

              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="w-full py-2.5 bg-yellow-500/20 border border-yellow-500/50 rounded-lg text-sm font-bold text-yellow-400 hover:bg-yellow-500/30 transition-all"
              >
                Launch Phishing Test
              </motion.button>
            </GlassCard>
          </div>
        )}

        {activeTab === 'exploits' && (
          <GlassCard className="p-6">
            <h3 className="text-lg font-black text-cyber-white mb-4">Exploit Development</h3>
            <p className="text-cyber-slate">Create and manage custom exploits for discovered vulnerabilities</p>
          </GlassCard>
        )}

        {activeTab === 'simulation' && (
          <GlassCard className="p-6">
            <h3 className="text-lg font-black text-cyber-white mb-4">Attack Simulation</h3>
            <p className="text-cyber-slate">Run comprehensive attack simulations to test system defenses</p>
          </GlassCard>
        )}
      </div>
    </DashboardLayout>
  );
};

