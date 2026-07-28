import {
  PiggyBank,
  Flame,
  Target,
  Share2,
  Plus,
  X,
  Pencil,
  Trash2,
  User,
} from "lucide-react";
import { useNaijaBase } from "../context/NaijaBaseContext";
import { todayISO, naira } from "../utils/constants";
import { differenceInCalendarDays, parseISO } from "date-fns";
import { useState } from "react";

export default function SavingsPage() {
  const { currentUser, updateUserData } = useNaijaBase();
  const s = currentUser?.data?.savings;
  if (!s) return null;

  const today = todayISO();
  const pct =
    s.targetAmount > 0
      ? Math.min(100, (s.savedAmount / s.targetAmount) * 100)
      : 0;
  const goalReached = s.targetAmount > 0 && s.savedAmount >= s.targetAmount;

  // --- State for editing ---
  const [isEditingAmount, setIsEditingAmount] = useState(false);
  const [editAmount, setEditAmount] = useState(s.savedAmount || 0);
  const [contributorName, setContributorName] = useState("");
  const [showContributorInput, setShowContributorInput] = useState(false);

  // --- Helper: Update savings field ---
  const setField = (field, value) => {
    updateUserData((d) => ({
      ...d,
      savings: { ...d.savings, [field]: value },
    }));
  };

  // --- Handle saving today ---
  const handleSaveToday = () => {
    const amountToSave = parseFloat(s.dailySaveAmount) || 0;
    if (amountToSave <= 0) {
      alert("Please enter a valid daily savings amount.");
      return;
    }

    updateUserData((d) => {
      const sv = d.savings;
      let newStreak = sv.streak;
      if (sv.lastSavedDate) {
        const diff = differenceInCalendarDays(
          parseISO(today),
          parseISO(sv.lastSavedDate),
        );
        if (diff === 1) newStreak = sv.streak + 1;
        else if (diff > 1) newStreak = 1;
      } else {
        newStreak = 1;
      }
      return {
        ...d,
        savings: {
          ...sv,
          savedAmount: (sv.savedAmount || 0) + amountToSave,
          streak: newStreak,
          lastSavedDate: today,
        },
      };
    });
  };

  // --- Handle editing saved amount ---
  const handleEditAmount = () => {
    const newAmount = parseFloat(editAmount);
    if (isNaN(newAmount) || newAmount < 0) {
      alert("Please enter a valid amount.");
      return;
    }
    setField("savedAmount", newAmount);
    setIsEditingAmount(false);
  };

  // --- Handle clearing all savings ---
  const handleClearAll = () => {
    if (
      !window.confirm(
        "Are you sure you want to clear all savings? This will reset your saved amount to 0.",
      )
    ) {
      return;
    }
    setField("savedAmount", 0);
    setIsEditingAmount(false);
    setEditAmount(0);
  };

  // --- Handle adding a contributor ---
  const handleAddContributor = () => {
    const name = contributorName.trim();
    if (!name) {
      alert("Please enter a contributor name.");
      return;
    }
    const contributors = s.contributors || [];
    if (contributors.includes(name)) {
      alert("This contributor already exists.");
      return;
    }
    setField("contributors", [...contributors, name]);
    setContributorName("");
    setShowContributorInput(false);
  };

  // --- Handle removing a contributor ---
  const handleRemoveContributor = (name) => {
    if (!window.confirm(`Remove ${name} from contributors?`)) return;
    const contributors = s.contributors || [];
    setField(
      "contributors",
      contributors.filter((c) => c !== name),
    );
  };

  // --- Handle sharing ---
  const handleShare = () => {
    const goalName = s.goalName || "my savings goal";
    const contributors = s.contributors || [];
    const contributorList =
      contributors.length > 0
        ? `\n👥 Contributors: ${contributors.join(", ")}`
        : "";
    const message = `🎯 I've saved ${naira(s.savedAmount)} towards "${goalName}" and I'm on a ${s.streak}-day savings streak using KudiTrack! 🇳🇬${contributorList}\n\nJoin me and start tracking yours here: ${window.location.origin}`;

    const url = `https://wa.me/?text=${encodeURIComponent(message)}`;
    window.open(url, "_blank");
  };

  return (
    <div className="max-w-3xl mx-auto px-4 py-6 animate-fade-in space-y-6">
      <div>
        <h1 className="text-2xl font-extrabold text-neutral-text dark:text-white flex items-center gap-2">
          <PiggyBank className="w-6 h-6 text-primary dark:text-primary-400" />{" "}
          Savings Challenge
        </h1>
        <p className="text-sm text-gray-500 dark:text-gray-400">
          Enter your daily savings amount and build your streak.
        </p>
      </div>

      {/* --- Settings Section --- */}
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 p-5 space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          <div>
            <label className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide">
              Goal Name
            </label>
            <input
              type="text"
              value={s.goalName || ""}
              onChange={(e) => setField("goalName", e.target.value)}
              placeholder="e.g. New Laptop"
              className="mt-1 w-full px-4 py-3 border border-gray-200 dark:border-gray-600 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary bg-white dark:bg-gray-700 text-gray-800 dark:text-gray-200"
            />
          </div>
          <div>
            <label className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide">
              Target (₦)
            </label>
            <input
              type="number"
              inputMode="numeric"
              value={s.targetAmount || ""}
              onChange={(e) =>
                setField("targetAmount", parseFloat(e.target.value) || 0)
              }
              placeholder="0"
              className="mt-1 w-full px-4 py-3 border border-gray-200 dark:border-gray-600 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary bg-white dark:bg-gray-700 text-gray-800 dark:text-gray-200"
            />
          </div>
          <div>
            <label className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide">
              Platform
            </label>
            <input
              type="text"
              value={s.platform || ""}
              onChange={(e) => setField("platform", e.target.value)}
              placeholder="Piggyvest, Kuda, Cash"
              className="mt-1 w-full px-4 py-3 border border-gray-200 dark:border-gray-600 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary bg-white dark:bg-gray-700 text-gray-800 dark:text-gray-200"
            />
          </div>
        </div>

        <div className="border-t border-gray-100 dark:border-gray-700 pt-4">
          <label className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide">
            Daily Save Amount (₦)
          </label>
          <input
            type="number"
            inputMode="numeric"
            value={s.dailySaveAmount || ""}
            onChange={(e) =>
              setField("dailySaveAmount", parseFloat(e.target.value) || 0)
            }
            placeholder="e.g. 2000"
            className="mt-1 w-full sm:w-1/3 px-4 py-3 border border-gray-200 dark:border-gray-600 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary bg-white dark:bg-gray-700 text-gray-800 dark:text-gray-200"
          />
        </div>
      </div>

      {/* --- Progress Section --- */}
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 p-6">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <Target className="w-5 h-5 text-primary dark:text-primary-400" />
            <h3 className="font-bold text-neutral-text dark:text-white">
              {s.goalName || "Set a goal name"}
            </h3>
          </div>
          <div className="flex items-center gap-1.5 bg-secondary-50 dark:bg-secondary-900/30 px-3 py-1.5 rounded-full">
            <Flame className="w-4 h-4 text-secondary-600 dark:text-secondary-400" />
            <span className="text-sm font-bold text-secondary-600 dark:text-secondary-400">
              {s.streak} day{s.streak !== 1 ? "s" : ""}
            </span>
          </div>
        </div>

        <div className="mb-2 flex justify-between text-sm">
          <span className="text-gray-500 dark:text-gray-400">
            {naira(s.savedAmount)} saved
          </span>
          <span className="text-gray-500 dark:text-gray-400">
            {naira(s.targetAmount)} target
          </span>
        </div>
        <div className="w-full h-6 bg-gray-100 dark:bg-gray-700 rounded-full overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-primary to-primary-400 rounded-full transition-all duration-500"
            style={{ width: `${pct}%` }}
          />
        </div>
        <p className="text-center text-sm font-semibold text-primary dark:text-primary-400 mt-2">
          {pct.toFixed(1)}%
        </p>

        {goalReached && (
          <div className="mt-4 bg-green-50 dark:bg-green-900/30 border border-green-200 dark:border-green-800 rounded-xl p-3 text-center text-sm text-green-700 dark:text-green-400 font-medium">
            🎉 Goal reached! Well done!
          </div>
        )}

        {/* --- Edit Amount Section --- */}
        <div className="mt-4 border-t border-gray-100 dark:border-gray-700 pt-4">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-gray-600 dark:text-gray-400">
              Current Saved Amount
            </span>
            <div className="flex items-center gap-2">
              {isEditingAmount ? (
                <div className="flex items-center gap-2">
                  <input
                    type="number"
                    inputMode="numeric"
                    value={editAmount}
                    onChange={(e) => setEditAmount(e.target.value)}
                    className="w-32 px-3 py-1.5 text-sm border border-gray-200 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary/30 bg-white dark:bg-gray-700 text-gray-800 dark:text-gray-200"
                    placeholder="Enter amount"
                    autoFocus
                  />
                  <button
                    onClick={handleEditAmount}
                    className="px-3 py-1.5 bg-primary text-white dark:text-white text-sm font-medium rounded-lg hover:bg-primary-600 dark:hover:bg-primary-500 transition-colors"
                  >
                    Save
                  </button>
                  <button
                    onClick={() => {
                      setIsEditingAmount(false);
                      setEditAmount(s.savedAmount || 0);
                    }}
                    className="px-3 py-1.5 bg-gray-200 dark:bg-gray-700 text-gray-600 dark:text-gray-400 text-sm font-medium rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors"
                  >
                    Cancel
                  </button>
                </div>
              ) : (
                <button
                  onClick={() => {
                    setIsEditingAmount(true);
                    setEditAmount(s.savedAmount || 0);
                  }}
                  className="flex items-center gap-1 px-3 py-1.5 text-sm font-medium text-primary dark:text-primary-400 bg-primary-50 dark:bg-primary-900/30 hover:bg-primary-100 dark:hover:bg-primary-900/50 rounded-lg transition-colors"
                >
                  <Pencil className="w-3.5 h-3.5" /> Edit Amount
                </button>
              )}
              <button
                onClick={handleClearAll}
                className="flex items-center gap-1 px-3 py-1.5 text-sm font-medium text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-900/30 hover:bg-red-100 dark:hover:bg-red-900/50 rounded-lg transition-colors"
              >
                <Trash2 className="w-3.5 h-3.5" /> Clear All
              </button>
            </div>
          </div>
        </div>

        {/* --- Contributors Section --- */}
        <div className="mt-4 border-t border-gray-100 dark:border-gray-700 pt-4">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <User className="w-4 h-4 text-primary dark:text-primary-400" />
              <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                Contributors
              </span>
              <span className="text-xs text-gray-400 dark:text-gray-500">
                ({(s.contributors || []).length})
              </span>
            </div>
            <button
              onClick={() => setShowContributorInput(true)}
              className="flex items-center gap-1 px-3 py-1.5 text-sm font-medium text-primary dark:text-primary-400 bg-primary-50 dark:bg-primary-900/30 hover:bg-primary-100 dark:hover:bg-primary-900/50 rounded-lg transition-colors"
            >
              <Plus className="w-3.5 h-3.5" /> Add
            </button>
          </div>

          {showContributorInput && (
            <div className="flex items-center gap-2 mb-3 animate-fade-in">
              <input
                type="text"
                value={contributorName}
                onChange={(e) => setContributorName(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleAddContributor()}
                placeholder="Enter contributor name..."
                className="flex-1 px-3 py-2 text-sm border border-gray-200 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary/30 bg-white dark:bg-gray-700 text-gray-800 dark:text-gray-200"
                autoFocus
              />
              <button
                onClick={handleAddContributor}
                className="px-4 py-2 bg-primary text-white dark:text-white text-sm font-medium rounded-lg hover:bg-primary-600 dark:hover:bg-primary-500 transition-colors"
              >
                Add
              </button>
              <button
                onClick={() => {
                  setShowContributorInput(false);
                  setContributorName("");
                }}
                className="p-2 text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-400 transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          )}

          {(s.contributors || []).length > 0 ? (
            <div className="flex flex-wrap gap-2">
              {(s.contributors || []).map((name) => (
                <div
                  key={name}
                  className="flex items-center gap-2 bg-gray-50 dark:bg-gray-700/50 px-3 py-1.5 rounded-full border border-gray-200 dark:border-gray-600"
                >
                  <span className="text-sm text-gray-700 dark:text-gray-300">
                    {name}
                  </span>
                  <button
                    onClick={() => handleRemoveContributor(name)}
                    className="text-gray-400 dark:text-gray-500 hover:text-red-500 dark:hover:text-red-400 transition-colors"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-gray-400 dark:text-gray-500 text-center py-2">
              No contributors yet. Add someone who's helping you save!
            </p>
          )}
        </div>

        {/* --- Action Buttons --- */}
        <button
          onClick={handleSaveToday}
          className="mt-5 w-full flex items-center justify-center gap-2 py-3 bg-primary text-white dark:text-white font-semibold rounded-xl hover:bg-primary-600 dark:hover:bg-primary-500 transition-colors"
        >
          <PiggyBank className="w-5 h-5" /> Save Today (+
          {naira(s.dailySaveAmount || 0)})
        </button>
        {s.lastSavedDate && (
          <p className="text-center text-xs text-gray-400 dark:text-gray-500 mt-2">
            Last saved: {formatDate(s.lastSavedDate)}
          </p>
        )}

        <button
          onClick={handleShare}
          className="mt-3 w-full flex items-center justify-center gap-2 py-3 bg-secondary text-white dark:text-white font-semibold rounded-xl hover:bg-secondary-600 dark:hover:bg-secondary-500 transition-colors"
        >
          <Share2 className="w-5 h-5" /> Share Your Progress on WhatsApp
        </button>
      </div>
    </div>
  );
}

// Helper function for date formatting
function formatDate(iso) {
  if (!iso) return "";
  const date = new Date(iso);
  if (isNaN(date.getTime())) return "Invalid date";
  return date.toLocaleDateString("en-NG", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}
