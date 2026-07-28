import { Link, useLocation, useNavigate } from "react-router-dom";
import {
  LayoutDashboard,
  ShoppingCart,
  Zap,
  MapPin,
  PiggyBank,
  BookOpen,
  User,
  LogIn,
  UserPlus,
  LogOut,
  Shield,
} from "lucide-react";
import { useNaijaBase } from "../context/NaijaBaseContext";

export default function Navbar() {
  const { state, logout, currentUser } = useNaijaBase();
  const location = useLocation();
  const navigate = useNavigate();
  const loggedIn = state.currentUserId != null;

  const ADMIN_EMAIL = "dapodevv@gmail.com";
  const isAdmin = currentUser?.email === ADMIN_EMAIL;

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  // 🚀 FIXED: Added dark mode classes to all styles
  const linkBase =
    "px-3 py-2 rounded-lg text-sm font-medium transition-colors duration-200";
  const active =
    "text-primary dark:text-primary-400 bg-primary-50 dark:bg-primary-900/30";
  const idle =
    "text-gray-600 dark:text-gray-400 hover:text-primary dark:hover:text-primary-400 hover:bg-gray-100 dark:hover:bg-gray-800";

  const isActive = (path) => (location.pathname === path ? active : idle);

  return (
    // 🚀 FIXED: Added dark mode classes to header
    <header className="sticky top-0 z-40 bg-white/95 dark:bg-gray-900/95 backdrop-blur border-b border-gray-200 dark:border-gray-800 transition-colors duration-300">
      <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between">
        {/* --- KUDITRACK LOGO WITH BUILT-IN FALLBACK --- */}
        <Link to="/" className="flex items-center gap-2 group">
          <img
            src="/kuditrack-logo.png"
            alt="KudiTrack Logo"
            className="w-9 h-9 object-contain group-hover:scale-105 transition-transform"
            onError={(e) => {
              e.target.style.display = "none";
              e.target.nextElementSibling.style.display = "flex";
            }}
          />
          <div className="hidden w-9 h-9 rounded-xl bg-primary text-white items-center justify-center font-bold text-sm group-hover:scale-105 transition-transform">
            KT
          </div>
          {/* 🚀 FIXED: Added dark:text-primary-400 */}
          <span className="text-xl font-extrabold text-primary dark:text-primary-400 tracking-tight">
            KudiTrack
          </span>
        </Link>

        <nav className="hidden md:flex items-center gap-1">
          {loggedIn ? (
            <>
              <Link to="/" className={`${linkBase} ${isActive("/")}`}>
                Dashboard
              </Link>
              <Link
                to="/market"
                className={`${linkBase} ${isActive("/market")}`}
              >
                Expenses
              </Link>
              <Link
                to="/finance"
                className={`${linkBase} ${isActive("/finance")}`}
              >
                Finance
              </Link>
              <Link to="/trip" className={`${linkBase} ${isActive("/trip")}`}>
                Trip
              </Link>
              <Link
                to="/savings"
                className={`${linkBase} ${isActive("/savings")}`}
              >
                Savings
              </Link>
              <Link to="/blog" className={`${linkBase} ${isActive("/blog")}`}>
                Blog
              </Link>
              <Link
                to="/profile"
                className={`${linkBase} ${isActive("/profile")}`}
              >
                Profile
              </Link>

              {isAdmin && (
                // 🚀 FIXED: Added dark mode classes to admin link
                <Link
                  to="/admin"
                  className={`${linkBase} ${isActive("/admin")} text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/30 border border-red-200 dark:border-red-800`}
                >
                  <Shield className="w-4 h-4 inline mr-1" /> Admin
                </Link>
              )}

              {/* 🚀 FIXED: Added dark mode classes to logout button */}
              <button
                onClick={handleLogout}
                className={`${linkBase} text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/30 flex items-center gap-1.5`}
              >
                <LogOut className="w-4 h-4" /> Logout
              </button>
            </>
          ) : (
            <>
              <Link to="/blog" className={`${linkBase} ${isActive("/blog")}`}>
                Blog
              </Link>
              <Link to="/login" className={`${linkBase} ${isActive("/login")}`}>
                Login
              </Link>
              <Link
                to="/register"
                className="px-4 py-2 rounded-lg text-sm font-semibold bg-primary dark:bg-primary-600 text-white dark:text-white hover:bg-primary-600 dark:hover:bg-primary-500 transition-colors"
              >
                Register
              </Link>
            </>
          )}
        </nav>
      </div>
    </header>
  );
}
