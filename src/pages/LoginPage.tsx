import { useState, type FormEvent } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { GraduationCap, ArrowLeft, Loader2 } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/context/AuthContext';
import { Alert } from '@/components/ui';

export default function LoginPage() {
  const { profile } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');
  const [loading, setLoading] = useState(false);
  const [resetMode, setResetMode] = useState(false);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError('');
    setNotice('');
    setLoading(true);
    try {
      if (resetMode) {
        const { error } = await supabase.auth.resetPasswordForEmail(email);
        if (error) throw error;
        setNotice('Password reset email sent. Please check your inbox.');
      } else {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) {
          if (error.message.includes('Email not confirmed')) {
            throw new Error('Please confirm your email address before signing in.');
          }
          throw error;
        }
        const { data } = await supabase
          .from('profiles')
          .select('role')
          .eq('id', (await supabase.auth.getUser()).data.user?.id ?? '')
          .maybeSingle();
        const role = data?.role ?? profile?.role;
        navigate(role ? `/dashboard/${role}` : '/login', { replace: true });
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-hero-grad px-4 py-12">
      <div className="w-full max-w-md">
        <Link
          to="/"
          className="mb-6 inline-flex items-center gap-2 text-sm font-semibold text-ink-soft transition-colors hover:text-primary-500"
        >
          <ArrowLeft size={16} />
          Back to home
        </Link>

        <div className="card animate-fade-up p-8 shadow-float">
          <div className="mb-8 text-center">
            <span className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-primary-400 to-primary-500 text-white">
              <GraduationCap size={28} />
            </span>
            <h1 className="text-2xl font-extrabold text-ink">
              {resetMode ? 'Reset Password' : 'Welcome Back'}
            </h1>
            <p className="mt-1 text-sm text-ink-soft">
              {resetMode
                ? 'Enter your email and we will send you a reset link.'
                : 'Sign in to continue to your dashboard.'}
            </p>
          </div>

          {error && <div className="mb-4"><Alert kind="error" message={error} /></div>}
          {notice && <div className="mb-4"><Alert kind="success" message={notice} /></div>}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label htmlFor="email" className="form-label">Email</label>
              <input
                id="email"
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                className="input-field"
              />
            </div>
            {!resetMode && (
              <div>
                <label htmlFor="password" className="form-label">Password</label>
                <input
                  id="password"
                  type="password"
                  required
                  minLength={6}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter your password"
                  className="input-field"
                />
              </div>
            )}
            <button type="submit" disabled={loading} className="btn-primary w-full py-3">
              {loading && <Loader2 size={18} className="animate-spin" />}
              {resetMode ? 'Send Reset Link' : 'Sign In'}
            </button>
          </form>

          <div className="mt-6 text-center text-sm">
            {resetMode ? (
              <button
                type="button"
                onClick={() => setResetMode(false)}
                className="font-semibold text-primary-500 hover:text-primary-600"
              >
                Back to sign in
              </button>
            ) : (
              <>
                <button
                  type="button"
                  onClick={() => {
                    setResetMode(true);
                    setError('');
                  }}
                  className="font-semibold text-primary-500 hover:text-primary-600"
                >
                  Forgot password?
                </button>
                <p className="mt-3 text-ink-soft">
                  Don&apos;t have an account?{' '}
                  <Link to="/register" className="font-semibold text-primary-500 hover:text-primary-600">
                    Create one
                  </Link>
                </p>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
