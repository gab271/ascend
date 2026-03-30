import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import AuthGuard from './guards/AuthGuard';
import GuestGuard from './guards/GuestGuard';
import Landing from './pages/Landing';
import Login from './pages/auth/Login';
import Register from './pages/auth/Register';
import ForgotPassword from './pages/auth/ForgotPassword';
import ResetPassword from './pages/auth/ResetPassword';
import Dashboard from './pages/app/Dashboard';
import Missions from './pages/app/Missions';
import Shop from './pages/app/Shop';
import Profile from './pages/app/Profile';
import Ranking from './pages/app/Ranking';
import Rewards from './pages/app/Rewards';
import Settings from './pages/app/Settings';
import AppLayout from './components/layout/AppLayout';

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

        {/* Auth pages — only accessible without a session */}
        <Route path="/login"           element={<GuestGuard><Login /></GuestGuard>} />
        <Route path="/register"        element={<GuestGuard><Register /></GuestGuard>} />
        <Route path="/forgot-password" element={<GuestGuard><ForgotPassword /></GuestGuard>} />

        {/* Password reset — must remain accessible without a session (token is in URL) */}
        <Route path="/auth/reset-password" element={<ResetPassword />} />

        {/* App pages — require an active session */}
        <Route element={<AuthGuard><AppLayout /></AuthGuard>}>
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/missions"  element={<Missions />} />
          <Route path="/shop"      element={<Shop />} />
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
