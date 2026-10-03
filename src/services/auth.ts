import type { AuthResponse, User } from '@supabase/supabase-js';
import { getSupabase } from '../lib/supabase';

export type AuthServiceErrorCode =
  | 'invalid_credentials'
  | 'not_authorized'
  | 'admin_check_failed'
  | 'authentication_failed';

export class AuthServiceError extends Error {
  readonly code: AuthServiceErrorCode;
  readonly originalError?: unknown;

  constructor(code: AuthServiceErrorCode, message: string, originalError?: unknown) {
    super(message);
    this.name = 'AuthServiceError';
    this.code = code;
    this.originalError = originalError;
  }
}

export async function checkAdminStatus(userId: string): Promise<boolean> {
  const { data, error } = await getSupabase()
    .from('admins')
    .select('user_id')
    .eq('user_id', userId)
    .maybeSingle();

  if (error) {
    throw error;
  }

  return Boolean(data);
}

export async function signInAsAdmin(email: string, password: string): Promise<AuthResponse> {
  const supabase = getSupabase();
  const { data, error } = await supabase.auth.signInWithPassword({ email, password });

  if (error || !data.user) {
    const errorMessage = error?.message ?? 'The authentication service did not return a user.';
    const isInvalidCredentials = /invalid login credentials|invalid email or password/i.test(errorMessage);
    throw new AuthServiceError(
      isInvalidCredentials ? 'invalid_credentials' : 'authentication_failed',
      errorMessage,
      error,
    );
  }

  let isAdmin: boolean;
  try {
    isAdmin = await checkAdminStatus(data.user.id);
  } catch (adminError) {
    await supabase.auth.signOut();
    throw new AuthServiceError(
      'admin_check_failed',
      adminError instanceof Error ? adminError.message : 'The administrator record could not be checked.',
      adminError,
    );
  }

  if (!isAdmin) {
    await supabase.auth.signOut();
    throw new AuthServiceError(
      'not_authorized',
      'This account is not authorized as an administrator.',
    );
  }

  return { data, error: null };
}

export async function getCurrentUser(): Promise<User | null> {
  const { data, error } = await getSupabase().auth.getUser();
  if (error) {
    throw error;
  }
  return data.user;
}
