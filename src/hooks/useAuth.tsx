import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react';
import type { Session } from '@supabase/supabase-js';
import { getSupabase } from '../lib/supabase';
import { checkAdminStatus, signInAsAdmin, type AuthServiceError } from '../services/auth';

interface AuthContextValue {
  session: Session | null;
  isAdmin: boolean | null;
  isLoading: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<Session | null>(null);
  const [isAdmin, setIsAdmin] = useState<boolean | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const syncSession = useCallback(async (nextSession: Session | null) => {
    setSession(nextSession);
    if (!nextSession) {
      setIsAdmin(false);
      setIsLoading(false);
      return;
    }

    try {
      const admin = await checkAdminStatus(nextSession.user.id);
      setIsAdmin(admin);
      if (!admin) {
        await getSupabase().auth.signOut();
      }
    } catch (error) {
      console.error('Admin status check failed.', error);
      setIsAdmin(false);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    const supabase = getSupabase();
    let mounted = true;

    void supabase.auth.getSession().then(({ data, error }) => {
      if (!mounted) return;
      if (error) {
        console.error('Session lookup failed.', error);
        setSession(null);
        setIsAdmin(false);
        setIsLoading(false);
        return;
      }
      void syncSession(data.session);
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, nextSession) => {
      if (mounted) {
        window.setTimeout(() => {
          if (mounted) void syncSession(nextSession);
        }, 0);
      }
    });

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, [syncSession]);

  const signIn = useCallback(async (email: string, password: string) => {
    await signInAsAdmin(email, password);
    const currentSession = (await getSupabase().auth.getSession()).data.session;
    setSession(currentSession);
    setIsAdmin(true);
  }, []);

  const signOut = useCallback(async () => {
    await getSupabase().auth.signOut();
    setSession(null);
    setIsAdmin(false);
  }, []);

  const value = useMemo(
    () => ({ session, isAdmin, isLoading, signIn, signOut }),
    [isAdmin, isLoading, session, signIn, signOut],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextValue {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used inside AuthProvider.');
  }
  return context;
}

export function isAuthServiceError(error: unknown): error is AuthServiceError {
  return error instanceof Error && error.name === 'AuthServiceError' && 'code' in error;
}
