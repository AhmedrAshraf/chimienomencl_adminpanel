'use client';

import { createContext, useContext, useEffect, useState } from 'react';
import { AuthUser, getCurrentUser, signIn, signOut } from './auth';
import { useRouter } from 'next/navigation';

type AuthContextType = {
  user: AuthUser | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<{ data: any; error: any }>;
  signOut: () => Promise<{ error: any }>;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    checkUser();
  }, []);

  async function checkUser() {
    try {
      const { user, error } = await getCurrentUser();
      if (error) throw error;
      setUser(user as AuthUser);
    } catch (error) {
      setUser(null);
    } finally {
      setLoading(false);
    }
  }

  const value = {
    user,
    loading,
    signIn: async (email: string, password: string) => {
      const result = await signIn(email, password);
      if (!result.error) {
        await checkUser();
      }
      return result;
    },
    signOut: async () => {
      const result = await signOut();
      if (!result.error) {
        setUser(null);
        router.push('/login');
      }
      return result;
    },
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
} 