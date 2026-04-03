import { useEffect, useRef } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Loader } from '@stonal-tech/lib-design-system-react';
import { useAuth } from '@hooks/useAuth';
import styles from './CallbackPage.module.scss';

export const CallbackPage = () => {
  const [searchParams] = useSearchParams();
  const { handleCallback } = useAuth();
  const navigate = useNavigate();
  const calledRef = useRef(false);

  useEffect(() => {
    const code = searchParams.get('code');
    if (!code || calledRef.current) return;
    calledRef.current = true;

    handleCallback(code)
      .then(() => navigate('/', { replace: true }))
      .catch(() => navigate('/login', { replace: true }));
  }, [searchParams, handleCallback, navigate]);

  return (
    <div className={styles.callback}>
      <Loader isLoading message="Authenticating with GitHub..." />
    </div>
  );
};
