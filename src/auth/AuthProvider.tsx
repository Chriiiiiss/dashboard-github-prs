import { useState, useCallback, type ReactNode } from 'react';
import { AuthContext, type AuthState } from './AuthContext';
import type { User } from '@localTypes/github';

const GITHUB_CLIENT_ID = import.meta.env.VITE_GITHUB_CLIENT_ID;
const GITHUB_OAUTH_URL = 'https://github.com/login/oauth/authorize';
const SCOPES = 'repo read:org';

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [token, setToken] = useState<string | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const login = useCallback(() => {
    const params = new URLSearchParams({
      client_id: GITHUB_CLIENT_ID,
      scope: SCOPES,
      redirect_uri: `${window.location.origin}/auth/callback`,
    });
    window.location.href = `${GITHUB_OAUTH_URL}?${params}`;
  }, []);

  const handleCallback = useCallback(async (code: string) => {
    setIsLoading(true);
    try {
      const tokenRes = await fetch('/api/auth/token', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code }),
      });

      if (!tokenRes.ok) throw new Error('Token exchange failed');

      const { access_token } = await tokenRes.json();

      const userRes = await fetch('https://api.github.com/user', {
        headers: { Authorization: `Bearer ${access_token}` },
      });

      if (!userRes.ok) throw new Error('Failed to fetch user');

      const userData: User = await userRes.json();
      setToken(access_token);
      setUser(userData);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const logout = useCallback(() => {
    setToken(null);
    setUser(null);
  }, []);

  const value: AuthState = {
    isAuthenticated: !!token,
    isLoading,
    token,
    user,
    login,
    logout,
    handleCallback,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
