import {
  createContext,
  useContext,
  useEffect,
  useState,
} from "react";
import type { ReactNode } from "react";
import { authApi } from "../api/auth";

/* =========================================================
   Types
========================================================= */

interface AuthContextType {
  user: any;
  isAuthenticated: boolean;
  loading: boolean;
  login: (googleIdToken: string) => Promise<void>;
  devLogin: () => Promise<void>;
  logout: () => Promise<void>;
  // Team / UI state
  team: 'red' | 'blue';
  setTeam: (team: 'red' | 'blue') => void;
  toggleTeam: () => void;
  sidebarCollapsed: boolean;
  setSidebarCollapsed: (val: boolean) => void;
} 

const AuthContext = createContext<AuthContextType | null>(null);

/* =========================================================
   Helpers
========================================================= */

const getToken = () => localStorage.getItem("sentinai_token");
const getTeam = () => (localStorage.getItem("sentinai_team") as 'red' | 'blue') || 'red';

/* =========================================================
   Provider
========================================================= */

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<any>(null);
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(
    Boolean(getToken())
  );
  const [loading, setLoading] = useState<boolean>(true);

  // Team and UI state
  const [team, setTeam] = useState<'red' | 'blue'>(getTeam());
  const [sidebarCollapsed, setSidebarCollapsed] = useState<boolean>(false);

  // Persist team selection
  useEffect(() => {
    localStorage.setItem('sentinai_team', team);
  }, [team]);

  const toggleTeam = () => setTeam((t) => (t === 'red' ? 'blue' : 'red'));

  /* =========================================================
     Hydration: Token → User
  ========================================================= */

  useEffect(() => {
    const token = getToken();

    if (!token) {
      setIsAuthenticated(false);
      setUser(null);
      setLoading(false);
      return;
    }

    authApi
      .getCurrentUser()
      .then((res) => {
        if (res?.success && res.user) {
          setUser(res.user);
          setIsAuthenticated(true);
        } else {
          localStorage.removeItem("sentinai_token");
          setUser(null);
          setIsAuthenticated(false);
        }
      })
      .catch(() => {
        localStorage.removeItem("sentinai_token");
        setUser(null);
        setIsAuthenticated(false);
      })
      .finally(() => {
        // keep your animation polish
        setTimeout(() => setLoading(false), 800);
      });
  }, []);

  /* =========================================================
     Auth Actions
  ========================================================= */

  const login = async (googleIdToken: string) => {
    const res = await authApi.googleLogin(googleIdToken);

    if (!res?.success || !res.token) {
      throw new Error("Login failed");
    }

    localStorage.setItem("sentinai_token", res.token);
    setUser(res.user);
    setIsAuthenticated(true);
  };

  const devLogin = async () => {
    const res = await authApi.devLogin();

    if (!res?.success || !res.token) {
      throw new Error("Dev login failed");
    }

    localStorage.setItem("sentinai_token", res.token);
    setUser(res.user);
    setIsAuthenticated(true);
  };

  const logout = async () => {
    try {
      await authApi.logout();
    } finally {
      localStorage.removeItem("sentinai_token");
      setUser(null);
      setIsAuthenticated(false);
    }
  };

  /* =========================================================
     System Boot Screen (UNCHANGED – SAFE)
  ========================================================= */

  if (loading) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-cyber-black overflow-hidden">
        <style>{`
          @keyframes gradient-drift {
            0% { background-position: 0% 50%; }
            50% { background-position: 100% 50%; }
            100% { background-position: 0% 50%; }
          }
          @keyframes pulse-ring {
            0% { transform: scale(0.8); opacity: 0.5; }
            100% { transform: scale(2); opacity: 0; }
          }
          @keyframes scan-vertical {
            0% { transform: translateY(-100%); }
            100% { transform: translateY(100%); }
          }
        `}</style>

        <div className="absolute inset-0 opacity-20 bg-gradient-to-br from-cyber-blue/10 via-cyber-dark to-black animate-[gradient-drift_10s_ease_infinite] bg-[length:400%_400%]" />
        <div className="absolute inset-0 opacity-[0.03] bg-[url('https://grainy-gradients.vercel.app/noise.svg')]" />

        <div className="absolute inset-0 w-full h-full pointer-events-none z-0">
          <div className="w-full h-[20vh] bg-gradient-to-b from-transparent via-cyber-blue/10 to-transparent animate-[scan-vertical_3s_linear_infinite]" />
        </div>

        <div className="relative z-10 flex flex-col items-center">
          <div className="relative mb-8">
            <div className="absolute inset-0 border border-cyber-blue/30 rounded-full animate-[pulse-ring_3s_linear_infinite]" />
            <div className="absolute inset-0 border border-cyber-purple/20 rounded-full animate-[pulse-ring_3s_linear_infinite_1s]" />

            <div className="relative h-16 w-16 bg-gradient-to-tr from-cyber-blue to-cyber-purple rounded-xl flex items-center justify-center shadow-lg shadow-cyber-blue/50">
              <span className="text-3xl font-bold text-white animate-pulse">V</span>
            </div>

            <div className="absolute -bottom-1 -right-1 h-4 w-4 bg-cyber-green rounded-full border-2 border-cyber-black shadow-[0_0_10px_#10b981] animate-bounce" />
          </div>

          <div className="w-64 h-1.5 bg-cyber-dark rounded-full overflow-hidden relative mb-4 ring-1 ring-cyber-slate/30 shimmer-effect">
            <div className="absolute inset-0 bg-cyber-blue/20" />
            <div
              className="h-full bg-gradient-to-r from-cyber-blue via-cyber-purple to-cyber-blue animate-[gradient-drift_2s_linear_infinite] bg-[length:200%_100%]"
              style={{ width: "60%", borderRadius: "99px" }}
            />
          </div>

          <div className="text-center space-y-1">
            <h2 className="text-white font-bold tracking-[0.2em] text-sm uppercase animate-pulse">
              Initializing Core
            </h2>
            <div className="flex justify-center">
              <p className="text-cyber-slate text-xs font-mono typewriter">
                Verifying encryption keys...
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  /* =========================================================
     Provider
  ========================================================= */

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated,
        loading,
        login,
        devLogin,
        logout,
        team,
        setTeam,
        toggleTeam,
        sidebarCollapsed,
        setSidebarCollapsed,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

/* =========================================================
   Hook
========================================================= */

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error("useAuth must be used inside AuthProvider");
  }
  return ctx;
};
