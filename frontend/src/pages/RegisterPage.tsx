import { useState, FormEvent } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { AxiosError } from 'axios';
import { useAuth } from '../context/AuthContext';
import { Input } from '../components/UI/Input';
import { Button } from '../components/UI/Button';
import { ApiError } from '../types';

function extractMessage(err: unknown): string {
  const msg = (err as AxiosError<ApiError>).response?.data?.message;
  return Array.isArray(msg) ? msg.join(', ') : msg || 'Registration failed. Please try again.';
}

export function RegisterPage() {
  const { register } = useAuth();
  const navigate = useNavigate();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError('');

    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    setIsLoading(true);
    try {
      await register(email, password, name);
      navigate('/dashboard', { replace: true });
    } catch (err) {
      setError(extractMessage(err));
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top_left,rgba(20,184,166,0.18),transparent_28%),linear-gradient(135deg,#f0fdfa_0%,#ffffff_38%,#ecfeff_100%)] flex items-center justify-center p-4 sm:p-6">
      <div className="grid w-full max-w-5xl gap-6 lg:grid-cols-[0.95fr_1.05fr]">
        <div className="w-full">
          <div className="animate-slide-up rounded-[2rem] border border-white/70 bg-white/90 p-6 shadow-[0_24px_80px_rgba(15,118,110,0.14)] backdrop-blur sm:p-8">
            {/* Brand header */}
            <div className="mb-8 text-center lg:text-left">
              <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-teal-600 text-white shadow-lg shadow-teal-200 lg:mx-0 text-2xl font-bold">
                T
              </div>
              <h1 className="text-2xl font-bold text-slate-900">Create account</h1>
              <p className="mt-1 text-sm text-slate-500">
                Start organizing your tasks today — free
              </p>
            </div>

            {error && (
              <div
                className="mb-5 rounded-2xl border border-rose-200 bg-rose-50/80 px-4 py-3"
                role="alert"
              >
                <p className="text-sm text-rose-700">{error}</p>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4" noValidate>
              <Input
                label="Full Name"
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Jane Doe"
                autoComplete="name"
                required
              />
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
                placeholder="Min 8 chars — upper, lower, number"
                autoComplete="new-password"
                required
              />
              <Input
                label="Confirm Password"
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="••••••••"
                autoComplete="new-password"
                required
              />
              <Button
                type="submit"
                isLoading={isLoading}
                className="w-full shadow-lg shadow-teal-200"
                size="lg"
              >
                Create Account
              </Button>
            </form>

            <p className="mt-6 text-center text-sm text-slate-500 lg:text-left">
              Already have an account?{' '}
              <Link to="/login" className="font-medium text-teal-700 hover:text-teal-600">
                Sign in
              </Link>
            </p>
          </div>
        </div>

        <aside className="hidden overflow-hidden rounded-[2rem] border border-teal-100 bg-slate-950 px-8 py-10 text-white shadow-2xl shadow-teal-200/20 lg:flex lg:flex-col lg:justify-between">
          <div>
            <div className="mb-8 flex h-12 w-12 items-center justify-center rounded-2xl bg-teal-500 text-lg font-bold text-white shadow-lg shadow-teal-500/30">
              T
            </div>
            <p className="text-sm font-medium uppercase tracking-[0.3em] text-teal-200">
              Get started
            </p>
            <h2 className="mt-4 max-w-lg text-4xl font-semibold leading-tight text-white">
              Set up your workspace in seconds.
            </h2>
            <p className="mt-4 max-w-md text-sm leading-6 text-slate-300">
              Create your account, secure it with JWT cookies, and manage a polished task list from
              any device.
            </p>
          </div>

          <div className="grid gap-3 text-sm text-slate-200">
            <div className="rounded-2xl border border-white/10 bg-white/5 px-4 py-3 backdrop-blur">
              Clean onboarding with clear validation.
            </div>
            <div className="rounded-2xl border border-white/10 bg-white/5 px-4 py-3 backdrop-blur">
              Optimized for desktop, tablet, and mobile screens.
            </div>
            <div className="rounded-2xl border border-white/10 bg-white/5 px-4 py-3 backdrop-blur">
              Premium teal visuals that feel modern and focused.
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
}
