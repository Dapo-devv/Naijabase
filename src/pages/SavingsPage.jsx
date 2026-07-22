import { PiggyBank, Flame, Target, Share2 } from 'lucide-react';
import { useNaijaBase } from '../context/NaijaBaseContext';
import { todayISO, naira } from '../utils/constants';
import { differenceInCalendarDays, parseISO } from 'date-fns';

export default function SavingsPage() {
  const { currentUser, updateUserData } = useNaijaBase();
  const s = currentUser?.data?.savings;
  if (!s) return null;

  const today = todayISO();
  const pct = s.targetAmount > 0 ? Math.min(100, (s.savedAmount / s.targetAmount) * 100) : 0;
  const goalReached = s.targetAmount > 0 && s.savedAmount >= s.targetAmount;

  const setField = (field, value) => {
    updateUserData((d) => ({
      ...d,
      savings: { ...d.savings, [field]: value },
    }));
  };

  const handleSaveToday = () => {
    const amountToSave = parseFloat(s.dailySaveAmount) || 0;
    if (amountToSave <= 0) {
      alert('Please enter a valid daily savings amount.');
      return;
    }

    updateUserData((d) => {
      const sv = d.savings;
      let newStreak = sv.streak;
      if (sv.lastSavedDate) {
        const diff = differenceInCalendarDays(parseISO(today), parseISO(sv.lastSavedDate));
        if (diff === 1) newStreak = sv.streak + 1;
        else if (diff > 1) newStreak = 1;
      } else {
        newStreak = 1;
      }
      return {
        ...d,
        savings: {
          ...sv,
          savedAmount: sv.savedAmount + amountToSave,
          streak: newStreak,
          lastSavedDate: today,
        },
      };
    });
  };

  // 🚀 NEW: The Share to WhatsApp function
  const handleShare = () => {
    const goalName = s.goalName || 'my savings goal';
    const message = `🎯 I've saved ${naira(s.savedAmount)} towards "${goalName}" and I'm on a ${s.streak}-day savings streak using NaijaBase! 🇳🇬\n\nJoin me and start tracking yours here: ${window.location.origin}`;
    
    // Open WhatsApp with the pre-filled message
    const url = `https://wa.me/?text=${encodeURIComponent(message)}`;
    window.open(url, '_blank');
  };

  return (
    <div className="max-w-3xl mx-auto px-4 py-6 animate-fade-in space-y-6">
      <div>
        <h1 className="text-2xl font-extrabold text-neutral-text flex items-center gap-2">
          <PiggyBank className="w-6 h-6 text-primary" /> Savings Challenge
        </h1>
        <p className="text-sm text-gray-500">Enter your daily savings amount and build your streak.</p>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5 space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          <div>
            <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Goal Name</label>
            <input
              type="text"
              value={s.goalName}
              onChange={(e) => setField('goalName', e.target.value)}
              placeholder="e.g. New Laptop"
              className="mt-1 w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary"
            />
          </div>
          <div>
            <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Target (₦)</label>
            <input
              type="number"
              inputMode="numeric"
              value={s.targetAmount || ''}
              onChange={(e) => setField('targetAmount', parseFloat(e.target.value) || 0)}
              placeholder="0"
              className="mt-1 w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary"
            />
          </div>
          <div>
            <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Platform</label>
            <input
              type="text"
              value={s.platform}
              onChange={(e) => setField('platform', e.target.value)}
              placeholder="Piggyvest, Kuda, Cash"
              className="mt-1 w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary"
            />
          </div>
        </div>

        <div className="border-t border-gray-100 pt-4">
          <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Daily Save Amount (₦)</label>
          <input
            type="number"
            inputMode="numeric"
            value={s.dailySaveAmount || ''}
            onChange={(e) => setField('dailySaveAmount', parseFloat(e.target.value) || 0)}
            placeholder="e.g. 2000"
            className="mt-1 w-full sm:w-1/3 px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary"
          />
        </div>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <Target className="w-5 h-5 text-primary" />
            <h3 className="font-bold text-neutral-text">{s.goalName || 'Set a goal name'}</h3>
          </div>
          <div className="flex items-center gap-1.5 bg-secondary-50 px-3 py-1.5 rounded-full">
            <Flame className="w-4 h-4 text-secondary-600" />
            <span className="text-sm font-bold text-secondary-600">{s.streak} day{s.streak !== 1 ? 's' : ''}</span>
          </div>
        </div>

        <div className="mb-2 flex justify-between text-sm">
          <span className="text-gray-500">{naira(s.savedAmount)} saved</span>
          <span className="text-gray-500">{naira(s.targetAmount)} target</span>
        </div>
        <div className="w-full h-6 bg-gray-100 rounded-full overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-primary to-primary-400 rounded-full transition-all duration-500"
            style={{ width: `${pct}%` }}
          />
        </div>
        <p className="text-center text-sm font-semibold text-primary mt-2">{pct.toFixed(1)}%</p>

        {goalReached && (
          <div className="mt-4 bg-green-50 border border-green-200 rounded-xl p-3 text-center text-sm text-green-700 font-medium">
            Goal reached! Well done.
          </div>
        )}

        <button
          onClick={handleSaveToday}
          className="mt-5 w-full flex items-center justify-center gap-2 py-3 bg-primary text-white font-semibold rounded-xl hover:bg-primary-600 transition-colors"
        >
          <PiggyBank className="w-5 h-5" /> Save Today (+{naira(s.dailySaveAmount || 0)})
        </button>
        {s.lastSavedDate && (
          <p className="text-center text-xs text-gray-400 mt-2">Last saved: {s.lastSavedDate}</p>
        )}

        {/* 🚀 The new Share Button */}
        <button
          onClick={handleShare}
          className="mt-3 w-full flex items-center justify-center gap-2 py-3 bg-secondary text-white font-semibold rounded-xl hover:bg-secondary-600 transition-colors"
        >
          <Share2 className="w-5 h-5" /> Share Your Progress on WhatsApp
        </button>
      </div>
    </div>
  );
}