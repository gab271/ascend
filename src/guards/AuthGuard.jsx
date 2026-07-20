import { Navigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import LoadingScreen from '../components/LoadingScreen';

// Protects app routes. Redirects to /login if there is no active session.
export default function AuthGuard({ children }) {
  const { session, loading } = useAuth();
  // Never `return null` — a blank page is indistinguishable from a crash.
  if (loading) return <LoadingScreen label="AUTHENTICATING" />;
  if (!session) return <Navigate to="/login" replace />;
  return children;
}
