import { createContext, useContext, useMemo, useState } from 'react';
import type { PropsWithChildren } from 'react';

import { authService } from './authService';
import type { LoginValues } from '../../lib/validators';
import type { AuthUser } from './authService';

type AuthContextValue = {
  user: AuthUser | null;
  token: string | null;
  login: (values: LoginValues) => Promise<void>;
  logout: () => void;
};

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export function AuthProvider({ children }: PropsWithChildren) {
  const initialSession = authService.getSession();
  const [user, setUser] = useState<AuthUser | null>(initialSession?.user ?? null);
  const [token, setToken] = useState<string | null>(initialSession?.token ?? null);

  const value = useMemo<AuthContextValue>(
    () => ({
      user,
      token,
      async login(values) {
        const session = await authService.login(values);
        authService.saveSession(session);
        setUser(session.user);
        setToken(session.token);
      },
      logout() {
        authService.logout();
        setUser(null);
        setToken(null);
      },
    }),
    [token, user]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error('useAuth must be used inside AuthProvider');
  }
  return ctx;
}
