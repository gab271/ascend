import { Navigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import LoadingScreen from '../components/LoadingScreen';

// Protects auth routes. Redirects to /dashboard if the user is already logged in.
export default function GuestGuard({ children }) {
  const { session, loading } = useAuth();
  // Never `return null` — a blank page is indistinguishable from a crash.
  if (loading) return <LoadingScreen label="LOADING" />;
  if (session) return <Navigate to="/dashboard" replace />;
  return children;
}
