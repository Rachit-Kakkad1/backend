import { LayoutDashboard, ShieldCheck, History, Terminal, Menu, X, ChevronLeft, ChevronRight } from 'lucide-react';
import { useNavigate, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';

import { ProfileModal } from './ProfileModal';

const SidebarItem = ({ icon: Icon, label, path, active, collapsed }: any) => {
  const navigate = useNavigate();
  return (
    <div
      title={collapsed ? label : undefined}
      onClick={() => navigate(path)}
      className={`flex items-center ${collapsed ? 'justify-center' : 'space-x-3'} p-3 rounded-lg cursor-pointer transition-all duration-300 group relative overflow-hidden btn-underline btn-icon-shift ${active
        ? 'bg-cyber-blue/10 text-cyber-blue ring-1 ring-cyber-blue/20'
        : 'text-cyber-slate hover:bg-white/5 hover:text-cyber-white active:scale-95'
        }`}>
      <Icon size={18} className={active ? 'text-cyber-blue' : 'text-cyber-slate group-hover:text-cyber-white transition-colors'} />
      <span className={`font-semibold text-sm tracking-tight whitespace-nowrap ${collapsed ? 'hidden' : ''}`}>{label}</span>
    </div>
  );
};

export const DashboardLayout = ({ children }: { children: React.ReactNode }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, logout, team, setTeam, sidebarCollapsed, setSidebarCollapsed } = useAuth();
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  // Handle window resize
  useEffect(() => {
    const handleResize = () => {
      const mobile = window.innerWidth < 768;
      setIsMobile(mobile);
      if (mobile && !sidebarCollapsed) {
        setSidebarCollapsed(true);
      }
    };
    
    handleResize(); // Init
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [setSidebarCollapsed]); // Added dependency to fix linter warning if any

  const getInitials = (name: string) => {
    if (!name) return "AU";
    return name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase();
  };

  const isRedTeam = team === 'red';

  return (
    <div className={`flex min-h-screen font-sans overflow-x-hidden transition-colors duration-500 ${isRedTeam ? 'bg-[#0f0505] text-red-50' : 'bg-cyber-black text-cyber-white'}`}>
      
      {/* 
        ========================================
        BLUE TEAM SIDEBAR 
        ========================================
        - Rendered ONLY if team is 'blue'
        - Uses AnimatePresence for smooth slide in/out
      */}
      <AnimatePresence mode="wait">
        {!isRedTeam && (
          <motion.aside
            initial={{ x: -300, opacity: 0 }}
            animate={{ 
              x: 0, 
              opacity: 1,
              width: sidebarCollapsed ? 80 : 256
            }}
            exit={{ x: -300, opacity: 0 }}
            transition={{ type: "spring", stiffness: 300, damping: 30 }}
            className={`fixed h-full z-30 border-r flex flex-col backdrop-blur-xl transition-colors duration-300
              ${isRedTeam 
                ? 'border-red-900/30 bg-red-950/20' 
                : 'border-white/5 bg-cyber-dark/90 supports-[backdrop-filter]:bg-cyber-dark/50'
              }`}
          >
            {/* Sidebar Toggle Button (Absolute) */}
            <button
              onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
              className="absolute -right-3 top-8 bg-cyber-dark border border-white/10 rounded-full p-1 text-cyber-slate hover:text-cyber-white hover:border-cyber-blue transition-all z-50 shadow-lg"
            >
              {sidebarCollapsed ? <ChevronRight size={14} /> : <ChevronLeft size={14} />}
            </button>

            {/* Header / Logo */}
            <div className="p-6 flex items-center space-x-3 mb-2">
              <div 
                className={`${sidebarCollapsed ? 'w-8 h-8' : 'w-9 h-9'} bg-cyber-blue rounded-lg flex items-center justify-center transition-all cursor-pointer shadow-[0_0_15px_rgba(59,130,246,0.5)]`}
                onClick={() => navigate('/dashboard')}
              >
                <ShieldCheck size={20} className="text-cyber-black" />
              </div>
              {!sidebarCollapsed && (
                <motion.span 
                  initial={{ opacity: 0 }} 
                  animate={{ opacity: 1 }} 
                  className="text-lg font-black tracking-tighter text-cyber-white"
                >
                  ThreatLens
                </motion.span>
              )}
            </div>

            {/* Team Switcher */}
            <div className={`px-4 mb-6 ${sidebarCollapsed ? 'flex justify-center' : ''}`}>
              <button
                onClick={() => {
                  const newTeam = 'red';
                  setTeam(newTeam);
                  navigate('/red-team');
                }}
                className={`
                  relative overflow-hidden group w-full flex items-center
                  ${sidebarCollapsed ? 'justify-center p-2' : 'justify-between px-4 py-3'}
                  bg-gradient-to-r from-red-900/40 to-red-600/20 
                  border border-red-500/30 rounded-xl
                  hover:border-red-500/60 hover:from-red-900/60 hover:to-red-600/30
                  transition-all duration-300 shadow-[0_0_15px_rgba(220,38,38,0.15)]
                  hover:shadow-[0_0_20px_rgba(220,38,38,0.3)]
                `}
                title="Switch to Red Team"
              >
                {/* Button Glow Effect */}
                <div className="absolute inset-0 bg-red-500/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                
                {/* Content */}
                <div className={`flex items-center ${sidebarCollapsed ? 'justify-center' : 'space-x-3'} relative z-10`}>
                  <div className="w-8 h-8 rounded-lg bg-red-500/20 flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                    <ShieldCheck size={18} className="text-red-400" />
                  </div>
                  
                  {!sidebarCollapsed && (
                    <div className="flex flex-col items-start">
                      <span className="text-sm font-bold text-red-100 group-hover:text-white transition-colors">Red Team</span>
                      <span className="text-[10px] text-red-300/60 uppercase tracking-wider font-semibold">Switch Ops</span>
                    </div>
                  )}
                </div>

                {/* Arrow Icon */}
                {!sidebarCollapsed && (
                  <ChevronRight size={16} className="text-red-400 opacity-70 group-hover:opacity-100 group-hover:translate-x-1 transition-all" />
                )}
              </button>
            </div>

            {/* Navigation */}
            <div className="flex-1 px-3 space-y-1 overflow-y-auto custom-scrollbar">
              {!sidebarCollapsed && (
                <p className="px-3 text-xs uppercase tracking-[0.2em] text-cyber-slate/60 font-bold mb-2 mt-4">Main Menu</p>
              )}
              <SidebarItem icon={LayoutDashboard} label="Dashboard" path="/dashboard" active={location.pathname === '/dashboard'} collapsed={sidebarCollapsed} />
              <SidebarItem icon={Terminal} label="Analysis" path="/analyze" active={location.pathname === '/analyze'} collapsed={sidebarCollapsed} />
              <SidebarItem icon={History} label="History" path="/history" active={location.pathname === '/history'} collapsed={sidebarCollapsed} />
            </div>

            {/* User Profile */}
            <div className="mt-auto border-t border-white/5 bg-black/20 p-4">
              <div 
                className={`flex items-center ${sidebarCollapsed ? 'justify-center' : 'space-x-3'} p-2 rounded-lg hover:bg-white/5 transition-colors cursor-pointer group mb-4`} 
                onClick={() => setIsProfileOpen(true)}
              >
                <div className="relative">
                  <div className={`w-10 h-10 rounded-lg bg-gradient-to-br from-cyber-blue/20 to-cyber-purple/20 border border-white/10 flex items-center justify-center text-cyber-blue font-black text-xs ${sidebarCollapsed ? 'w-8 h-8' : ''}`}>
                    {getInitials(user?.name || "AU")}
                  </div>
                  <div className="absolute -bottom-1 -right-1 w-3 h-3 bg-cyber-black rounded-full flex items-center justify-center">
                    <div className="w-2 h-2 bg-cyber-green rounded-full animate-pulse"></div>
                  </div>
                </div>
                
                {!sidebarCollapsed && (
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-bold text-cyber-white truncate">{user?.name || "Admin User"}</p>
                    <p className="text-[10px] text-cyber-slate truncate">Security Analyst</p>
                  </div>
                )}
              </div>

              {/* Footer Actions */}
              <div className={`flex items-center ${sidebarCollapsed ? 'flex-col space-y-4' : 'justify-between'}`}>
                <div
                  onClick={() => navigate('/')}
                  className={`flex items-center ${sidebarCollapsed ? 'justify-center' : 'space-x-2'} text-cyber-slate hover:text-cyber-white cursor-pointer transition-colors`}
                  title="Back to Home"
                >
                  <ChevronLeft size={18} />
                  {!sidebarCollapsed && <span className="text-xs font-bold">Home</span>}
                </div>

                <div
                  onClick={async () => { await logout(); navigate('/'); }}
                  className={`flex items-center ${sidebarCollapsed ? 'justify-center' : 'space-x-2'} text-cyber-slate hover:text-red-400 cursor-pointer transition-colors`}
                  title="Sign Out"
                >
                  <X size={18} />
                  {!sidebarCollapsed && <span className="text-xs font-bold">Logout</span>}
                </div>
              </div>
            </div>
          </motion.aside>
        )}
      </AnimatePresence>

      {/* 
        ========================================
        MAIN CONTENT AREA
        ========================================
        - Adjusts margin based on Sidebar presence
      */}
      <main 
        className={`flex-1 min-h-screen transition-all duration-300 relative
          ${!isRedTeam 
            ? (sidebarCollapsed ? 'md:ml-20' : 'md:ml-64') 
            : 'ml-0' // Full width for Red Team
          }
        `}
      >
        {/* Mobile Header for Blue Team (When sidebar is hidden/collapsed on mobile) */}
        {!isRedTeam && isMobile && (
          <div className="sticky top-0 z-20 bg-cyber-dark/80 backdrop-blur-md border-b border-white/5 p-4 flex items-center justify-between md:hidden">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-cyber-blue rounded-lg flex items-center justify-center">
                <ShieldCheck size={18} className="text-cyber-black" />
              </div>
              <span className="font-bold text-cyber-white">ThreatLens</span>
            </div>
            <button onClick={() => setSidebarCollapsed(!sidebarCollapsed)} className="p-2 text-cyber-white">
              <Menu size={24} />
            </button>
          </div>
        )}

        {/* Content Wrapper */}
        <div className={`p-4 md:p-8 max-w-[1920px] mx-auto ${isRedTeam ? 'p-6 md:p-12' : ''}`}>
          {children}
        </div>
      </main>

      <ProfileModal isOpen={isProfileOpen} onClose={() => setIsProfileOpen(false)} />
    </div>
  );
};
