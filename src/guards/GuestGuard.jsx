import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

// Protects auth routes. Redirects to /dashboard if the user is already logged in.
export default function GuestGuard({ children }) {
  const { session, loading } = useAuth();
  if (loading) return null;
  if (session) return <Navigate to="/dashboard" replace />;
  return children;
}
