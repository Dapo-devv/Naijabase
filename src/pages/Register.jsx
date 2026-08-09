import { useState } from "react";
import { Link, useNavigate, Navigate } from "react-router-dom";
import { Mail, Lock, User, ArrowRight, Eye, EyeOff } from "lucide-react";
import { useNaijaBase } from "../context/NaijaBaseContext";
import LoadingSpinner from "../components/LoadingSpinner";

export default function Register() {
  const { state, register } = useNaijaBase();
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [username, setUsername] = useState("");
  const [name, setName] = useState("");
  const [surname, setSurname] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");
  const [confirmationSent, setConfirmationSent] = useState(false);

  if (state.currentUserId != null) return <Navigate to="/" replace />;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccessMessage("");
    setConfirmationSent(false);

    if (email.trim().length < 5)
      setError("Please enter a valid email address.");
    else if (username.trim().length < 2)
      setError("Username must be at least 2 characters.");
    else if (name.trim().length < 1) setError("Please enter your first name.");
    else if (surname.trim().length < 1) setError("Please enter your surname.");
    else if (password.length < 6)
      setError("Password must be at least 6 characters.");
    else {
      setLoading(true);
      const res = await register(
        email.trim(),
        password,
        username.trim(),
        name.trim(),
        surname.trim(),
      );
      setLoading(false);
      if (!res.ok) setError(res.error);
      else if (state.currentUserId != null) navigate("/");
      else if (res.message && res.message.includes("confirm your email")) {
        setConfirmationSent(true);
        setSuccessMessage(res.message);
      } else {
        setSuccessMessage(res.message || "Account created successfully!");
        setTimeout(() => navigate("/"), 300);
      }
    }
  };

  return (
    <div className="min-h-screen bg-neutral-bg dark:bg-gray-900 flex items-center justify-center px-4 py-10 animate-fade-in">
      <div className="w-full max-w-md">
        <div className="flex flex-col items-center mb-6">
          <img
            src="/trackcash-logo.png"
            alt="TrackCash"
            className="w-20 h-20 object-contain mb-4 drop-shadow-lg"
          />
          <h1 className="text-2xl font-extrabold text-neutral-text dark:text-white tracking-tight text-center">
            Take full control of your money
          </h1>
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1 text-center max-w-xs mx-auto">
            Track daily expenses, monitor business sales, manage staff costs,
            and grow your savings, all in one secure place.
          </p>
        </div>

        {/* Warm, premium Information Card */}
        <div className="bg-gradient-to-br from-amber-50 to-orange-50 dark:from-amber-900/20 dark:to-orange-900/20 rounded-xl p-3 mb-5 border border-amber-200 dark:border-amber-800 shadow-sm">
          <p className="text-xs text-amber-800 dark:text-amber-200 leading-relaxed text-center font-medium">
            Start logging your daily expenses, business income, trips, and
            savings—all in one place.
          </p>
        </div>

        {successMessage && !confirmationSent && (
          <div className="bg-green-50 dark:bg-green-900/30 border border-green-200 dark:border-green-800 text-green-700 dark:text-green-300 text-sm rounded-xl p-3 mb-4">
            {successMessage}
          </div>
        )}

        {confirmationSent && (
          <div className="bg-blue-50 dark:bg-blue-900/30 border border-blue-200 dark:border-blue-800 text-blue-700 dark:text-blue-300 text-sm rounded-xl p-3 mb-4 text-center">
            <p className="mb-2">
              Confirmation email sent! Please check your inbox.
            </p>
            <Link
              to="/login"
              className="inline-block py-2 px-4 bg-primary text-white rounded-lg hover:bg-primary-600 transition-colors"
            >
              Go to Login <ArrowRight className="w-4 h-4 inline ml-1" />
            </Link>
          </div>
        )}

        {!confirmationSent && (
          <form onSubmit={handleSubmit} className="space-y-4">
            {[
              {
                label: "Email",
                icon: Mail,
                val: email,
                set: setEmail,
                type: "email",
                placeholder: "you@example.com",
              },
              {
                label: "First Name",
                icon: User,
                val: name,
                set: setName,
                type: "text",
                placeholder: "Your first name",
              },
              {
                label: "Surname",
                icon: User,
                val: surname,
                set: setSurname,
                type: "text",
                placeholder: "Your surname",
              },
              {
                label: "Username",
                icon: User,
                val: username,
                set: setUsername,
                type: "text",
                placeholder: "Choose a username",
              },
            ].map((f, i) => (
              <div key={i} className="relative group">
                <label className="text-[10px] font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-0.5 block">
                  {f.label}
                </label>
                <div className="relative">
                  <f.icon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input
                    type={f.type}
                    value={f.val}
                    onChange={(e) => f.set(e.target.value)}
                    className="w-full pl-10 pr-4 py-3 border border-gray-200 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-primary/30 bg-white dark:bg-gray-700 text-gray-800 dark:text-gray-200 transition-all placeholder:text-gray-400 text-sm"
                    placeholder={f.placeholder}
                    required
                  />
                </div>
              </div>
            ))}

            {/* Password field with eye toggle */}
            <div className="relative group">
              <label className="text-[10px] font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-0.5 block">
                Password
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-10 pr-10 py-3 border border-gray-200 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-primary/30 bg-white dark:bg-gray-700 text-gray-800 dark:text-gray-200 transition-all placeholder:text-gray-400 text-sm"
                  placeholder="At least 6 chars"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
                >
                  {showPassword ? (
                    <EyeOff className="w-4 h-4" />
                  ) : (
                    <Eye className="w-4 h-4" />
                  )}
                </button>
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
                <LoadingSpinner size={20} color="text-white" />
              ) : (
                "Create Account"
              )}
            </button>
          </form>
        )}

        {!confirmationSent && (
          <p className="text-center text-xs text-gray-500 dark:text-gray-400 mt-5">
            Already have an account?{" "}
            <Link
              to="/login"
              className="text-primary font-semibold hover:underline"
            >
              Log in
            </Link>
          </p>
        )}
      </div>
    </div>
  );
}
