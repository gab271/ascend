import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import Landing from './pages/Landing';
import Login from './pages/Login';
import Register from './pages/Register';
import ForgotPassword from './pages/ForgotPassword';
import Dashboard from './pages/Dashboard';
import Missions from './pages/Missions';
import Profile from './pages/Profile';
import Ranking from './pages/Ranking';
import Rewards from './pages/Rewards';
import Settings from './pages/Settings';
import AppLayout from './components/layout/AppLayout';

// Redirige a /login si no hay sesión activa
function ProtectedRoute({ children }) {
  const { session, loading } = useAuth();
  if (loading) return null; // espera a que Supabase responda
  if (!session) return <Navigate to="/login" replace />;
  return children;
}

// Redirige a /dashboard si ya hay sesión (evita ver login/register logueado)
function GuestRoute({ children }) {
  const { session, loading } = useAuth();
  if (loading) return null;
  if (session) return <Navigate to="/dashboard" replace />;
  return children;
}

// Film grain SVG data URI — very subtle texture overlay
const GRAIN_URI = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='200' height='200'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.75' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='200' height='200' filter='url(%23n)'/%3E%3C/svg%3E";

export default function App() {
  return (
    <BrowserRouter>
    <AuthProvider>
      {/* Film grain overlay — gives an analog, crafted feel to the UI */}
      <div
        aria-hidden="true"
        style={{
          position: 'fixed',
          top: '-50%',
          left: '-50%',
          width: '200%',
          height: '200%',
          pointerEvents: 'none',
          zIndex: 9997,
          backgroundImage: `url("${GRAIN_URI}")`,
          opacity: 0.032,
          animation: 'grain-shift 0.5s steps(1) infinite',
          willChange: 'transform',
        }}
      />

      <Routes>
        {/* Landing page — full screen, no sidebar */}
        <Route path="/" element={<Landing />} />

        {/* Auth pages — solo accesibles sin sesión */}
        <Route path="/login"           element={<GuestRoute><Login /></GuestRoute>} />
        <Route path="/register"        element={<GuestRoute><Register /></GuestRoute>} />
        <Route path="/forgot-password" element={<GuestRoute><ForgotPassword /></GuestRoute>} />

        {/* App pages — requieren sesión activa */}
        <Route element={<ProtectedRoute><AppLayout /></ProtectedRoute>}>
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/missions"  element={<Missions />} />
          <Route path="/profile"   element={<Profile />} />
          <Route path="/ranking"   element={<Ranking />} />
          <Route path="/rewards"   element={<Rewards />} />
          <Route path="/settings"  element={<Settings />} />
        </Route>

        {/* Catch-all */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </AuthProvider>
    </BrowserRouter>
  );
}
