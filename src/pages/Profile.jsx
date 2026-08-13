import { useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  User,
  LogOut,
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
  Bell,
  Menu,
  Eye,
  EyeOff,
  AlertTriangle,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useNaijaBase } from "../context/NaijaBaseContext";
import LoadingSpinner from "../components/LoadingSpinner";
import { supabase } from "../lib/supabase";

export default function Profile() {
  const { currentUser, logout, deleteAccount, updateUserData } = useNaijaBase();
  const navigate = useNavigate();
  const fileRef = useRef(null);

  const [isLoading, setIsLoading] = useState(false);
  const [msg, setMsg] = useState(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  // --- Form State ---
  const name = currentUser?.name || "";
  const surname = currentUser?.surname || "";
  const [phoneNumber, setPhoneNumber] = useState(
    currentUser?.data?.phoneNumber || "",
  );
  const [timezone, setTimezone] = useState(
    currentUser?.data?.timezone || "Africa/Lagos",
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
      theme,
      loginAlerts,
    };
    updateUserData(updatedData);
    setIsLoading(false);
    showToast("Profile updated successfully!");
  };

  const handleLogout = () => {
    logout();
    navigate("/login");
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
    <div className="min-h-screen bg-[#f5f6fa] dark:bg-gray-900 pb-8">
      {/* Toast */}
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

      {/* Header */}
      <div className="bg-white dark:bg-gray-800 px-5 py-4 flex items-center justify-between shadow-sm border-b border-gray-200 dark:border-gray-700 sticky top-0 z-10">
        <h1 className="text-xl font-bold text-gray-800 dark:text-white">
          TrackCash
        </h1>
        <div className="flex items-center gap-3">
          <button className="text-gray-500 hover:text-primary transition-colors">
            <Bell className="w-5 h-5" />
          </button>
          <button className="text-gray-500 hover:text-primary transition-colors">
            <Menu className="w-6 h-6" />
          </button>
        </div>
      </div>

      {/* Avatar */}
      <div className="flex flex-col items-center mt-6 mb-6">
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
              <option value="Africa/Nairobi">East Africa Time (EAT)</option>
              <option value="Africa/Johannesburg">
                South Africa Standard Time (SAST)
              </option>
              <option value="America/New_York">Eastern Time (ET)</option>
              <option value="Europe/London">Greenwich Mean Time (GMT)</option>
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
              className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out ${loginAlerts ? "bg-green-500" : "bg-gray-200 dark:bg-gray-600"}`}
            >
              <span
                className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${loginAlerts ? "translate-x-5" : "translate-x-0"}`}
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
            </select>
          </div>
        </div>
      </div>

      {/* ✅ SAVE CHANGES BUTTON (First in scroll order) */}
      <div className="mx-4 mb-3">
        <button
          onClick={handleSaveChanges}
          disabled={isLoading}
          className="w-full py-3.5 bg-[#0f172a] dark:bg-[#1e293b] text-white font-semibold rounded-xl hover:bg-[#1e293b] dark:hover:bg-[#334155] flex items-center justify-center gap-2 text-sm shadow-md"
        >
          {isLoading ? (
            <LoadingSpinner size={20} color="text-white" />
          ) : (
            <Save className="w-4 h-4" />
          )}
          {isLoading ? "Saving..." : "Save Changes"}
        </button>
      </div>

      {/* 🛡️ DELETE ACCOUNT BUTTON (Second in scroll order) */}
      <div className="mx-4 mb-8">
        <button
          onClick={() => setShowDeleteModal(true)}
          className="w-full flex items-center justify-center gap-2 py-3 border border-red-300 dark:border-red-800 text-red-600 dark:text-red-400 rounded-xl text-sm font-medium hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
        >
          <Trash2 className="w-4 h-4" /> Delete Account
        </button>
      </div>

      {/* ⚠️ DELETE CONFIRMATION MODAL */}
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
                  (market logs, trips, plans, and savings) will be removed
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
