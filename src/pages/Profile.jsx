import { useRef, useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  User,
  Trash2,
  Camera,
  Save,
  Moon,
  Sun,
  Globe,
  ShieldAlert,
  Smartphone,
  CheckCircle2,
  XCircle,
  Eye,
  EyeOff,
  AlertTriangle,
  Coins,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useNaijaBase } from "../context/NaijaBaseContext";
import LoadingSpinner from "../components/LoadingSpinner";
import { supabase } from "../lib/supabase";
import { CURRENCIES } from "../utils/constants";

export default function Profile() {
  const { currentUser, logout, deleteAccount, updateUserData } = useNaijaBase();
  const navigate = useNavigate();
  const fileRef = useRef(null);

  const [isLoading, setIsLoading] = useState(false);
  const [msg, setMsg] = useState(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);

  // --- Form State ---
  const name = currentUser?.name || "";
  const surname = currentUser?.surname || "";
  const [phoneNumber, setPhoneNumber] = useState(
    currentUser?.data?.phoneNumber || "",
  );
  const [timezone, setTimezone] = useState(
    currentUser?.data?.timezone || "Africa/Lagos",
  );
  const [currency, setCurrency] = useState(
    currentUser?.data?.currency || "NGN",
  );

  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loginAlerts, setLoginAlerts] = useState(
    currentUser?.data?.loginAlerts ?? true,
  );

  const [showCurrentPW, setShowCurrentPW] = useState(false);
  const [showNewPW, setShowNewPW] = useState(false);
  const [showConfirmPW, setShowConfirmPW] = useState(false);

  const [theme, setTheme] = useState(currentUser?.theme || "light");
  const [language, setLanguage] = useState("English (US)");

  // 🔍 Track unsaved changes
  useEffect(() => {
    if (!currentUser) return;
    const original = {
      phoneNumber: currentUser.data?.phoneNumber || "",
      timezone: currentUser.data?.timezone || "Africa/Lagos",
      currency: currentUser.data?.currency || "NGN",
      theme: currentUser.theme || "light",
      loginAlerts: currentUser.data?.loginAlerts ?? true,
    };
    const changed =
      phoneNumber !== original.phoneNumber ||
      timezone !== original.timezone ||
      currency !== original.currency ||
      theme !== original.theme ||
      loginAlerts !== original.loginAlerts ||
      newPassword.length > 0 ||
      confirmPassword.length > 0;
    setHasUnsavedChanges(changed);
  }, [
    phoneNumber,
    timezone,
    currency,
    theme,
    loginAlerts,
    newPassword,
    confirmPassword,
    currentUser,
  ]);

  if (!currentUser) return null;

  const showToast = (message, type = "success") => {
    setMsg({ type, text: message });
    setTimeout(() => setMsg(null), 3000);
  };

  const handleThemeToggle = () => {
    const newTheme = theme === "dark" ? "light" : "dark";
    setTheme(newTheme);
    if (newTheme === "dark") {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
    updateUserData((d) => ({ ...d, theme: newTheme }));
    showToast(`Theme switched to ${newTheme} mode`);
  };

  const handleImageUpload = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      updateUserData((d) => ({ ...d, profilePicture: ev.target.result }));
      showToast("Profile picture updated!");
    };
    reader.readAsDataURL(file);
    e.target.value = "";
  };

  const handleSaveChanges = async () => {
    setIsLoading(true);

    if (newPassword || confirmPassword) {
      if (newPassword !== confirmPassword) {
        showToast("New passwords do not match.", "error");
        setIsLoading(false);
        return;
      }
      if (newPassword.length < 6) {
        showToast("Password must be at least 6 characters.", "error");
        setIsLoading(false);
        return;
      }
      const { error: authError } = await supabase.auth.updateUser({
        password: newPassword,
      });
      if (authError) {
        showToast(authError.message || "Failed to update password.", "error");
        setIsLoading(false);
        return;
      }
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
      showToast("Password updated successfully!");
    }

    const updatedData = {
      ...currentUser.data,
      phoneNumber,
      timezone,
      currency,
      theme,
      loginAlerts,
    };
    updateUserData(updatedData);
    setIsLoading(false);
    setHasUnsavedChanges(false);
    showToast("Profile updated successfully!");
  };

  const handleLogoutAllDevices = async () => {
    if (
      !window.confirm(
        "This will log you out from all devices (including this one). Continue?",
      )
    )
      return;
    setIsLoading(true);
    try {
      await supabase.auth.signOut({ scope: "global" });
      logout();
      navigate("/login");
    } catch (err) {
      showToast("Failed to log out all devices.", "error");
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteAccount = async () => {
    setShowDeleteModal(false);
    const result = await deleteAccount();
    if (!result.ok)
      showToast(result.error || "Failed to delete account.", "error");
    else {
      showToast("Account deleted.");
      setTimeout(() => navigate("/login"), 1500);
    }
  };

  return (
    <div className="min-h-screen bg-[#f5f6fa] dark:bg-gray-900 pb-32">
      {msg && (
        <div className="fixed top-4 left-1/2 -translate-x-1/2 z-50 w-[90%] max-w-md bg-white dark:bg-gray-800 shadow-lg rounded-xl p-4 flex items-center gap-3 border border-gray-200 dark:border-gray-700 animate-fade-in">
          {msg.type === "success" ? (
            <CheckCircle2 className="w-5 h-5 text-green-500" />
          ) : (
            <XCircle className="w-5 h-5 text-red-500" />
          )}
          <span className="text-sm font-medium text-gray-800 dark:text-gray-200">
            {msg.text}
          </span>
        </div>
      )}

      {/* Header row with quick Save hint */}
      <div className="flex items-center justify-between px-4 pt-5 pb-2">
        <h1 className="text-2xl font-extrabold text-gray-900 dark:text-white">
          Profile
        </h1>
        {hasUnsavedChanges && (
          <span className="flex items-center gap-1.5 text-xs font-semibold text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-900/30 px-3 py-1.5 rounded-full border border-amber-200 dark:border-amber-800 animate-pulse">
            <span className="w-1.5 h-1.5 rounded-full bg-amber-500" />
            Unsaved changes
          </span>
        )}
      </div>

      {/* Avatar */}
      <div className="flex flex-col items-center mt-4 mb-6">
        <div className="relative group">
          <div className="w-24 h-24 rounded-full bg-primary-50 dark:bg-primary-900/30 border-2 border-gray-200 dark:border-gray-700 flex items-center justify-center overflow-hidden">
            {currentUser.profilePicture ? (
              <img
                src={currentUser.profilePicture}
                alt="Profile"
                className="w-full h-full object-cover"
              />
            ) : (
              <User className="w-10 h-10 text-primary dark:text-primary-400" />
            )}
          </div>
          <button
            onClick={() => fileRef.current?.click()}
            className="absolute bottom-0 right-0 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 p-1.5 rounded-full shadow hover:bg-gray-50 dark:hover:bg-gray-600"
          >
            <Camera className="w-4 h-4 text-gray-600 dark:text-gray-300" />
          </button>
          <input
            ref={fileRef}
            type="file"
            accept="image/*"
            onChange={handleImageUpload}
            className="hidden"
          />
        </div>
        <h2 className="text-xl font-bold text-gray-900 dark:text-white mt-3">
          {name} {surname}
        </h2>
        <p className="text-sm text-gray-500 dark:text-gray-400">
          {currentUser.email}
        </p>
        <button
          onClick={() => fileRef.current?.click()}
          className="mt-3 px-4 py-1.5 border border-gray-300 dark:border-gray-600 rounded-lg text-xs font-medium text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700"
        >
          UPLOAD PHOTO
        </button>
      </div>

      {/* Personal Information */}
      <div className="mx-4 mb-4 bg-white dark:bg-gray-800 rounded-2xl p-5 shadow-sm border border-gray-200 dark:border-gray-700">
        <h3 className="text-lg font-bold text-gray-800 dark:text-white mb-4 border-b border-gray-100 dark:border-gray-700 pb-2">
          Personal Information
        </h3>
        <div className="space-y-4">
          <div>
            <label className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-1 block">
              Full Name
            </label>
            <div className="w-full px-3 py-2.5 border border-gray-200 dark:border-gray-600 rounded-lg bg-gray-100 dark:bg-gray-600 text-gray-600 dark:text-gray-400 cursor-not-allowed text-sm">
              {name}
            </div>
          </div>
          <div>
            <label className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-1 block">
              Surname
            </label>
            <div className="w-full px-3 py-2.5 border border-gray-200 dark:border-gray-600 rounded-lg bg-gray-100 dark:bg-gray-600 text-gray-600 dark:text-gray-400 cursor-not-allowed text-sm">
              {surname}
            </div>
          </div>
          <div>
            <label className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-1 block">
              Email Address
            </label>
            <input
              type="email"
              value={currentUser.email}
              disabled
              className="w-full px-3 py-2.5 border border-gray-200 dark:border-gray-600 rounded-lg bg-gray-100 dark:bg-gray-600 text-gray-500 dark:text-gray-400 cursor-not-allowed text-sm"
            />
          </div>
          <div>
            <label className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-1 block">
              Phone Number
            </label>
            <input
              type="tel"
              value={phoneNumber}
              onChange={(e) => setPhoneNumber(e.target.value)}
              placeholder="+234 800 000 0000"
              className="w-full px-3 py-2.5 border border-gray-200 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-700 text-gray-800 dark:text-gray-200 focus:ring-2 focus:ring-primary/30 text-sm"
            />
          </div>

          {/* Currency Selector */}
          <div>
            <label className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-1 flex items-center gap-1.5">
              <Coins className="w-3.5 h-3.5 text-primary" />
              Preferred Currency
            </label>
            <select
              value={currency}
              onChange={(e) => setCurrency(e.target.value)}
              className="w-full px-3 py-2.5 border border-gray-200 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-700 text-gray-800 dark:text-gray-200 focus:ring-2 focus:ring-primary/30 text-sm appearance-none"
            >
              {CURRENCIES.map((c) => (
                <option key={c.code} value={c.code}>
                  {c.flag} {c.code} — {c.name} ({c.symbol})
                </option>
              ))}
            </select>
            <p className="text-[10px] text-gray-400 dark:text-gray-500 mt-1">
              All your transactions, plans, and reports will use this currency.
            </p>
          </div>

          {/* Timezone */}
          <div>
            <label className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-1 block">
              Timezone
            </label>
            <select
              value={timezone}
              onChange={(e) => setTimezone(e.target.value)}
              className="w-full px-3 py-2.5 border border-gray-200 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-700 text-gray-800 dark:text-gray-200 focus:ring-2 focus:ring-primary/30 text-sm appearance-none"
            >
              <option value="Africa/Lagos">West Africa Time (WAT)</option>
              <option value="Africa/Accra">Greenwich Mean Time (GMT)</option>
              <option value="Africa/Nairobi">East Africa Time (EAT)</option>
              <option value="Africa/Johannesburg">
                South Africa Standard Time (SAST)
              </option>
              <option value="Africa/Cairo">Eastern European Time (EET)</option>
              <option value="UTC">UTC (Coordinated Universal Time)</option>
              <option value="America/New_York">Eastern Time (ET)</option>
              <option value="America/Chicago">Central Time (CT)</option>
              <option value="America/Los_Angeles">Pacific Time (PT)</option>
              <option value="Europe/London">Greenwich Mean Time (GMT)</option>
              <option value="Europe/Paris">Central European Time (CET)</option>
              <option value="Asia/Dubai">Gulf Standard Time (GST)</option>
              <option value="Asia/Kolkata">India Standard Time (IST)</option>
              <option value="Asia/Tokyo">Japan Standard Time (JST)</option>
              <option value="Asia/Singapore">Singapore Time (SGT)</option>
              <option value="Australia/Sydney">
                Australian Eastern Time (AET)
              </option>
            </select>
          </div>
        </div>
      </div>

      {/* Security */}
      <div className="mx-4 mb-4 bg-white dark:bg-gray-800 rounded-2xl p-5 shadow-sm border border-gray-200 dark:border-gray-700">
        <h3 className="text-lg font-bold text-gray-800 dark:text-white mb-4 border-b border-gray-100 dark:border-gray-700 pb-2">
          Security
        </h3>
        <div className="space-y-4">
          <div className="relative">
            <label className="text-[10px] font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-1 block">
              Current Password
            </label>
            <div className="relative">
              <input
                type={showCurrentPW ? "text" : "password"}
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full pl-3 pr-10 py-2.5 border border-gray-200 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-700 text-gray-800 dark:text-gray-200 focus:ring-2 focus:ring-primary/30 text-sm"
              />
              <button
                type="button"
                onClick={() => setShowCurrentPW(!showCurrentPW)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
              >
                {showCurrentPW ? (
                  <EyeOff className="w-4 h-4" />
                ) : (
                  <Eye className="w-4 h-4" />
                )}
              </button>
            </div>
          </div>

          <div className="relative">
            <label className="text-[10px] font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-1 block">
              New Password
            </label>
            <div className="relative">
              <input
                type={showNewPW ? "text" : "password"}
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="Enter new password"
                className="w-full pl-3 pr-10 py-2.5 border border-gray-200 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-700 text-gray-800 dark:text-gray-200 focus:ring-2 focus:ring-primary/30 text-sm"
              />
              <button
                type="button"
                onClick={() => setShowNewPW(!showNewPW)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
              >
                {showNewPW ? (
                  <EyeOff className="w-4 h-4" />
                ) : (
                  <Eye className="w-4 h-4" />
                )}
              </button>
            </div>
          </div>

          <div className="relative">
            <label className="text-[10px] font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-1 block">
              Confirm Password
            </label>
            <div className="relative">
              <input
                type={showConfirmPW ? "text" : "password"}
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Confirm new password"
                className="w-full pl-3 pr-10 py-2.5 border border-gray-200 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-700 text-gray-800 dark:text-gray-200 focus:ring-2 focus:ring-primary/30 text-sm"
              />
              <button
                type="button"
                onClick={() => setShowConfirmPW(!showConfirmPW)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
              >
                {showConfirmPW ? (
                  <EyeOff className="w-4 h-4" />
                ) : (
                  <Eye className="w-4 h-4" />
                )}
              </button>
            </div>
          </div>

          <div className="flex items-center justify-between pt-2 border-t border-gray-100 dark:border-gray-700">
            <div className="flex-1 pr-4">
              <div className="flex items-center gap-2">
                <ShieldAlert className="w-4 h-4 text-primary" />
                <span className="text-sm font-semibold text-gray-700 dark:text-gray-300">
                  Login Alerts
                </span>
              </div>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                Receive email when a new device logs in.
              </p>
            </div>
            <button
              onClick={() => {
                const newVal = !loginAlerts;
                setLoginAlerts(newVal);
                updateUserData((d) => ({ ...d, loginAlerts: newVal }));
                showToast(
                  newVal ? "Login Alerts enabled" : "Login Alerts disabled",
                );
              }}
              className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out ${
                loginAlerts ? "bg-green-500" : "bg-gray-200 dark:bg-gray-600"
              }`}
            >
              <span
                className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                  loginAlerts ? "translate-x-5" : "translate-x-0"
                }`}
              />
            </button>
          </div>

          <button
            onClick={handleLogoutAllDevices}
            disabled={isLoading}
            className="w-full flex items-center justify-center gap-2 py-2.5 mt-2 border border-blue-200 dark:border-blue-800 text-blue-600 dark:text-blue-400 rounded-lg text-sm font-medium hover:bg-blue-50 dark:hover:bg-blue-900/30 disabled:opacity-50"
          >
            {isLoading ? (
              <LoadingSpinner size={16} color="text-blue-600" />
            ) : (
              <Smartphone className="w-4 h-4" />
            )}
            {isLoading ? "Logging out..." : "Log out all devices"}
          </button>
        </div>
      </div>

      {/* Preferences */}
      <div className="mx-4 mb-4 bg-white dark:bg-gray-800 rounded-2xl p-5 shadow-sm border border-gray-200 dark:border-gray-700">
        <h3 className="text-lg font-bold text-gray-800 dark:text-white mb-4 border-b border-gray-100 dark:border-gray-700 pb-2">
          Preferences
        </h3>
        <div className="space-y-4">
          <div className="flex items-center justify-between py-1">
            <div>
              <div className="flex items-center gap-2">
                {theme === "dark" ? (
                  <Moon className="w-4 h-4 text-primary" />
                ) : (
                  <Sun className="w-4 h-4 text-secondary-500" />
                )}
                <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  Theme
                </span>
              </div>
              <p className="text-xs text-gray-500 dark:text-gray-400 capitalize">
                {theme} Mode
              </p>
            </div>
            <button
              onClick={handleThemeToggle}
              className="w-10 h-10 rounded-full bg-gray-100 dark:bg-gray-700 flex items-center justify-center text-gray-500 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-600"
            >
              {theme === "dark" ? (
                <Sun className="w-5 h-5" />
              ) : (
                <Moon className="w-5 h-5" />
              )}
            </button>
          </div>
          <div className="flex items-center justify-between py-1">
            <div>
              <div className="flex items-center gap-2">
                <Globe className="w-4 h-4 text-primary" />
                <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  Language
                </span>
              </div>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                {language}
              </p>
            </div>
            <select
              value={language}
              onChange={(e) => setLanguage(e.target.value)}
              className="px-3 py-1.5 border border-gray-200 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-700 text-gray-800 dark:text-gray-200 text-sm"
            >
              <option>English (US)</option>
              <option>English (UK)</option>
              <option>French</option>
              <option>Spanish</option>
              <option>Portuguese</option>
              <option>German</option>
            </select>
          </div>
        </div>
      </div>

      {/* Danger Zone */}
      <div className="mx-4 mb-8">
        <button
          onClick={() => setShowDeleteModal(true)}
          className="w-full flex items-center justify-center gap-2 py-3 border border-red-300 dark:border-red-800 text-red-600 dark:text-red-400 rounded-xl text-sm font-medium hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
        >
          <Trash2 className="w-4 h-4" /> Delete Account
        </button>
      </div>

      {/* 🟢 FLOATING SAVE BUTTON (Always visible, glows on unsaved) */}
      <AnimatePresence>
        <motion.button
          key="floating-save"
          initial={{ opacity: 0, scale: 0.8, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.8, y: 20 }}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={handleSaveChanges}
          disabled={isLoading}
          className={`fixed bottom-24 right-4 sm:right-6 z-40 flex items-center gap-2 px-5 py-3.5 rounded-full font-semibold text-sm shadow-2xl transition-all duration-300 disabled:opacity-70 ${
            hasUnsavedChanges
              ? "bg-primary text-white ring-4 ring-primary/30 animate-pulse-soft"
              : "bg-[#0f172a] dark:bg-[#1e293b] text-white hover:bg-[#1e293b] dark:hover:bg-[#334155]"
          }`}
          aria-label="Save changes"
        >
          {isLoading ? (
            <LoadingSpinner size={18} color="text-white" />
          ) : (
            <Save className="w-5 h-5" />
          )}
          <span className="hidden sm:inline">
            {isLoading ? "Saving..." : hasUnsavedChanges ? "Save" : "Saved"}
          </span>
          {hasUnsavedChanges && !isLoading && (
            <span className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full animate-ping" />
          )}
          {hasUnsavedChanges && !isLoading && (
            <span className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full" />
          )}
        </motion.button>
      </AnimatePresence>

      {/* Delete Modal */}
      <AnimatePresence>
        {showDeleteModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 dark:bg-black/80 p-4 backdrop-blur-sm"
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              transition={{ type: "spring", damping: 20 }}
              className="bg-white dark:bg-gray-800 w-full max-w-sm rounded-2xl shadow-2xl overflow-hidden border border-gray-200 dark:border-gray-700 p-6"
            >
              <div className="flex flex-col items-center text-center space-y-4">
                <div className="w-16 h-16 rounded-full bg-red-100 dark:bg-red-900/30 flex items-center justify-center">
                  <AlertTriangle className="w-8 h-8 text-red-600 dark:text-red-400" />
                </div>
                <h3 className="text-xl font-bold text-neutral-text dark:text-white">
                  Delete Account?
                </h3>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  This action is <strong>permanent</strong>. All your data
                  (expenses, trips, plans, and savings) will be removed
                  immediately.
                </p>
                <div className="flex gap-3 w-full pt-2">
                  <button
                    onClick={() => setShowDeleteModal(false)}
                    className="flex-1 py-3 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-xl font-medium hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleDeleteAccount}
                    className="flex-1 py-3 bg-red-600 text-white rounded-xl font-medium hover:bg-red-700 transition-colors"
                  >
                    Delete
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
