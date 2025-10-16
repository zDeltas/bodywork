import React, { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react';
import { TokenStorageService, StoredUser } from '@/app/services/auth/tokenStorage';

export interface AuthContextType {
  isAuthenticated: boolean;
  isLoading: boolean;
  user: StoredUser | null;
  signIn: (accessToken: string, refreshToken: string, user: StoredUser) => Promise<void>;
  signOut: () => Promise<void>;
  refreshSession: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface AuthProviderProps {
  children: ReactNode;
}

export function AuthProvider({ children }: AuthProviderProps) {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [user, setUser] = useState<StoredUser | null>(null);

  const checkSession = useCallback(async () => {
    try {
      setIsLoading(true);
      
      const tokens = await TokenStorageService.getTokens();
      const storedUser = await TokenStorageService.getUser();

      if (tokens && storedUser) {
        setIsAuthenticated(true);
        setUser(storedUser);
        console.log('[Auth] Session restored:', storedUser.email);
      } else {
        setIsAuthenticated(false);
        setUser(null);
      }
    } catch (error) {
      console.error('[Auth] Session check failed:', error);
      setIsAuthenticated(false);
      setUser(null);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const signIn = useCallback(async (
    accessToken: string,
    refreshToken: string,
    userData: StoredUser
  ) => {
    try {
      await TokenStorageService.saveTokens(accessToken, refreshToken);
      await TokenStorageService.saveUser(userData);

      setIsAuthenticated(true);
      setUser(userData);
      
      console.log('[Auth] Sign in successful:', userData.email);
    } catch (error) {
      console.error('[Auth] Sign in failed:', error);
      throw new Error('Failed to sign in');
    }
  }, []);

  const signOut = useCallback(async () => {
    try {
      await TokenStorageService.clearAll();

      setIsAuthenticated(false);
      setUser(null);
      
      console.log('[Auth] Sign out successful');
    } catch (error) {
      console.error('[Auth] Sign out failed:', error);
      throw new Error('Failed to sign out');
    }
  }, []);

  const refreshSession = useCallback(async () => {
    await checkSession();
  }, [checkSession]);

  useEffect(() => {
    checkSession();
  }, [checkSession]);

  const value: AuthContextType = {
    isAuthenticated,
    isLoading,
    user,
    signIn,
    signOut,
    refreshSession,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextType {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

export default AuthContext;
