import { Routes, Route, Navigate } from "react-router-dom";
import { LoginPage } from "./pages/LoginPage";         // ✅ FIXED: Added { }
import LandingPage from "./pages/LandingPage";
import { DashboardPage } from "./pages/DashboardPage"; // ✅ FIXED: Added { }
import { AnalysisPage } from "./pages/AnalysisPage";   // ✅ FIXED: Added { }
import HistoryPage from "./pages/HistoryPage";         // Kept as default (unless you updated it too)
import { BlueTeamPage } from "./pages/BlueTeamPage";
import { RedTeamPage } from "./pages/RedTeamPage";
import ProtectedRoute from "./components/ProtectedRoute";
import "./pages/DashboardAnimations.css";

function App() {
  return (
    <div className="min-h-screen bg-cyber-black font-sans text-cyber-white bg-noise-subtle antialiased selection:bg-cyber-purple selection:text-white overflow-x-hidden">
      <Routes>
        {/* Public Routes */}
        <Route path="/" element={<LandingPage />} />
        <Route path="/login" element={<LoginPage />} />

        {/* Protected Routes */}
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <DashboardPage />
            </ProtectedRoute>
          }
        />

        <Route
          path="/analyze"
          element={
            <ProtectedRoute>
              <AnalysisPage />
            </ProtectedRoute>
          }
        />

        <Route
          path="/history"
          element={
            <ProtectedRoute>
              <HistoryPage />
            </ProtectedRoute>
          }
        />

        <Route
          path="/blue-team"
          element={
            <ProtectedRoute>
              <BlueTeamPage />
            </ProtectedRoute>
          }
        />

        <Route
          path="/red-team"
          element={
            <ProtectedRoute>
              <RedTeamPage />
            </ProtectedRoute>
          }
        />

        {/* Fallback */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </div>
  );
}

export default App;