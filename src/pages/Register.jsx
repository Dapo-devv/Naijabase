import { useState } from "react";
import { Link, useNavigate, Navigate } from "react-router-dom";
import { AlertTriangle, Loader2, Mail, ArrowRight } from "lucide-react";
import { useNaijaBase } from "../context/NaijaBaseContext";

export default function Register() {
  const { state, register } = useNaijaBase();
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [username, setUsername] = useState("");
  const [name, setName] = useState("");
  const [surname, setSurname] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");
  const [confirmationSent, setConfirmationSent] = useState(false);

  // If user is already logged in, send them to the Dashboard immediately
  if (state.currentUserId != null) return <Navigate to="/" replace />;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccessMessage("");
    setConfirmationSent(false);

    if (email.trim().length < 5) {
      setError("Please enter a valid email address.");
      return;
    }
    if (username.trim().length < 2) {
      setError("Username must be at least 2 characters.");
      return;
    }
    if (name.trim().length < 1) {
      setError("Please enter your first name.");
      return;
    }
    if (surname.trim().length < 1) {
      setError("Please enter your surname.");
      return;
    }
    if (password.length < 6) {
      setError("Password must be at least 6 characters.");
      return;
    }

    setLoading(true);
    const res = await register(
      email.trim(),
      password,
      username.trim(),
      name.trim(),
      surname.trim(),
    );
    setLoading(false);

    if (!res.ok) {
      setError(res.error);
      return;
    }

    // 🚀 LOGIC CHANGE: Check if the user was auto-logged in
    // If state.currentUserId exists, it means Supabase auto-logged them in (often happens in dev)
    if (state.currentUserId != null) {
      navigate("/");
      return;
    }

    // Check if email confirmation was sent
    if (res.message && res.message.includes("confirm your email")) {
      setConfirmationSent(true);
      setSuccessMessage(res.message);
    } else {
      setSuccessMessage(res.message || "Account created successfully!");
      // Fallback: navigate to dashboard just in case
      setTimeout(() => navigate("/"), 300);
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
            Create account
          </h1>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Start tracking your daily life
          </p>
        </div>

        <div className="bg-amber-50 dark:bg-amber-900/30 border border-amber-200 dark:border-amber-800 rounded-xl p-3 mb-5 flex gap-2 transition-colors duration-300">
          <AlertTriangle className="w-4 h-4 text-amber-500 dark:text-amber-400 shrink-0 mt-0.5" />
          <p className="text-xs text-amber-700 dark:text-amber-300 leading-relaxed">
            Your data will sync securely across all your devices. Check your
            email to confirm your account.
          </p>
        </div>

        {/* Success Message */}
        {successMessage && !confirmationSent && (
          <div className="bg-green-50 dark:bg-green-900/30 border border-green-200 dark:border-green-800 text-green-600 dark:text-green-400 text-sm rounded-lg p-3 mb-4 transition-colors duration-300">
            {successMessage}
          </div>
        )}

        {/* Confirmation Sent Message */}
        {confirmationSent && (
          <div className="bg-blue-50 dark:bg-blue-900/30 border border-blue-200 dark:border-blue-800 text-blue-600 dark:text-blue-400 text-sm rounded-lg p-3 mb-4 transition-colors duration-300 flex flex-col items-center gap-2">
            <div className="flex items-center gap-2">
              <Mail className="w-4 h-4 shrink-0" />
              <span>
                Confirmation email sent! Please check your inbox and click the
                link to verify your account.
              </span>
            </div>
            {/* 🚀 NEW: Direct link to Login so they don't feel stuck */}
            <Link
              to="/login"
              className="mt-2 w-full flex items-center justify-center gap-2 py-2 bg-primary text-white dark:text-white font-semibold rounded-lg hover:bg-primary-600 dark:hover:bg-primary-500 transition-colors"
            >
              Go to Login <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        )}

        {/* Registration Form - Only show if not confirmed */}
        {!confirmationSent && (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide">
                Email Address
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="mt-1 w-full px-4 py-3 border border-gray-200 dark:border-gray-600 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary bg-white dark:bg-gray-700 text-gray-800 dark:text-gray-200 transition-colors duration-300"
                placeholder="you@example.com"
                required
              />
            </div>
            <div>
              <label className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide">
                First Name
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="mt-1 w-full px-4 py-3 border border-gray-200 dark:border-gray-600 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary bg-white dark:bg-gray-700 text-gray-800 dark:text-gray-200 transition-colors duration-300"
                placeholder="Your first name"
                required
              />
            </div>
            <div>
              <label className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide">
                Surname
              </label>
              <input
                type="text"
                value={surname}
                onChange={(e) => setSurname(e.target.value)}
                className="mt-1 w-full px-4 py-3 border border-gray-200 dark:border-gray-600 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary bg-white dark:bg-gray-700 text-gray-800 dark:text-gray-200 transition-colors duration-300"
                placeholder="Your surname"
                required
              />
            </div>
            <div>
              <label className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide">
                Username
              </label>
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="mt-1 w-full px-4 py-3 border border-gray-200 dark:border-gray-600 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary bg-white dark:bg-gray-700 text-gray-800 dark:text-gray-200 transition-colors duration-300"
                placeholder="Choose a username"
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
                className="mt-1 w-full px-4 py-3 border border-gray-200 dark:border-gray-600 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary bg-white dark:bg-gray-700 text-gray-800 dark:text-gray-200 transition-colors duration-300"
                placeholder="At least 6 characters"
                required
              />
            </div>

            {error && (
              <div className="bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-800 text-red-600 dark:text-red-400 text-sm rounded-lg p-3 transition-colors duration-300">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 bg-primary text-white dark:text-white font-semibold rounded-xl hover:bg-primary-600 dark:hover:bg-primary-500 transition-colors disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" /> Creating
                  account...
                </>
              ) : (
                "Create Account"
              )}
            </button>
          </form>
        )}

        {!confirmationSent && (
          <p className="text-center text-sm text-gray-500 dark:text-gray-400 mt-5">
            Already have an account?{" "}
            <Link
              to="/login"
              className="text-primary dark:text-primary-400 font-semibold hover:underline"
            >
              Log in
            </Link>
          </p>
        )}
      </div>
    </div>
  );
}
