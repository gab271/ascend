import { Navigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';

// Redirects authenticated users to /onboarding if they haven't
// completed it yet. Wraps the main app routes only — the
// /onboarding route itself sits outside this guard to avoid loops.
export default function OnboardingGuard({ children }) {
  const { profile, loading } = useAuth();
  if (loading) return null;
  if (profile && !profile.onboarding_completed) return <Navigate to="/onboarding" replace />;
  return children;
}
