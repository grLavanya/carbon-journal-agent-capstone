import { useState } from 'react';
import { useAuth } from '../lib/useAuth';
import { Leaf } from 'lucide-react';

export default function AuthScreen() {
  const { signIn, signUp } = useAuth();
  const [isSignUp, setIsSignUp] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(false);
    setSubmitting(true);

    if (isSignUp) {
      const { error: err } = await signUp(email, password);
      if (err) setError(err);
      else setSuccess(true);
    } else {
      const { error: err } = await signIn(email, password);
      if (err) setError(err);
    }
    setSubmitting(false);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="relative z-10 w-full max-w-md mx-4">
        <div className="bg-[#FDF6E3]/95 backdrop-blur-md rounded-2xl shadow-[0_8px_40px_rgba(60,45,20,0.18)] border border-parchment-300/60 p-8">
          <div className="flex items-center gap-2.5 mb-2 justify-center">
            <Leaf className="w-7 h-7 text-sage-600" strokeWidth={2.2} />
            <span className="text-2xl font-serif font-semibold tracking-tight text-[#3D2518]">Folio</span>
          </div>

          <h2 className="text-xl font-serif font-medium text-[#5C3D2E] text-center mb-1">
            {isSignUp ? 'Begin your journey' : 'Welcome back'}
          </h2>
          <p className="text-sm font-serif text-[#7A6248] text-center mb-6 italic">
            {isSignUp ? 'Every small act of care matters' : 'Your green journal awaits'}
          </p>

          {success && (
            <div className="mb-4 p-3 rounded-lg bg-sage-50 border border-sage-200 text-sage-800 text-sm font-serif text-center">
              Account created! You can now sign in.
            </div>
          )}

          {error && (
            <div className="mb-4 p-3 rounded-lg bg-red-50/80 border border-red-200 text-red-800 text-sm font-serif">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label htmlFor="email" className="block text-sm font-serif font-medium text-[#5C3D2E] mb-1">Email</label>
              <input
                id="email"
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-4 py-2.5 rounded-lg border border-parchment-300 bg-parchment-50 focus:outline-none focus:ring-2 focus:ring-sage-400/40 focus:border-sage-400 text-parchment-900 placeholder-[#A0856C] transition font-serif"
                placeholder="you@example.com"
              />
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-serif font-medium text-[#5C3D2E] mb-1">Password</label>
              <input
                id="password"
                type="password"
                required
                minLength={6}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-4 py-2.5 rounded-lg border border-parchment-300 bg-parchment-50 focus:outline-none focus:ring-2 focus:ring-sage-400/40 focus:border-sage-400 text-parchment-900 placeholder-[#A0856C] transition font-serif"
                placeholder="Min. 6 characters"
              />
            </div>

            <button
              type="submit"
              disabled={submitting}
              className="w-full py-2.5 rounded-lg bg-sage-500 hover:bg-sage-600 active:bg-sage-700 text-parchment-50 font-serif font-medium transition disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {submitting ? 'Please wait...' : isSignUp ? 'Create Account' : 'Sign In'}
            </button>
          </form>

          <p className="mt-5 text-center text-sm font-serif text-[#5C3D2E]">
            {isSignUp ? 'Already have an account?' : "Don't have an account?"}{' '}
            <button
              onClick={() => { setIsSignUp(!isSignUp); setError(null); setSuccess(false); }}
              className="text-sage-600 hover:text-sage-700 font-serif font-medium transition underline underline-offset-2"
            >
              {isSignUp ? 'Sign in' : 'Sign up'}
            </button>
          </p>
        </div>
      </div>
    </div>
  );
}
