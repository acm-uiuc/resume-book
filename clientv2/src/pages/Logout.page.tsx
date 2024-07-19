import { useAuth } from '@/components/AuthContext';
import { Navigate } from 'react-router-dom';

export function LogoutPage() {
  const { logoutCallback } = useAuth();
  logoutCallback();
  return <Navigate to="/login" />;
}
