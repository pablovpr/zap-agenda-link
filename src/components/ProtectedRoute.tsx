import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { useSubscription } from '@/hooks/useSubscription';
import { useProfile } from '@/hooks/useProfile';
import LoadingScreen from './LoadingScreen';

interface ProtectedRouteProps {
  children: React.ReactNode;
  requireAuth?: boolean;
  requireOnboarding?: boolean;
  requireSubscription?: boolean;
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ 
  children, 
  requireAuth = true,
  requireOnboarding = true,
  requireSubscription = true
}) => {
  const { user, isLoading: authLoading } = useAuth();
  const { isSubscribed, loading: subscriptionLoading } = useSubscription();
  const { isProfileComplete, loading: profileLoading } = useProfile();
  const location = useLocation();

  // Show loading state
  const isLoading = authLoading || 
    (requireSubscription && subscriptionLoading) || 
    (requireOnboarding && requireAuth && user && profileLoading);

  if (isLoading) {
    return <LoadingScreen />;
  }

  // Check authentication
  if (requireAuth && !user) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // For authenticated users, check the flow
  if (user && requireAuth) {
    // Check onboarding completion
    if (requireOnboarding && !isProfileComplete) {
      return <Navigate to="/onboarding" replace />;
    }

    // Check subscription (only if onboarding is complete)
    if (requireSubscription && isProfileComplete && !isSubscribed) {
      return <Navigate to="/checkout" replace />;
    }
  }

  return <>{children}</>;
};

export default ProtectedRoute;