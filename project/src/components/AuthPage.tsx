import { useState } from 'react';
import { HeartPulse, LockKeyhole, Mail, UserRound } from 'lucide-react';
import { api } from '@/lib/api';

export default function AuthPage({ onAuthenticated }: { onAuthenticated: () => void }) {
  const [mode, setMode] = useState<'login' | 'register'>('login');
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const submit = async (event: React.FormEvent) => {
    event.preventDefault();
    setError('');
    if (mode === 'register' && password !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }
    setSubmitting(true);
    try {
      if (mode === 'login') await api.login(email, password);
      else await api.register(fullName, email, password, confirmPassword);
      onAuthenticated();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not complete authentication.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <main className="flex min-h-screen items-center justify-center bg-gradient-to-br from-teal-50 via-slate-50 to-brand-50 px-4 py-8">
      <section className="w-full max-w-md rounded-3xl border border-white/70 bg-white p-7 shadow-pop sm:p-9">
        <div className="mb-8 text-center">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-teal-500 to-brand-600 text-white shadow-lg">
            <HeartPulse size={28} />
          </div>
          <h1 className="mt-4 text-2xl font-bold text-slate-900">MediCare360</h1>
          <p className="mt-1 text-sm text-slate-500">
            {mode === 'login' ? 'Sign in to manage your health records.' : 'Create your private health workspace.'}
          </p>
        </div>

        {error && <p className="mb-4 rounded-xl bg-rose-50 px-3 py-2.5 text-sm font-medium text-rose-700">{error}</p>}

        <form onSubmit={submit} className="space-y-4" noValidate>
          {mode === 'register' && (
            <label className="block">
              <span className="label-base">Full name</span>
              <span className="relative block">
                <UserRound size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input className="input-base pl-9" value={fullName} onChange={(e) => setFullName(e.target.value)} required autoFocus />
              </span>
            </label>
          )}
          <label className="block">
            <span className="label-base">Email</span>
            <span className="relative block">
              <Mail size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input type="email" className="input-base pl-9" value={email} onChange={(e) => setEmail(e.target.value)} required autoFocus={mode === 'login'} />
            </span>
          </label>
          <label className="block">
            <span className="label-base">Password</span>
            <span className="relative block">
              <LockKeyhole size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input type="password" minLength={8} className="input-base pl-9" value={password} onChange={(e) => setPassword(e.target.value)} required />
            </span>
          </label>
          {mode === 'register' && (
            <label className="block">
              <span className="label-base">Confirm password</span>
              <input type="password" minLength={8} className="input-base" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} required />
            </label>
          )}
          <button type="submit" className="btn-primary w-full justify-center" disabled={submitting}>
            {submitting ? 'Please wait...' : mode === 'login' ? 'Sign in' : 'Create account'}
          </button>
        </form>

        <button
          type="button"
          onClick={() => { setMode(mode === 'login' ? 'register' : 'login'); setError(''); }}
          className="mt-5 w-full text-center text-sm font-medium text-teal-700 hover:text-teal-800"
        >
          {mode === 'login' ? 'New to MediCare360? Create an account' : 'Already have an account? Sign in'}
        </button>
      </section>
    </main>
  );
}
