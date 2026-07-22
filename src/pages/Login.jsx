import { useState } from 'react';
import { Link, useNavigate, Navigate } from 'react-router-dom';
import { Leaf, AlertTriangle } from 'lucide-react';
import { useNaijaBase } from '../context/NaijaBaseContext';

export default function Login() {
  const { state, login, resetPassword } = useNaijaBase();
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  // Password Reset States
  const [showReset, setShowReset] = useState(false);
  const [resetEmail, setResetEmail] = useState('');
  const [resetMsg, setResetMsg] = useState(null);

  if (state.currentUserId != null) return <Navigate to="/" replace />;

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');
    const res = await login(email.trim(), password);
    if (!res.ok) {
      setError(res.error);
      return;
    }
    navigate('/');
  };

  const handleResetRequest = async (e) => {
    e.preventDefault();
    setError('');
    setResetMsg(null);
    if (!resetEmail.trim()) {
      setError('Please enter your email address.');
      return;
    }
    const res = await resetPassword(resetEmail.trim());
    if (res.ok) {
      setResetMsg('Password reset link sent! Check your inbox.');
      setResetEmail('');
    } else {
      setError(res.error);
    }
  };

  return (
    <div className="max-w-md mx-auto px-4 py-10 animate-fade-in">
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8">
        <div className="flex flex-col items-center mb-6">
          <div className="w-14 h-14 rounded-2xl bg-primary flex items-center justify-center mb-3">
            <Leaf className="w-7 h-7 text-white" />
          </div>
          <h1 className="text-2xl font-extrabold text-neutral-text">
            {showReset ? 'Reset Password' : 'Welcome back'}
          </h1>
          <p className="text-sm text-gray-500">
            {showReset ? 'Enter your email to receive a reset link' : 'Log in to your NaijaBase dashboard'}
          </p>
        </div>

        <div className="bg-amber-50 border border-amber-200 rounded-xl p-3 mb-5 flex gap-2">
          <AlertTriangle className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
          <p className="text-xs text-amber-700 leading-relaxed">
            {showReset 
              ? 'We will send a secure link to reset your password.' 
              : 'Your data now syncs across devices securely via Supabase.'}
          </p>
        </div>

        {/* Login Form */}
        {!showReset ? (
          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Email Address</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                autoComplete="email"
                className="mt-1 w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary"
                placeholder="you@example.com"
                required
              />
            </div>
            <div>
              <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Password</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                autoComplete="current-password"
                className="mt-1 w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary"
                placeholder="Enter your password"
                required
              />
            </div>

            {error && (
              <div className="bg-red-50 border border-red-200 text-red-600 text-sm rounded-lg p-3">{error}</div>
            )}

            <button
              type="submit"
              className="w-full py-3 bg-primary text-white font-semibold rounded-xl hover:bg-primary-600 transition-colors"
            >
              Log In
            </button>

            <div className="flex flex-col items-center gap-2 mt-2">
              <button
                type="button"
                onClick={() => setShowReset(true)}
                className="text-sm text-gray-500 hover:text-primary transition-colors"
              >
                Forgot password?
              </button>
              <p className="text-sm text-gray-500">
                No account?{' '}
                <Link to="/register" className="text-primary font-semibold hover:underline">
                  Register
                </Link>
              </p>
            </div>
          </form>
        ) : (
          /* Password Reset Form */
          <form onSubmit={handleResetRequest} className="space-y-4">
            <div>
              <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Email Address</label>
              <input
                type="email"
                value={resetEmail}
                onChange={(e) => setResetEmail(e.target.value)}
                className="mt-1 w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary"
                placeholder="you@example.com"
                required
              />
            </div>

            {error && (
              <div className="bg-red-50 border border-red-200 text-red-600 text-sm rounded-lg p-3">{error}</div>
            )}
            {resetMsg && (
              <div className="bg-green-50 border border-green-200 text-green-600 text-sm rounded-lg p-3">{resetMsg}</div>
            )}

            <button
              type="submit"
              className="w-full py-3 bg-primary text-white font-semibold rounded-xl hover:bg-primary-600 transition-colors"
            >
              Send Reset Link
            </button>

            <button
              type="button"
              onClick={() => {
                setShowReset(false);
                setError('');
                setResetMsg(null);
              }}
              className="w-full text-center text-sm text-gray-500 hover:text-primary transition-colors"
            >
              ← Back to Login
            </button>
          </form>
        )}
      </div>
    </div>
  );
}