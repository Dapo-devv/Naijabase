import { useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  User,
  LogOut,
  Trash2,
  Download,
  Upload,
  CheckCircle2,
  XCircle,
  Moon,
  Sun,
  Camera,
  Save,
} from "lucide-react";
import { useNaijaBase } from "../context/NaijaBaseContext";
import { todayISO } from "../utils/constants";

export default function Profile() {
  const {
    currentUser,
    logout,
    deleteAccount,
    replaceUserData,
    updateUserData,
  } = useNaijaBase();
  const navigate = useNavigate();
  const fileRef = useRef(null);
  const [msg, setMsg] = useState(null);
  const [isEditingTheme, setIsEditingTheme] = useState(false);
  const [tempTheme, setTempTheme] = useState(currentUser?.theme || "light");
  const [isDeleting, setIsDeleting] = useState(false);

  if (!currentUser) return null;

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  // 🚀 FIX: Proper account deletion with loading state
  const handleDelete = async () => {
    if (
      !window.confirm(
        "Delete your account and all data? This cannot be undone.\n\n" +
          "This will permanently remove:\n" +
          "• Your account credentials\n" +
          "• All your saved data (market logs, trips, savings, etc.)",
      )
    ) {
      return;
    }

    setIsDeleting(true);
    const result = await deleteAccount();
    setIsDeleting(false);

    if (!result.ok) {
      setMsg({
        type: "error",
        text: result.error || "Failed to delete account. Please try again.",
      });
      return;
    }

    setMsg({
      type: "success",
      text: result.message || "Account deleted successfully.",
    });
    setTimeout(() => {
      navigate("/login");
    }, 1500);
  };

  const handleExport = () => {
    const date = todayISO();
    const blob = new Blob([JSON.stringify(currentUser.data, null, 2)], {
      type: "application/json",
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `kuditrack_backup_${currentUser.username}_${date}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    setMsg({ type: "success", text: "Backup downloaded successfully." });
  };

  const handleImport = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setMsg(null);
    const reader = new FileReader();
    reader.onload = async (ev) => {
      try {
        const parsed = JSON.parse(ev.target.result);
        if (
          typeof parsed !== "object" ||
          parsed === null ||
          !Array.isArray(parsed.marketItems) ||
          !Array.isArray(parsed.marketLogs) ||
          typeof parsed.generator !== "object" ||
          !Array.isArray(parsed.trips) ||
          typeof parsed.savings !== "object"
        ) {
          setMsg({
            type: "error",
            text: "Invalid file: missing required fields.",
          });
          return;
        }
        await replaceUserData(parsed);
        setMsg({ type: "success", text: "Data imported successfully." });
      } catch (err) {
        setMsg({
          type: "error",
          text: "Could not parse file. Make sure it is a valid KudiTrack backup.",
        });
      }
    };
    reader.readAsText(file);
    e.target.value = "";
  };

  // Profile Picture Handler
  const handleImageUpload = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      const base64 = ev.target.result;
      updateUserData((d) => ({
        ...d,
        profilePicture: base64,
      }));
      setMsg({ type: "success", text: "Profile picture updated!" });
      setTimeout(() => setMsg(null), 3000);
    };
    reader.readAsDataURL(file);
    e.target.value = "";
  };

  // Theme Handler
  const handleThemeSave = () => {
    updateUserData((d) => ({
      ...d,
      theme: tempTheme,
    }));
    setIsEditingTheme(false);
    setMsg({ type: "success", text: "Theme updated!" });
    setTimeout(() => setMsg(null), 3000);
  };

  return (
    <div className="max-w-3xl mx-auto px-4 py-8 animate-fade-in space-y-8">
      {/* --- Profile Header --- */}
      <div className="bg-white dark:bg-gray-800 rounded-3xl shadow-md border border-gray-100 dark:border-gray-700 p-8 relative overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-24 bg-gradient-to-r from-primary to-primary-700 opacity-10 dark:opacity-20" />
        <div className="relative flex flex-col sm:flex-row items-center gap-6">
          <div className="relative group">
            <div className="w-28 h-28 rounded-2xl bg-gray-100 dark:bg-gray-700 flex items-center justify-center overflow-hidden border-4 border-white dark:border-gray-800 shadow-sm">
              {currentUser.profilePicture ? (
                <img
                  src={currentUser.profilePicture}
                  alt="Profile"
                  className="w-full h-full object-cover"
                />
              ) : (
                <User className="w-12 h-12 text-gray-400 dark:text-gray-500" />
              )}
            </div>
            <button
              onClick={() => fileRef.current?.click()}
              className="absolute bottom-1 right-1 bg-primary text-white p-2 rounded-full shadow-lg hover:bg-primary-600 transition-colors"
            >
              <Camera className="w-4 h-4" />
            </button>
            <input
              ref={fileRef}
              type="file"
              accept="image/*"
              onChange={handleImageUpload}
              className="hidden"
            />
          </div>
          <div className="flex-1 text-center sm:text-left">
            <h2 className="text-3xl font-extrabold text-neutral-text dark:text-white">
              {currentUser.name} {currentUser.surname}
            </h2>
            <p className="text-gray-500 dark:text-gray-400">
              @{currentUser.username}
            </p>
            <p className="text-sm text-gray-400 dark:text-gray-500 mt-1">
              {currentUser.email}
            </p>
          </div>
          <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
            <button
              onClick={handleLogout}
              className="flex items-center justify-center gap-2 px-4 py-2 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-xl hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
            >
              <LogOut className="w-4 h-4" /> Logout
            </button>
            <button
              onClick={handleDelete}
              disabled={isDeleting}
              className="flex items-center justify-center gap-2 px-4 py-2 bg-red-50 dark:bg-red-900/30 text-red-600 dark:text-red-400 rounded-xl hover:bg-red-100 dark:hover:bg-red-900/50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Trash2 className="w-4 h-4" />{" "}
              {isDeleting ? "Deleting..." : "Delete"}
            </button>
          </div>
        </div>
      </div>

      {/* --- Theme Settings --- */}
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 p-6">
        <h3 className="text-lg font-bold text-neutral-text dark:text-white mb-4 flex items-center gap-2">
          <Moon className="w-5 h-5 text-primary dark:text-primary-400" />{" "}
          Appearance
        </h3>
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-3 flex-1">
            {isEditingTheme ? (
              <select
                value={tempTheme}
                onChange={(e) => setTempTheme(e.target.value)}
                className="px-3 py-2 border border-gray-200 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-200"
              >
                <option value="light">☀️ Light Mode</option>
                <option value="dark">🌙 Dark Mode</option>
              </select>
            ) : (
              <div className="flex items-center gap-2">
                {currentUser.theme === "dark" ? (
                  <Moon className="w-5 h-5 text-primary dark:text-primary-400" />
                ) : (
                  <Sun className="w-5 h-5 text-secondary-500" />
                )}
                <span className="text-gray-700 dark:text-gray-300 font-medium capitalize">
                  {currentUser.theme} Mode
                </span>
              </div>
            )}
          </div>
          {isEditingTheme ? (
            <div className="flex gap-2">
              <button
                onClick={handleThemeSave}
                className="flex items-center gap-1 px-3 py-2 bg-primary text-white dark:text-white rounded-lg hover:bg-primary-600 dark:hover:bg-primary-500 transition-colors"
              >
                <Save className="w-4 h-4" /> Save
              </button>
              <button
                onClick={() => {
                  setIsEditingTheme(false);
                  setTempTheme(currentUser.theme);
                }}
                className="px-3 py-2 bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
              >
                Cancel
              </button>
            </div>
          ) : (
            <button
              onClick={() => setIsEditingTheme(true)}
              className="px-3 py-2 bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
            >
              Change Theme
            </button>
          )}
        </div>
      </div>

      {/* --- Backup & Restore --- */}
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 p-6">
        <h3 className="text-lg font-bold text-neutral-text dark:text-white mb-1">
          Backup & Restore
        </h3>
        <p className="text-sm text-gray-500 dark:text-gray-400 mb-5">
          Export your data to a file, or import a backup to restore it.
        </p>
        <div className="flex flex-col sm:flex-row gap-3 mb-4">
          <button
            onClick={handleExport}
            className="flex-1 flex items-center justify-center gap-2 py-3 bg-primary text-white dark:text-white font-semibold rounded-xl hover:bg-primary-600 dark:hover:bg-primary-500 transition-colors"
          >
            <Download className="w-5 h-5" /> Export Data
          </button>
          <button
            onClick={() => fileRef.current?.click()}
            className="flex-1 flex items-center justify-center gap-2 py-3 bg-secondary text-white dark:text-white font-semibold rounded-xl hover:bg-secondary-600 dark:hover:bg-secondary-500 transition-colors"
          >
            <Upload className="w-5 h-5" /> Import Data
          </button>
        </div>
        {msg && (
          <div
            className={`flex items-center gap-2 p-3 rounded-xl text-sm ${
              msg.type === "success"
                ? "bg-green-50 dark:bg-green-900/30 text-green-700 dark:text-green-400"
                : "bg-red-50 dark:bg-red-900/30 text-red-700 dark:text-red-400"
            }`}
          >
            {msg.type === "success" ? (
              <CheckCircle2 className="w-4 h-4" />
            ) : (
              <XCircle className="w-4 h-4" />
            )}
            {msg.text}
          </div>
        )}
      </div>
    </div>
  );
}
