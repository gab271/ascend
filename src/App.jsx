import { lazy, Suspense } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { LanguageProvider } from './context/LanguageContext';
import AuthGuard from './guards/AuthGuard';
import GuestGuard from './guards/GuestGuard';
import OnboardingGuard from './guards/OnboardingGuard';
import AppLayout from './components/layout/AppLayout';
import ErrorBoundary from './components/ErrorBoundary';
import LoadingScreen from './components/LoadingScreen';

// Route-level code splitting.
//
// Everything used to ship in one ~658 kB chunk, so a first-time visitor on
// mobile data downloaded the entire app — Shop, Settings, Landing videos and
// all — just to see the login screen. Each route is now its own chunk, fetched
// on navigation.
const Landing        = lazy(() => import('./pages/Landing'));
const Login          = lazy(() => import('./pages/auth/Login'));
const Register       = lazy(() => import('./pages/auth/Register'));
const ForgotPassword = lazy(() => import('./pages/auth/ForgotPassword'));
const ResetPassword  = lazy(() => import('./pages/auth/ResetPassword'));
const Onboarding     = lazy(() => import('./pages/app/Onboarding'));
const Dashboard      = lazy(() => import('./pages/app/Dashboard'));
const Missions       = lazy(() => import('./pages/app/Missions'));
const Shop           = lazy(() => import('./pages/app/Shop'));
const Profile        = lazy(() => import('./pages/app/Profile'));
const Ranking        = lazy(() => import('./pages/app/Ranking'));
const Rewards        = lazy(() => import('./pages/app/Rewards'));
const Settings       = lazy(() => import('./pages/app/Settings'));

// Film grain SVG data URI — very subtle texture overlay
const GRAIN_URI = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='200' height='200'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.75' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='200' height='200' filter='url(%23n)'/%3E%3C/svg%3E";

export default function App() {
  return (
    <BrowserRouter>
    <LanguageProvider>
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

      {/* Any render crash below shows the actual error instead of a blank page */}
      <ErrorBoundary>
      <Suspense fallback={<LoadingScreen />}>
      <Routes>
        {/* Landing page — full screen, no sidebar */}
        <Route path="/" element={<Landing />} />

        {/* Auth pages — only accessible without a session */}
        <Route path="/login"           element={<GuestGuard><Login /></GuestGuard>} />
        <Route path="/register"        element={<GuestGuard><Register /></GuestGuard>} />
        <Route path="/forgot-password" element={<GuestGuard><ForgotPassword /></GuestGuard>} />

        {/* Password reset — must remain accessible without a session (token is in URL) */}
        <Route path="/auth/reset-password" element={<ResetPassword />} />

        {/* Onboarding — requires session, but not yet onboarded */}
        <Route path="/onboarding" element={<AuthGuard><Onboarding /></AuthGuard>} />

        {/* App pages — require an active session + completed onboarding */}
        <Route element={<AuthGuard><OnboardingGuard><AppLayout /></OnboardingGuard></AuthGuard>}>
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
      </Suspense>
      </ErrorBoundary>
    </AuthProvider>
    </LanguageProvider>
    </BrowserRouter>
  );
}
