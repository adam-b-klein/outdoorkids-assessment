import { useState } from 'react';
import { TreePine, Eye, EyeOff, ArrowLeft } from 'lucide-react';
import { supabase } from '../lib/supabase';

type Props = {
  onBack: () => void;
  initialMode?: 'signin' | 'signup';
};

type Mode = 'signin' | 'signup' | 'reset';

export default function AuthPage({ onBack, initialMode = 'signin' }: Props) {
  const [mode, setMode] = useState<Mode>(initialMode);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    setMessage('');
    setLoading(true);

    try {
      if (mode === 'signin') {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
      } else if (mode === 'signup') {
        const { error } = await supabase.auth.signUp({ email, password });
        if (error) throw error;
        setMessage('Account created! Check your email to confirm, or sign in now.');
      } else {
        const { error } = await supabase.auth.resetPasswordForEmail(email);
        if (error) throw error;
        setMessage('Password reset email sent. Check your inbox.');
      }
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <div className="p-6">
        <button
          onClick={onBack}
          className="flex items-center gap-2 text-gray-500 hover:text-gray-700 text-sm font-medium transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Back
        </button>
      </div>

      <div className="flex-1 flex items-center justify-center px-6 py-12">
        <div className="w-full max-w-md">
          {/* Logo */}
          <div className="text-center mb-8">
            <div className="w-14 h-14 bg-emerald-600 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg shadow-emerald-200">
              <TreePine className="w-8 h-8 text-white" />
            </div>
            <h1 className="text-2xl font-bold text-gray-900">
              {mode === 'signin' ? 'Welcome back' : mode === 'signup' ? 'Create your account' : 'Reset password'}
            </h1>
            <p className="text-gray-500 text-sm mt-1">
              {mode === 'signin' ? 'Sign in to continue earning rewards' : mode === 'signup' ? 'Join OutdoorKids — it\'s free' : 'We\'ll send you a reset link'}
            </p>
          </div>

          <div className="bg-white rounded-2xl p-8 shadow-sm border border-gray-100">
            {error && (
              <div className="mb-5 p-3 bg-red-50 border border-red-100 rounded-lg text-sm text-red-700">
                {error}
              </div>
            )}
            {message && (
              <div className="mb-5 p-3 bg-emerald-50 border border-emerald-100 rounded-lg text-sm text-emerald-700">
                {message}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Email</label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100 outline-none transition-all text-sm"
                  placeholder="you@example.com"
                />
              </div>

              {mode !== 'reset' && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">Password</label>
                  <div className="relative">
                    <input
                      type={showPassword ? 'text' : 'password'}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                      minLength={6}
                      className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100 outline-none transition-all text-sm pr-12"
                      placeholder="••••••••"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>
              )}

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-emerald-600 hover:bg-emerald-700 disabled:bg-emerald-400 text-white py-3 rounded-xl font-semibold transition-all text-sm mt-2"
              >
                {loading ? 'Please wait...' : mode === 'signin' ? 'Sign In' : mode === 'signup' ? 'Create Account' : 'Send Reset Link'}
              </button>
            </form>

            <div className="mt-6 space-y-3 text-center text-sm">
              {mode === 'signin' && (
                <>
                  <button
                    onClick={() => { setMode('reset'); setError(''); setMessage(''); }}
                    className="text-gray-500 hover:text-gray-700 transition-colors block w-full"
                  >
                    Forgot your password?
                  </button>
                  <p className="text-gray-500">
                    Don't have an account?{' '}
                    <button
                      onClick={() => { setMode('signup'); setError(''); setMessage(''); }}
                      className="text-emerald-600 hover:text-emerald-700 font-semibold"
                    >
                      Sign up free
                    </button>
                  </p>
                </>
              )}
              {mode === 'signup' && (
                <p className="text-gray-500">
                  Already have an account?{' '}
                  <button
                    onClick={() => { setMode('signin'); setError(''); setMessage(''); }}
                    className="text-emerald-600 hover:text-emerald-700 font-semibold"
                  >
                    Sign in
                  </button>
                </p>
              )}
              {mode === 'reset' && (
                <button
                  onClick={() => { setMode('signin'); setError(''); setMessage(''); }}
                  className="text-emerald-600 hover:text-emerald-700 font-semibold"
                >
                  Back to sign in
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
