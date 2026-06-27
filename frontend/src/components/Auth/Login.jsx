import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { CATEGORIES } from '../../constants/categories';
import Logo from '../common/Logo';

const Login = () => {
  const [formData, setFormData] = useState({ email: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const { login } = useAuth();
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    const result = await login(formData.email, formData.password);

    setLoading(false);

    if (result.success) {
      navigate(result.user.role === 'teacher' ? '/teacher/dashboard' : '/parent/dashboard');
    } else {
      setError(result.error);
    }
  };

  return (
    <div className="min-h-screen lg:grid lg:grid-cols-2">
      {/* Brand panel — leads with the four dimensions Attune is built around. */}
      <aside className="relative hidden overflow-hidden bg-auth-gradient px-12 py-14 text-sand-50 lg:flex lg:flex-col lg:justify-between">
        <div className="blob-1" aria-hidden="true" />
        <div className="blob-2" aria-hidden="true" />
        <div className="pointer-events-none absolute inset-0 bg-auth-accent" aria-hidden="true" />
        <Logo className="[&_span]:text-sand-50 relative" />

        <div className="relative max-w-md animate-rise">
          <p className="eyebrow text-brand-300">Calm, classroom-ready insight</p>
          <h1 className="mt-4 font-display text-4xl font-bold leading-[1.1]">
            Notice the early signs, before they become struggles.
          </h1>
          <p className="mt-4 text-brand-100/80">
            Attune helps teachers log what they observe in seconds and helps parents
            follow the patterns that matter — across four dimensions.
          </p>

          <ul className="mt-9 space-y-3">
            {CATEGORIES.map((category) => (
              <li key={category.key} className="flex items-center gap-3">
                <span
                  className="h-2.5 w-2.5 rounded-full"
                  style={{ backgroundColor: category.hex }}
                  aria-hidden="true"
                />
                <span className="font-semibold">{category.label}</span>
                <span className="text-sm text-brand-100/60">{category.description}</span>
              </li>
            ))}
          </ul>
        </div>

        <p className="relative text-sm text-brand-100/50">
          Built for primary schools in Tunisia.
        </p>
      </aside>

      {/* Form panel */}
      <main className="flex min-h-screen items-center justify-center px-6 py-12">
        <div className="w-full max-w-sm animate-rise">
          <div className="mb-8 lg:hidden">
            <Logo />
          </div>

          <h2 className="font-display text-2xl font-bold text-ink dark:text-sand-50">
            Welcome back
          </h2>
          <p className="mt-1.5 text-sm text-ink-soft dark:text-sand-200/70">
            Sign in to pick up where you left off.
          </p>

          {error && (
            <div
              className="mt-6 flex items-start gap-3 rounded-xl border border-stress/20 bg-stress-soft px-4 py-3 text-sm text-stress-softText animate-fade-in"
              role="alert"
            >
              <svg className="mt-0.5 h-4 w-4 shrink-0" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
              </svg>
              {error}
            </div>
          )}

          <form className="mt-7 space-y-5" onSubmit={handleSubmit}>
            <div>
              <label htmlFor="email" className="label">Email address</label>
              <input
                id="email"
                name="email"
                type="email"
                autoComplete="email"
                required
                className="input"
                placeholder="you@school.tn"
                value={formData.email}
                onChange={handleChange}
              />
            </div>
            <div>
              <label htmlFor="password" className="label">Password</label>
              <input
                id="password"
                name="password"
                type="password"
                autoComplete="current-password"
                required
                className="input"
                placeholder="••••••••"
                value={formData.password}
                onChange={handleChange}
              />
            </div>

            <button type="submit" disabled={loading} className="btn-primary w-full">
              {loading ? 'Signing in…' : 'Sign in'}
            </button>
          </form>

          <p className="mt-6 text-center text-sm text-ink-soft dark:text-sand-200/70">
            New to Attune?{' '}
            <Link to="/register" className="font-semibold text-brand-700 hover:text-brand-800 dark:text-brand-300">
              Create an account
            </Link>
          </p>
        </div>
      </main>
    </div>
  );
};

export default Login;
