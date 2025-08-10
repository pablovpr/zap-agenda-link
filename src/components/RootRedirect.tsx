import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppState } from '@/hooks/useAppState';
import LoadingScreen from './LoadingScreen';

const RootRedirect = () => {
  const { isLoading, redirectPath } = useAppState();
  const navigate = useNavigate();

  useEffect(() => {
    if (!isLoading) {
      navigate(redirectPath, { replace: true });
    }
  }, [isLoading, redirectPath, navigate]);

  return <LoadingScreen message="Redirecionando..." />;
};

export default RootRedirect;