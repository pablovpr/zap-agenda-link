import { useAuth } from '@/hooks/useAuth';
import { useSubscription } from '@/hooks/useSubscription';
import { useProfile } from '@/hooks/useProfile';

export const useAppState = () => {
  const { user, isLoading: authLoading } = useAuth();
  const { isSubscribed, loading: subscriptionLoading } = useSubscription();
  const { isProfileComplete, loading: profileLoading } = useProfile();

  const isAuthenticated = !!user;
  const hasCompletedOnboarding = isProfileComplete;
  const hasActiveSubscription = isSubscribed;

  // Determine overall loading state
  const isLoading = authLoading || 
    (isAuthenticated && profileLoading) || 
    (isAuthenticated && hasCompletedOnboarding && subscriptionLoading);

  // Determine user state
  const getUserState = () => {
    if (!isAuthenticated) return 'unauthenticated';
    if (!hasCompletedOnboarding) return 'needs-onboarding';
    if (!hasActiveSubscription) return 'needs-subscription';
    return 'complete';
  };

  const userState = getUserState();

  // Determine redirect path
  const getRedirectPath = () => {
    switch (userState) {
      case 'unauthenticated':
        return '/login';
      case 'needs-onboarding':
        return '/onboarding';
      case 'needs-subscription':
        return '/checkout';
      case 'complete':
        return '/dashboard';
      default:
        return '/login';
    }
  };

  return {
    user,
    isLoading,
    isAuthenticated,
    hasCompletedOnboarding,
    hasActiveSubscription,
    userState,
    redirectPath: getRedirectPath()
  };
};