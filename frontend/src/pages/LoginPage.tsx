import { useState, FormEvent } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { AxiosError } from 'axios';
import { useAuth } from '../context/AuthContext';
import { Input } from '../components/UI/Input';
import { Button } from '../components/UI/Button';
import { ApiError } from '../types';

function extractMessage(err: unknown): string {
  const msg = (err as AxiosError<ApiError>).response?.data?.message;
  return Array.isArray(msg) ? msg.join(', ') : msg || 'Login failed. Please try again.';
}

export function LoginPage() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);
    try {
      await login(email, password);
      navigate('/dashboard', { replace: true });
    } catch (err) {
      setError(extractMessage(err));
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top_left,rgba(20,184,166,0.18),transparent_28%),linear-gradient(135deg,#f0fdfa_0%,#ffffff_38%,#ecfeff_100%)] flex items-center justify-center p-4 sm:p-6">
      <div className="grid w-full max-w-5xl gap-6 lg:grid-cols-[1.05fr_0.95fr]">
        <aside className="hidden overflow-hidden rounded-[2rem] border border-teal-100 bg-slate-950 px-8 py-10 text-white shadow-2xl shadow-teal-200/20 lg:flex lg:flex-col lg:justify-between">
          <div>
            <div className="mb-8 flex h-12 w-12 items-center justify-center rounded-2xl bg-teal-500 text-lg font-bold text-white shadow-lg shadow-teal-500/30">
              T
            </div>
            <p className="text-sm font-medium uppercase tracking-[0.3em] text-teal-200">
              Task Manager
            </p>
            <h1 className="mt-4 max-w-lg text-4xl font-semibold leading-tight text-white">
              A cleaner way to plan work, move faster, and stay organized.
            </h1>
            <p className="mt-4 max-w-md text-sm leading-6 text-slate-300">
              Keep everything in one place with secure sign-in, instant task updates, and a calm
              interface designed for real work.
            </p>
          </div>

          <div className="grid gap-3 text-sm text-slate-200">
            <div className="rounded-2xl border border-white/10 bg-white/5 px-4 py-3 backdrop-blur">
              Secure auth with HTTP-only cookies and rate limiting.
            </div>
            <div className="rounded-2xl border border-white/10 bg-white/5 px-4 py-3 backdrop-blur">
              Teal, responsive UI tuned for desktop and mobile.
            </div>
            <div className="rounded-2xl border border-white/10 bg-white/5 px-4 py-3 backdrop-blur">
              Fast task management with clear status filtering.
            </div>
          </div>
        </aside>

        <div className="w-full">
          <div className="animate-slide-up rounded-[2rem] border border-white/70 bg-white/90 p-6 shadow-[0_24px_80px_rgba(15,118,110,0.14)] backdrop-blur sm:p-8">
            {/* Brand header */}
            <div className="mb-8 text-center lg:text-left">
              <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-teal-600 text-white shadow-lg shadow-teal-200 lg:mx-0 text-2xl font-bold">
                T
              </div>
              <h1 className="text-2xl font-bold text-slate-900">Welcome back</h1>
              <p className="mt-1 text-sm text-slate-500">Sign in to manage your tasks</p>
            </div>

            {error && (
              <div
                className="mb-5 rounded-2xl border border-rose-200 bg-rose-50/80 px-4 py-3"
                role="alert"
              >
                <p className="text-sm text-rose-700">{error}</p>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-5" noValidate>
              <Input
                label="Email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                autoComplete="email"
                required
              />
              <Input
                label="Password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                autoComplete="current-password"
                required
              />
              <Button
                type="submit"
                isLoading={isLoading}
                className="w-full shadow-lg shadow-teal-200"
                size="lg"
              >
                Sign In
              </Button>
            </form>

            <p className="mt-6 text-center text-sm text-slate-500 lg:text-left">
              Don&apos;t have an account?{' '}
              <Link to="/register" className="font-medium text-teal-700 hover:text-teal-600">
                Create one free
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
