import React, { createContext, useContext, useEffect, useMemo, useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { TOKEN_STORAGE_KEY } from '../services/apiClient';
import { authApi } from '../services/api';

interface AuthContextValue {
  isReady: boolean;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<void>;
  signup: (email: string, password: string, nickname: string) => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [isReady, setIsReady] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    AsyncStorage.getItem(TOKEN_STORAGE_KEY).then((token) => {
      setIsAuthenticated(Boolean(token));
      setIsReady(true);
    });
  }, []);

  const persistToken = async (accessToken: string) => {
    await AsyncStorage.setItem(TOKEN_STORAGE_KEY, accessToken);
    setIsAuthenticated(true);
  };

  const value = useMemo<AuthContextValue>(
    () => ({
      isReady,
      isAuthenticated,
      login: async (email, password) => {
        const { accessToken } = await authApi.login(email, password);
        await persistToken(accessToken);
      },
      signup: async (email, password, nickname) => {
        const { accessToken } = await authApi.signup(email, password, nickname);
        await persistToken(accessToken);
      },
      logout: async () => {
        await AsyncStorage.removeItem(TOKEN_STORAGE_KEY);
        setIsAuthenticated(false);
      },
    }),
    [isReady, isAuthenticated],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth는 AuthProvider 내부에서만 사용할 수 있어요.');
  return ctx;
}
