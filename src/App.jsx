import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Landing from './pages/Landing';
import Dashboard from './pages/Dashboard';
import Missions from './pages/Missions';
import Profile from './pages/Profile';
import Ranking from './pages/Ranking';
import Rewards from './pages/Rewards';
import AppLayout from './components/layout/AppLayout';

// Film grain SVG data URI — very subtle texture overlay
const GRAIN_URI = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='200' height='200'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.75' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='200' height='200' filter='url(%23n)'/%3E%3C/svg%3E";

export default function App() {
  return (
    <BrowserRouter>
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

        {/* App pages — wrapped with sidebar layout */}
        <Route element={<AppLayout />}>
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/missions" element={<Missions />} />
          <Route path="/profile" element={<Profile />} />
          <Route path="/ranking" element={<Ranking />} />
          <Route path="/rewards" element={<Rewards />} />
        </Route>

        {/* Catch-all */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}
