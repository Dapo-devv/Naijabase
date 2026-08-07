import { useState } from "react";
import { Link, useNavigate, Navigate } from "react-router-dom";
import { Mail, Lock, LogIn } from "lucide-react";
import { useNaijaBase } from "../context/NaijaBaseContext";

export default function Login() {
  const { state, login, resetPassword, resendConfirmation } = useNaijaBase();
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");

  const [showReset, setShowReset] = useState(false);
  const [resetEmail, setResetEmail] = useState("");
  const [resetMsg, setResetMsg] = useState(null);

  if (state.currentUserId != null) return <Navigate to="/" replace />;

  const handleLogin = async (e) => {
    e.preventDefault();
    setError("");
    setSuccessMessage("");
    setLoading(true);
    const res = await login(email.trim(), password);
    setLoading(false);
    if (!res.ok) {
      setError(res.error);
      return;
    }
    navigate("/");
  };

  const handleResetRequest = async (e) => {
    e.preventDefault();
    setError("");
    setResetMsg(null);
    if (!resetEmail.trim()) {
      setError("Please enter your email address.");
      return;
    }
    const res = await resetPassword(resetEmail.trim());
    if (res.ok) {
      setResetMsg(res.message || "Password reset link sent! Check your inbox.");
      setResetEmail("");
    } else {
      setError(res.error);
    }
  };

  return (
    <div className="max-w-md mx-auto px-4 py-8 animate-fade-in">
      <div className="bg-white/90 dark:bg-gray-800/90 backdrop-blur-md rounded-3xl shadow-2xl border border-white/20 dark:border-gray-700/50 p-6 transition-colors duration-300">
        <div className="flex flex-col items-center mb-4">
          <img
            src="/trackcash-logo.png"
            alt="TrackCash"
            className="w-16 h-16 object-contain mb-2 drop-shadow-lg"
          />
          <h1 className="text-2xl font-extrabold text-neutral-text dark:text-white tracking-tight text-center">
            Welcome back
          </h1>
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1 text-center max-w-xs mx-auto">
            Log in to update your daily records and monitor your cash flow in
            real time.
          </p>
        </div>

        {/* Warm, premium Information Card */}
        <div className="bg-gradient-to-br from-amber-50 to-orange-50 dark:from-amber-900/20 dark:to-orange-900/20 rounded-xl p-3 mb-4 border border-amber-200 dark:border-amber-800 shadow-sm">
          <p className="text-xs text-amber-800 dark:text-amber-200 leading-relaxed text-center font-medium">
            {showReset
              ? "We'll send a secure link to reset your password."
              : "Start logging your daily expenses, business income, trips, and savings."}
          </p>
        </div>

        {successMessage && (
          <div className="bg-green-50 dark:bg-green-900/30 border border-green-200 dark:border-green-800 text-green-700 dark:text-green-300 text-sm rounded-xl p-3 mb-4">
            {successMessage}
          </div>
        )}

        {!showReset ? (
          <form onSubmit={handleLogin} className="space-y-4">
            <div className="relative group">
              <label className="text-[10px] font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-0.5 block">
                Email Address
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 border border-gray-200 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-primary/30 bg-white dark:bg-gray-700 text-gray-800 dark:text-gray-200 transition-all placeholder:text-gray-400 text-sm"
                  placeholder="you@example.com"
                  required
                />
              </div>
            </div>

            <div className="relative group">
              <label className="text-[10px] font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-0.5 block">
                Password
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 border border-gray-200 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-primary/30 bg-white dark:bg-gray-700 text-gray-800 dark:text-gray-200 transition-all placeholder:text-gray-400 text-sm"
                  placeholder="Enter your password"
                  required
                />
              </div>
            </div>

            {error && (
              <div className="bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-300 text-sm rounded-xl p-3">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 bg-primary text-white dark:text-white font-semibold rounded-xl hover:bg-primary-600 transition-all shadow-md hover:shadow-lg flex items-center justify-center gap-2 text-sm"
            >
              {loading ? (
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                <>
                  <LogIn className="w-4 h-4" /> Log In
                </>
              )}
            </button>

            <div className="flex flex-col items-center gap-3 pt-2">
              <button
                type="button"
                onClick={() => setShowReset(true)}
                className="text-xs text-gray-500 hover:text-primary transition-colors"
              >
                Forgot password?
              </button>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                No account?{" "}
                <Link
                  to="/register"
                  className="text-primary font-semibold hover:underline"
                >
                  Create one
                </Link>
              </p>
            </div>
          </form>
        ) : (
          <form onSubmit={handleResetRequest} className="space-y-4">
            <div className="relative group">
              <label className="text-[10px] font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-0.5 block">
                Email Address
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="email"
                  value={resetEmail}
                  onChange={(e) => setResetEmail(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 border border-gray-200 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-primary/30 bg-white dark:bg-gray-700 text-gray-800 dark:text-gray-200 transition-all placeholder:text-gray-400 text-sm"
                  placeholder="you@example.com"
                  required
                />
              </div>
            </div>

            {error && (
              <div className="bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-300 text-sm rounded-xl p-3">
                {error}
              </div>
            )}
            {resetMsg && (
              <div className="bg-green-50 dark:bg-green-900/30 border border-green-200 dark:border-green-800 text-green-700 dark:text-green-300 text-sm rounded-xl p-3">
                {resetMsg}
              </div>
            )}

            <button
              type="submit"
              className="w-full py-3 bg-primary text-white dark:text-white font-semibold rounded-xl hover:bg-primary-600 transition-all shadow-md hover:shadow-lg flex items-center justify-center gap-2 text-sm"
            >
              Send Reset Link
            </button>

            <button
              type="button"
              onClick={() => {
                setShowReset(false);
                setError("");
                setResetMsg(null);
              }}
              className="w-full text-center text-xs text-gray-500 hover:text-primary transition-colors mt-2"
            >
              ← Back to Login
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
