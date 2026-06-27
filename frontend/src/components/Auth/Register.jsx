import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import Logo from '../common/Logo';

const ROLES = [
  { value: 'teacher', title: 'Teacher', blurb: 'Log observations for your class' },
  { value: 'parent', title: 'Parent', blurb: "Follow your child's progress" },
];

const Register = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: '',
    role: 'teacher',
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const { register } = useAuth();
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    setError('');
  };

  const passwordsMismatch =
    formData.confirmPassword.length > 0 && formData.password !== formData.confirmPassword;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    setLoading(true);

    const result = await register({
      name: formData.name,
      email: formData.email,
      phone: formData.phone,
      password: formData.password,
      role: formData.role,
    });

    setLoading(false);

    if (result.success) {
      navigate(result.user.role === 'teacher' ? '/teacher/dashboard' : '/parent/dashboard');
    } else {
      setError(result.error);
    }
  };

  return (
    <div className="min-h-screen lg:grid lg:grid-cols-2">
      <aside className="relative hidden overflow-hidden bg-auth-gradient px-12 py-14 text-sand-50 lg:flex lg:flex-col lg:justify-between">
        <div className="blob-2" aria-hidden="true" />
        <div className="blob-1" aria-hidden="true" style={{ left: 'auto', right: '-20rem', top: '40%' }} />
        <div className="pointer-events-none absolute inset-0 bg-auth-accent" aria-hidden="true" />
        <Logo className="[&_span]:text-sand-50 relative" />
        <div className="relative max-w-md animate-rise">
          <p className="eyebrow text-brand-300">Two minutes to set up</p>
          <h1 className="mt-4 font-display text-4xl font-bold leading-[1.1]">
            Start building a clearer picture, one note at a time.
          </h1>
          <p className="mt-4 text-brand-100/80">
            A shared, gentle record between the classroom and home — so no early
            signal gets lost between them.
          </p>
        </div>
        <p className="relative text-sm text-brand-100/50">
          Student names are encrypted and never shown to other families.
        </p>
      </aside>

      <main className="flex min-h-screen items-center justify-center px-6 py-12">
        <div className="w-full max-w-md animate-rise">
          <div className="mb-8 lg:hidden">
            <Logo />
          </div>

          <h2 className="font-display text-2xl font-bold text-ink dark:text-sand-50">
            Create your account
          </h2>
          <p className="mt-1.5 text-sm text-ink-soft dark:text-sand-200/70">
            Tell us who you are and how to reach you.
          </p>

          {error && (
            <div
              className="mt-6 rounded-xl border border-stress/20 bg-stress-soft px-4 py-3 text-sm text-stress-softText animate-fade-in"
              role="alert"
            >
              {error}
            </div>
          )}

          <form className="mt-7 space-y-5" onSubmit={handleSubmit}>
            <fieldset>
              <legend className="label">I am a…</legend>
              <div className="grid grid-cols-2 gap-3">
                {ROLES.map((role) => {
                  const active = formData.role === role.value;
                  return (
                    <label
                      key={role.value}
                      className={`cursor-pointer rounded-xl border p-3.5 transition-all ${
                        active
                          ? 'border-brand-500 bg-brand-50 ring-2 ring-brand-500/20 dark:bg-night-700'
                          : 'border-sand-200 hover:border-sand-300 dark:border-night-600'
                      }`}
                    >
                      <input
                        type="radio"
                        name="role"
                        value={role.value}
                        checked={active}
                        onChange={handleChange}
                        className="sr-only"
                      />
                      <span className="block text-sm font-semibold text-ink dark:text-sand-100">
                        {role.title}
                      </span>
                      <span className="mt-0.5 block text-xs text-ink-soft dark:text-sand-200/60">
                        {role.blurb}
                      </span>
                    </label>
                  );
                })}
              </div>
            </fieldset>

            <div>
              <label htmlFor="name" className="label">Full name</label>
              <input id="name" name="name" type="text" autoComplete="name" required className="input" placeholder="Amira Ben Salah" value={formData.name} onChange={handleChange} />
            </div>

            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
              <div>
                <label htmlFor="email" className="label">Email</label>
                <input id="email" name="email" type="email" autoComplete="email" required className="input" placeholder="you@school.tn" value={formData.email} onChange={handleChange} />
              </div>
              <div>
                <label htmlFor="phone" className="label">Phone</label>
                <input id="phone" name="phone" type="tel" autoComplete="tel" required className="input" placeholder="+216 …" value={formData.phone} onChange={handleChange} />
              </div>
            </div>

            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
              <div>
                <label htmlFor="password" className="label">Password</label>
                <input id="password" name="password" type="password" autoComplete="new-password" required minLength={6} className="input" placeholder="At least 6 characters" value={formData.password} onChange={handleChange} />
              </div>
              <div>
                <label htmlFor="confirmPassword" className="label">Confirm password</label>
                <input
                  id="confirmPassword"
                  name="confirmPassword"
                  type="password"
                  autoComplete="new-password"
                  required
                  className={`input ${passwordsMismatch ? 'border-stress focus:border-stress focus:ring-stress/15' : ''}`}
                  placeholder="Re-enter password"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  aria-invalid={passwordsMismatch}
                />
                {passwordsMismatch && (
                  <p className="mt-1.5 text-xs font-medium text-stress-softText">Passwords don't match yet.</p>
                )}
              </div>
            </div>

            <button type="submit" disabled={loading || passwordsMismatch} className="btn-primary w-full">
              {loading ? 'Creating account…' : 'Create account'}
            </button>
          </form>

          <p className="mt-6 text-center text-sm text-ink-soft dark:text-sand-200/70">
            Already have an account?{' '}
            <Link to="/login" className="font-semibold text-brand-700 hover:text-brand-800 dark:text-brand-300">
              Sign in
            </Link>
          </p>
        </div>
      </main>
    </div>
  );
};

export default Register;
