import { createContext } from 'react';
import type { User } from '@localTypes/github';

export interface AuthState {
  isAuthenticated: boolean;
  isLoading: boolean;
  token: string | null;
  user: User | null;
  login: () => void;
  logout: () => void;
  handleCallback: (code: string) => Promise<void>;
}

export const AuthContext = createContext<AuthState | null>(null);
