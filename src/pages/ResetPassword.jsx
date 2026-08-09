import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "../lib/supabase";
import { Lock, CheckCircle2, XCircle } from "lucide-react";
import LoadingSpinner from "../components/LoadingSpinner";
import { useNaijaBase } from "../context/NaijaBaseContext";

export default function ResetPassword() {
  const navigate = useNavigate();
  const { isPasswordRecovery, clearPasswordRecovery } = useNaijaBase();
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [isCheckingToken, setIsCheckingToken] = useState(true);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    if (isPasswordRecovery) {
      setIsCheckingToken(false);
      return;
    }
    // Give a short window in case the event fires slightly after mount
    const timeout = setTimeout(() => setIsCheckingToken(false), 2000);
    return () => clearTimeout(timeout);
  }, [isPasswordRecovery]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (password.length < 6) {
      setError("Password must be at least 6 characters.");
      return;
    }
    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    setLoading(true);
    const { error: updateError } = await supabase.auth.updateUser({ password });
    setLoading(false);

    if (updateError) {
      setError(updateError.message || "Failed to update password.");
    } else {
      setSuccess(true);
      clearPasswordRecovery();
      setTimeout(() => {
        supabase.auth.signOut().then(() => navigate("/login"));
      }, 2500);
    }
  };

  if (isCheckingToken) {
    return (
      <div className="min-h-screen bg-neutral-bg dark:bg-gray-900 flex items-center justify-center px-4">
        <div className="text-center space-y-4">
          <LoadingSpinner size={48} color="text-primary" />
          <p className="text-gray-500 dark:text-gray-400">
            Verifying your reset link...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-neutral-bg dark:bg-gray-900 flex items-center justify-center px-4 py-10">
      <div className="max-w-md w-full bg-white dark:bg-gray-800 rounded-3xl shadow-2xl border border-gray-200 dark:border-gray-700 p-6 transition-colors duration-300">
        {error && (
          <div className="bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-300 text-sm rounded-xl p-3 mb-4 flex items-center gap-2">
            <XCircle className="w-5 h-5 flex-shrink-0" />
            {error}
          </div>
        )}

        {success ? (
          <div className="text-center py-6 space-y-4">
            <div className="w-16 h-16 bg-green-100 dark:bg-green-900/20 rounded-full flex items-center justify-center mx-auto">
              <CheckCircle2 className="w-8 h-8 text-green-600 dark:text-green-400" />
            </div>
            <h2 className="text-2xl font-bold text-neutral-text dark:text-white">
              Password Updated!
            </h2>
            <p className="text-gray-500 dark:text-gray-400 text-sm">
              Your password has been changed successfully. Redirecting you to
              login...
            </p>
          </div>
        ) : isPasswordRecovery ? (
          <>
            <div className="flex flex-col items-center mb-6">
              <Lock className="w-8 h-8 text-primary dark:text-primary-400 mb-2" />
              <h1 className="text-2xl font-extrabold text-neutral-text dark:text-white text-center">
                Set New Password
              </h1>
              <p className="text-xs text-gray-500 dark:text-gray-400 text-center mt-1">
                Enter your new password below.
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="relative">
                <label className="text-[10px] font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-1 block">
                  New Password
                </label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full pl-10 pr-4 py-2.5 border border-gray-200 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-primary/30 bg-white dark:bg-gray-700 text-gray-800 dark:text-gray-200 text-sm"
                    placeholder="Minimum 6 characters"
                    required
                  />
                </div>
              </div>

              <div className="relative">
                <label className="text-[10px] font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-1 block">
                  Confirm Password
                </label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input
                    type="password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="w-full pl-10 pr-4 py-2.5 border border-gray-200 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-primary/30 bg-white dark:bg-gray-700 text-gray-800 dark:text-gray-200 text-sm"
                    placeholder="Re-enter new password"
                    required
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 bg-primary text-white dark:text-white font-semibold rounded-xl hover:bg-primary-600 transition-all shadow-md flex items-center justify-center gap-2 text-sm"
              >
                {loading ? (
                  <LoadingSpinner size={20} color="text-white" />
                ) : (
                  "Update Password"
                )}
              </button>
            </form>
          </>
        ) : (
          <div className="text-center py-6">
            <p className="text-gray-500 dark:text-gray-400 text-sm">
              The password reset link is invalid or has expired.
              <br />
              <button
                onClick={() => navigate("/login")}
                className="text-primary font-semibold hover:underline mt-2"
              >
                Go back to Login
              </button>
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
