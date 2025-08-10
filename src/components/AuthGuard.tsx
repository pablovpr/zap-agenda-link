import { Navigate, useLocation } from 'react-router-dom';
import { useAppState } from '@/hooks/useAppState';
import LoadingScreen from './LoadingScreen';

interface AuthGuardProps {
  children: React.ReactNode;
}

const AuthGuard: React.FC<AuthGuardProps> = ({ children }) => {
  const { isLoading, isAuthenticated, redirectPath } = useAppState();
  const location = useLocation();

  // Show loading state
  if (isLoading) {
    return <LoadingScreen />;
  }

  // If user is already authenticated, redirect based on their state
  if (isAuthenticated) {
    const from = (location.state as any)?.from?.pathname || redirectPath;
    return <Navigate to={from} replace />;
  }

  return <>{children}</>;
};

export default AuthGuard;