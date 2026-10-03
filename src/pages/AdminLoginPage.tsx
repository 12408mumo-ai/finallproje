import { Eye, EyeOff, LockKeyhole, Mail, ShieldCheck } from 'lucide-react';
import { useEffect, useState, type FormEvent } from 'react';
import { Link, Navigate, useLocation, useNavigate } from 'react-router-dom';
import { Logo } from '../components/Logo';
import { useAuth, isAuthServiceError } from '../hooks/useAuth';
import { useToast } from '../hooks/useToast';
import { formatError, getErrorMessage } from '../lib/errors';

export function AdminLoginPage() {
  const { session, isAdmin, isLoading: authLoading, signIn } = useAuth();
  const { showSuccess, showError } = useToast();
  const navigate = useNavigate();
  const location = useLocation();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [signingIn, setSigningIn] = useState(false);

  useEffect(() => {
    if (!authLoading && session && isAdmin) {
      navigate('/admin', { replace: true });
    }
  }, [authLoading, isAdmin, navigate, session]);

  if (!authLoading && session && isAdmin) {
    return <Navigate to="/admin" replace />;
  }

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setSigningIn(true);
    try {
      await signIn(email, password);
      showSuccess('Logged in successfully.');
      const from = (location.state as { from?: string } | null)?.from ?? '/admin';
      navigate(from, { replace: true });
    } catch (error) {
      if (isAuthServiceError(error)) {
        if (error.code === 'invalid_credentials') {
          showError(
            formatError({
              title: 'Authentication Failed',
              location: 'Admin Login',
              reason: 'Invalid email or password.',
              suggestion: 'Check your credentials and try again.',
            }),
          );
        } else if (error.code === 'not_authorized') {
          showError(
            formatError({
              title: 'Access Denied',
              location: 'Admin Login',
              reason: 'This account is not authorized as an administrator.',
              suggestion: 'Ask the owner to add this user to the admins table.',
            }),
          );
        } else {
          showError(
            formatError({
              title: 'Authentication Failed',
              location: error.code === 'admin_check_failed' ? 'Supabase Database → admins' : 'Supabase Authentication',
              reason: getErrorMessage(error),
              suggestion: 'Check the Supabase connection and try again.',
            }),
          );
        }
      } else {
        showError(
          formatError({
            title: 'Authentication Failed',
            location: 'Supabase Authentication',
            reason: getErrorMessage(error),
            suggestion: 'Check the Supabase connection and try again.',
          }),
        );
      }
    } finally {
      setSigningIn(false);
    }
  };

  return (
    <main className="admin-login-page">
      <div className="admin-login-brand"><Logo /></div>
      <div className="admin-login-layout">
        <section className="admin-login-intro">
          <p className="eyebrow">Private workspace</p>
          <h1>Welcome back to the Rafna room.</h1>
          <p>Manage your collection with the same care you bring to every customer home.</p>
          <div className="login-trust-list">
            <span><ShieldCheck size={17} /> Supabase-secured access</span>
            <span><LockKeyhole size={17} /> Protected product management</span>
          </div>
        </section>
        <section className="login-card" aria-labelledby="login-heading">
          <div className="login-card-mark"><Logo showWordmark={false} /></div>
          <p className="eyebrow">Administrator sign in</p>
          <h2 id="login-heading">Open your dashboard</h2>
          <p className="login-card-copy">Use the administrator credentials created in Supabase.</p>
          <form className="admin-login-form" onSubmit={handleSubmit} noValidate>
            <div className="form-field">
              <label htmlFor="admin-email">Email address</label>
              <div className="input-with-icon">
                <Mail size={17} aria-hidden="true" />
                <input
                  id="admin-email"
                  type="email"
                  value={email}
                  onChange={(event) => setEmail(event.target.value)}
                  placeholder="Enter your email address"
                  autoComplete="username"
                  required
                />
              </div>
            </div>
            <div className="form-field">
              <label htmlFor="admin-password">Password</label>
              <div className="input-with-icon input-with-action">
                <LockKeyhole size={17} aria-hidden="true" />
                <input
                  id="admin-password"
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(event) => setPassword(event.target.value)}
                  placeholder="Enter your password"
                  autoComplete="current-password"
                  required
                />
                <button
                  className="input-action"
                  type="button"
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                  onClick={() => setShowPassword((visible) => !visible)}
                >
                  {showPassword ? <EyeOff size={17} /> : <Eye size={17} />}
                </button>
              </div>
            </div>
            <button className="button button-primary login-submit" type="submit" disabled={signingIn}>
              {signingIn ? 'Signing in...' : 'Sign In'}
            </button>
          </form>
          <Link className="login-home-link" to="/">Return to public website</Link>
        </section>
      </div>
      <p className="login-footer">Secure workspace · Rafna Investment · Nairobi</p>
    </main>
  );
}
