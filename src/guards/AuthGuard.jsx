import { Navigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';

// Protects app routes. Redirects to /login if there is no active session.
export default function AuthGuard({ children }) {
  const { session, loading } = useAuth();
  if (loading) return null;
  if (!session) return <Navigate to="/login" replace />;
  return children;
}
