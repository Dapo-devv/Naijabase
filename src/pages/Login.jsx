import { useState } from "react";
import { Link, useNavigate, Navigate } from "react-router-dom";
import { AlertTriangle, Loader2, Mail } from "lucide-react";
import { useNaijaBase } from "../context/NaijaBaseContext";

export default function Login() {
  const {
    state,
    login,
    resetPassword,
    resendConfirmation,
    emailConfirmationSent,
  } = useNaijaBase();
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");

  // Password Reset States
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

  const handleResendConfirmation = async () => {
    if (!email.trim()) {
      setError("Please enter your email address.");
      return;
    }
    setLoading(true);
    const res = await resendConfirmation(email.trim());
    setLoading(false);
    if (res.ok) {
      setSuccessMessage(
        res.message || "Confirmation email resent! Please check your inbox.",
      );
    } else {
      setError(res.error);
    }
  };

  return (
    <div className="max-w-md mx-auto px-4 py-10 animate-fade-in">
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 p-8 transition-colors duration-300">
        <div className="flex flex-col items-center mb-6">
          <img
            src="/kuditrack-logo.png"
            alt="KudiTrack Logo"
            className="w-16 h-16 object-contain mb-3"
          />
          <h1 className="text-2xl font-extrabold text-neutral-text dark:text-white">
            {showReset ? "Reset Password" : "Welcome back"}
          </h1>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            {showReset
              ? "Enter your email to receive a reset link"
              : "Log in to your KudiTrack dashboard"}
          </p>
        </div>

        {/* 🚨 UPDATED: App Description Box */}
        <div className="bg-amber-50 dark:bg-amber-900/30 border border-amber-200 dark:border-amber-800 rounded-xl p-3 mb-5 flex gap-2 transition-colors duration-300">
          <AlertTriangle className="w-4 h-4 text-amber-500 dark:text-amber-400 shrink-0 mt-0.5" />
          <p className="text-xs text-amber-700 dark:text-amber-300 leading-relaxed">
            {showReset ? (
              "We will send a secure link to reset your password."
            ) : (
              <>
                <span className="font-bold">
                  Track your daily market expenses,
                </span>{" "}
                business revenue, trip budgets, and savings—all in one simple
                dashboard built for daily spending activities.
              </>
            )}
          </p>
        </div>

        {/* Success Message */}
        {successMessage && (
          <div className="bg-green-50 dark:bg-green-900/30 border border-green-200 dark:border-green-800 text-green-600 dark:text-green-400 text-sm rounded-lg p-3 mb-4 transition-colors duration-300">
            {successMessage}
          </div>
        )}

        {/* Email Confirmation Sent Message */}
        {emailConfirmationSent && !error && (
          <div className="bg-blue-50 dark:bg-blue-900/30 border border-blue-200 dark:border-blue-800 text-blue-600 dark:text-blue-400 text-sm rounded-lg p-3 mb-4 transition-colors duration-300 flex items-center gap-2">
            <Mail className="w-4 h-4 shrink-0" />
            <span>
              Confirmation email sent! Please check your inbox and click the
              link to verify your account.
            </span>
          </div>
        )}

        {/* Login Form */}
        {!showReset ? (
          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide">
                Email Address
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                autoComplete="email"
                className="mt-1 w-full px-4 py-3 border border-gray-200 dark:border-gray-600 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary bg-white dark:bg-gray-700 text-gray-800 dark:text-gray-200 transition-colors duration-300"
                placeholder="you@example.com"
                required
              />
            </div>
            <div>
              <label className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide">
                Password
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                autoComplete="current-password"
                className="mt-1 w-full px-4 py-3 border border-gray-200 dark:border-gray-600 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary bg-white dark:bg-gray-700 text-gray-800 dark:text-gray-200 transition-colors duration-300"
                placeholder="Enter your password"
                required
              />
            </div>

            {error && (
              <div className="bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-800 text-red-600 dark:text-red-400 text-sm rounded-lg p-3 transition-colors duration-300">
                {error}
              </div>
            )}

            {/* Resend Confirmation Button - shown if there's an email confirmation error */}
            {error && error.includes("confirm your email") && (
              <button
                type="button"
                onClick={handleResendConfirmation}
                disabled={loading}
                className="w-full py-2.5 bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 font-medium rounded-xl hover:bg-blue-100 dark:hover:bg-blue-900/50 transition-colors flex items-center justify-center gap-2"
              >
                <Mail className="w-4 h-4" />
                {loading ? "Sending..." : "Resend Confirmation Email"}
              </button>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 bg-primary text-white dark:text-white font-semibold rounded-xl hover:bg-primary-600 dark:hover:bg-primary-500 transition-colors disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" /> Logging in...
                </>
              ) : (
                "Log In"
              )}
            </button>

            <div className="flex flex-col items-center gap-2 mt-2">
              <button
                type="button"
                onClick={() => setShowReset(true)}
                className="text-sm text-gray-500 dark:text-gray-400 hover:text-primary dark:hover:text-primary-400 transition-colors"
              >
                Forgot password?
              </button>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                No account?{" "}
                <Link
                  to="/register"
                  className="text-primary dark:text-primary-400 font-semibold hover:underline"
                >
                  Register
                </Link>
              </p>
            </div>
          </form>
        ) : (
          /* Password Reset Form */
          <form onSubmit={handleResetRequest} className="space-y-4">
            <div>
              <label className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide">
                Email Address
              </label>
              <input
                type="email"
                value={resetEmail}
                onChange={(e) => setResetEmail(e.target.value)}
                className="mt-1 w-full px-4 py-3 border border-gray-200 dark:border-gray-600 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary bg-white dark:bg-gray-700 text-gray-800 dark:text-gray-200 transition-colors duration-300"
                placeholder="you@example.com"
                required
              />
            </div>

            {error && (
              <div className="bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-800 text-red-600 dark:text-red-400 text-sm rounded-lg p-3 transition-colors duration-300">
                {error}
              </div>
            )}
            {resetMsg && (
              <div className="bg-green-50 dark:bg-green-900/30 border border-green-200 dark:border-green-800 text-green-600 dark:text-green-400 text-sm rounded-lg p-3 transition-colors duration-300">
                {resetMsg}
              </div>
            )}

            <button
              type="submit"
              className="w-full py-3 bg-primary text-white dark:text-white font-semibold rounded-xl hover:bg-primary-600 dark:hover:bg-primary-500 transition-colors"
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
              className="w-full text-center text-sm text-gray-500 dark:text-gray-400 hover:text-primary dark:hover:text-primary-400 transition-colors"
            >
              ← Back to Login
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
